import { useEffect, useState, type ReactNode } from "react";

type Moment = {
  id: string;
  label: string;
  agentTokens: string;
  agentFindings: string[];
  specification: string[];
  coverage: string[];
  reviewEvent: boolean;
};

const moments: Moment[] = [
  {
    id: "review",
    label: "First review",
    agentTokens: "14k",
    agentFindings: ["A", "B"],
    specification: ["R₁"],
    coverage: ["A"],
    reviewEvent: true,
  },
  {
    id: "repeat",
    label: "Same review",
    agentTokens: "28k",
    agentFindings: ["A", "C"],
    specification: ["R₁"],
    coverage: ["A"],
    reviewEvent: false,
  },
  {
    id: "revision-2",
    label: "Revision 2",
    agentTokens: "42k",
    agentFindings: ["B", "C"],
    specification: ["R₁", "R₂"],
    coverage: ["A", "B"],
    reviewEvent: true,
  },
  {
    id: "revision-3",
    label: "Revision 3",
    agentTokens: "56k",
    agentFindings: ["A", "C"],
    specification: ["R₁", "R₂", "R₃", "M₁"],
    coverage: ["A", "B", "C"],
    reviewEvent: true,
  },
];

const operatingModel = [
  { label: "Who", review: "Security agent", scan: "Taint analysis engine" },
  { label: "How", review: "Model reasoning", scan: "Formal inter-procedural dataflow analysis" },
  { label: "When", review: "When new context appears", scan: "Whenever a scan runs" },
  { label: "What", review: "Taint rules and dependency models", scan: "Detailed dataflow traces" },
];

function FindingMarks({ findings, stable = false }: { findings: string[]; stable?: boolean }) {
  return (
    <span className="inline-flex gap-1" aria-label={`Findings ${findings.join(", ")}`}>
      {findings.map((finding) => (
        <span
          key={finding}
          className={[
            "inline-flex h-5 w-5 items-center justify-center rounded font-mono text-[8px] font-semibold",
            stable ? "bg-primary text-primary-foreground" : "bg-foreground text-background",
          ].join(" ")}
        >
          {finding}
        </span>
      ))}
    </span>
  );
}

function TimelineNode({ active, children, accent = false }: { active: boolean; children: ReactNode; accent?: boolean }) {
  return (
    <div className={[
      "relative z-10 mx-auto flex min-h-14 w-[8.5rem] flex-col justify-center rounded-lg border px-3 py-2 transition-all duration-700",
      active
        ? accent
          ? "scale-[1.03] border-primary bg-primary/10 text-foreground shadow-sm"
          : "scale-[1.03] border-foreground/50 bg-background text-foreground shadow-sm"
        : "border-border bg-background/80 text-muted-foreground opacity-55",
    ].join(" ")}>
      {children}
    </div>
  );
}

export function ContinuousSecurity() {
  const [momentIndex, setMomentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const moment = moments[momentIndex];

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const interval = window.setInterval(() => {
      setMomentIndex((current) => (current + 1) % moments.length);
    }, 2600);
    return () => window.clearInterval(interval);
  }, [paused]);

  return (
    <section
      className="band"
      aria-labelledby="continuous-security-heading"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="section-header">
          <p className="section-eyebrow">The flexibility of agent reasoning and the consistency of formal analysis combined</p>
          <h2 id="continuous-security-heading" className="section-heading">Turn one security review into unlimited security scans</h2>
        </div>

        <figure className="section-content overflow-hidden rounded-xl border border-border-strong bg-background" aria-labelledby="continuous-security-heading">
          <figcaption className="sr-only">Three application-security approaches compared across repeated reviews and revisions</figcaption>

          <div className="overflow-x-auto bg-code-header scrollbar-thin">
            <div className="min-w-[58rem]">
              <div className="grid grid-cols-[10rem_1fr] border-b border-border">
                <div className="flex items-center border-r border-border px-4 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Approach</div>
                <div className="relative grid grid-cols-4 px-6 py-3">
                  <span
                    className="pointer-events-none absolute bottom-0 top-0 w-px bg-primary/70 transition-[left] duration-700 ease-out"
                    style={{ left: `${((momentIndex + 0.5) / moments.length) * 100}%` }}
                    aria-hidden="true"
                  ></span>
                  {moments.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={index === momentIndex}
                      onClick={() => {
                        setPaused(true);
                        setMomentIndex(index);
                      }}
                      className={[
                        "relative z-10 mx-auto min-h-10 rounded-md px-3 py-2 font-mono text-[9px] font-semibold uppercase tracking-[0.1em] transition-colors",
                        index === momentIndex ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-background hover:text-primary",
                      ].join(" ")}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-[10rem_1fr] border-b border-border">
                <div className="flex flex-col justify-center border-r border-border px-4 py-5">
                  <h3 className="font-mono text-xs font-semibold text-foreground">Agent review</h3>
                  <p className="mt-1 font-mono text-[9px] leading-4 text-muted-foreground">Informal knowledge</p>
                </div>
                <div className="relative grid grid-cols-4 items-center px-6 py-5" aria-label="Agent review repeats from informal Markdown knowledge">
                  {moments.map((item, index) => (
                    <TimelineNode key={item.id} active={index === momentIndex}>
                      <span className="font-mono text-[9px] font-semibold">review.md</span>
                      <span className="mt-2 flex items-center justify-between gap-2">
                        <FindingMarks findings={item.agentFindings} />
                        <span className="font-mono text-[8px] text-primary">{item.agentTokens} tokens</span>
                      </span>
                    </TimelineNode>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-[10rem_1fr] border-b border-border">
                <div className="flex flex-col justify-center border-r border-border px-4 py-5">
                  <h3 className="font-mono text-xs font-semibold text-foreground">Static analysis</h3>
                  <p className="mt-1 font-mono text-[9px] leading-4 text-muted-foreground">Fixed rules + models</p>
                </div>
                <div className="relative grid grid-cols-4 items-center px-6 py-5" aria-label="Static analysis repeats a fixed specification">
                  <span className="absolute left-[12.5%] right-[12.5%] top-1/2 h-px bg-border-strong" aria-hidden="true"></span>
                  {moments.map((item, index) => (
                    <TimelineNode key={item.id} active={index === momentIndex}>
                      <span className="flex items-center justify-between gap-2 font-mono text-[9px] font-semibold"><span>R₁ M₁</span><span className="text-[8px] text-muted-foreground">fixed</span></span>
                      <span className="mt-2 flex items-center justify-between gap-2"><span className="font-mono text-[8px] text-muted-foreground">scan</span><FindingMarks findings={["A"]} stable /></span>
                    </TimelineNode>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-[10rem_1fr]">
                <div className="flex flex-col justify-center border-r border-border px-4 py-5">
                  <h3 className="font-mono text-xs font-semibold text-primary">OpenTaint</h3>
                  <p className="mt-1 font-mono text-[9px] leading-4 text-muted-foreground">Accumulating specification</p>
                </div>
                <div className="relative grid grid-cols-4 items-center px-6 py-5" aria-label="The formal specification is applied by taint analysis">
                  <span className="absolute left-[12.5%] right-[12.5%] top-1/2 h-px bg-primary/45" aria-hidden="true"></span>
                  <span
                    className="pointer-events-none absolute left-[12.5%] top-1/2 h-px bg-primary transition-[width] duration-700 ease-out"
                    style={{ width: `${momentIndex * 25}%` }}
                    aria-hidden="true"
                  ></span>
                  {moments.map((item, index) => (
                    <TimelineNode key={item.id} active={index === momentIndex} accent>
                      <span className="flex items-center justify-between gap-2 font-mono text-[9px] font-semibold">
                        <span>{item.specification.join(" ")}</span>
                        <span className="text-[8px] text-muted-foreground">{item.reviewEvent ? "enacted" : "unchanged"}</span>
                      </span>
                      <span className="mt-2 flex items-center justify-between gap-2"><span className="font-mono text-[8px] text-muted-foreground">scan</span><FindingMarks findings={item.coverage} stable /></span>
                    </TimelineNode>
                  ))}
                  <span className="sr-only" aria-label={`Formal specification contains ${moment.specification.join(", ")}`}></span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_3rem_1fr] border-t border-border-strong sm:grid-cols-[1fr_6rem_1fr]">
            <div className="px-3 py-4 text-right sm:px-6 sm:py-5">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground">One security review</p>
            </div>
            <div className="flex items-center justify-center border-x border-border px-1 font-mono text-[8px] uppercase tracking-[0.08em] text-muted-foreground sm:text-[9px] sm:tracking-[0.1em]">Review / scan</div>
            <div className="px-3 py-4 text-left sm:px-6 sm:py-5">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">Unlimited security scans</p>
            </div>
          </div>

          <div className="divide-y divide-border border-t border-border">
            {operatingModel.map((row) => (
              <div key={row.label} className="grid grid-cols-[1fr_3rem_1fr] sm:grid-cols-[1fr_6rem_1fr]">
                <p className="px-3 py-3 text-right font-mono text-[10px] font-medium leading-5 text-foreground sm:px-6 sm:text-xs">{row.review}</p>
                <p className="flex items-center justify-center border-x border-border px-1 py-3 font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground sm:text-[10px]">{row.label}</p>
                <p className="px-3 py-3 text-left font-mono text-[10px] font-medium leading-5 text-foreground sm:px-6 sm:text-xs">{row.scan}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-border-strong bg-primary/[0.04] px-4 py-4 text-center font-mono text-sm font-semibold text-foreground" aria-live="polite">
            <span className="text-primary">Coverage</span>
            <span className="mx-3 text-muted-foreground">=</span>
            {moment.coverage.join(" ∪ ")}
            <span className="ml-4 text-[10px] font-normal text-muted-foreground"><span>0 model tokens</span> per scan</span>
          </div>
        </figure>
      </div>
    </section>
  );
}
