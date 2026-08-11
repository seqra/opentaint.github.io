import { useEffect, useState } from "react";

type Scene = {
  id: string;
  label: string;
  agentTokens: string;
  agentFindings: string[];
  specification: string[];
  coverage: string[];
  reviewEvent: boolean;
};

const scenes: Scene[] = [
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
];

const allFindings = ["A", "B", "C"];

function FindingSet({ findings, stable = false }: { findings: string[]; stable?: boolean }) {
  return (
    <div className="flex items-center gap-2" aria-label={`Findings ${findings.join(", ")}`}>
      {allFindings.map((finding) => {
        const active = findings.includes(finding);
        return (
          <span
            key={finding}
            className={[
              "inline-flex h-8 w-8 items-center justify-center rounded-md border font-mono text-[11px] font-semibold transition-all duration-500",
              active
                ? stable
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground opacity-25",
            ].join(" ")}
          >
            {finding}
          </span>
        );
      })}
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
        </div>

        <div className="section-content overflow-hidden rounded-xl border border-border-strong bg-background">
          <div className="flex flex-wrap justify-center gap-2 border-b border-border bg-code-header p-2" aria-label="Comparison timeline">
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
                  "min-h-10 rounded-md border px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors",
                  index === sceneIndex
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border-strong bg-background text-muted-foreground hover:border-primary hover:text-primary",
                ].join(" ")}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-[1fr_3rem_1fr] border-b border-border-strong sm:grid-cols-[1fr_6rem_1fr]">
            <div className={[
              "continuous-review-phase px-3 py-4 text-right sm:px-6 sm:py-5",
              !scene.reviewEvent && "continuous-phase-idle",
            ].filter(Boolean).join(" ")}>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground">One security review</p>
            </div>
            <div className="relative flex items-center px-2" aria-hidden="true">
              <span className="h-px w-full bg-border-strong"></span>
              <span className={[
                "continuous-transfer absolute left-2 h-px bg-primary",
                !scene.reviewEvent && "continuous-transfer-scan-only",
              ].filter(Boolean).join(" ")}></span>
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

            <div className="grid grid-cols-[1fr_3rem_1fr] sm:grid-cols-[1fr_6rem_1fr]">
              <div className="min-w-0 px-3 py-4 sm:px-6 sm:py-6">
                <p className="text-right font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Taint rules + dependency models</p>
                <div className="mt-3 flex min-h-8 flex-wrap justify-end gap-2" aria-label={`Formal specification contains ${scene.specification.join(", ")}`}>
                  {scene.specification.map((artifact, index) => (
                    <span key={artifact} className="continuous-artifact-in rounded-md border border-primary bg-primary/10 px-2 py-1 font-mono text-[10px] font-semibold text-primary" style={{ animationDelay: `${index * 90}ms` }}>{artifact}</span>
                  ))}
                  {!scene.reviewEvent && <span className="self-center font-mono text-[9px] text-muted-foreground">unchanged</span>}
                </div>
              </div>
              <p className="flex items-center justify-center border-x border-border px-1 py-3 font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground sm:text-[10px]">What</p>
              <div className="min-w-0 px-3 py-4 sm:px-6 sm:py-6">
                <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Applied across the codebase</p>
                <div className="mt-3 flex items-center gap-2" aria-label="The formal specification is applied by taint analysis">
                  <span className="shrink-0 rounded-md border border-border-strong px-2 py-1 font-mono text-[9px] text-foreground">Spec</span>
                  <span className="relative h-px min-w-4 flex-1 overflow-hidden bg-border-strong" aria-hidden="true"><span className="continuous-scan-pulse absolute inset-y-0 left-0 w-1/2 bg-primary"></span></span>
                  <span className="shrink-0 rounded-md border border-primary bg-primary/10 px-2 py-1 font-mono text-[9px] text-primary">Scan</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid border-t border-border-strong sm:grid-cols-2">
            <div className="border-b border-border p-4 sm:border-b-0 sm:border-r sm:p-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Agent-only result</p>
                  <div className="mt-3"><FindingSet findings={scene.agentFindings} /></div>
                </div>
                <p className="text-right font-mono text-[10px] text-muted-foreground"><span className="block font-semibold text-primary">{scene.agentTokens} tokens</span>findings vary</p>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Enacted coverage</p>
                  <div className="mt-3"><FindingSet findings={scene.coverage} stable /></div>
                </div>
                <p className="text-right font-mono text-[10px] text-muted-foreground"><span className="block font-semibold text-foreground">0 model tokens</span>same scan, same result</p>
              </div>
            </div>
          </div>

          <div className="border-t border-border-strong bg-primary/[0.04] px-4 py-4 text-center font-mono text-sm font-semibold text-foreground" aria-live="polite">
            <span className="text-primary">Coverage</span>
            <span className="mx-3 text-muted-foreground">=</span>
            {scene.coverage.join(" ∪ ")}
          </div>
        </div>
      </div>
    </section>
  );
}
