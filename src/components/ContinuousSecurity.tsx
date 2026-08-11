import { useEffect, useState } from "react";

type Scene = {
  id: string;
  label: string;
  commit: string;
  agentTokens: string;
  agentFindings: string[];
  markdownFiles: number;
  openTaintTokens: string;
  specification: string[];
  coverage: string[];
  reviewEvent: boolean;
};

const scenes: Scene[] = [
  {
    id: "review",
    label: "First review",
    commit: "7a1c9e",
    agentTokens: "14k",
    agentFindings: ["A", "B"],
    markdownFiles: 1,
    openTaintTokens: "14k",
    specification: ["R₁"],
    coverage: ["A"],
    reviewEvent: true,
  },
  {
    id: "repeat",
    label: "Same review",
    commit: "7a1c9e",
    agentTokens: "28k",
    agentFindings: ["A", "C"],
    markdownFiles: 2,
    openTaintTokens: "14k",
    specification: ["R₁"],
    coverage: ["A"],
    reviewEvent: false,
  },
  {
    id: "revision-2",
    label: "Revision 2",
    commit: "c402bf",
    agentTokens: "42k",
    agentFindings: ["B", "C"],
    markdownFiles: 3,
    openTaintTokens: "25k",
    specification: ["R₁", "R₂"],
    coverage: ["A", "B"],
    reviewEvent: true,
  },
  {
    id: "revision-3",
    label: "Revision 3",
    commit: "f83d21",
    agentTokens: "56k",
    agentFindings: ["A", "C"],
    markdownFiles: 4,
    openTaintTokens: "37k",
    specification: ["R₁", "R₂", "R₃", "M₁"],
    coverage: ["A", "B", "C"],
    reviewEvent: true,
  },
];

const allFindings = ["A", "B", "C"];

const operatingModel = [
  { label: "Who", review: "Security agent", scan: "Taint analysis engine" },
  { label: "How", review: "Model reasoning", scan: "Formal inter-procedural dataflow analysis" },
  { label: "When", review: "When new context appears", scan: "Whenever a scan runs" },
  { label: "What", review: "AST-pattern taint rules and dependency models", scan: "Detailed dataflow traces" },
];

function FindingSet({ findings, stable = false }: { findings: string[]; stable?: boolean }) {
  return (
    <div className="flex items-center gap-2" aria-label={`Findings ${findings.join(", ")}`}>
      {allFindings.map((finding) => {
        const active = findings.includes(finding);
        return (
          <span
            key={finding}
            className={[
              "inline-flex h-7 w-7 items-center justify-center border font-mono text-[11px] font-semibold transition-all duration-500",
              active
                ? stable
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground opacity-30",
            ].join(" ")}
          >
            {finding}
          </span>
        );
      })}
    </div>
  );
}

function Flow({ modeled }: { modeled: boolean }) {
  return (
    <div className="grid grid-cols-[auto_1fr_auto_1fr_auto] items-center" aria-label={modeled ? "The modeled flow reaches Context.eval" : "The flow stops at an opaque external method"}>
      <span className="border border-border-strong bg-background px-2 py-2 font-mono text-[9px] text-foreground">HTTP input</span>
      <span className="h-px bg-primary" aria-hidden="true" />
      <span className={[
        "border px-2 py-2 text-center font-mono text-[9px]",
        modeled ? "border-primary bg-primary/10 text-primary" : "border-dashed border-border-strong text-muted-foreground",
      ].join(" ")}>
        {modeled ? "model M₁" : "external(?)"}
      </span>
      <span className={modeled ? "h-px bg-primary" : "relative h-px bg-border-strong"} aria-hidden="true">
        {!modeled && <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-1 font-mono text-xs text-primary">×</span>}
      </span>
      <span className={[
        "border px-2 py-2 font-mono text-[9px]",
        modeled ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground opacity-45",
      ].join(" ")}>Context.eval</span>
    </div>
  );
}

export function ContinuousSecurity() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const scene = scenes[sceneIndex];

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const interval = window.setInterval(() => {
      setSceneIndex((current) => (current + 1) % scenes.length);
    }, 3200);
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
          <p className="section-eyebrow">Continuous and lean application security testing</p>
          <h2 id="continuous-security-heading" className="section-heading">Review new context and continuously test what is already known</h2>
          <p className="mx-auto mt-6 max-w-[62ch] font-mono text-sm leading-7 text-muted-foreground">
            OpenTaint combines flexible agent reasoning with consistent formal taint analysis, so coverage grows without repeating the entire review.
          </p>
        </div>

        <div className="section-content">
          <div className="flex flex-wrap justify-center gap-2" aria-label="Comparison timeline">
            {scenes.map((item, index) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={index === sceneIndex}
                onClick={() => {
                  setPaused(true);
                  setSceneIndex(index);
                }}
                className={[
                  "min-h-11 border px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors",
                  index === sceneIndex
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border-strong bg-background text-muted-foreground hover:border-primary hover:text-primary",
                ].join(" ")}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-8 overflow-hidden border-y border-border-strong bg-background" aria-label="One review becomes unlimited scans">
            <div className="grid grid-cols-[1fr_3rem_1fr] border-b border-border-strong sm:grid-cols-[1fr_6rem_1fr]">
              <div className={[
                "continuous-review-phase px-3 py-4 text-right sm:px-6 sm:py-5",
                !scene.reviewEvent && "continuous-phase-idle",
              ].filter(Boolean).join(" ")}>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">One security review</p>
              </div>
              <div className="relative flex items-center px-2" aria-hidden="true">
                <span className="h-px w-full bg-border-strong"></span>
                <span className={[
                  "continuous-transfer absolute left-2 h-px bg-primary",
                  !scene.reviewEvent && "continuous-transfer-scan-only",
                ].join(" ")}></span>
              </div>
              <div className="continuous-scan-phase px-3 py-4 text-left sm:px-6 sm:py-5">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">Unlimited security scans</p>
              </div>
            </div>

            <div className="divide-y divide-border">
              {operatingModel.map((row) => (
                <div key={row.label} className="grid grid-cols-[1fr_3rem_1fr] sm:grid-cols-[1fr_6rem_1fr]">
                  <p className={[
                    "continuous-review-cell px-3 py-3 text-right font-mono text-[10px] font-medium leading-5 text-foreground sm:px-6 sm:text-xs",
                    !scene.reviewEvent && "continuous-phase-idle",
                  ].filter(Boolean).join(" ")}>{row.review}</p>
                  <p className="flex items-center justify-center border-x border-border px-1 py-3 font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground sm:text-[10px]">{row.label}</p>
                  <p className="continuous-scan-cell px-3 py-3 text-left font-mono text-[10px] font-medium leading-5 text-foreground sm:px-6 sm:text-xs">{row.scan}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 grid overflow-hidden border-y border-border-strong bg-background lg:grid-cols-3">
            <article className="min-w-0 border-b border-border-strong p-5 lg:border-b-0 lg:border-r lg:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Agent review alone</p>
                  <h3 className="mt-2 font-mono text-lg font-semibold text-foreground">Flexible, but costly to repeat</h3>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">{scene.commit}</span>
              </div>

              <div className="mt-6 border border-border bg-code-header p-3">
                <div className="flex items-center justify-between gap-4 font-mono text-[10px]">
                  <span className="text-foreground">Context loaded again</span>
                  <span className="font-semibold text-primary">{scene.agentTokens} tokens</span>
                </div>
                <div className="mt-3 space-y-1.5 font-mono text-[9px] text-muted-foreground">
                  <p>Read security-review.md</p>
                  <p>Read related application code</p>
                  <p>Interpret trust boundaries again</p>
                </div>
              </div>

              <div className="mt-6 flex items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">Current findings</p>
                  <div className="mt-2"><FindingSet findings={scene.agentFindings} /></div>
                </div>
                <div className="relative h-14 w-24" aria-label={`${scene.markdownFiles} Markdown review files`}>
                  {Array.from({ length: scene.markdownFiles }).map((_, index) => (
                    <span key={index} className="continuous-markdown-in absolute right-0 h-10 w-20 border border-border-strong bg-background px-2 pt-2 font-mono text-[7px] text-muted-foreground transition-all duration-500" style={{ bottom: `${index * 5}px`, right: `${index * 4}px`, animationDelay: `${index * 70}ms` }}>review.md</span>
                  ))}
                </div>
              </div>

              <p className="mt-5 border-l-2 border-primary pl-3 font-mono text-[11px] leading-5 text-muted-foreground">Markdown preserves prose. The agent must interpret it again before it can test new code.</p>
            </article>

            <article className="min-w-0 border-b border-border-strong p-5 lg:border-b-0 lg:border-r lg:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Fixed-specification taint analysis</p>
                  <h3 className="mt-2 font-mono text-lg font-semibold text-foreground">Consistent, but bounded</h3>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">CPU scan</span>
              </div>

              <div className="mt-8"><Flow modeled={false} /></div>

              <div className="mt-7 flex items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">Fixed specification</p>
                  <div className="mt-2 flex gap-2"><span className="border border-border-strong px-2 py-1 font-mono text-[10px] text-foreground">R₁</span></div>
                </div>
                <div className="text-right font-mono text-[10px] text-muted-foreground">
                  <p>0 model tokens</p>
                  <p className="mt-1">same result</p>
                </div>
              </div>

              <p className="mt-5 border-l-2 border-primary pl-3 font-mono text-[11px] leading-5 text-muted-foreground">It cannot invent a missing rule. Without a dependency model, the trace stops at opaque external code.</p>
            </article>

            <article className="min-w-0 p-5 lg:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">OpenTaint</p>
                  <h3 className="mt-2 font-mono text-lg font-semibold text-foreground">Flexible review, consistent scans</h3>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">{scene.openTaintTokens} tokens</span>
              </div>

              <div className="mt-6 flex min-h-7 flex-wrap gap-2" aria-label={`Formal specification contains ${scene.specification.join(", ")}`}>
                {scene.specification.map((artifact, index) => (
                  <span key={artifact} className="continuous-artifact-in border border-primary bg-primary/10 px-2 py-1 font-mono text-[10px] font-semibold text-primary" style={{ animationDelay: `${index * 90}ms` }}>{artifact}</span>
                ))}
                {!scene.reviewEvent && <span className="px-2 py-1 font-mono text-[9px] text-muted-foreground">specification unchanged</span>}
              </div>

              <div className="mt-5"><Flow modeled={scene.specification.includes("M₁")} /></div>

              <div className="mt-7 flex items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">Enacted coverage</p>
                  <div className="mt-2"><FindingSet findings={scene.coverage} stable /></div>
                </div>
                <div className="text-right font-mono text-[10px] text-muted-foreground">
                  <p>{scene.reviewEvent ? "review + enact" : "CPU scan only"}</p>
                  <p className="mt-1">whole codebase</p>
                </div>
              </div>

              <p className="mt-5 border-l-2 border-primary pl-3 font-mono text-[11px] leading-5 text-muted-foreground">New reviews extend or revise the formal specification. Every scan applies everything enacted so far.</p>
            </article>
          </div>

          <div className="border-b border-border-strong bg-primary/[0.04] px-4 py-5 text-center font-mono text-sm font-semibold text-foreground" aria-live="polite">
            <span className="text-primary">Coverage</span>
            <span className="mx-3 text-muted-foreground">=</span>
            {scene.coverage.join(" ∪ ")}
            <span className="ml-4 block text-[10px] font-normal text-muted-foreground sm:inline">same code + specification, same findings</span>
          </div>
        </div>
      </div>
    </section>
  );
}
