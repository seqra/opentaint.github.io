import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type Scene = {
  id: string;
  nav: string;
  kicker: string;
  title: string;
  copy: string;
  formula: ReactNode;
  signal: string;
};

const scenes: Scene[] = [
  {
    id: "variable",
    nav: "Learning",
    kicker: "Model review",
    title: "The same review can produce different findings",
    copy: "Repeat the review and you cannot know which findings will return.",
    formula: <>Review₁ △ Review₂ ≠ ∅</>,
    signal: "Repeated model inference, variable output",
  },
  {
    id: "deterministic",
    nav: "Searching",
    kicker: "Formal analysis",
    title: "The same inputs produce the same report",
    copy: "A formal specification gives the engine an exact analysis to repeat.",
    formula: <>Report₁ = Report₂</>,
    signal: "Consistent output",
  },
  {
    id: "diff",
    nav: "Learn the diff",
    kicker: "Expensive learning",
    title: "Learning the diff does not replace learning the whole project",
    copy: "To recover whole-project results, the model still has to reread the whole project.",
    formula: <>Review₁ ∪ Review<sub>Δ</sub> ≠ Review₂</>,
    signal: "Whole-project learning repeats model cost",
  },
  {
    id: "rescan",
    nav: "Search the whole",
    kicker: "Cheap searching",
    title: "Search every new version without relearning the project",
    copy: "Attach the specification and let the engine scan the whole project again on CPUs.",
    formula: <>Scan(Project₂, Spec) → Report₂</>,
    signal: "CPU scan, no model inference",
  },
  {
    id: "bounded",
    nav: "Engine limits",
    kicker: "Specification quality",
    title: "The engine only knows its formal specification",
    copy: "Missing or imprecise rules and models create missed findings and false alarms.",
    formula: <>Missed {'{B}'}<br />False alarm {'{F}'}</>,
    signal: "The specification determines precision and coverage",
  },
  {
    id: "translate",
    nav: "Enactment",
    kicker: "The key step",
    title: "Turn review knowledge into a formal specification",
    copy: "The agent enacts what it learned as taint rules and dependency models.",
    formula: <>Review ⊆ Report</>,
    signal: "When the knowledge is expressible",
  },
  {
    id: "compound",
    nav: "Lean",
    kicker: "OpenTaint",
    title: "Every review can add durable coverage",
    copy: "Formal specifications combine. The next scan applies all accumulated knowledge.",
    formula: <>Report = Review₁ ∪ Review₂</>,
    signal: "Security knowledge compounds",
  },
  {
    id: "continuous",
    nav: "Continuous",
    kicker: "OpenTaint",
    title: "Review the change. Scan the whole project",
    copy: "Use model reasoning for new context and formal analysis for everything already known.",
    formula: <>Report₂ ⊇ Review₁ ∪ Review₂</>,
    signal: "Lean, continuous coverage",
  },
];

const clamp = (value: number) => Math.max(0, Math.min(1, value));

function FindingSet({ values, report = false }: { values: string[]; report?: boolean }) {
  return (
    <span className="flex items-center justify-center gap-1.5" aria-label={`${report ? "Report" : "Review"} findings ${values.join(", ")}`}>
      {values.map((value) => (
        <span
          key={value}
          className={[
            "flex h-7 w-7 items-center justify-center rounded-full border font-mono text-[10px] font-semibold sm:h-8 sm:w-8 sm:text-xs",
            report ? "border-primary bg-primary text-primary-foreground" : "border-foreground/45 bg-background text-foreground",
          ].join(" ")}
        >
          {value}
        </span>
      ))}
    </span>
  );
}

type NodeKind = "project" | "change" | "review" | "spec" | "report";

function FlowNode({
  kind,
  label,
  findings,
  rules,
  muted = false,
}: {
  kind: NodeKind;
  label: string;
  findings?: string[];
  rules?: string[];
  muted?: boolean;
}) {
  const isFormal = kind === "spec" || kind === "report";
  return (
    <div
      className={[
        "flex min-h-[4.75rem] min-w-0 flex-col items-center justify-center rounded-lg border px-2 py-2.5 text-center transition-colors sm:min-h-[5.5rem] sm:px-3",
        isFormal ? "border-primary/55 bg-primary/[0.045]" : "border-border-strong bg-background",
        muted ? "opacity-45" : "opacity-100",
      ].join(" ")}
    >
      <span className={["font-mono text-[9px] font-semibold uppercase tracking-[0.08em] sm:text-[10px]", isFormal ? "text-primary" : "text-muted-foreground"].join(" ")}>
        {label}
      </span>
      {kind === "project" && (
        <span className="mt-2 grid w-9 gap-1" aria-hidden="true"><i className="h-px bg-foreground/70" /><i className="h-px w-7 bg-foreground/50" /><i className="h-px w-8 bg-foreground/35" /></span>
      )}
      {kind === "change" && <span className="mt-1 font-mono text-xl font-semibold text-primary">Δ</span>}
      {findings && <span className="mt-2"><FindingSet values={findings} report={kind === "report"} /></span>}
      {rules && (
        <span className="mt-2 flex flex-wrap justify-center gap-1" aria-label={`Formal specification ${rules.join(", ")}`}>
          {rules.map((rule) => <span key={rule} className="rounded bg-primary px-1.5 py-1 font-mono text-[9px] font-semibold text-primary-foreground">{rule}</span>)}
        </span>
      )}
    </div>
  );
}

function ProjectInput({ label, change = false, rules }: { label: string; change?: boolean; rules?: string[] }) {
  return (
    <div
      className="flex min-h-[4.75rem] min-w-0 flex-col overflow-hidden rounded-lg border border-border-strong bg-background text-center sm:min-h-[5.5rem]"
      aria-label={`${label}${change ? " with new code" : ""}${rules ? ` with attached formal specification ${rules.join(", ")}` : ""}`}
    >
      <span className="relative flex flex-1 items-center justify-center gap-2 px-2 py-2 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-muted-foreground sm:text-[10px]">
        <span>{label}</span>
        <span className="grid w-6 gap-1" aria-hidden="true"><i className="h-px bg-foreground/55" /><i className="h-px w-5 bg-foreground/35" /></span>
        {change && <span className="font-mono text-base font-semibold text-primary">Δ</span>}
      </span>
      {rules && (
        <span className="flex items-center justify-center gap-1 border-t border-primary/45 bg-primary/[0.07] px-2 py-1.5 font-mono text-[8px] font-semibold uppercase tracking-[0.06em] text-primary sm:text-[9px]">
          <span>Attached spec</span>
          <span aria-label={`Formal specification ${rules.join(", ")}`}>{rules.join(" ")}</span>
        </span>
      )}
    </div>
  );
}

function FlowArrow({ label, formal = false, progress = 1 }: { label: string; formal?: boolean; progress?: number }) {
  return (
    <div className="relative flex min-w-0 items-center px-1" aria-label={label}>
      <span className="absolute inset-x-0 -top-3 text-center font-mono text-[8px] font-semibold uppercase tracking-[0.06em] text-muted-foreground sm:-top-4 sm:text-[9px]">{label}</span>
      <span className={["relative h-px w-full overflow-hidden", formal ? "bg-primary/20" : "border-t border-dashed border-foreground/25"].join(" ")}>
        <span
          className={["absolute inset-y-0 left-0 origin-left transition-none", formal ? "bg-primary" : "border-t border-dashed border-foreground"].join(" ")}
          style={{ width: `${Math.round(clamp(progress) * 100)}%` }}
        />
      </span>
      <span className={["-ml-px font-mono text-sm leading-none", formal ? "text-primary" : "text-foreground"].join(" ")} aria-hidden="true">›</span>
    </div>
  );
}

function Flow({
  from,
  to,
  via,
  formal = false,
  progress,
}: {
  from: ReactNode;
  to: ReactNode;
  via: string;
  formal?: boolean;
  progress: number;
}) {
  return (
    <div className="grid grid-cols-[minmax(4.5rem,1fr)_minmax(2.75rem,0.55fr)_minmax(4.5rem,1fr)] items-center gap-1 sm:grid-cols-[minmax(7rem,1fr)_minmax(4.5rem,0.5fr)_minmax(7rem,1fr)] sm:gap-2">
      {from}
      <FlowArrow label={via} formal={formal} progress={progress} />
      {to}
    </div>
  );
}

function Chain({
  from,
  middle,
  to,
  firstLabel,
  secondLabel,
  progress,
}: {
  from: ReactNode;
  middle: ReactNode;
  to: ReactNode;
  firstLabel: string;
  secondLabel: string;
  progress: number;
}) {
  return (
    <div className="grid grid-cols-[minmax(3.75rem,1fr)_minmax(2rem,0.38fr)_minmax(3.75rem,1fr)_minmax(2rem,0.38fr)_minmax(3.75rem,1fr)] items-center gap-1 sm:grid-cols-[minmax(6rem,1fr)_minmax(3.25rem,0.42fr)_minmax(6rem,1fr)_minmax(3.25rem,0.42fr)_minmax(6rem,1fr)] sm:gap-2">
      {from}
      <FlowArrow label={firstLabel} progress={clamp(progress * 1.8)} />
      {middle}
      <FlowArrow label={secondLabel} progress={clamp((progress - 0.32) * 1.8)} />
      {to}
    </div>
  );
}

function SceneDiagram({ id, progress }: { id: string; progress: number }) {
  const first = clamp(progress * 2.4);
  const second = clamp((progress - 0.2) * 2.4);
  const third = clamp((progress - 0.45) * 2.6);

  if (id === "variable") return (
    <div className="grid gap-7" aria-label="Two model reviews of the same project return different findings">
      <Flow from={<FlowNode kind="project" label="Same project" />} via="model" to={<FlowNode kind="review" label="Review 1" findings={["A", "B"]} />} progress={first} />
      <Flow from={<FlowNode kind="project" label="Same project" />} via="model" to={<FlowNode kind="review" label="Review 2" findings={["A", "C"]} />} progress={second} />
    </div>
  );

  if (id === "deterministic") return (
    <div className="grid gap-7" aria-label="Two formal scans of the same project and specification return the same report">
      <Flow from={<ProjectInput label="Same project" rules={["R₁", "R₂"]} />} via="engine" formal to={<FlowNode kind="report" label="Report 1" findings={["A", "B"]} />} progress={first} />
      <Flow from={<ProjectInput label="Same project" rules={["R₁", "R₂"]} />} via="engine" formal to={<FlowNode kind="report" label="Report 2" findings={["A", "B"]} />} progress={second} />
    </div>
  );

  if (id === "diff") return (
    <div className="grid gap-5" aria-label="A review of a project plus a review of its change does not equal a new whole-project review">
      <Flow from={<FlowNode kind="project" label="Project 1" />} via="model" to={<FlowNode kind="review" label="Review 1" findings={["A", "B"]} />} progress={first} />
      <Flow from={<ProjectInput label="Project 2" change />} via="model" to={<FlowNode kind="review" label="Review 2" findings={["B", "C"]} />} progress={second} />
      <Flow from={<FlowNode kind="change" label="Change only" />} via="model" to={<FlowNode kind="review" label="Diff review" findings={["C"]} />} progress={third} />
    </div>
  );

  if (id === "rescan") return (
    <div className="grid gap-7" aria-label="The same formal specification scans two complete project versions">
      <Flow from={<ProjectInput label="Project 1" rules={["R₁", "R₂"]} />} via="engine" formal to={<FlowNode kind="report" label="Report 1" findings={["A", "B"]} />} progress={first} />
      <Flow from={<ProjectInput label="Project 2" change rules={["R₁", "R₂"]} />} via="engine" formal to={<FlowNode kind="report" label="Report 2" findings={["A", "B", "C"]} />} progress={second} />
    </div>
  );

  if (id === "bounded") return (
    <div className="grid gap-6" aria-label="An incomplete formal specification creates a missed finding and a false alarm">
      <Flow from={<ProjectInput label="Project" rules={["R₁"]} />} via="engine" formal to={<FlowNode kind="report" label="Report" findings={["A", "F"]} />} progress={first} />
      <Flow from={<FlowNode kind="project" label="Same project" />} via="model" to={<FlowNode kind="review" label="Review" findings={["A", "B"]} />} progress={second} />
      <div className="grid grid-cols-2 gap-3 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] sm:gap-4 sm:text-[10px]">
        <div className="flex items-center justify-center gap-3 rounded-lg border border-border-strong bg-background px-3 py-3 text-muted-foreground"><span className="flex h-7 w-7 items-center justify-center rounded-full border border-foreground/45 text-foreground">B</span><span>Missed finding</span></div>
        <div className="flex items-center justify-center gap-3 rounded-lg border border-primary/55 bg-primary/[0.045] px-3 py-3 text-primary"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">F</span><span>False alarm</span></div>
      </div>
    </div>
  );

  if (id === "translate") return (
    <div className="grid gap-7" aria-label="Review findings become a formal specification which the engine applies to the project">
      <Chain from={<FlowNode kind="project" label="Project" />} firstLabel="model" middle={<FlowNode kind="review" label="Review" findings={["A", "B"]} />} secondLabel="model enacts" to={<FlowNode kind="spec" label="Formal spec" rules={["R₁", "R₂"]} />} progress={first} />
      <Flow from={<ProjectInput label="Project" rules={["R₁", "R₂"]} />} via="engine" formal to={<FlowNode kind="report" label="Report" findings={["A", "B"]} />} progress={second} />
    </div>
  );

  if (id === "compound") return (
    <div className="grid gap-5" aria-label="Formal specifications from two reviews combine into one report">
      <Chain from={<FlowNode kind="project" label="Project" />} firstLabel="model" middle={<FlowNode kind="review" label="Review 1" findings={["A"]} />} secondLabel="model enacts" to={<FlowNode kind="spec" label="Spec 1" rules={["R₁"]} />} progress={first} />
      <Chain from={<FlowNode kind="project" label="Project" />} firstLabel="model" middle={<FlowNode kind="review" label="Review 2" findings={["B"]} />} secondLabel="model enacts" to={<FlowNode kind="spec" label="Spec 2" rules={["R₂"]} />} progress={second} />
      <Flow from={<ProjectInput label="Project" rules={["R₁", "R₂"]} />} via="engine" formal to={<FlowNode kind="report" label="Report" findings={["A", "B"]} />} progress={third} />
    </div>
  );

  return (
    <div className="grid gap-5" aria-label="A review of the project and a review of its change add formal specifications to a whole-project scan">
      <Chain from={<FlowNode kind="project" label="Project" />} firstLabel="model" middle={<FlowNode kind="review" label="Review 1" findings={["A"]} />} secondLabel="model enacts" to={<FlowNode kind="spec" label="Spec 1" rules={["R₁"]} />} progress={first} />
      <Chain from={<FlowNode kind="change" label="New context" />} firstLabel="model" middle={<FlowNode kind="review" label="Review 2" findings={["B"]} />} secondLabel="model enacts" to={<FlowNode kind="spec" label="Spec 2" rules={["R₂"]} />} progress={second} />
      <Flow from={<ProjectInput label="Whole project" change rules={["R₁", "R₂"]} />} via="engine" formal to={<FlowNode kind="report" label="Report" findings={["A", "B"]} />} progress={third} />
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
      <span className="inline-flex items-center gap-2"><i className="w-7 border-t border-dashed border-foreground" />Model reasoning</span>
      <span className="inline-flex items-center gap-2"><i className="h-px w-7 bg-primary" />Formal program analysis</span>
      <span className="inline-flex items-center gap-2"><i className="h-3 w-3 rounded-full border border-foreground/50" />Review finding</span>
      <span className="inline-flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-primary" />Report finding</span>
    </div>
  );
}

export function ContinuousSecurity() {
  const trackRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [sceneProgress, setSceneProgress] = useState(0.35);
  const scene = scenes[sceneIndex];

  const readScroll = useCallback(() => {
    const track = trackRef.current;
    const frame = frameRef.current;
    if (!track || !frame) return;
    const top = track.getBoundingClientRect().top + window.scrollY;
    const stickyTop = Number.parseFloat(window.getComputedStyle(frame).top) || 0;
    const start = top - stickyTop;
    const distance = Math.max(1, track.offsetHeight - frame.offsetHeight);
    const overall = clamp((window.scrollY - start) / distance);
    const position = overall * (scenes.length - 0.001);
    const nextIndex = Math.min(scenes.length - 1, Math.floor(position));
    setSceneIndex(nextIndex);
    setSceneProgress(position - nextIndex);
  }, []);

  useEffect(() => {
    let frame = 0;
    const schedule = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(readScroll);
    };
    readScroll();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [readScroll]);

  const goToScene = (index: number) => {
    const track = trackRef.current;
    const frame = frameRef.current;
    setSceneIndex(index);
    setSceneProgress(0.58);
    if (!track || !frame) return;
    const top = track.getBoundingClientRect().top + window.scrollY;
    const stickyTop = Number.parseFloat(window.getComputedStyle(frame).top) || 0;
    const start = top - stickyTop;
    const distance = Math.max(1, track.offsetHeight - frame.offsetHeight);
    const target = start + distance * ((index + 0.58) / scenes.length);
    window.scrollTo({ top: target, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  const sceneStyle = {
    "--scene-progress": sceneProgress,
  } as CSSProperties;

  return (
    <section className="band section-divider continuous-security-band" aria-labelledby="continuous-security-heading">
      <div className="mx-auto max-w-[90rem]">
        <div className="section-header">
          <p className="section-eyebrow">The flexibility of model reasoning and the consistency of formal program analysis combined</p>
          <h2 id="continuous-security-heading" className="section-heading">Turn one security review into unlimited security scans</h2>
        </div>

        <div ref={trackRef} className="relative mt-12 h-[720svh] lg:mt-16" data-testid="continuous-security-track">
          <div ref={frameRef} className="sticky top-16 flex h-[calc(100svh-4rem)] min-h-[38rem] items-center py-4 sm:py-6">
            <figure className="mx-auto grid max-h-[calc(100svh-6rem)] w-full overflow-hidden rounded-xl border border-border-strong bg-background shadow-sm lg:min-h-[38rem] lg:grid-cols-[12rem_minmax(0,1fr)] xl:min-h-[40rem]" aria-labelledby="continuous-security-heading">
              <figcaption className="sr-only">A scroll-controlled comparison of model security review, formal program analysis, and the OpenTaint workflow</figcaption>

              <nav className="hidden border-r border-border bg-code-header p-3 lg:block" aria-label="Security review comparison">
                <ol className="grid gap-1">
                  {scenes.map((item, index) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        aria-current={index === sceneIndex ? "step" : undefined}
                        onClick={() => goToScene(index)}
                        className={[
                          "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors",
                          index === sceneIndex ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-background hover:text-foreground",
                        ].join(" ")}
                      >
                        <span className="opacity-65">{String(index + 1).padStart(2, "0")}</span>
                        <span>{item.nav}</span>
                      </button>
                    </li>
                  ))}
                </ol>
              </nav>

              <div className="flex min-h-0 min-w-0 flex-col" style={sceneStyle}>
                <div className="flex items-center justify-between gap-4 border-b border-border bg-code-header px-4 py-3 sm:px-6">
                  <Legend />
                  <span className="shrink-0 font-mono text-[9px] font-semibold text-muted-foreground lg:hidden">{String(sceneIndex + 1).padStart(2, "0")} / {String(scenes.length).padStart(2, "0")}</span>
                </div>

                <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(17rem,0.6fr)_minmax(32rem,1.4fr)]">
                  <div className="flex flex-col justify-center border-b border-border px-5 py-6 sm:px-8 lg:border-b-0 lg:border-r lg:py-8">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-primary">{scene.kicker}</p>
                    <h3 className="mt-4 max-w-xl font-mono text-xl font-semibold leading-tight text-foreground sm:text-2xl lg:text-[1.65rem]">{scene.title}</h3>
                    <p className="mt-4 max-w-xl text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-6">{scene.copy}</p>
                    <div className="mt-6 border-l-2 border-primary pl-4">
                      <p className="whitespace-nowrap font-mono text-[15px] font-semibold text-foreground sm:text-base" aria-live="polite">{scene.formula}</p>
                      <p className="mt-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-primary sm:text-[10px]">{scene.signal}</p>
                    </div>
                  </div>

                  <div className="flex min-h-0 flex-col justify-center bg-code-bg px-4 py-7 sm:px-8 lg:px-10" data-testid="continuous-security-scene" data-scene={scene.id}>
                    <SceneDiagram id={scene.id} progress={sceneProgress} />
                  </div>
                </div>

                <div className="grid h-1 grid-cols-8 bg-border" aria-hidden="true">
                  {scenes.map((item, index) => (
                    <span key={item.id} className={index <= sceneIndex ? "bg-primary" : "bg-transparent"} />
                  ))}
                </div>
              </div>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
