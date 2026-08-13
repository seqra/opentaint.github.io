import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileCode2,
  FileText,
  Search,
  SkipBack,
  SkipForward,
} from "lucide-react";

const stages = [
  { id: "review", number: "01", label: "Discovery" },
  { id: "enact", number: "02", label: "Enact" },
  { id: "scan", number: "03", label: "Scan" },
  { id: "triage", number: "04", label: "Triage" },
  { id: "report", number: "05", label: "Report" },
] as const;

const timeline = ["review", "enact", "scan", "triage", "report"] as const;
type TimelineId = (typeof timeline)[number];

function scrollOffset(container: HTMLElement, target: HTMLElement) {
  return target.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
}

function timelineMetrics(track: HTMLElement) {
  const sticky = track.firstElementChild as HTMLElement | null;
  const stickyTop = sticky ? Number.parseFloat(window.getComputedStyle(sticky).top) || 0 : 0;
  const start = track.getBoundingClientRect().top + window.scrollY - stickyTop;
  const distance = Math.max(1, track.offsetHeight - (sticky?.offsetHeight ?? window.innerHeight));
  return { start, distance };
}

function withStageHolds(progress: number) {
  const startHold = 0.125;
  const finishHold = 0.45;
  if (progress <= startHold) return 0;
  if (progress >= 1 - finishHold) return 1;
  return (progress - startHold) / (1 - startHold - finishHold);
}

function UserPrompt({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[10px] bg-[#e8f0fb] px-4 py-3 text-[14px] leading-5 text-[#242b33] dark:bg-[hsl(var(--agent)/0.16)] dark:text-foreground">
      {children}
    </div>
  );
}

function AgentText({ children }: { children: ReactNode }) {
  return (
    <p className="mt-6 text-[14px] leading-[21px] text-foreground first:mt-0">{children}</p>
  );
}

type ToolActivityProps = {
  title: string;
  detail?: string;
  activity?: string[];
  meta?: string;
  icon?: "file" | "search" | "check";
  children?: ReactNode;
  added?: number;
  removed?: number;
  defaultOpen?: boolean;
};

function ToolActivity({ title, detail, activity, meta, icon = "file", children, added, removed, defaultOpen = false }: ToolActivityProps) {
  const [open, setOpen] = useState(defaultOpen);
  const Icon = icon === "search" ? Search : icon === "check" ? Check : FileCode2;
  const iconColor = icon === "check" ? "text-[#2d8a4e] dark:text-[#79bd8f]" : "text-muted-foreground";
  return (
    <div className="mt-3">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-8 w-full items-center gap-2 text-left text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronDown className={["h-4 w-4 shrink-0 transition-transform", open ? "" : "-rotate-90"].join(" ")} strokeWidth={1.8} aria-hidden="true" />
        <Icon className={`h-4 w-4 shrink-0 ${iconColor}`} strokeWidth={1.7} aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate text-[14px] leading-[21px]">{title}</span>
        {added !== undefined && <span className="shrink-0 font-mono text-[11px] text-[#2d8a4e] dark:text-[#79bd8f]">+{added}</span>}
        {removed !== undefined && <span className="shrink-0 font-mono text-[11px] text-[#c73a32] dark:text-[#ff746c]">-{removed}</span>}
        {meta && <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{meta}</span>}
      </button>
      {open && (detail || activity || children) && (
        <div className="mt-2 overflow-hidden rounded-[10px] border border-black/[0.06] bg-[#f6f6f4] dark:border-white/10 dark:bg-white/[0.035]">
          {detail && <p className="px-3 py-2 font-mono text-[11px] leading-5 text-muted-foreground">{detail}</p>}
          {activity && (
            <div className="px-3 py-2 font-mono text-[11px] leading-5 text-muted-foreground">
              {activity.map((item) => <div key={item}>{item}</div>)}
            </div>
          )}
          {children}
        </div>
      )}
    </div>
  );
}

function CommandCard({ children }: { children: ReactNode }) {
  return (
    <pre className="overflow-x-auto bg-[#f3f2ef] px-3 py-3 text-[13px] leading-5 text-[#312d2a] antialiased scrollbar-thin dark:bg-code dark:text-[var(--code-text)]" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace', WebkitFontSmoothing: "antialiased", textRendering: "optimizeLegibility" }}><code>{children}</code></pre>
  );
}

function AgentStage({
  id,
  children,
  setRef,
}: {
  id: TimelineId;
  children: ReactNode;
  setRef: (node: HTMLElement | null) => void;
}) {
  return (
    <section
      ref={setRef}
      data-agent-stage={id}
      className="px-6 py-6 first:pt-8 last:min-h-full last:pb-8"
    >
      {children}
    </section>
  );
}

function SurfaceStory({ title, children, window }: { title: string; children: string; window: ReactNode }) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-[#efeeeb] p-4 dark:bg-background">
      <div className="mb-6 w-full shrink-0 px-3 pt-1 text-center">
        <p className="font-mono text-[20px] font-semibold leading-7 tracking-[-0.035em] text-foreground xl:text-[22px]">{title}</p>
        <p className="mx-auto mt-2 max-w-[46rem] text-[13px] leading-5 text-muted-foreground">{children}</p>
      </div>
      <div className="mx-auto min-h-0 w-full max-w-[42rem] flex-1">{window}</div>
    </div>
  );
}

function ReviewReport({ progress }: { progress: number }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    element.scrollTop = Math.max(0, element.scrollHeight - element.clientHeight) * progress;
  }, [progress]);

  return (
    <SurfaceStory
      title="Informal security knowledge"
      window={<div className="flex h-full flex-col overflow-hidden rounded-[10px] border border-border bg-[#faf9f7] shadow-sm dark:bg-card">
        <div className="relative flex h-10 shrink-0 items-center border-b border-border bg-[#f1f0ed] px-3 dark:bg-code-header">
          <div className="flex gap-2" aria-hidden="true">
            <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
            <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
            <span className="h-2 w-2 rounded-full bg-[#28c840]" />
          </div>
          <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-md border border-border bg-background/80 px-4 py-1">
            <FileText className="h-3 w-3 text-muted-foreground" strokeWidth={1.7} aria-hidden="true" />
            <span className="whitespace-nowrap font-mono text-[10px] text-foreground">security-review.md</span>
          </div>
          <span className="ml-auto hidden items-center gap-2 text-[10px] text-[#4c835e] dark:text-[#7fbd92] xl:flex"><Check className="h-3.5 w-3.5" /> Saved</span>
        </div>
        <div ref={scrollRef} data-testid="review-report-scroll" className="min-h-0 flex-1 overflow-hidden px-8 py-8 xl:px-10">
        <article className="mx-auto max-w-[36rem] text-[13px] leading-6 text-[#443c38] dark:text-card-foreground">
          <h3 className="text-[22px] font-semibold leading-8 tracking-[-0.025em] text-foreground">Unauthenticated execution review</h3>
          <p className="mt-2 text-muted-foreground">Security context captured from the reviewed request path.</p>

          <section className="mt-8 rounded-[10px] border border-primary/25 bg-primary/[0.05] p-4">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">Trust boundary</p>
            <p className="mt-2">Unauthenticated <code className="font-mono text-[12px] text-primary">POST /api/jobs</code> input controls the script passed into the execution pipeline.</p>
          </section>

          <section className="mt-3 rounded-[10px] border border-border bg-background p-4">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">Vulnerability pattern</p>
            <p className="mt-2">Request-controlled script reaches <code className="font-mono text-[12px] text-primary">Context.eval</code> with host access enabled.</p>
          </section>

          <section className="mt-3 rounded-[10px] border border-border bg-background p-4">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">Opaque method behavior</p>
            <p className="mt-2"><code className="font-mono text-[12px] text-primary">Context.Builder.option()</code> returns the same builder, preserving state through the chain.</p>
          </section>

          <div className="mt-6 flex items-center gap-3 rounded-[10px] border border-border bg-[#f5f3f0] px-4 py-3 font-mono dark:bg-code">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-[11px] font-semibold text-foreground">Unauthenticated script execution</span>
            <span className="ml-auto text-[10px] text-muted-foreground">CWE-94</span>
          </div>
        </article>
        </div>
      </div>}
    >
      Trust boundaries, vulnerability patterns, and opaque behavior in plain language.
    </SurfaceStory>
  );
}

const sourceRule = `rules:
  - id: http-input
    options:
      lib: true
    severity: NOTE
    message: Untrusted HTTP input enters the application
    languages:
      - java
    patterns:
      - patterns:
          - pattern: |
              @$ANNOTATION(...)
              $RETURNTYPE $METHOD(..., $TYPE $UNTRUSTED, ...) {
                ...
              }
          - metavariable-pattern:
              metavariable: $ANNOTATION
              patterns:
                - pattern-either:
                    - pattern: RequestMapping
                    - pattern: GetMapping
                    - pattern: PostMapping
                    - pattern: PutMapping
                    - pattern: PatchMapping
                    - pattern: DeleteMapping`;

const sinkRule = `rules:
  - id: graal-eval
    options:
      lib: true
    severity: NOTE
    message: Script text reaches GraalVM evaluation
    languages:
      - java
    patterns:
      - pattern: |
          (Context $CONTEXT).eval(..., $UNTRUSTED)
      - focus-metavariable: $UNTRUSTED`;

const joinRule = `rules:
  - id: graaljs-code-injection
    severity: ERROR
    message: >-
      Untrusted HTTP input reaches
      a host-enabled GraalVM Context.eval call,
      allowing attacker-controlled script execution.
    metadata:
      cwe: CWE-94
      short-description: Untrusted script execution
    languages:
      - java
    mode: join
    join:
      refs:
        - rule: java/lib/spring/http-input.yaml#http-input
          as: source
        - rule: java/lib/generic/graal-eval.yaml#graal-eval
          as: sink
      on:
        - 'source.$UNTRUSTED -> sink.$UNTRUSTED'`;

const dependencyModel = `language: java

passThrough:
  - function: org.graalvm.polyglot.Context$Builder#option
    copy:
      - from: this
        to: result`;

function YamlCode({ code }: { code: string }) {
  return (
    <pre data-testid="artifact-code" className="min-h-full overflow-x-auto bg-[#2d8a4e]/[0.08] py-2 text-[12.5px] leading-5 text-[#44342c] dark:bg-[#79bd8f]/[0.08] dark:text-[var(--code-text)] scrollbar-thin" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace' }}><code>
      {code.split("\n").map((line, index) => {
        const key = /^(\s*(?:-\s+)?)([\w-]+):(.*)$/.exec(line);
        return (
          <span key={index} className="grid min-w-max grid-cols-[2rem_1fr] px-2">
            <span className="select-none pr-2 text-right text-[#b3a396] dark:text-[#5e4a4a]">{index + 1}</span>
            <span className="whitespace-pre">{key ? <>{key[1]}<span className="text-primary">{key[2]}</span>:{key[3]}</> : line || " "}</span>
          </span>
        );
      })}
    </code></pre>
  );
}

function ArtifactFrame({ path, kind, added, removed = 0, open, onToggle, children }: { path: string; kind: string; added: number; removed?: number; open: boolean; onToggle: () => void; children: ReactNode }) {
  return (
    <article className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[10px] border border-border bg-[#f9f7f5] shadow-sm dark:bg-code">
      <button type="button" aria-expanded={open} onClick={onToggle} className="flex min-h-10 w-full items-center gap-2 bg-[#f0eeeb] px-3 text-left dark:bg-code-header">
        <ChevronDown className={["h-4 w-4 shrink-0 text-muted-foreground transition-transform", open ? "" : "-rotate-90"].join(" ")} strokeWidth={1.8} aria-hidden="true" />
        <FileCode2 className="h-3.5 w-3.5 text-primary" strokeWidth={1.7} aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-foreground">{path}</span>
        <span className="hidden text-[11px] text-muted-foreground xl:inline">{kind}</span>
        <span className="font-mono text-[10px] text-[#2d8a4e] dark:text-[#79bd8f]">+{added}</span>
        <span className="font-mono text-[10px] text-[#c73a32] dark:text-[#ff746c]">-{removed}</span>
      </button>
      <div className={[
        "grid min-h-0 transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
        open ? "flex-1 grid-rows-[minmax(0,1fr)]" : "grid-rows-[0fr]",
      ].join(" ")}>
        <div className="min-h-0 overflow-hidden">
          <div className="h-full border-t border-border">{children}</div>
        </div>
      </div>
    </article>
  );
}

function Artifact({ path, kind, code, open, onToggle, scrollProgress = 0 }: { path: string; kind: string; code: string; open: boolean; onToggle: () => void; scrollProgress?: number }) {
  const codeScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const codeScroll = codeScrollRef.current;
    if (!codeScroll || !open) return;
    codeScroll.scrollTop = Math.max(0, codeScroll.scrollHeight - codeScroll.clientHeight) * scrollProgress;
  }, [open, scrollProgress]);

  return (
    <ArtifactFrame path={path} kind={kind} added={code.split("\n").length} open={open} onToggle={onToggle}>
      <div ref={codeScrollRef} data-testid="artifact-code-scroll" className="h-full overflow-auto scrollbar-thin"><YamlCode code={code} /></div>
    </ArtifactFrame>
  );
}

const specificationMappings = [
  { facts: ["pattern"], artifact: "sink" },
  { facts: ["boundary"], artifact: "source" },
  { facts: ["boundary", "pattern"], artifact: "join" },
  { facts: ["behavior"], artifact: "model" },
] as const;

function SpecificationTransformation({ activeArtifact }: { activeArtifact: number }) {
  const mapping = specificationMappings[activeArtifact] ?? specificationMappings[0];
  const isFactActive = (fact: string) => mapping.facts.includes(fact as never);

  return (
    <div className="enact-map mx-auto mb-3 max-w-[40rem] rounded-[10px] border border-border bg-background p-3 font-mono" aria-label="Informal security knowledge transformed into formal specifications">
      <div className="enact-map-document">
        <span className="enact-map-file"><FileText aria-hidden="true" /> security-review.md</span>
        <div className="enact-map-facts">
          <span className={isFactActive("boundary") ? "is-active" : ""}>TRUST BOUNDARY</span>
          <span className={isFactActive("pattern") ? "is-active" : ""}>VULNERABILITY PATTERN</span>
          <span className={isFactActive("behavior") ? "is-active" : ""}>OPAQUE BEHAVIOR</span>
        </div>
      </div>

      <div className="enact-transform" aria-hidden="true">
        <span>AGENT</span>
        <i><b /></i>
      </div>

      <div className="enact-map-document enact-map-formal">
        <span className="enact-map-file"><FileCode2 aria-hidden="true" /> formal-specification.yaml</span>
        <div className="enact-map-facts">
          <span className={mapping.artifact === "sink" ? "is-active" : ""}>SINK RULE</span>
          <span className={mapping.artifact === "source" ? "is-active" : ""}>SOURCE RULE</span>
          <span className={mapping.artifact === "join" ? "is-active" : ""}>JOIN RULE</span>
          <span className={mapping.artifact === "model" ? "is-active" : ""}>DEPENDENCY MODEL</span>
        </div>
      </div>
    </div>
  );
}

function Specifications({ progress }: { progress: number }) {
  const position = Math.min(3.999, Math.max(0, progress) * 4);
  const activeArtifact = Math.floor(position);
  const artifactProgress = position - activeArtifact;
  const codeScrollProgress = Math.max(0, Math.min(1, (artifactProgress - 0.1) / 0.72));
  const [manualState, setManualState] = useState<{ stage: number; artifact: number } | null>(null);
  const openArtifact = manualState?.stage === activeArtifact ? manualState.artifact : activeArtifact;
  const artifacts = [
    { path: "rules/java/lib/generic/graal-eval.yaml", kind: "Library sink", code: sinkRule },
    { path: "rules/java/lib/spring/http-input.yaml", kind: "Library source", code: sourceRule },
    { path: "rules/java/security/graaljs-code-injection.yaml", kind: "Security join", code: joinRule },
    { path: "model/org.graalvm.polyglot.yaml", kind: "Dependency model", code: dependencyModel },
  ];

  return (
    <SurfaceStory
      title="Formal security specifications"
      window={<div data-testid="artifact-scroll" className="flex h-full min-h-0 flex-col overflow-hidden rounded-[10px] border border-border bg-[#f4f2ef] p-3 shadow-sm dark:bg-card">
        <SpecificationTransformation activeArtifact={activeArtifact} />
        <div className="artifact-stack mx-auto min-h-0 w-full max-w-[40rem] flex-1" data-open-artifact={openArtifact < 0 ? "none" : openArtifact}>
          {artifacts.map((artifact, index) => (
            <div key={artifact.path} className="contents">
              <div className="artifact-stack-item min-h-0">
                <Artifact
                  {...artifact}
                  open={index === openArtifact}
                  scrollProgress={index === activeArtifact ? codeScrollProgress : 0}
                  onToggle={() => setManualState({
                    stage: activeArtifact,
                    artifact: openArtifact === index ? -1 : index,
                  })}
                />
              </div>
              {index < artifacts.length - 1 && <span className="artifact-stack-spacer" aria-hidden="true" />}
            </div>
          ))}
        </div>
      </div>}
    >
      Agents translate informal knowledge into precise rules and dependency models.
    </SurfaceStory>
  );
}

type ScanFindingProps = {
  title: string;
  file: string;
  path: string;
};

function ScanFinding({ title, file, path }: ScanFindingProps) {
  return (
    <article className="grid h-full min-h-0 grid-cols-[minmax(0,1.05fr)_minmax(9rem,0.95fr)] overflow-hidden rounded-[10px] border border-primary/35 bg-background">
      <div className="flex min-h-0 flex-col justify-center px-4 py-3.5">
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-primary">CWE-94</span>
          <span className="font-mono text-[9px] text-muted-foreground">Candidate</span>
        </div>
        <h4 className="mt-3 text-[13px] font-semibold leading-5 text-foreground">{title}</h4>
        <p className="mt-2 font-mono text-[10px] text-muted-foreground">{file}</p>
      </div>
      <div className="flex min-h-0 flex-col justify-center border-l border-primary/15 bg-primary/[0.025] px-4 py-3.5 dark:bg-primary/[0.045]">
        <div className="flex items-center gap-2" aria-hidden="true">
          <span className="h-2 w-2 rounded-full bg-primary" />
          <span className="h-px flex-1 bg-primary/35" />
          <span className="h-2 w-2 rounded-sm border border-primary bg-primary/10" />
          <span className="h-px flex-1 bg-primary/35" />
          <span className="h-2 w-2 rotate-45 bg-primary" />
        </div>
        <p className="mt-2 text-[10px] leading-4 text-muted-foreground">{path}</p>
      </div>
    </article>
  );
}

function ScanResults({ progress }: { progress: number }) {
  const completion = Math.max(0, Math.min(1, progress));
  const complete = completion === 1;

  return (
    <SurfaceStory
      title="Fast scans"
      window={<div data-testid="scan-results-view" className="flex h-full flex-col overflow-hidden rounded-[10px] border border-border bg-[#f9f7f5] shadow-sm dark:bg-card">
        <div className="flex h-10 shrink-0 items-center justify-between border-b border-border bg-[#f0eeeb] px-4 font-mono dark:bg-code-header">
          <span className="text-[11px] font-semibold text-foreground">OpenTaint scan</span>
          <span className="text-[9px] font-semibold text-[#2d8a4e] dark:text-[#79bd8f]">{complete ? "COMPLETE" : "ANALYZING"}</span>
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-5">
          <div className="grid shrink-0 grid-cols-3 gap-2">
            <div className="rounded-lg border border-border bg-background p-4"><span className="font-mono text-[9px] text-muted-foreground">PROJECT MODEL</span><b className="mt-1 block text-[12px] text-foreground">Built</b></div>
            <div className="rounded-lg border border-border bg-background p-4"><span className="font-mono text-[9px] text-muted-foreground">RULES AND MODELS</span><b className="mt-1 block text-[12px] text-foreground">Loaded</b></div>
            <div className="rounded-lg border border-border bg-background p-4"><span className="font-mono text-[9px] text-muted-foreground">TIME</span><b className="mt-1 block text-[12px] text-foreground">30s</b></div>
          </div>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-border"><span className="block h-full origin-left bg-primary will-change-transform" style={{ transform: `scaleX(${completion})` }} /></div>
          <div className="mt-5 flex items-center justify-between">
            <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-foreground">2 candidate findings</h3>
          </div>
          <div className="mt-3 flex min-h-0 flex-1 items-center">
            <div className="grid h-5/6 min-h-0 w-full grid-rows-2 gap-4">
              <ScanFinding title="Unauthenticated script execution" file="ScriptRuntime.java:11" path="POST /api/jobs → Context.eval" />
              <ScanFinding title="Script execution in preview renderer" file="PreviewRenderer.java:11" path="POST /api/preview → Context.eval" />
            </div>
          </div>
        </div>
      </div>}
    >
      Formal program analysis searches the whole project in seconds.
    </SurfaceStory>
  );
}

const sourceFiles: Record<string, string> = {
  "JobController.java": `package demo.app.api;

import demo.app.execution.JobService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public final class JobController {
    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @PostMapping("/api/jobs")
    public String submit(@RequestParam("script") String script) {
        jobService.submit(script);
        return "accepted";
    }
}`,
  "JobService.java": `package demo.app.execution;

public final class JobService {
    private final ScriptDispatcher dispatcher;

    public JobService(ScriptDispatcher dispatcher) {
        this.dispatcher = dispatcher;
    }

    public void submit(String script) {
        dispatcher.dispatch(script);
    }
}`,
  "ScriptDispatcher.java": `package demo.app.execution;

public final class ScriptDispatcher {
    private final ExpressionEvaluator evaluator;

    public ScriptDispatcher(ExpressionEvaluator evaluator) {
        this.evaluator = evaluator;
    }

    public void dispatch(String script) {
        evaluator.evaluate(script);
    }
}`,
  "ExpressionEvaluator.java": `package demo.app.execution;

public final class ExpressionEvaluator {
    private final ScriptRuntime runtime;

    public ExpressionEvaluator(ScriptRuntime runtime) {
        this.runtime = runtime;
    }

    public void evaluate(String script) {
        runtime.execute(script);
    }
}`,
  "ScriptRuntime.java": `package demo.app.execution;

import org.graalvm.polyglot.Context;
import org.graalvm.polyglot.HostAccess;

public final class ScriptRuntime {
    public void execute(String script) {
        try (Context context = Context.newBuilder("js")
                .allowHostAccess(HostAccess.ALL)
                .build()) {
            context.eval("js", script);
        }
    }
}`,
};

export const flowSteps = [
  { file: "JobController.java", line: 17, message: 'Method entry marks the 1st argument of "submit" as $UNTRUSTED' },
  { file: "JobController.java", line: 18, message: 'Calling "submit" with $UNTRUSTED data at the 1st argument of "submit"' },
  { file: "JobService.java", line: 10, message: 'Entering "submit" with $UNTRUSTED data at the 1st argument of "submit"' },
  { file: "JobService.java", line: 11, message: 'Calling "dispatch" with $UNTRUSTED data at the 1st argument of "submit"' },
  { file: "ScriptDispatcher.java", line: 10, message: 'Entering "dispatch" with $UNTRUSTED data at the 1st argument of "dispatch"' },
  { file: "ScriptDispatcher.java", line: 11, message: 'Calling "evaluate" with $UNTRUSTED data at the 1st argument of "dispatch"' },
  { file: "ExpressionEvaluator.java", line: 10, message: 'Entering "evaluate" with $UNTRUSTED data at the 1st argument of "evaluate"' },
  { file: "ExpressionEvaluator.java", line: 11, message: 'Calling "execute" with $UNTRUSTED data at the 1st argument of "evaluate"' },
  { file: "ScriptRuntime.java", line: 7, message: 'Entering "execute" with $UNTRUSTED data at the 1st argument of "execute"' },
  { file: "ScriptRuntime.java", line: 11, message: "Untrusted HTTP input reaches a host-enabled GraalVM Context.eval call." },
] as const;

const reportTraceNodes = [
  { label: "HTTP INPUT" },
  { label: "SERVICE" },
  { label: "DISPATCH" },
  { label: "EVALUATE" },
  { label: "EVAL" },
] as const;

function ReportTraceMap({ stepIndex }: { stepIndex: number }) {
  const activeNode = Math.min(reportTraceNodes.length - 1, Math.floor(stepIndex / 2));

  return (
    <div className="report-trace-map" role="img" aria-label={`Dataflow trace progress: ${reportTraceNodes[activeNode].label}, step ${stepIndex + 1} of ${flowSteps.length}`}>
      {reportTraceNodes.map((node, index) => (
        <div className="contents" key={node.label}>
          <div className="report-trace-node" data-state={index < activeNode ? "passed" : index === activeNode ? "active" : "pending"}>
            <span><i /></span>
            <b>{node.label}</b>
          </div>
          {index < reportTraceNodes.length - 1 && (
            <span className="report-trace-edge" data-state={index < activeNode ? "passed" : index === activeNode ? "active" : "pending"} aria-hidden="true"><i /></span>
          )}
        </div>
      ))}
    </div>
  );
}

function JavaLine({ line }: { line: string }) {
  const tokens = line.split(/("[^"\\]*(?:\\.[^"\\]*)*"|\b(?:package|import|public|private|final|return|new|try|record|class|void|static)\b)/g);
  return <>{tokens.map((token, index) => {
    if (token.startsWith('"')) return <span key={index} className="text-[#ca2121] dark:text-[#ff3838]">{token}</span>;
    if (/^(?:package|import|public|private|final|return|new|try|record|class|void|static)$/.test(token)) return <span key={index} className="text-[#b91c1c] dark:text-[#ff6b6b]">{token}</span>;
    return <span key={index}>{token}</span>;
  })}</>;
}

const triageRuleLines = [
  { number: 9, content: "    patterns:" },
  { number: 10, content: "      - pattern: |" },
  { number: 11, content: "          (Context $CONTEXT).eval(..., $UNTRUSTED)" },
  { number: 12, content: "      - focus-metavariable: $UNTRUSTED" },
  { number: 13, content: "      - pattern-inside: |", added: true },
  { number: 14, content: "          Context $CONTEXT =", added: true },
  { number: 15, content: "            org.graalvm.polyglot.Context.newBuilder(...)", added: true },
  { number: 16, content: "              .allowHostAccess(org.graalvm.polyglot.HostAccess.ALL)", added: true },
  { number: 17, content: "              .build();", added: true },
  { number: 18, content: "          ...", added: true },
] as const;

function TriageCode({ tuned }: { tuned: boolean }) {
  return (
    <pre data-testid="triage-code" className="max-h-60 overflow-auto py-2 text-[12.5px] leading-5 text-[#44342c] dark:text-[var(--code-text)] scrollbar-thin" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace' }}><code>
      {triageRuleLines.map((line) => {
        const added = "added" in line && line.added;
        const key = /^(\s*(?:-\s+)?)([\w-]+):(.*)$/.exec(line.content);
        return (
          <span
            key={line.number}
            className={[
              "grid min-w-max grid-cols-[2rem_1fr] px-2 transition-[background-color,opacity,transform] duration-500",
              added && tuned ? "translate-y-0 bg-[#2d8a4e]/15 opacity-100 dark:bg-[#79bd8f]/15" : "",
              added && !tuned ? "translate-y-1 opacity-20" : "",
            ].join(" ")}
          >
            <span className="select-none pr-2 text-right text-[#b3a396] dark:text-[#5e4a4a]">{line.number}</span>
            <span className="whitespace-pre">{key ? <>{key[1]}<span className="text-primary">{key[2]}</span>:{key[3]}</> : line.content}</span>
          </span>
        );
      })}
    </code></pre>
  );
}

function TriageView({ progress }: { progress: number }) {
  const [open, setOpen] = useState(true);
  const tuned = progress >= 0.32;
  const rescanned = progress >= 0.62;

  return (
    <SurfaceStory
      title="Fewer false alarms"
      window={<div data-testid="triage-view" className="h-full overflow-hidden rounded-[10px] border border-border bg-[#f4f2ef] p-3 shadow-sm dark:bg-card">
        <div className="mx-auto grid h-full max-w-[40rem] grid-rows-[minmax(0,1fr)_auto_auto] gap-2">
          <div className="min-h-0 overflow-hidden">
            <ArtifactFrame
              path="rules/java/lib/generic/graal-eval.yaml"
              kind="Library sink"
              added={6}
              open={open}
              onToggle={() => setOpen((value) => !value)}
            >
              <div className="max-h-[13rem] overflow-auto scrollbar-thin"><TriageCode tuned={tuned} /></div>
            </ArtifactFrame>
          </div>

          <div className="triage-causal-rail" data-state={rescanned ? "complete" : tuned ? "tuned" : "reviewing"} aria-hidden="true">
            <span className="triage-causal-step"><i />ADD CONTEXT</span>
            <b><i /></b>
            <span className="triage-causal-step"><i />RESCAN</span>
            <b><i /></b>
            <span className="triage-causal-step"><i />REMOVE NOISE</span>
          </div>

          <section className="overflow-hidden rounded-[10px] border border-border bg-background">
            <div className="flex h-10 items-center justify-between border-b border-border bg-[#f0eeeb] px-4 font-mono dark:bg-code-header">
              <span className="text-[11px] font-semibold text-foreground">Rescan results</span>
              <span className="text-[9px] font-semibold text-[#2d8a4e] dark:text-[#79bd8f]">{rescanned ? "RULE TUNED" : "REFINING RULE"}</span>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-primary/30 bg-primary/[0.05] p-3"><span className="font-mono text-[9px] text-muted-foreground">CONFIRMED</span><b className="mt-1 block text-xl text-primary">1</b></div>
                <div className={["relative overflow-hidden rounded-lg border p-3 transition-colors duration-500", rescanned ? "border-[#2d8a4e]/30 bg-[#2d8a4e]/[0.05]" : "border-primary/30 bg-primary/[0.05]"].join(" ")}>
                  <span className="font-mono text-[9px] text-muted-foreground">FALSE ALARMS</span>
                  <span className="relative mt-1 block h-7 overflow-hidden text-xl font-semibold tabular-nums">
                    <b className={["absolute left-0 transition-all duration-500", rescanned ? "-translate-y-8 opacity-0" : "translate-y-0 text-primary opacity-100"].join(" ")}>1</b>
                    <b className={["absolute left-0 text-[#2d8a4e] transition-all duration-500 dark:text-[#79bd8f]", rescanned ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"].join(" ")}>0</b>
                  </span>
                </div>
              </div>
              <div className={["mt-3 flex min-h-12 items-center gap-3 rounded-lg border px-3 transition-all duration-500", rescanned ? "translate-y-0 border-primary/35 opacity-100" : "translate-y-2 border-border opacity-45"].join(" ")}>
                <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold text-foreground">Unauthenticated script execution</p>
                  <p className="mt-1 truncate font-mono text-[9px] text-muted-foreground">ScriptRuntime.java:11</p>
                </div>
                <span className="shrink-0 font-mono text-[9px] font-semibold text-primary">CONFIRMED</span>
              </div>
            </div>
          </section>
        </div>
      </div>}
    >
      The agent tunes the rule, then verifies the false alarm is gone.
    </SurfaceStory>
  );
}

function FindingReport({ progress }: { progress: number }) {
  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = flowSteps[stepIndex];
  const activeFile = currentStep.file;
  const currentLine = currentStep.line;
  const stepMessage = currentStep.message;
  const activeSourceLines = sourceFiles[activeFile].split("\n");
  const placeTooltipAbove = currentLine > activeSourceLines.length / 2;

  const move = (next: number) => {
    const bounded = Math.max(0, Math.min(flowSteps.length - 1, next));
    setStepIndex(bounded);
  };

  useEffect(() => {
    move(Math.round(progress * (flowSteps.length - 1)));
  }, [progress]);

  return (
    <SurfaceStory
      title="Detailed dataflow trace"
      window={<div data-testid="simplified-report-view" className="flex h-full flex-col overflow-hidden rounded-[10px] border border-border bg-[#f9f7f5] font-mono text-[#44342c] shadow-sm dark:bg-code dark:text-[var(--code-text)]">
      <div className="grid h-10 shrink-0 grid-cols-[minmax(0,1fr)_14rem] items-center border-b border-[#ded7d1] bg-[#f0eeeb] text-[11px] dark:border-border dark:bg-code-header">
        <div className="flex min-w-0 items-center gap-2 px-3">
          <FileCode2 className="h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={1.7} aria-hidden="true" />
          <span className="truncate text-[#44342c] dark:text-[var(--code-text)]">{activeFile}</span>
        </div>
        <div className="flex h-full w-56 items-center justify-end gap-1 px-2" data-testid="report-navigation">
          <button aria-label="First step" disabled={stepIndex === 0} onClick={() => move(0)} className="inline-flex h-6 w-6 items-center justify-center rounded border border-border bg-background text-foreground disabled:opacity-35"><SkipBack size={13} /></button>
          <button aria-label="Back over a call" disabled={stepIndex === 0} onClick={() => move(stepIndex - 3)} className="inline-flex h-6 w-6 items-center justify-center rounded border border-border bg-background text-foreground disabled:opacity-35"><ChevronsLeft size={13} /></button>
          <button aria-label="Back" disabled={stepIndex === 0} onClick={() => move(stepIndex - 1)} className="inline-flex h-6 w-6 items-center justify-center rounded border border-border bg-background text-foreground disabled:opacity-35"><ChevronLeft size={13} /></button>
          <button aria-label="Next" disabled={stepIndex === flowSteps.length - 1} onClick={() => move(stepIndex + 1)} className="inline-flex h-6 w-6 items-center justify-center rounded border border-border bg-background text-foreground disabled:opacity-35"><ChevronRight size={13} /></button>
          <button aria-label="Next over a call" disabled={stepIndex === flowSteps.length - 1} onClick={() => move(stepIndex + 3)} className="inline-flex h-6 w-6 items-center justify-center rounded border border-border bg-background text-foreground disabled:opacity-35"><ChevronsRight size={13} /></button>
          <button aria-label="Last step" disabled={stepIndex === flowSteps.length - 1} onClick={() => move(flowSteps.length - 1)} className="inline-flex h-6 w-6 items-center justify-center rounded border border-border bg-background text-foreground disabled:opacity-35"><SkipForward size={13} /></button>
          <span className="ml-1 inline-flex w-[5ch] shrink-0 justify-end whitespace-nowrap tabular-nums text-[#76665d] dark:text-muted-foreground">{stepIndex + 1}/{flowSteps.length}</span>
        </div>
      </div>
      <div data-testid="report-code-view" className="relative min-h-0 flex-1 overflow-hidden py-2">
        <div className="text-[clamp(10.5px,0.85vw,12px)] leading-[1.4] tracking-[-0.025em]">
          {activeSourceLines.map((code, index) => {
            const line = index + 1;
            const isCurrent = line === currentLine;
            const isSink = isCurrent && stepIndex === flowSteps.length - 1;
            return (
              <div key={line} className="relative">
                <div className={["grid min-h-[1.4em] grid-cols-[0.9rem_1.5rem_minmax(0,1fr)] px-1.5", isSink ? "bg-primary/20" : isCurrent ? "bg-blue-500/20" : ""].join(" ")}>
                  <span className={isSink ? "text-primary" : isCurrent ? "text-blue-500" : ""}>{isCurrent ? "▶" : ""}</span>
                  <span className="select-none pr-3 text-right text-[#b3a396] dark:text-[#5e4a4a]">{line}</span>
                  <span className="whitespace-pre"><JavaLine line={code} /></span>
                </div>
                {isCurrent && (
                  <div
                    role="status"
                    className={[
                      "absolute left-10 right-2 z-20 rounded-lg border border-primary/30 bg-background/95 px-3 py-2 font-sans text-[10.5px] leading-[15px] text-foreground shadow-[0_8px_28px_rgba(37,25,20,0.2)] backdrop-blur-sm dark:bg-card/95",
                      placeTooltipAbove ? "bottom-full mb-1" : "top-full mt-1",
                    ].join(" ")}
                  >
                    <div className="mb-1 flex items-center justify-between gap-3 font-mono text-[9px] uppercase tracking-[0.04em] text-muted-foreground">
                      <span>Step {stepIndex + 1} of {flowSteps.length}</span>
                      <span>{currentStep.file}:{currentStep.line}</span>
                    </div>
                    <p>{stepMessage}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <ReportTraceMap stepIndex={stepIndex} />
      </div>}
    >
      Formal proof of how untrusted data reaches the vulnerable operation.
    </SurfaceStory>
  );
}

function WorkSurface({ stage, progress }: { stage: TimelineId; progress: number }) {
  if (stage === "review") return <ReviewReport progress={progress} />;
  if (stage === "enact") return <Specifications progress={progress} />;
  if (stage === "scan") return <ScanResults progress={progress} />;
  if (stage === "triage") return <TriageView progress={progress} />;
  return <FindingReport progress={progress} />;
}

export function UnifiedWorkbench() {
  const [ready, setReady] = useState(false);
  const [timelineIndex, setTimelineIndex] = useState(0);
  const [timelineProgress, setTimelineProgress] = useState(0);
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const stageRefs = useRef<Array<HTMLElement | null>>([]);
  const timelineStage = timeline[timelineIndex];
  const activeStageIndex = stages.findIndex((stage) => stage.id === timelineStage);

  useEffect(() => setReady(true), []);

  const selectStage = (index: number) => {
    const targetTimelineIndex = index;
    const track = scrollTrackRef.current;
    if (track) {
      const { start, distance } = timelineMetrics(track);
      window.scrollTo({
        top: start + distance * ((targetTimelineIndex + 0.02) / timeline.length),
        behavior: "smooth",
      });
    }
    setTimelineIndex(targetTimelineIndex);
    setTimelineProgress(0.02);
    const transcriptTarget = stageRefs.current[targetTimelineIndex];
    if (transcriptRef.current && transcriptTarget) {
      transcriptRef.current.scrollTop = scrollOffset(transcriptRef.current, transcriptTarget);
    }
  };

  useEffect(() => {
    let frame = 0;
    const sync = () => {
      frame = 0;
      const track = scrollTrackRef.current;
      const transcript = transcriptRef.current;
      if (!track) return;

      const { start, distance } = timelineMetrics(track);
      const progress = Math.max(0, Math.min(1, (window.scrollY - start) / distance));
      const position = progress * timeline.length;
      const nextIndex = Math.min(timeline.length - 1, Math.floor(position));
      const localProgress = nextIndex === timeline.length - 1
        ? Math.min(1, position - nextIndex)
        : position - nextIndex;

      setTimelineIndex((current) => current === nextIndex ? current : nextIndex);
      setTimelineProgress(localProgress);

      if (transcript) {
        const current = stageRefs.current[nextIndex];
        const next = stageRefs.current[Math.min(timeline.length - 1, nextIndex + 1)];
        if (current) {
          const currentTop = scrollOffset(transcript, current);
          const nextTop = nextIndex === timeline.length - 1
            ? transcript.scrollHeight - transcript.clientHeight
            : next ? scrollOffset(transcript, next) : currentTop;
          transcript.scrollTop = currentTop + (nextTop - currentTop) * localProgress;
        }
      }
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(sync);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    sync();
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={scrollTrackRef} data-testid="demo-scroll-track" className="demo-scroll-track relative h-[720vh]">
      <div className="sticky top-16 flex h-[calc(100vh-4rem)] min-h-[38rem] max-h-[48rem] items-center">
        <div data-testid="unified-workbench" data-demo-ready={ready ? "true" : "false"} className="agent-ui mx-auto w-full max-w-[82rem] overflow-hidden rounded-[20px] border border-black/10 bg-white p-2 dark:border-border dark:bg-card">
      <div className="overflow-hidden rounded-[13px] border border-border bg-background">
        <div className="flex h-10 items-center border-b border-border bg-[#f0efec] px-3 dark:bg-code-header">
          <div className="flex items-center gap-2">
            <img src="/favicon.svg" alt="" className="h-4 w-4" aria-hidden="true" />
            <span className="text-[12px] font-semibold text-foreground">OpenTaint</span>
          </div>
        </div>

        <div className="grid h-[calc(100vh-9rem)] min-h-[34rem] max-h-[42rem] grid-cols-[4.5rem_minmax(0,1fr)] grid-rows-[minmax(0,1fr)] md:grid-cols-[8.5rem_minmax(0,1fr)] lg:grid-cols-[8.5rem_minmax(18rem,0.78fr)_minmax(0,1.22fr)] xl:grid-cols-[10rem_minmax(20rem,0.78fr)_minmax(0,1.22fr)]">
          <aside className="border-r border-border bg-[#f2f1ee] p-3 dark:bg-card" aria-label="Demo steps">
            <p className="px-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Session</p>
            <ol className="mt-4 space-y-1">
              {stages.map((item, index) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => selectStage(index)}
                    aria-current={index === activeStageIndex ? "step" : undefined}
                    aria-label={item.label}
                    className={[
                      "flex h-8 w-full items-center gap-2 rounded-md px-2 text-left transition-colors",
                      index === activeStageIndex ? "bg-white text-foreground shadow-sm dark:bg-white/[0.08]" : "text-muted-foreground hover:bg-black/[0.035] hover:text-foreground dark:hover:bg-white/[0.04]",
                    ].join(" ")}
                  >
                    <span className={index === activeStageIndex ? "h-1.5 w-1.5 rounded-full bg-primary" : "h-1.5 w-1.5 rounded-full border border-muted-foreground/50"} />
                    <span className="hidden font-mono text-[10px] opacity-60 xl:inline">{item.number}</span>
                    <span className="text-[11px] font-medium sm:text-[12px]">{item.label}</span>
                  </button>
                </li>
              ))}
            </ol>
          </aside>

          <section className="hidden min-w-0 border-r border-border bg-[#fbfaf8] dark:bg-background lg:block" aria-label="Coding agent session">
            <div
              ref={transcriptRef}
              className="h-full min-w-0 overflow-hidden"
              aria-label="Agent transcript"
            >
              <AgentStage id="review" setRef={(node) => { stageRefs.current[0] = node; }}>
                <UserPrompt>Review this application for unauthenticated code execution. Capture what you learn for future scans.</UserPrompt>
                <AgentText>I’ll map unauthenticated inputs and the APIs that execute code.</AgentText>
                <ToolActivity title="Explored the request and execution paths" activity={["Read JobController.java", "Read PreviewController.java", "Read ScriptRuntime.java", "Read PreviewRenderer.java", "Searched @PostMapping", "Searched Context.eval", "Searched HostAccess.ALL"]} meta="7 files" defaultOpen />
                <AgentText><code className="font-mono text-[12px] text-primary">POST /api/jobs</code> sends request-controlled script into a host-enabled <code className="font-mono text-[12px] text-primary">Context.eval</code>.</AgentText>
                <ToolActivity title="Created security-review.md" activity={["Trust boundary: unauthenticated job input", "Vulnerability pattern: input → host-enabled eval", "Opaque behavior: option() returns the builder"]} added={18} removed={0} icon="check" defaultOpen />
              </AgentStage>

              <AgentStage id="enact" setRef={(node) => { stageRefs.current[1] = node; }}>
                <AgentText>I’ll turn those three facts into specifications OpenTaint can execute.</AgentText>
                <ToolActivity title="Read security-review.md" activity={["Trust boundary", "Vulnerability pattern", "Opaque method behavior"]} defaultOpen />
                <ToolActivity title="Created 4 OpenTaint artifacts" activity={["Created rules/java/lib/generic/graal-eval.yaml", "Created rules/java/lib/spring/http-input.yaml", "Created rules/java/security/graaljs-code-injection.yaml", "Created model/org.graalvm.polyglot.yaml"]} added={74} removed={0} icon="check" defaultOpen />
                <ToolActivity title="Validated rules and models" activity={["HTTP input marked untrusted", "Context.eval marked as a sink", "Builder chain preserves state"]} meta="Passed" icon="check" defaultOpen />
              </AgentStage>

              <AgentStage id="scan" setRef={(node) => { stageRefs.current[2] = node; }}>
                <AgentText>I’ll apply the new specifications across the whole project.</AgentText>
                <ToolActivity title="Ran OpenTaint scan" meta="30s" icon="search" defaultOpen>
                  <CommandCard><span className="text-[#2d8a4e] dark:text-[#8fc99f]">$</span> opentaint scan \{"\n"}    --project-model build/project-model \{"\n"}    --ruleset .opentaint/rules \{"\n"}    --passthrough-approximations .opentaint/model \{"\n"}    --output results/report.sarif \{"\n"}    --log-file opentaint.log</CommandCard>
                </ToolActivity>
                <AgentText>The scan found two paths into <code className="font-mono text-[12px] text-primary">Context.eval</code>. I’ll inspect both before accepting them.</AgentText>
              </AgentStage>

              <AgentStage id="triage" setRef={(node) => { stageRefs.current[3] = node; }}>
                <ToolActivity title="Inspected 2 complete paths" activity={["JobController → ScriptRuntime", "PreviewController → PreviewRenderer"]} meta="2 candidates" icon="search" defaultOpen />
                <AgentText>The job path is exploitable. The preview path uses a restricted context and is a false alarm.</AgentText>
                <AgentText>I’ll require the evaluated context to be built with <code className="font-mono text-[12px] text-primary">HostAccess.ALL</code>.</AgentText>
                <ToolActivity title="Refined graal-eval.yaml" activity={["Correlated $CONTEXT", "Required HostAccess.ALL"]} added={6} removed={0} icon="file" defaultOpen />
                <ToolActivity title="Rescanned the project" activity={["Kept ScriptRuntime.java:11", "Removed PreviewRenderer.java:11"]} meta="1 finding, 0 false alarms" icon="check" defaultOpen />
                <AgentText>The refined rule keeps the confirmed path and no longer reports the preview path.</AgentText>
              </AgentStage>

              <AgentStage id="report" setRef={(node) => { stageRefs.current[4] = node; }}>
                <AgentText>Review complete. OpenTaint reproduced the finding as a 10-step path from <code className="font-mono text-[12px]">POST /api/jobs</code> to <code className="font-mono text-[12px] text-primary">Context.eval</code>.</AgentText>
                <ToolActivity title="Opened results/report.sarif" activity={["1 error", "1 affected file", "1 triggered rule"]} icon="file" defaultOpen />
                <div className="mt-4 rounded-md border border-border bg-background px-4 py-3 text-[12px] leading-5">
                  <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" /><span className="font-semibold text-foreground">Unauthenticated script execution</span></div>
                  <p className="mt-2 text-muted-foreground">The report viewer preserves every call, assignment, and return along the path, with the sink highlighted in red.</p>
                </div>
              </AgentStage>
            </div>
          </section>

          <section className="min-h-0 min-w-0 overflow-hidden bg-background" aria-live="polite" aria-label={`${stages[activeStageIndex].label} output`}>
            <div key={timelineStage} className="demo-work-surface h-full min-h-0 overflow-hidden">
              <WorkSurface stage={timelineStage} progress={withStageHolds(timelineProgress)} />
            </div>
          </section>
        </div>
      </div>
    </div>
      </div>
    </div>
  );
}
