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
  SkipBack,
  SkipForward,
  TerminalSquare,
} from "lucide-react";
import { TerminalDemo } from "./TerminalDemo";

const stages = [
  { id: "review", number: "01", label: "Review" },
  { id: "enact", number: "02", label: "Enact" },
  { id: "scan", number: "03", label: "Scan" },
  { id: "report", number: "04", label: "Report" },
] as const;

type StageId = (typeof stages)[number]["id"];

const timeline = ["review", "enact", "scan", "summary", "report"] as const;
type TimelineId = (typeof timeline)[number];

function scrollOffset(container: HTMLElement, target: HTMLElement) {
  return target.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
}

function timelineBounds(track: HTMLElement, sticky: HTMLElement | null) {
  const stickyTop = sticky ? Number.parseFloat(window.getComputedStyle(sticky).top) || 0 : 0;
  const trackTop = track.getBoundingClientRect().top + window.scrollY;
  const start = trackTop - stickyTop;
  const end = trackTop + track.offsetHeight - window.innerHeight;
  return { start, distance: Math.max(1, end - start) };
}

function UserPrompt({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[10px] bg-[#e8f0fb] px-4 py-3 text-[14px] leading-5 text-[#242b33] dark:bg-[#243244] dark:text-[#eef4fb]">
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
  icon?: "file" | "terminal" | "check";
  children?: ReactNode;
  added?: number;
  removed?: number;
  defaultOpen?: boolean;
};

function ToolActivity({ title, detail, activity, meta, icon = "file", children, added, removed, defaultOpen = false }: ToolActivityProps) {
  const [open, setOpen] = useState(defaultOpen);
  const Icon = icon === "terminal" ? TerminalSquare : icon === "check" ? Check : FileCode2;
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
    <pre className="overflow-x-auto bg-[#f3f2ef] px-3 py-3 text-[13px] leading-5 text-[#312d2a] antialiased scrollbar-thin dark:bg-[#191615] dark:text-[#eee9e5]" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace', WebkitFontSmoothing: "antialiased", textRendering: "optimizeLegibility" }}><code>{children}</code></pre>
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

function ReviewReport({ progress }: { progress: number }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    element.scrollTop = Math.max(0, element.scrollHeight - element.clientHeight) * progress;
  }, [progress]);

  return (
    <div className="flex h-full flex-col bg-[#faf9f7] dark:bg-[#120b0a]">
      <div className="flex h-10 shrink-0 items-center gap-2 border-b border-border bg-[#f1f0ed] px-3 dark:bg-[#1b1110]">
        <FileText className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.7} aria-hidden="true" />
        <span className="font-mono text-[12px] text-foreground">security-review.md</span>
        <span className="ml-auto flex items-center gap-2 text-[11px] text-[#4c835e] dark:text-[#7fbd92]"><Check className="h-4 w-4" /> Saved</span>
      </div>
      <div ref={scrollRef} data-testid="review-report-scroll" className="min-h-0 flex-1 overflow-hidden px-8 py-8 xl:px-10">
        <article className="mx-auto max-w-[38rem] text-[13px] leading-6 text-[#443c38] dark:text-[#ded6d2]">
          <h3 className="text-[22px] font-semibold leading-8 tracking-[-0.025em] text-foreground">Unauthenticated script execution</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded bg-primary px-2 py-1 font-mono text-[11px] font-semibold text-white">CRITICAL</span>
            <span className="rounded border border-border bg-background px-2 py-1 font-mono text-[11px] text-muted-foreground">CWE-94</span>
            <span className="rounded border border-border bg-background px-2 py-1 font-mono text-[11px] text-muted-foreground">POST /api/jobs</span>
          </div>

          <h4 className="mt-8 border-b border-border pb-2 text-[14px] font-semibold text-foreground">Summary</h4>
          <p className="mt-3">The public job endpoint accepts a script expression and passes it to a host-enabled GraalVM context. An unauthenticated request can therefore execute attacker-controlled JavaScript with host access.</p>

          <h4 className="mt-8 border-b border-border pb-2 text-[14px] font-semibold text-foreground">Evidence</h4>
          <div className="mt-3 overflow-hidden rounded-md border border-border bg-[#f9f7f5] font-mono dark:bg-[#140505]">
            <div className="border-b border-border px-3 py-2 text-[11px] text-muted-foreground">src/main/java/demo/app/execution/ScriptRuntime.java</div>
            <pre className="overflow-x-auto px-3 py-2 text-[11px] leading-5 text-[#44342c] dark:text-[#f0dcdc] scrollbar-thin"><code><span className="text-[#b3a396]">8</span>   try (Context context = createContext()) {'{'}{"\n"}<span className="bg-primary/15 text-primary"><span className="text-primary">9</span>       context.eval(<span className="text-primary">&quot;js&quot;</span>, script);</span>{"\n"}<span className="text-[#b3a396]">10</span>  {'}'}</code></pre>
          </div>

          <h4 className="mt-8 border-b border-border pb-2 text-[14px] font-semibold text-foreground">Trust boundary</h4>
          <p className="mt-3">The <code className="rounded bg-black/[0.05] px-1 py-0.5 font-mono text-[12px] dark:bg-white/[0.08]">script</code> query parameter crosses from an unauthenticated HTTP request into an interpreter configured with <code className="rounded bg-black/[0.05] px-1 py-0.5 font-mono text-[12px] dark:bg-white/[0.08]">HostAccess.ALL</code>.</p>

          <h4 className="mt-8 border-b border-border pb-2 text-[14px] font-semibold text-foreground">Impact</h4>
          <p className="mt-3">An unauthenticated attacker can evaluate arbitrary JavaScript with access to host classes exposed by the embedded runtime.</p>

        </article>
      </div>
    </div>
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
    pattern: (org.graalvm.polyglot.Context $CONTEXT).eval($LANGUAGE, $UNTRUSTED)`;

const joinRule = `rules:
  - id: graaljs-code-injection
    severity: ERROR
    message: >-
      Untrusted HTTP input reaches a host-enabled GraalVM Context.eval call,
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
    <pre className="overflow-x-auto py-2 text-[12.5px] leading-5 text-[#44342c] dark:text-[#f0dcdc] scrollbar-thin" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace' }}><code>
      {code.split("\n").map((line, index) => {
        const key = /^(\s*(?:-\s+)?)([\w-]+):(.*)$/.exec(line);
        return (
          <span key={index} className="grid min-w-max grid-cols-[1.25rem_2.25rem_1fr] bg-[#2d8a4e]/[0.08] px-3 dark:bg-[#79bd8f]/[0.08]">
            <span className="select-none text-[#2d8a4e] dark:text-[#79bd8f]">+</span>
            <span className="select-none pr-2 text-right text-[#b3a396] dark:text-[#5e4a4a]">{index + 1}</span>
            <span className="whitespace-pre">{key ? <>{key[1]}<span className="text-primary">{key[2]}</span>:{key[3]}</> : line || " "}</span>
          </span>
        );
      })}
    </code></pre>
  );
}

function Artifact({ path, kind, code, open, onToggle }: { path: string; kind: string; code: string; open: boolean; onToggle: () => void }) {
  const added = code.split("\n").length;
  return (
    <article className="overflow-hidden rounded-[10px] border border-border bg-[#f9f7f5] shadow-sm dark:bg-[#140505]">
      <button type="button" aria-expanded={open} onClick={onToggle} className="flex min-h-10 w-full items-center gap-2 bg-[#f0eeeb] px-3 text-left dark:bg-[#1d0d0c]">
        <ChevronDown className={["h-4 w-4 shrink-0 text-muted-foreground transition-transform", open ? "" : "-rotate-90"].join(" ")} strokeWidth={1.8} aria-hidden="true" />
        <FileCode2 className="h-3.5 w-3.5 text-primary" strokeWidth={1.7} aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-foreground">{path}</span>
        <span className="hidden text-[11px] text-muted-foreground xl:inline">{kind}</span>
        <span className="font-mono text-[10px] text-[#2d8a4e] dark:text-[#79bd8f]">+{added}</span>
        <span className="font-mono text-[10px] text-[#c73a32] dark:text-[#ff746c]">-0</span>
      </button>
      {open && <div className="border-t border-border"><YamlCode code={code} /></div>}
    </article>
  );
}

function Specifications({ progress }: { progress: number }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeArtifact = Math.min(3, Math.floor(progress * 4));
  const [openState, setOpenState] = useState({ stage: activeArtifact, artifact: activeArtifact });
  const openArtifact = openState.stage === activeArtifact ? openState.artifact : activeArtifact;
  const artifacts = [
    { path: "rules/java/lib/generic/graal-eval.yaml", kind: "Library sink", code: sinkRule },
    { path: "rules/java/lib/spring/http-input.yaml", kind: "Library source", code: sourceRule },
    { path: "rules/java/security/graaljs-code-injection.yaml", kind: "Security join", code: joinRule },
    { path: "model/org.graalvm.polyglot.yaml", kind: "Dependency model", code: dependencyModel },
  ];

  useEffect(() => {
    const scroll = scrollRef.current;
    if (scroll) scroll.scrollTop = 0;
  }, [activeArtifact]);

  return (
    <div ref={scrollRef} data-testid="artifact-scroll" className="h-full overflow-hidden bg-[#efeeeb] p-4 dark:bg-[#100908] sm:p-6">
      <div className="mx-auto max-w-[40rem] space-y-4">
        {artifacts.map((artifact, index) => (
          <div key={artifact.path}>
            <Artifact
              {...artifact}
              open={index === openArtifact}
              onToggle={() => setOpenState({
                stage: activeArtifact,
                artifact: openArtifact === index ? -1 : index,
              })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function CliRun() {
  return (
    <div className="h-full bg-background">
      <TerminalDemo scenario="security-review" ariaLabel="Real OpenTaint scan output for the anonymous security review project" />
    </div>
  );
}

function CliSummary() {
  return (
    <div className="h-full bg-background">
      <TerminalDemo scenario="security-summary" ariaLabel="Real OpenTaint summary output for the anonymous security review project" />
    </div>
  );
}

const sourceFiles: Record<string, string> = {
  "JobController.java": `package demo.app.api;

import demo.app.execution.JobReceipt;
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
    public JobReceipt submit(@RequestParam("script") String script) {
        return jobService.submit(script);
    }
}`,
  "JobService.java": `package demo.app.execution;

import demo.app.model.JobDefinition;

public final class JobService {
    private final ExecutionPlanner planner;

    public JobService(ExecutionPlanner planner) {
        this.planner = planner;
    }

    public JobReceipt submit(String script) {
        JobDefinition definition = JobDefinition.from(script);
        planner.schedule(definition);
        return JobReceipt.accepted();
    }
}`,
  "JobDefinition.java": `package demo.app.model;

public record JobDefinition(String script) {
    public static JobDefinition from(String script) {
        return new JobDefinition(script);
    }
}`,
  "ExecutionPlanner.java": `package demo.app.execution;

import demo.app.model.JobDefinition;

public final class ExecutionPlanner {
    private final ScriptTaskMapper taskMapper;
    private final ExpressionEvaluator evaluator;

    public ExecutionPlanner(ScriptTaskMapper taskMapper, ExpressionEvaluator evaluator) {
        this.taskMapper = taskMapper;
        this.evaluator = evaluator;
    }

    public void schedule(JobDefinition definition) {
        ScriptTask task = taskMapper.map(definition);
        evaluator.evaluate(task);
    }
}`,
  "ScriptTaskMapper.java": `package demo.app.execution;

import demo.app.model.JobDefinition;

public final class ScriptTaskMapper {
    public ScriptTask map(JobDefinition definition) {
        return new ScriptTask(definition.script());
    }
}`,
  "ScriptTask.java": `package demo.app.execution;

public record ScriptTask(String expression) {}`,
  "ExpressionEvaluator.java": `package demo.app.execution;

public final class ExpressionEvaluator {
    private final ScriptRuntime runtime;

    public ExpressionEvaluator(ScriptRuntime runtime) {
        this.runtime = runtime;
    }

    public void evaluate(ScriptTask task) {
        runtime.execute(task.expression());
    }
}`,
  "ScriptRuntime.java": `package demo.app.execution;

import org.graalvm.polyglot.Context;
import org.graalvm.polyglot.HostAccess;

public final class ScriptRuntime {
    public void execute(String script) {
        try (Context context = createContext()) {
            context.eval("js", script);
        }
    }

    private Context createContext() {
        return Context.newBuilder("js")
                .allowHostAccess(HostAccess.ALL)
                .option("engine.WarnInterpreterOnly", "false")
                .build();
    }
}`,
};

const flowSteps = [
  { file: "JobController.java", line: 18, message: 'Method entry marks the 1st argument of "submit" as $UNTRUSTED' },
  { file: "JobController.java", line: 19, message: 'Calling "submit" with $UNTRUSTED data at the 1st argument of "submit"' },
  { file: "JobService.java", line: 12, message: 'Entering "submit" with $UNTRUSTED data at the 1st argument of "submit"' },
  { file: "JobService.java", line: 13, message: 'Calling "from" with $UNTRUSTED data at the 1st argument of "submit"' },
  { file: "JobDefinition.java", line: 4, message: 'Entering "from" with marked data at the 1st argument of "from"' },
  { file: "JobDefinition.java", line: 5, message: 'Calling "JobDefinition" initializer with marked data at the 1st argument of "from"' },
  { file: "JobDefinition.java", line: 3, message: 'Entering "JobDefinition" initializer with marked data at "script"' },
  { file: "JobDefinition.java", line: 3, message: '"this.script" is assigned a value with marked data' },
  { file: "JobDefinition.java", line: 3, message: 'Exiting "JobDefinition" initializer' },
  { file: "JobDefinition.java", line: 5, message: 'Takes marked data at the 1st argument of "from" and ends up with marked data at the returned value' },
  { file: "JobDefinition.java", line: 6, message: 'Exiting "from"' },
  { file: "JobService.java", line: 13, message: 'Method "from" propagates $UNTRUSTED data from the 1st argument of "submit" to "definition"' },
  { file: "JobService.java", line: 14, message: 'Calling "schedule" with $UNTRUSTED data at "definition"' },
  { file: "ExecutionPlanner.java", line: 14, message: 'Entering "schedule" with $UNTRUSTED data at the 1st argument of "schedule"' },
  { file: "ExecutionPlanner.java", line: 15, message: 'Calling "map" with $UNTRUSTED data at the 1st argument of "schedule"' },
  { file: "ScriptTaskMapper.java", line: 6, message: 'Entering "map" with marked data at the 1st argument of "map"' },
  { file: "ScriptTaskMapper.java", line: 7, message: 'Calling "script" with marked data at the 1st argument of "map"' },
  { file: "JobDefinition.java", line: 3, message: 'The returning value is assigned marked data from "this.script"' },
  { file: "JobDefinition.java", line: 3, message: 'Exiting "script"' },
  { file: "ScriptTaskMapper.java", line: 7, message: 'Method "script" propagates marked data from the 1st argument of "map" to a local variable' },
  { file: "ScriptTaskMapper.java", line: 7, message: 'Calling "ScriptTask" initializer with marked data at a local variable' },
  { file: "ScriptTask.java", line: 3, message: 'Entering "ScriptTask" initializer with marked data at "expression"' },
  { file: "ScriptTask.java", line: 3, message: '"this.expression" is assigned a value with marked data' },
  { file: "ScriptTask.java", line: 3, message: 'Exiting "ScriptTask" initializer' },
  { file: "ScriptTaskMapper.java", line: 7, message: 'Takes marked data at a local variable and ends up with marked data at the returned value' },
  { file: "ScriptTaskMapper.java", line: 8, message: 'Exiting "map"' },
  { file: "ExecutionPlanner.java", line: 15, message: 'Method "map" propagates $UNTRUSTED data from the 1st argument of "schedule" to "task"' },
  { file: "ExecutionPlanner.java", line: 16, message: 'Calling "evaluate" with $UNTRUSTED data at "task"' },
  { file: "ExpressionEvaluator.java", line: 10, message: 'Entering "evaluate" with $UNTRUSTED data at the 1st argument of "evaluate"' },
  { file: "ExpressionEvaluator.java", line: 11, message: 'Calling "expression" with $UNTRUSTED data at the 1st argument of "evaluate"' },
  { file: "ScriptTask.java", line: 3, message: 'The returning value is assigned marked data from "this.expression"' },
  { file: "ScriptTask.java", line: 3, message: 'Exiting "expression"' },
  { file: "ExpressionEvaluator.java", line: 11, message: 'Method "expression" propagates $UNTRUSTED data from the 1st argument of "evaluate" to a local variable' },
  { file: "ExpressionEvaluator.java", line: 11, message: 'Calling "execute" with $UNTRUSTED data at a local variable' },
  { file: "ScriptRuntime.java", line: 7, message: 'Entering "execute" with $UNTRUSTED data at the 1st argument of "execute"' },
  { file: "ScriptRuntime.java", line: 9, message: "Untrusted HTTP input reaches a host-enabled GraalVM Context.eval call, allowing attacker-controlled script execution." },
] as const;

function JavaLine({ line }: { line: string }) {
  const tokens = line.split(/("[^"\\]*(?:\\.[^"\\]*)*"|\b(?:package|import|public|private|final|return|new|try|record|class|void|static)\b)/g);
  return <>{tokens.map((token, index) => {
    if (token.startsWith('"')) return <span key={index} className="text-[#ca2121] dark:text-[#ff3838]">{token}</span>;
    if (/^(?:package|import|public|private|final|return|new|try|record|class|void|static)$/.test(token)) return <span key={index} className="text-[#b91c1c] dark:text-[#ff6b6b]">{token}</span>;
    return <span key={index}>{token}</span>;
  })}</>;
}

function FindingReport({ progress }: { progress: number }) {
  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = flowSteps[stepIndex];
  const [selectedFile, setSelectedFile] = useState(currentStep.file);
  const activeFile = selectedFile;
  const currentLine = activeFile === currentStep.file ? currentStep.line : -1;
  const files = Object.keys(sourceFiles);
  const stepMessage = currentStep.message;

  const move = (next: number) => {
    const bounded = Math.max(0, Math.min(flowSteps.length - 1, next));
    setStepIndex(bounded);
    setSelectedFile(flowSteps[bounded].file);
  };

  useEffect(() => {
    move(Math.round(progress * (flowSteps.length - 1)));
  }, [progress]);

  return (
    <div data-testid="simplified-report-view" className="flex h-full flex-col bg-[#f9f7f5] font-mono text-[#44342c] dark:bg-[#140505] dark:text-[#f0dcdc]">
      <div className="flex h-10 shrink-0 items-center border-b border-[#ded7d1] bg-[#f0eeeb] text-[11px] dark:border-[#4b1d1d] dark:bg-[#1d0d0c]">
        <div role="tablist" className="flex min-w-0 flex-1 overflow-x-auto scrollbar-thin">
          {files.map((file) => (
            <button
              key={file}
              type="button"
              role="tab"
              aria-selected={file === activeFile}
              onClick={() => setSelectedFile(file)}
              className={[
                "h-10 shrink-0 border-r border-[#ded7d1] px-3 text-[11px] dark:border-[#4b1d1d]",
                file === activeFile ? "bg-[#f9f7f5] text-[#44342c] dark:bg-[#140505] dark:text-[#f0dcdc]" : "text-[#76665d] dark:text-[#a98e8e]",
              ].join(" ")}
            >{file}</button>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-1 px-2">
          <button aria-label="First step" disabled={stepIndex === 0} onClick={() => move(0)} className="inline-flex h-6 w-6 items-center justify-center rounded border border-border bg-background text-foreground disabled:opacity-35"><SkipBack size={13} /></button>
          <button aria-label="Back over a call" disabled={stepIndex === 0} onClick={() => move(stepIndex - 3)} className="inline-flex h-6 w-6 items-center justify-center rounded border border-border bg-background text-foreground disabled:opacity-35"><ChevronsLeft size={13} /></button>
          <button aria-label="Back" disabled={stepIndex === 0} onClick={() => move(stepIndex - 1)} className="inline-flex h-6 w-6 items-center justify-center rounded border border-border bg-background text-foreground disabled:opacity-35"><ChevronLeft size={13} /></button>
          <button aria-label="Next" disabled={stepIndex === flowSteps.length - 1} onClick={() => move(stepIndex + 1)} className="inline-flex h-6 w-6 items-center justify-center rounded border border-border bg-background text-foreground disabled:opacity-35"><ChevronRight size={13} /></button>
          <button aria-label="Next over a call" disabled={stepIndex === flowSteps.length - 1} onClick={() => move(stepIndex + 3)} className="inline-flex h-6 w-6 items-center justify-center rounded border border-border bg-background text-foreground disabled:opacity-35"><ChevronsRight size={13} /></button>
          <button aria-label="Last step" disabled={stepIndex === flowSteps.length - 1} onClick={() => move(flowSteps.length - 1)} className="inline-flex h-6 w-6 items-center justify-center rounded border border-border bg-background text-foreground disabled:opacity-35"><SkipForward size={13} /></button>
          <span className="ml-1 whitespace-nowrap text-[#76665d] dark:text-[#a98e8e]">{stepIndex + 1}/{flowSteps.length}</span>
        </div>
      </div>
      <div className="relative min-h-0 flex-1 overflow-auto py-4 scrollbar-thin">
        <div className="min-w-[42rem] text-[12px] leading-6">
          {sourceFiles[activeFile].split("\n").map((code, index) => {
            const line = index + 1;
            const isCurrent = line === currentLine;
            const isSink = isCurrent && stepIndex === flowSteps.length - 1;
            const tooltipBelow = line <= 4 || line <= sourceFiles[activeFile].split("\n").length * 0.58;
            return (
              <div key={line} className="relative">
                <div className={["grid min-h-6 grid-cols-[2rem_3rem_1fr] px-3", isSink ? "bg-primary/20" : isCurrent ? "bg-blue-500/20" : ""].join(" ")}>
                  <span className={isSink ? "text-primary" : isCurrent ? "text-blue-500" : ""}>{isCurrent ? "▶" : ""}</span>
                  <span className="select-none pr-3 text-right text-[#b3a396] dark:text-[#5e4a4a]">{line}</span>
                  <span className="whitespace-pre"><JavaLine line={code} /></span>
                </div>
                {isCurrent && (
                  <div
                    role="status"
                    className={[
                      "absolute left-20 z-20 w-[28rem] max-w-[calc(100%-6rem)] rounded-lg border border-primary/30 bg-background/95 px-3 py-2 font-sans text-[11px] leading-4 text-foreground shadow-[0_8px_28px_rgba(37,25,20,0.2)] backdrop-blur-sm dark:bg-[#211412]/95",
                      tooltipBelow ? "top-full mt-2" : "bottom-full mb-2",
                    ].join(" ")}
                  >
                    <div className="mb-1 flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
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
    </div>
  );
}

function WorkSurface({ stage, progress }: { stage: TimelineId; progress: number }) {
  if (stage === "review") return <ReviewReport progress={progress} />;
  if (stage === "enact") return <Specifications progress={progress} />;
  if (stage === "scan") return <CliRun />;
  if (stage === "summary") return <CliSummary />;
  return <FindingReport progress={progress} />;
}

export function UnifiedWorkbench() {
  const [timelineIndex, setTimelineIndex] = useState(0);
  const [timelineProgress, setTimelineProgress] = useState(0);
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const stageRefs = useRef<Array<HTMLElement | null>>([]);
  const navigationTargetRef = useRef<number | null>(null);
  const navigationTimeoutRef = useRef<number | null>(null);
  const timelineStage = timeline[timelineIndex];
  const activeStageIndex = timelineStage === "summary"
    ? 2
    : stages.findIndex((stage) => stage.id === timelineStage);

  const selectStage = (index: number) => {
    const targetTimelineIndex = index === 3 ? 4 : index;
    navigationTargetRef.current = targetTimelineIndex;
    setTimelineIndex(targetTimelineIndex);
    setTimelineProgress(0);
    const transcriptTarget = stageRefs.current[targetTimelineIndex];
    if (transcriptRef.current && transcriptTarget) {
      transcriptRef.current.scrollTop = scrollOffset(transcriptRef.current, transcriptTarget);
    }
    const track = scrollTrackRef.current;
    if (!track) return;
    const { start, distance } = timelineBounds(track, stickyRef.current);
    const targetTop = start + distance * ((targetTimelineIndex + 0.02) / timeline.length);
    window.scrollTo({
      top: targetTop,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
    if (navigationTimeoutRef.current) window.clearTimeout(navigationTimeoutRef.current);
    navigationTimeoutRef.current = window.setTimeout(() => {
      if (navigationTargetRef.current === targetTimelineIndex) {
        navigationTargetRef.current = null;
        window.dispatchEvent(new Event("scroll"));
      }
    }, 900);
  };

  useEffect(() => {
    let frame = 0;
    const sync = () => {
      frame = 0;
      const track = scrollTrackRef.current;
      const transcript = transcriptRef.current;
      if (!track) return;

      const { start, distance } = timelineBounds(track, stickyRef.current);
      const progress = Math.max(0, Math.min(1, (window.scrollY - start) / distance));
      const position = progress * timeline.length;
      const nextIndex = Math.min(timeline.length - 1, Math.floor(position));
      const localProgress = nextIndex === timeline.length - 1
        ? Math.min(1, position - nextIndex)
        : position - nextIndex;

      const navigationTarget = navigationTargetRef.current;
      if (navigationTarget !== null) {
        setTimelineIndex(navigationTarget);
        setTimelineProgress(0);
        const navigationStage = stageRefs.current[navigationTarget];
        if (transcript && navigationStage) transcript.scrollTop = scrollOffset(transcript, navigationStage);
        return;
      }

      setTimelineIndex((current) => current === nextIndex ? current : nextIndex);
      setTimelineProgress(localProgress);

      if (transcript) {
        const current = stageRefs.current[nextIndex];
        const next = stageRefs.current[Math.min(timeline.length - 1, nextIndex + 1)];
        if (current) {
          const currentTop = scrollOffset(transcript, current);
          const nextTop = next ? scrollOffset(transcript, next) : currentTop;
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
      if (navigationTimeoutRef.current) window.clearTimeout(navigationTimeoutRef.current);
    };
  }, []);

  return (
    <div ref={scrollTrackRef} data-testid="demo-scroll-track" className="relative h-[520vh]">
      <div ref={stickyRef} className="sticky top-16 flex h-[calc(100vh-4rem)] items-center">
        <div data-testid="unified-workbench" className="agent-ui mx-auto w-full max-w-[82rem] overflow-hidden rounded-[20px] border border-black/10 bg-white p-2 shadow-[0_28px_90px_rgba(37,25,20,0.18)] dark:border-white/10 dark:bg-[#211a17]">
      <div className="overflow-hidden rounded-[13px] border border-border bg-background">
        <div className="flex h-10 items-center border-b border-border bg-[#f0efec] px-3 dark:bg-[#1b1513]">
          <div className="flex items-center gap-2">
            <img src="/favicon.svg" alt="" className="h-4 w-4" aria-hidden="true" />
            <span className="text-[12px] font-semibold text-foreground">OpenTaint</span>
          </div>
        </div>

        <div className="grid h-[calc(100vh-9rem)] min-h-[34rem] max-h-[42rem] grid-cols-[4.5rem_minmax(0,1fr)] grid-rows-[minmax(0,1fr)] md:grid-cols-[8.5rem_minmax(20rem,0.9fr)_minmax(0,1.1fr)] xl:grid-cols-[10rem_minmax(22rem,0.9fr)_minmax(0,1.1fr)]">
          <aside className="border-r border-border bg-[#f2f1ee] p-3 dark:bg-[#181210]" aria-label="Demo steps">
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

          <section className="hidden min-w-0 border-r border-border bg-[#fbfaf8] dark:bg-[#14100e] md:block" aria-label="Coding agent session">
            <div
              ref={transcriptRef}
              className="h-full min-w-0 overflow-hidden"
              aria-label="Agent transcript"
            >
              <AgentStage id="review" setRef={(node) => { stageRefs.current[0] = node; }}>
                <UserPrompt>Review this application for unauthenticated code execution and write a security review report.</UserPrompt>
                <AgentText>I’ll map the unauthenticated HTTP surface, then trace request-controlled values into script and command execution APIs.</AgentText>
                <ToolActivity title="Explored the application" activity={["Read JobController.java", "Read JobService.java", "Read ExpressionEvaluator.java", "Read ScriptRuntime.java", "Searched @PostMapping", "Searched Context.eval"]} meta="8 files" defaultOpen />
                <AgentText>The job endpoint passes its <code className="font-mono text-[12px] text-primary">script</code> parameter through the execution pipeline into a host-enabled GraalVM context.</AgentText>
                <ToolActivity title="Created security-review.md" activity={["Wrote Summary", "Wrote Evidence", "Wrote Trust boundary", "Wrote Impact"]} added={38} removed={0} icon="check" defaultOpen />
                <AgentText>I documented the finding with the affected endpoint and the complete path to <code className="font-mono text-[12px] text-primary">Context.eval</code>.</AgentText>
              </AgentStage>

              <AgentStage id="enact" setRef={(node) => { stageRefs.current[1] = node; }}>
                <AgentText>I’ll enact the review as taint rules and dependency models OpenTaint can apply without repeating the agent review.</AgentText>
                <ToolActivity title="Read security-review.md" activity={["Read Trust boundary", "Read Evidence", "Read Impact"]} />
                <ToolActivity title="Created 4 OpenTaint artifacts" activity={["Created rules/java/lib/generic/graal-eval.yaml", "Created rules/java/lib/spring/http-input.yaml", "Created rules/java/security/graaljs-code-injection.yaml", "Created model/org.graalvm.polyglot.yaml"]} added={74} removed={0} icon="check" defaultOpen />
                <ToolActivity title="Ran rule tests" activity={["Passed http-input sources", "Passed graal-eval sinks", "Rule parsing issues: no issues found"]} meta="Passed" icon="check" />
                <AgentText>The taint rule defines what to find. The dependency model tells the analyzer how data moves through external GraalVM methods.</AgentText>
              </AgentStage>

              <AgentStage id="scan" setRef={(node) => { stageRefs.current[2] = node; }}>
                <AgentText>I’ll run OpenTaint with the new rule and dependency model across the project.</AgentText>
                <ToolActivity title="Ran OpenTaint" meta="3.8s" icon="terminal" defaultOpen>
                  <CommandCard><span className="text-[#2d8a4e] dark:text-[#8fc99f]">$</span> opentaint scan \{"\n"}    --project-model build/project-model \{"\n"}    --ruleset .opentaint/rules \{"\n"}    --passthrough-approximations \{"\n"}      .opentaint/model/org.graalvm.polyglot.yaml \{"\n"}    -o results/report.sarif</CommandCard>
                </ToolActivity>
                <AgentText>The scan found one CWE-94 path. I’ll ask OpenTaint for the finding and its full interprocedural flow.</AgentText>
              </AgentStage>

              <AgentStage id="summary" setRef={(node) => { stageRefs.current[3] = node; }}>
                <ToolActivity title="Read OpenTaint summary" meta="36 steps" icon="terminal" defaultOpen>
                  <CommandCard><span className="text-[#2d8a4e] dark:text-[#8fc99f]">$</span> opentaint summary results/report.sarif \{"\n"}    --show-findings --verbose-flow --show-code-snippets</CommandCard>
                </ToolActivity>
                <AgentText>The summary confirms the endpoint, exact sink, and every propagation step in the 36-step flow.</AgentText>
              </AgentStage>

              <AgentStage id="report" setRef={(node) => { stageRefs.current[4] = node; }}>
                <AgentText>Review complete. OpenTaint reproduced the finding as a 36-step path from <code className="font-mono text-[12px]">POST /api/jobs</code> to <code className="font-mono text-[12px] text-primary">Context.eval</code>.</AgentText>
                <ToolActivity title="Opened results/report.sarif" activity={["1 error", "1 affected file", "1 triggered rule"]} icon="file" defaultOpen />
                <div className="mt-4 rounded-md border border-border bg-background px-4 py-3 text-[12px] leading-5">
                  <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" /><span className="font-semibold text-foreground">Unauthenticated script execution</span></div>
                  <p className="mt-2 text-muted-foreground">The report viewer preserves every call, assignment, and return along the path, with the sink highlighted in red.</p>
                </div>
              </AgentStage>
            </div>
          </section>

          <section className="min-h-0 min-w-0 overflow-hidden bg-background" aria-live="polite" aria-label={`${timelineStage === "summary" ? "Summary" : stages[activeStageIndex].label} output`}>
            <div key={timelineStage} className="demo-work-surface h-full min-h-0 overflow-hidden">
              <WorkSurface stage={timelineStage} progress={timelineProgress} />
            </div>
          </section>
        </div>
      </div>
    </div>
      </div>
    </div>
  );
}
