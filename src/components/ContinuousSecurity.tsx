import { useCallback, useRef, useState, type ReactNode } from "react";
import { createHeroFlowField } from "@/lib/heroFlowField";

type Scene = {
  id: string;
  nav: string;
  kicker: string;
  title: string;
  conclusion: string;
};

const continuousFlowLines = createHeroFlowField();

const scenes: Scene[] = [
  {
    id: "variable",
    nav: "Learning",
    kicker: "Model review",
    title: "The same review can produce different findings",
    conclusion: "Repeat the review. The findings change.",
  },
  {
    id: "deterministic",
    nav: "Searching",
    kicker: "Formal analysis",
    title: "The same inputs produce the same report",
    conclusion: "Repeat the scan. The report stays the same.",
  },
  {
    id: "diff",
    nav: "Learn the diff",
    kicker: "Expensive learning",
    title: "Learning the diff does not replace learning the whole project",
    conclusion: "The model must reread the whole project to recover full context.",
  },
  {
    id: "rescan",
    nav: "Search the whole",
    kicker: "Cheap searching",
    title: "Search every new version without relearning the project",
    conclusion: "Same specification. Whole-project scan. No model inference.",
  },
  {
    id: "bounded",
    nav: "Engine limits",
    kicker: "Specification quality",
    title: "The engine only knows its formal specification",
    conclusion: "Missing knowledge misses B. Imprecise knowledge reports F.",
  },
  {
    id: "translate",
    nav: "Enactment",
    kicker: "The key step",
    title: "Turn review knowledge into a formal specification",
    conclusion: "The review becomes taint rules and dependency models.",
  },
  {
    id: "compound",
    nav: "Lean",
    kicker: "OpenTaint",
    title: "Every review can add durable coverage",
    conclusion: "New specifications join everything already learned.",
  },
  {
    id: "continuous",
    nav: "Continuous",
    kicker: "OpenTaint",
    title: "Review the change. Scan the whole project",
    conclusion: "The model learns new context. The engine searches the whole project.",
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

function SpecificationMarks({ rules }: { rules: string[] }) {
  return (
    <span className="flex flex-wrap justify-center gap-1" aria-label={`Formal specification ${rules.join(", ")}`}>
      {rules.map((rule) => (
        <span key={rule} className="flex h-7 w-7 items-center justify-center rounded bg-primary font-mono text-[9px] font-semibold text-primary-foreground sm:h-8 sm:w-8 sm:text-[10px]">
          {rule}
        </span>
      ))}
    </span>
  );
}

function CodeChange() {
  return (
    <span className="mt-2 grid w-9 gap-1" aria-label="Changed code">
      <i className="h-px w-7 bg-foreground/35" />
      <i className="h-1 w-9 rounded-sm bg-primary" />
      <i className="h-px w-6 bg-foreground/55" />
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
      {kind === "change" && <CodeChange />}
      {findings && <span className="mt-2"><FindingSet values={findings} report={kind === "report"} /></span>}
      {rules && <span className="mt-2"><SpecificationMarks rules={rules} /></span>}
    </div>
  );
}

function ProjectInput({ label, change = false, rules }: { label: string; change?: boolean; rules?: string[] }) {
  return (
    <div
      className="flex min-h-[4.75rem] min-w-0 flex-col overflow-hidden rounded-lg border border-border-strong bg-background text-center sm:min-h-[5.5rem]"
      aria-label={`${label}${change ? " with new code" : ""}${rules ? ` with formal specification ${rules.join(", ")}` : ""}`}
    >
      <span className="relative flex flex-1 items-center justify-center gap-2 px-2 py-2 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-muted-foreground sm:text-[10px]">
        <span>{label}</span>
        <span className="grid w-6 gap-1" aria-hidden="true"><i className="h-px bg-foreground/55" /><i className={change ? "h-1 bg-primary" : "h-px w-5 bg-foreground/35"} /></span>
      </span>
      {rules && (
        <span className="flex items-center justify-center gap-2 border-t border-primary/45 bg-primary/[0.07] px-2 py-2 font-mono text-[8px] font-semibold uppercase tracking-[0.06em] text-primary sm:text-[9px]">
          <span>Formal spec</span>
          <SpecificationMarks rules={rules} />
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
    <div className="grid grid-cols-[minmax(3.5rem,1fr)_minmax(2.5rem,0.46fr)_minmax(3.5rem,1fr)_minmax(2.5rem,0.46fr)_minmax(3.5rem,1fr)] items-center gap-1 sm:grid-cols-[minmax(6rem,1fr)_minmax(3.25rem,0.42fr)_minmax(6rem,1fr)_minmax(3.25rem,0.42fr)_minmax(6rem,1fr)] sm:gap-2">
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
    <div className="grid gap-8" aria-label="Two model reviews of the same project return different findings">
      <Flow from={<FlowNode kind="project" label="Same project" />} via="model" to={<FlowNode kind="review" label="Review 1" findings={["A", "B"]} />} progress={first} />
      <Flow from={<FlowNode kind="project" label="Same project" />} via="model" to={<FlowNode kind="review" label="Review 2" findings={["A", "C"]} />} progress={second} />
    </div>
  );

  if (id === "deterministic") return (
    <div className="grid gap-8" aria-label="Two formal scans of the same project and specification return the same report">
      <Flow from={<ProjectInput label="Same project" rules={["R₁", "R₂"]} />} via="engine" formal to={<FlowNode kind="report" label="Report 1" findings={["A", "B"]} />} progress={first} />
      <Flow from={<ProjectInput label="Same project" rules={["R₁", "R₂"]} />} via="engine" formal to={<FlowNode kind="report" label="Report 2" findings={["A", "B"]} />} progress={second} />
    </div>
  );

  if (id === "diff") return (
    <div className="grid gap-6" aria-label="A review of a project plus a review of its change does not equal a new whole-project review">
      <Flow from={<FlowNode kind="project" label="Project 1" />} via="model" to={<FlowNode kind="review" label="Review 1" findings={["A", "B"]} />} progress={first} />
      <Flow from={<ProjectInput label="Project 2" change />} via="model" to={<FlowNode kind="review" label="Review 2" findings={["B", "C"]} />} progress={second} />
      <Flow from={<FlowNode kind="change" label="Change only" />} via="model" to={<FlowNode kind="review" label="Diff review" findings={["C"]} />} progress={third} />
    </div>
  );

  if (id === "rescan") return (
    <div className="grid gap-8" aria-label="The same formal specification scans two complete project versions">
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
    <div className="grid gap-8" aria-label="Review findings become a formal specification which the engine applies to the project">
      <Chain from={<FlowNode kind="project" label="Project" />} firstLabel="model" middle={<FlowNode kind="review" label="Review" findings={["A", "B"]} />} secondLabel="model enacts" to={<FlowNode kind="spec" label="Formal spec" rules={["R₁", "R₂"]} />} progress={first} />
      <Flow from={<ProjectInput label="Project" rules={["R₁", "R₂"]} />} via="engine" formal to={<FlowNode kind="report" label="Report" findings={["A", "B"]} />} progress={second} />
    </div>
  );

  if (id === "compound") return (
    <div className="grid gap-6" aria-label="Formal specifications from two reviews combine into one report">
      <Chain from={<FlowNode kind="project" label="Project" />} firstLabel="model" middle={<FlowNode kind="review" label="Review 1" findings={["A"]} />} secondLabel="model enacts" to={<FlowNode kind="spec" label="Spec 1" rules={["R₁"]} />} progress={first} />
      <Chain from={<FlowNode kind="project" label="Project" />} firstLabel="model" middle={<FlowNode kind="review" label="Review 2" findings={["B"]} />} secondLabel="model enacts" to={<FlowNode kind="spec" label="Spec 2" rules={["R₂"]} />} progress={second} />
      <Flow from={<ProjectInput label="Project" rules={["R₁", "R₂"]} />} via="engine" formal to={<FlowNode kind="report" label="Report" findings={["A", "B"]} />} progress={third} />
    </div>
  );

  return (
    <div className="grid gap-6" aria-label="A review of the project and a review of its change add formal specifications to a whole-project scan">
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [sceneProgress, setSceneProgress] = useState(0.35);
  const [scrollProgress, setScrollProgress] = useState(0);
  const scene = scenes[sceneIndex];

  const readScroll = useCallback(() => {
    const scroll = scrollRef.current;
    if (!scroll) return;
    const distance = Math.max(1, scroll.scrollHeight - scroll.clientHeight);
    const overall = clamp(scroll.scrollTop / distance);
    const position = overall * (scenes.length - 0.001);
    const nextIndex = Math.min(scenes.length - 1, Math.floor(position));
    setSceneIndex(nextIndex);
    setSceneProgress(position - nextIndex);
    setScrollProgress(overall);
  }, []);

  const goToScene = (index: number) => {
    const scroll = scrollRef.current;
    setSceneIndex(index);
    setSceneProgress(0.58);
    if (!scroll) return;
    const distance = Math.max(1, scroll.scrollHeight - scroll.clientHeight);
    const top = distance * ((index + 0.58) / scenes.length);
    if (typeof scroll.scrollTo === "function") {
      scroll.scrollTo({ top, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    } else {
      scroll.scrollTop = top;
    }
  };

  return (
    <section className="band section-divider continuous-security-band" aria-labelledby="continuous-security-heading">
      <div className="continuous-security-noise" aria-hidden="true">
        <svg viewBox="0 0 1200 720" preserveAspectRatio="xMidYMid slice">
          <g>
            {continuousFlowLines.map((line, index) => <path key={`continuous-flow-${index}`} d={line.d} />)}
          </g>
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-[96rem]">
        <div className="section-header">
          <p className="section-eyebrow">The flexibility of model reasoning and the consistency of formal program analysis combined</p>
          <h2 id="continuous-security-heading" className="section-heading">Turn one security review into unlimited security scans</h2>
        </div>

        <div
          ref={scrollRef}
          onScroll={readScroll}
          tabIndex={0}
          className="continuous-security-scroll relative mt-12 h-[40rem] overflow-y-auto rounded-xl border border-border-strong bg-background shadow-sm sm:h-[44rem] lg:mt-16 lg:h-[46rem]"
          data-testid="continuous-security-track"
          aria-label="Scroll through the security review comparison"
        >
          <div className="relative h-[150rem] lg:h-[168rem]">
            <figure className="continuous-security-frame sticky top-0 grid h-[40rem] w-full overflow-hidden bg-background sm:h-[44rem] lg:h-[46rem] lg:grid-cols-[12rem_minmax(0,1fr)]" aria-labelledby="continuous-security-heading">
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

              <div className="flex min-h-0 min-w-0 flex-col">
                <div className="flex items-center justify-between gap-4 border-b border-border bg-code-header px-4 py-3 sm:px-6">
                  <Legend />
                  <span className="shrink-0 font-mono text-[9px] font-semibold text-muted-foreground lg:hidden">{String(sceneIndex + 1).padStart(2, "0")} / {String(scenes.length).padStart(2, "0")}</span>
                </div>

                <div className="flex min-h-0 flex-1 flex-col">
                  <div className="grid gap-4 bg-background px-6 py-6 text-left sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.55fr)] lg:items-end lg:gap-8">
                    <div>
                      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-primary">{scene.kicker}</p>
                      <h3 className="mt-3 max-w-4xl font-mono text-xl font-semibold leading-tight text-foreground sm:text-2xl lg:text-[1.75rem]">{scene.title}</h3>
                    </div>
                    <p className="font-mono text-[11px] font-medium leading-5 text-muted-foreground sm:text-xs lg:text-right" aria-live="polite">{scene.conclusion}</p>
                  </div>

                  <div className="flex min-h-0 flex-1 flex-col justify-center bg-code-bg px-4 py-8 sm:px-8 lg:px-12" data-testid="continuous-security-scene" data-scene={scene.id}>
                    <div className="mx-auto w-full max-w-5xl">
                      <SceneDiagram id={scene.id} progress={sceneProgress} />
                    </div>
                  </div>
                </div>

                <div className="h-1 bg-transparent" aria-hidden="true">
                  <span className="block h-full origin-left bg-primary will-change-transform" style={{ transform: `scaleX(${scrollProgress})` }} />
                </div>
              </div>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
