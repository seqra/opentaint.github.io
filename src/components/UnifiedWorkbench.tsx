import { useEffect, useRef, useState } from "react";
import { Code, Scale, ShieldAlert, Terminal } from "lucide-react";
import { TerminalDemo } from "./TerminalDemo";

const steps = [
  { id: "review", label: "Reviewing application", file: "ScriptEvaluator.java" },
  { id: "scan", label: "Running OpenTaint", file: "Terminal" },
  { id: "artifacts", label: "Writing security specifications", file: ".opentaint/" },
  { id: "report", label: "Opening finding", file: "OpenTaint report" },
] as const;

type StepId = (typeof steps)[number]["id"];

function CodeReview() {
  return (
    <div className="h-full min-w-[42rem] bg-[#fbfaf8] px-8 py-6 font-mono text-[12px] leading-7 text-[#4f4540] dark:bg-[#160d0b] dark:text-[#d9ccc7]">
      <p className="mb-6 text-[10px] text-[#9b8f89]">core/src/main/java/com/netflix/conductor/core/events/ScriptEvaluator.java</p>
      <pre><code>
        <span className="text-[#9b8f89]">198</span>{"  "}jsBindings.putMember(<span className="text-[#35735c] dark:text-[#83c9aa]">&quot;$&quot;</span>, input);{"\n"}
        <span className="text-[#9b8f89]">199</span>{"  "}<span className="text-[#8b2e27] dark:text-[#ff7b70]">if</span> (console != <span className="text-[#8b2e27] dark:text-[#ff7b70]">null</span>) {"{"}{"\n"}
        <span className="text-[#9b8f89]">200</span>{"      "}jsBindings.putMember(<span className="text-[#35735c] dark:text-[#83c9aa]">&quot;console&quot;</span>, console);{"\n"}
        <span className="text-[#9b8f89]">201</span>{"  "}{"}"}{"\n"}
        <span className="text-[#9b8f89]">202</span>{"  "}<span className="text-[#8b2e27] dark:text-[#ff7b70]">final</span> Future&lt;Value&gt; futureResult ={"\n"}
        <span className="block bg-[#f5d7d2] text-[#32110e] dark:bg-[#5c1c18] dark:text-[#ffe5df]"><span className="text-[#9b8f89] dark:text-[#d19791]">203</span>{"      "}executorService.submit(() -&gt; context.eval(<span className="text-[#35735c] dark:text-[#83c9aa]">&quot;js&quot;</span>, script));</span>
        <span className="text-[#9b8f89]">204</span>{"  "}Value value = futureResult.get(maxExecutionTimeSeconds.getSeconds(),{"\n"}
        <span className="text-[#9b8f89]">205</span>{"      "}TimeUnit.SECONDS);
      </code></pre>
      <div className="mt-8 grid grid-cols-2 gap-6 border-t border-[#ded8d3] pt-6 text-[10px] dark:border-[#48322d]">
        <p><span className="block text-[#9b8f89]">Untrusted value</span>workflow input</p>
        <p><span className="block text-[#9b8f89]">Security-sensitive call</span>Context.eval</p>
      </div>
    </div>
  );
}

function CliRun() {
  return (
    <div className="h-full bg-background"><TerminalDemo source="/demo/conductor.cast" fallbackSource="/demo/conductor.svg" ariaLabel="OpenTaint scanning Conductor 3.23.0" /></div>
  );
}

function Artifacts() {
  return (
    <div className="grid h-full bg-[#fbfaf8] font-mono text-[#4f4540] dark:bg-[#160d0b] dark:text-[#d9ccc7] lg:grid-cols-2">
      <div className="min-w-0 border-b border-border p-4 lg:border-b-0 lg:border-r lg:p-6">
        <p className="truncate text-[10px] font-semibold text-primary">graalvm-polyglot-eval.yaml</p>
        <pre className="mt-4 overflow-hidden text-[10px] leading-5 sm:text-[11px] sm:leading-6"><code>
          <span className="text-primary">id:</span> graalvm-polyglot-eval{"\n"}
          <span className="text-primary">mode:</span> taint{"\n"}
          <span className="text-primary">pattern-sinks:</span>{"\n"}
          {"  - patterns:\n"}
          {"      - pattern: |\n"}
          {"          (Context $CTX)\n"}
          {"            .eval($LANG, $INPUT)\n"}
          <span className="text-primary">        - focus:</span> $INPUT
        </code></pre>
      </div>
      <div className="min-w-0 p-4 lg:p-6">
        <p className="truncate text-[10px] font-semibold text-primary">org.graalvm.polyglot.yaml</p>
        <pre className="mt-4 overflow-hidden text-[10px] leading-5 sm:text-[11px] sm:leading-6"><code>
          <span className="text-primary">passThrough:</span>{"\n"}
          {"  - function: |\n"}
          {"      Context$Builder#option\n"}
          <span className="text-primary">    copy:</span>{"\n"}
          {"      - from: this\n"}
          {"        to: result\n\n"}
          <span className="text-primary">  - function:</span> Source$Builder#cached
        </code></pre>
      </div>
    </div>
  );
}

function FindingReport() {
  return (
    <iframe
      src="/reports/conductor-cve-2026-58138.html"
      title="Interactive OpenTaint vulnerability report"
      loading="lazy"
      className="h-full w-full border-0 bg-background"
    />
  );
}

function StepIcon({ id }: { id: StepId }) {
  if (id === "review") return <Code size={13} aria-hidden="true" />;
  if (id === "scan") return <Terminal size={13} aria-hidden="true" />;
  if (id === "artifacts") return <Scale size={13} aria-hidden="true" />;
  return <ShieldAlert size={13} aria-hidden="true" />;
}

function ViewerTabs({ active }: { active: "code" | "rules" }) {
  return (
    <div className="flex h-10 items-stretch border-b border-border bg-code-header font-mono text-[10px]" role="tablist" aria-label="Editor view">
      <div role="tab" aria-selected={active === "code"} className={["flex items-center gap-2 border-r border-border px-4", active === "code" ? "bg-background text-foreground" : "text-muted-foreground"].join(" ")}><Code size={13} aria-hidden="true" />Code</div>
      <div role="tab" aria-selected={active === "rules"} className={["flex items-center gap-2 border-r border-border px-4", active === "rules" ? "bg-background text-foreground" : "text-muted-foreground"].join(" ")}><Scale size={13} aria-hidden="true" />Rules</div>
      <p className="ml-auto flex min-w-0 items-center truncate px-4 text-[9px] text-muted-foreground">{active === "code" ? "ScriptEvaluator.java" : ".opentaint/"}</p>
    </div>
  );
}

function WorkSurface({ step }: { step: StepId }) {
  if (step === "review") return <CodeReview />;
  if (step === "scan") return <CliRun />;
  if (step === "artifacts") return <Artifacts />;
  return <FindingReport />;
}

export function UnifiedWorkbench() {
  const [stepIndex, setStepIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [inView, setInView] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const step = steps[stepIndex];

  useEffect(() => {
    if (!rootRef.current || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.35 });
    observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || !autoplay || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => setStepIndex((current) => (current + 1) % steps.length), 3600);
    return () => window.clearTimeout(timer);
  }, [autoplay, inView, stepIndex]);

  const select = (index: number) => {
    setAutoplay(false);
    setStepIndex(index);
  };

  return (
    <div ref={rootRef} data-testid="unified-workbench" className="mx-auto max-w-[80rem] overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_50%_0%,#d84b40_0%,#a82019_42%,#5e100c_100%)] p-3 sm:p-6 lg:p-10">
      <div className="overflow-hidden rounded-xl border border-black/20 bg-background shadow-[0_32px_96px_rgba(31,4,2,0.42)]">
        <div className="grid min-h-12 grid-cols-[1fr_auto_1fr] items-center border-b border-border bg-code-header px-4">
          <div className="flex gap-2" aria-hidden="true"><span className="h-2 w-2 rounded-full bg-muted-foreground/30" /><span className="h-2 w-2 rounded-full bg-muted-foreground/30" /><span className="h-2 w-2 rounded-full bg-muted-foreground/30" /></div>
          <p className="font-mono text-[10px] text-foreground">OpenTaint AppSec Agent</p>
          <p className="hidden justify-self-end font-mono text-[9px] text-muted-foreground sm:block">conductor-3.23.0</p>
        </div>

        <div className="grid lg:grid-cols-[19rem_1fr]">
          <aside className="border-b border-border bg-[#f5f3f0] p-4 dark:bg-[#120b09] lg:min-h-[34rem] lg:border-b-0 lg:border-r" aria-label="Agent activity">
            <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">You</p>
            <p className="mt-2 rounded-lg bg-background p-3 font-mono text-[11px] leading-5 text-foreground shadow-sm">Review Conductor 3.23.0 for unauthenticated code execution.</p>

            <p className="mt-6 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Agent</p>
            <p className="mt-2 font-mono text-[11px] leading-5 text-foreground">I’ll trace workflow input into the script evaluators and preserve what the review establishes.</p>

            <div className="mt-6 space-y-1" aria-label="Review progress">
              {steps.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => select(index)}
                  aria-label={item.label}
                  aria-current={index === stepIndex ? "step" : undefined}
                  className={[
                    "flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-left font-mono text-[10px] transition-colors",
                    index === stepIndex ? "bg-background text-foreground shadow-sm" : index < stepIndex ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  <span className={index <= stepIndex ? "text-primary" : "text-muted-foreground/50"}><StepIcon id={item.id} /></span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </aside>

          <section className="min-w-0 bg-background" aria-live="polite" aria-label={step.file}>
            {step.id === "review" && <ViewerTabs active="code" />}
            {step.id === "artifacts" && <ViewerTabs active="rules" />}
            {step.id === "scan" && <div className="flex h-10 items-center gap-2 border-b border-border bg-code-header px-4 font-mono text-[10px] text-foreground"><Terminal size={13} aria-hidden="true" />Terminal</div>}
            <div key={step.id} className={["demo-work-surface overflow-hidden", step.id === "report" ? "h-[30.5rem] lg:h-[34rem]" : "h-[28rem] lg:h-[31.5rem]"].join(" ")}>
              <WorkSurface step={step.id} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
