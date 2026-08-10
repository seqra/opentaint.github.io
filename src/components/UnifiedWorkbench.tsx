import { useEffect, useRef, useState } from "react";

const steps = [
  { id: "review", label: "Reviewing application", file: "MarketingTemplateService.java" },
  { id: "scan", label: "Running OpenTaint", file: "Terminal" },
  { id: "artifacts", label: "Writing security specifications", file: ".opentaint/" },
  { id: "report", label: "Opening finding", file: "OpenTaint report" },
] as const;

type StepId = (typeof steps)[number]["id"];

function CodeReview() {
  return (
    <div className="h-full min-w-[42rem] bg-[#fbfaf8] px-8 py-6 font-mono text-[12px] leading-7 text-[#4f4540] dark:bg-[#160d0b] dark:text-[#d9ccc7]">
      <p className="mb-6 text-[10px] text-[#9b8f89]">src/main/java/org/seqra/spring/content/MarketingTemplateService.java</p>
      <pre><code>
        <span className="text-[#9b8f89]">31</span>{"  "}<span className="text-[#8b2e27] dark:text-[#ff7b70]">public</span> String render(String template, Model model) {"{"}{"\n"}
        <span className="text-[#9b8f89]">32</span>{"    "}StringTemplateResolver resolver ={"\n"}
        <span className="text-[#9b8f89]">33</span>{"        "}<span className="text-[#8b2e27] dark:text-[#ff7b70]">new</span> StringTemplateResolver();{"\n"}
        <span className="text-[#9b8f89]">34</span>{"    "}resolver.setTemplateMode(TemplateMode.HTML);{"\n"}
        <span className="text-[#9b8f89]">35</span>{"    "}resolver.setCacheable(<span className="text-[#8b2e27] dark:text-[#ff7b70]">false</span>);{"\n"}
        <span className="text-[#9b8f89]">36</span>{"\n"}
        <span className="block bg-[#f5d7d2] text-[#32110e] dark:bg-[#5c1c18] dark:text-[#ffe5df]"><span className="text-[#9b8f89] dark:text-[#d19791]">37</span>{"    "}<span className="text-[#8b2e27] dark:text-[#ff7b70]">return</span> engine.process(template, context);</span>
        <span className="text-[#9b8f89]">38</span>{"  "}{"}"}
      </code></pre>
      <div className="mt-8 grid grid-cols-2 gap-6 border-t border-[#ded8d3] pt-6 text-[10px] dark:border-[#48322d]">
        <p><span className="block text-[#9b8f89]">Untrusted value</span>template</p>
        <p><span className="block text-[#9b8f89]">Security-sensitive call</span>engine.process</p>
      </div>
    </div>
  );
}

function CliRun() {
  return (
    <div className="h-full bg-[#110b09] px-6 py-6 font-mono text-[11px] leading-6 text-[#e8ded9] sm:px-8 sm:text-[12px]">
      <p><span className="text-[#ff655b]">$</span> opentaint scan .</p>
      <div className="mt-6 text-[#aa9991]">
        <p>Building project model <span className="text-[#e8ded9]">Java · Spring</span></p>
        <p>Loading security specifications <span className="text-[#e8ded9]">148 rules · 27 models</span></p>
        <p>Analyzing project <span className="text-[#e8ded9]">1,284 methods</span></p>
      </div>
      <div className="mt-8 border-t border-[#51352f] pt-6">
        <p className="text-[#ff8b82]">2 findings</p>
        <p className="mt-4 text-[#e8ded9]">Critical&nbsp; Server-side template injection</p>
        <p className="text-[#aa9991]">MarketingTemplateService.java:37 · 10 steps</p>
        <p className="mt-3 text-[#e8ded9]">High&nbsp;&nbsp;&nbsp;&nbsp; Server-side request forgery</p>
        <p className="text-[#aa9991]">UrlFetchService.kt:33 · 7 steps</p>
      </div>
      <p className="mt-8 text-[#75c79f]">Scan completed in 8.4s</p>
    </div>
  );
}

function Artifacts() {
  return (
    <div className="grid h-full bg-[#fbfaf8] font-mono text-[#4f4540] dark:bg-[#160d0b] dark:text-[#d9ccc7] lg:grid-cols-2">
      <div className="min-w-0 border-b border-border p-4 lg:border-b-0 lg:border-r lg:p-6">
        <p className="truncate text-[10px] font-semibold text-primary">server-side-template-injection.yaml</p>
        <pre className="mt-4 overflow-hidden text-[10px] leading-5 sm:text-[11px] sm:leading-6"><code>
          <span className="text-primary">id:</span> thymeleaf-template-injection{"\n"}
          <span className="text-primary">mode:</span> taint{"\n"}
          <span className="text-primary">pattern-sinks:</span>{"\n"}
          {"  - patterns:\n"}
          {"      - pattern: |\n"}
          {"          $ENGINE.process(\n"}
          {"            $TEMPLATE, ...)\n"}
          <span className="text-primary">        - focus:</span> $TEMPLATE
        </code></pre>
      </div>
      <div className="min-w-0 p-4 lg:p-6">
        <p className="truncate text-[10px] font-semibold text-primary">org.thymeleaf.yaml</p>
        <pre className="mt-4 overflow-hidden text-[10px] leading-5 sm:text-[11px] sm:leading-6"><code>
          <span className="text-primary">passThrough:</span>{"\n"}
          {"  - function: |\n"}
          {"      Context#setVariable\n"}
          <span className="text-primary">    copy:</span>{"\n"}
          {"      - from: value\n"}
          {"        to: this\n\n"}
          <span className="text-primary">  - function:</span> Model#addAttribute
        </code></pre>
      </div>
    </div>
  );
}

function FindingReport() {
  const trace = [
    ["Request body", "TemplateRequest.java:15"],
    ["Controller parameter", "CampaignController.java:42"],
    ["Service call", "MarketingTemplateService.java:31"],
    ["Template evaluated", "MarketingTemplateService.java:37"],
  ];

  return (
    <a href="https://viewer.opentaint.org/" target="_blank" rel="noreferrer" className="grid h-full bg-[#fbfaf8] text-[#4f4540] dark:bg-[#160d0b] dark:text-[#d9ccc7] lg:grid-cols-[12rem_1fr]" aria-label="Open the OpenTaint report viewer">
      <div className="hidden border-r border-border p-4 font-mono lg:block">
        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Findings</p>
        <p className="mt-4 border-l-2 border-primary bg-primary/5 px-3 py-3 text-[10px] font-semibold leading-5">Template injection</p>
        <p className="mt-2 px-3 py-2 text-[10px] text-muted-foreground">Server-side request forgery</p>
      </div>
      <div className="min-w-0 p-4 font-mono sm:p-6">
        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-primary">Critical · CWE-94</p>
        <h3 className="mt-3 text-sm font-semibold leading-6 sm:text-base">Untrusted template reaches the template engine</h3>
        <p className="mt-1 text-[10px] text-muted-foreground">MarketingTemplateService.java:37</p>
        <ol className="mt-6 border-l border-primary pl-4">
          {trace.map(([label, file], index) => (
            <li key={label} className={index === trace.length - 1 ? "" : "pb-4"}>
              <p className="text-[10px] font-semibold sm:text-[11px]">{index + 1}. {label}</p>
              <p className="mt-1 text-[9px] text-muted-foreground sm:text-[10px]">{file}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 border-t border-border pt-4 text-[10px] font-semibold text-primary">Open complete finding</p>
      </div>
    </a>
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
          <p className="hidden justify-self-end font-mono text-[9px] text-muted-foreground sm:block">demo-app</p>
        </div>

        <div className="grid lg:grid-cols-[19rem_1fr]">
          <aside className="border-b border-border bg-[#f5f3f0] p-4 dark:bg-[#120b09] lg:min-h-[34rem] lg:border-b-0 lg:border-r" aria-label="Agent activity">
            <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">You</p>
            <p className="mt-2 rounded-lg bg-background p-3 font-mono text-[11px] leading-5 text-foreground shadow-sm">Review this application for exploitable vulnerabilities.</p>

            <p className="mt-6 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Agent</p>
            <p className="mt-2 font-mono text-[11px] leading-5 text-foreground">I’ll trace untrusted input, verify reachable operations, and preserve what the review establishes.</p>

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
                  <span className={index <= stepIndex ? "text-primary" : "text-muted-foreground/50"}>0{index + 1}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </aside>

          <section className="min-w-0 bg-background" aria-live="polite" aria-label={step.file}>
            <div className="flex h-10 items-center border-b border-border bg-code-header px-4 font-mono text-[9px] text-muted-foreground sm:text-[10px]">{step.file}</div>
            <div key={step.id} className="demo-work-surface h-[28rem] overflow-hidden lg:h-[31.5rem]">
              <WorkSurface step={step.id} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
