type TerminalTone = "plain" | "muted" | "blue" | "green" | "red" | "purple";

type TerminalLine = {
  content: string;
  tone?: TerminalTone;
  weight?: "normal" | "strong";
};

type TerminalDemoProps = {
  scenario?: "default" | "security-review" | "security-summary";
  ariaLabel?: string;
};

const securityReviewLines: TerminalLine[] = [
  { content: "$ opentaint scan \\", weight: "strong" },
  { content: "    --project-model build/project-model \\", tone: "muted" },
  { content: "    --ruleset .opentaint/rules \\", tone: "muted" },
  { content: "    --passthrough-approximations \\", tone: "muted" },
  { content: "      .opentaint/model/org.graalvm.polyglot.yaml \\", tone: "muted" },
  { content: "    -o results/report.sarif", tone: "muted" },
  { content: "" },
  { content: "╭─OpenTaint Scan─╮", tone: "purple", weight: "strong" },
  { content: "╰─┬──────────────╯", tone: "purple" },
  { content: "  ├─ Project model", tone: "blue" },
  { content: "  │  └─ build/project-model", tone: "muted" },
  { content: "  └─ User ruleset", tone: "blue" },
  { content: "     └─ .opentaint/rules", tone: "muted" },
  { content: "" },
  { content: "╭─Rule Statistics─╮", tone: "purple", weight: "strong" },
  { content: "╰─┬───────────────╯", tone: "purple" },
  { content: "  └─ Rule parsing issues", tone: "blue" },
  { content: "     └─ No issues found", tone: "green" },
  { content: "" },
  { content: "╭─Scan Summary─╮", tone: "purple", weight: "strong" },
  { content: "╰─┬────────────╯", tone: "purple" },
  { content: "  ├─ Findings", tone: "blue" },
  { content: "  │  ├─ Total: 1 error", tone: "red", weight: "strong" },
  { content: "  │  ├─ Files affected: 1" },
  { content: "  │  ├─ Rules executed: 1" },
  { content: "  │  └─ Rules triggered: 1" },
  { content: "  │     └─ java.security.graaljs-code-injection: 1 error [CWE-94]", tone: "red" },
  { content: "  │        └─ Untrusted script execution" },
  { content: "  └─ Output", tone: "blue" },
  { content: "     └─ Report: results/report.sarif", tone: "green" },
];

const securitySummaryLines: TerminalLine[] = [
  { content: "$ opentaint summary results/report.sarif \\", weight: "strong" },
  { content: "    --show-findings --verbose-flow --show-code-snippets", tone: "muted" },
  { content: "" },
  { content: "╭─demo/app/execution/ScriptRuntime.java [1]─╮", tone: "purple", weight: "strong" },
  { content: "╰─┬─────────────────────────────────────────╯", tone: "purple" },
  { content: "  └─ Fingerprint: tM52G7DlsAaR", tone: "muted" },
  { content: "     ├─ Rule: java.security.graaljs-code-injection [CWE-94]", tone: "red" },
  { content: "     ├─ Severity: ERROR", tone: "red", weight: "strong" },
  { content: "     ├─ Location: demo/app/execution/ScriptRuntime.java:9" },
  { content: "     ├─ Message: Untrusted HTTP input reaches a host-enabled" },
  { content: "     │  GraalVM Context.eval call, allowing attacker-controlled" },
  { content: "     │  script execution." },
  { content: "     ├─ Endpoints:", tone: "blue" },
  { content: "     │  └─ POST /api/jobs (query: script)", tone: "green" },
  { content: "     └─ Code flow:", tone: "blue" },
  { content: "        ├─ Method entry marks the 1st argument of \"submit\"" },
  { content: "        │  as $UNTRUSTED" },
  { content: "        │  ├─ demo/app/api/JobController.java:18", tone: "muted" },
  { content: "        │  └─ Code snippet", tone: "muted" },
  { content: "        │     │      17     @PostMapping(\"/api/jobs\")" },
  { content: "        │     │ >>   18     public JobReceipt submit(" },
  { content: "        │     │               @RequestParam(\"script\") String script) {" },
  { content: "        │     │      19         return jobService.submit(script);" },
  { content: "        │     └────  20     }" },
  { content: "        │" },
  { content: "        ├─ Calling \"submit\" with $UNTRUSTED data at the 1st" },
  { content: "        │  argument of \"submit\"" },
  { content: "        │  └─ demo/app/api/JobController.java:19", tone: "muted" },
  { content: "        │" },
  { content: "        └─ 36-step flow ends at Context.eval", tone: "red", weight: "strong" },
  { content: "           └─ demo/app/execution/ScriptRuntime.java:9", tone: "muted" },
];

const heroLines: TerminalLine[] = [
  { content: "$ opentaint scan", weight: "strong" },
  { content: "" },
  { content: "OpenTaint Scan", tone: "purple", weight: "strong" },
  { content: "├─ Project model loaded", tone: "blue" },
  { content: "├─ Security specifications loaded", tone: "blue" },
  { content: "└─ Source index ready", tone: "blue" },
  { content: "" },
  { content: "████████████████████████  100%", tone: "purple" },
  { content: "✓ Analysis complete", tone: "green" },
  { content: "" },
  { content: "3 findings, report written to results.sarif", tone: "red", weight: "strong" },
];

const toneClass: Record<TerminalTone, string> = {
  plain: "text-[#322e2b] dark:text-[#f4f0ed]",
  muted: "text-[#746c67] dark:text-[#b0aaa6]",
  blue: "text-[#2563a6] dark:text-[#8ec7ff]",
  green: "text-[#237344] dark:text-[#8bd3a3]",
  red: "text-[#bd302a] dark:text-[#ff746c]",
  purple: "text-[#9c3f56] dark:text-[#ff9a94]",
};

const linesFor = (scenario: NonNullable<TerminalDemoProps["scenario"]>) => {
  if (scenario === "security-review") return securityReviewLines;
  if (scenario === "security-summary") return securitySummaryLines;
  return heroLines;
};

export function TerminalDemo({
  scenario = "default",
  ariaLabel = "OpenTaint terminal output",
}: TerminalDemoProps = {}) {
  const lines = linesFor(scenario);

  return (
    <div
      data-testid="demo-hero-player"
      data-terminal-renderer="native-text"
      aria-label={ariaLabel}
      className="flex h-full w-full flex-col overflow-hidden bg-[#f8f7f5] dark:bg-[#100d0c]"
    >
      <div className="flex h-10 shrink-0 items-center border-b border-black/10 bg-[#efeeeb] px-4 dark:border-white/10 dark:bg-[#1a1614]">
        <div className="flex gap-2" aria-hidden="true">
          <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
          <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
          <span className="h-2 w-2 rounded-full bg-[#28c840]" />
        </div>
        <span className="mx-auto pr-10 font-mono text-[11px] text-[#766e69] dark:text-[#a69b96]">
          opentaint — {scenario === "security-summary" ? "summary" : "scan"}
        </span>
      </div>
      <pre
        className="min-h-0 min-w-0 w-full flex-1 overflow-hidden whitespace-pre px-4 py-4 text-[13px] leading-[13px]"
        style={{
          fontFamily: '"SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", monospace',
          fontVariantLigatures: "none",
          fontSynthesis: "none",
          WebkitFontSmoothing: "antialiased",
          textRendering: "geometricPrecision",
        }}
      >
        {lines.map((line, index) => (
          <span key={`${line.content}-${index}`} className={toneClass[line.tone ?? "plain"]}>
            <span className={line.weight === "strong" ? "font-semibold" : "font-normal"}>{line.content || " "}</span>
            {index < lines.length - 1 ? "\n" : ""}
          </span>
        ))}
      </pre>
    </div>
  );
}
