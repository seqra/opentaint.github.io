import { useEffect, useRef } from "react";
import securitySummaryOutput from "../data/security-summary.txt?raw";

type TerminalTone = "plain" | "muted" | "blue" | "green" | "red" | "purple";

type TerminalLine = {
  content: string;
  tone?: TerminalTone;
  weight?: "normal" | "strong";
  segments?: Array<{
    content: string;
    tone?: TerminalTone;
    weight?: "normal" | "strong";
  }>;
};

type TerminalDemoProps = {
  scenario?: "default" | "security-review" | "security-summary";
  ariaLabel?: string;
  progress?: number;
};

const securityReviewLines: TerminalLine[] = [
  { content: "$ opentaint scan \\", weight: "strong" },
  { content: "    --project-model build/project-model \\", tone: "muted" },
  { content: "    --ruleset .opentaint/rules \\", tone: "muted" },
  { content: "    --passthrough-approximations \\", tone: "muted" },
  { content: "      .opentaint/model \\", tone: "muted" },
  { content: "    -o results/report.sarif", tone: "muted" },
  { content: "" },
  { content: "╭─OpenTaint Scan─╮" },
  { content: "╰─┬──────────────╯" },
  { content: "  ├─ Project model", tone: "blue" },
  { content: "  │  └─ build/project-model" },
  { content: "  ├─ Analyzer", tone: "blue" },
  { content: "  │  └─ 2026.07.10.a20ded6" },
  { content: "  └─ User ruleset", tone: "blue" },
  { content: "     └─ .opentaint/rules" },
  { content: "" },
  { content: "✓ Analyzing project in 4s", segments: [
    { content: "✓", tone: "green" },
    { content: " Analyzing project in " },
    { content: "4s", tone: "muted" },
  ] },
  { content: "" },
  { content: "╭─Rule Statistics─╮" },
  { content: "╰─┬───────────────╯" },
  { content: "  └─ Rule parsing issues" },
  { content: "     └─ No issues found" },
  { content: "" },
  { content: "╭─Scan Summary─╮" },
  { content: "╰─┬────────────╯" },
  { content: "  ├─ Findings" },
  { content: "  │  ├─ Total: 1 error", segments: [
    { content: "Total:", tone: "blue" },
    { content: " " },
    { content: "1 error", tone: "red", weight: "strong" },
  ] },
  { content: "  │  ├─ Files affected: 1", segments: [
    { content: "Files affected:", tone: "blue" },
    { content: " 1" },
  ] },
  { content: "  │  ├─ Rules executed: 1", segments: [
    { content: "Rules executed:", tone: "blue" },
    { content: " 1" },
  ] },
  { content: "  │  └─ Rules triggered: 1", segments: [
    { content: "Rules triggered:", tone: "blue" },
    { content: " 1" },
  ] },
  { content: "  │     └─ java.security.graaljs-code-injection: 1 error [CWE-94]", segments: [
    { content: "java.security.graaljs-code-injection: " },
    { content: "1 error", tone: "red", weight: "strong" },
    { content: " [CWE-94]" },
  ] },
  { content: "  │        └─ Untrusted script execution" },
  { content: "  └─ Output" },
  { content: "     ├─ Report: results/report.sarif", segments: [
    { content: "Report:", tone: "blue" },
    { content: " results/report.sarif" },
  ] },
  { content: "     └─ Log: results/opentaint.log", segments: [
    { content: "Log:", tone: "blue" },
    { content: " results/opentaint.log" },
  ] },
  { content: "" },
  { content: "╭─Suggestions─╮" },
  { content: "╰─┬───────────╯" },
  { content: "  └─ To view findings run", tone: "green", weight: "strong" },
  { content: "     └─ opentaint summary results/report.sarif --show-findings", weight: "strong" },
];

const securitySummaryLines: TerminalLine[] = [
  { content: "$ opentaint summary results/report.sarif \\", weight: "strong" },
  { content: "    --show-findings --verbose-flow --show-code-snippets", tone: "muted" },
  { content: "" },
  ...securitySummaryOutput.trimEnd().split("\n").map((content): TerminalLine => {
    if (/^╭─/.test(content)) return { content, tone: "purple", weight: "strong" };
    if (/Fingerprint:|Location:|\.java:\d+$|Code snippet/.test(content)) return { content, tone: "muted" };
    if (/Severity: ERROR|1 error|graaljs-code-injection/.test(content)) return { content, tone: "red", weight: "strong" };
    if (/Endpoints:|Code flow:|Findings|Output|Total:|Files affected:|Rules (?:executed|triggered):|Report:/.test(content)) return { content, tone: "blue" };
    if (/POST \/api\/jobs/.test(content)) return { content, tone: "green" };
    return { content };
  }),
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

const linesFor = (scenario: NonNullable<TerminalDemoProps["scenario"]>) => {
  if (scenario === "security-review") return securityReviewLines;
  if (scenario === "security-summary") return securitySummaryLines;
  return heroLines;
};

const toneClass: Record<TerminalTone, string> = {
  plain: "text-[#302d2a] dark:text-[#eee9e5]",
  muted: "text-[#756d68] dark:text-[#aaa19c]",
  blue: "text-[#2369b3] dark:text-[#78baff]",
  green: "text-[#237b45] dark:text-[#72c98e]",
  red: "text-[#ca3029] dark:text-[#ff655d]",
  purple: "text-[#a63e58] dark:text-[#f07d91]",
};

const faintClass = "text-[#928c88] dark:text-[#77716e]";

function ConnectorGlyph({ glyph }: { glyph: string }) {
  if (glyph === " ") return <span className="relative h-[18px] w-[1ch] shrink-0" />;
  return (
    <span className="relative h-[18px] w-[1ch] shrink-0" aria-hidden="true">
      {(glyph === "│" || glyph === "├") && <span className="absolute inset-y-0 left-1/2 border-l border-current" />}
      {glyph === "└" && <span className="absolute left-1/2 top-0 h-1/2 border-l border-current" />}
      {(glyph === "├" || glyph === "└") && <span className="absolute left-1/2 right-0 top-1/2 border-t border-current" />}
      {glyph === "─" && <span className="absolute inset-x-0 top-1/2 border-t border-current" />}
      {glyph === "╭" && <span className="absolute bottom-0 left-1/2 right-0 top-1/2 rounded-tl border-l border-t border-current" />}
      {glyph === "╮" && <span className="absolute bottom-0 left-0 right-1/2 top-1/2 rounded-tr border-r border-t border-current" />}
      {glyph === "╰" && <span className="absolute bottom-1/2 left-1/2 right-0 top-0 rounded-bl border-b border-l border-current" />}
      {glyph === "╯" && <span className="absolute bottom-1/2 left-0 right-1/2 top-0 rounded-br border-b border-r border-current" />}
      {glyph === "┬" && <><span className="absolute inset-x-0 top-1/2 border-t border-current" /><span className="absolute bottom-0 left-1/2 h-1/2 border-l border-current" /></>}
    </span>
  );
}

function GlyphRun({ content }: { content: string }) {
  return (
    <span className="inline-flex h-[18px] shrink-0 align-top">
      {Array.from(content).map((glyph, index) => <ConnectorGlyph key={`${glyph}-${index}`} glyph={glyph} />)}
    </span>
  );
}

function TerminalSegments({ line, fallback, wrap = false }: { line: TerminalLine; fallback: string; wrap?: boolean }) {
  if (!line.segments) {
    return <span className={`${wrap ? "min-w-0 whitespace-pre-wrap break-words" : ""} ${toneClass[line.tone ?? "plain"]} ${line.weight === "strong" ? "font-semibold" : "font-normal"}`}>{fallback || " "}</span>;
  }
  return <>{line.segments.map((segment, index) => (
    <span
      key={`${segment.content}-${index}`}
      className={`${toneClass[segment.tone ?? "plain"]} ${segment.weight === "strong" ? "font-semibold" : "font-normal"}`}
    >
      {segment.content}
    </span>
  ))}</>;
}

function TerminalContent({ line, wrap = false }: { line: TerminalLine; wrap?: boolean }) {
  const tree = /^([ │├└─]+)(.*)$/.exec(line.content);
  if (!tree || !/[│├└]/.test(tree[1])) return <TerminalSegments line={line} fallback={line.content} wrap={wrap} />;
  return (
    <span className={wrap ? "flex min-h-[18px] min-w-0 items-start" : "inline-flex h-[18px] items-start align-top"}>
      <span className={faintClass}><GlyphRun content={tree[1]} /></span>
      <TerminalSegments line={line} fallback={tree[2]} wrap={wrap} />
    </span>
  );
}

function TerminalHeader({ title, bottom }: { title: string; bottom: string }) {
  return (
    <span className="block h-9">
      <span className={`flex h-[18px] ${faintClass}`}>
        <GlyphRun content="╭─" />
        <span className={`h-[18px] font-semibold leading-[18px] ${toneClass.purple}`}>{title}</span>
        <GlyphRun content="─╮" />
      </span>
      <span className={`flex h-[18px] ${faintClass}`}><GlyphRun content={bottom} /></span>
    </span>
  );
}

export function TerminalDemo({
  scenario = "default",
  ariaLabel = "OpenTaint terminal output",
  progress = 0,
}: TerminalDemoProps = {}) {
  const lines = linesFor(scenario);
  const wrapsLongLines = scenario === "security-summary";
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const output = outputRef.current;
    if (!output) return;
    output.scrollTop = Math.max(0, output.scrollHeight - output.clientHeight) * progress;
  }, [progress, scenario]);

  return (
    <div
      data-testid="demo-hero-player"
      data-terminal-renderer="native-cli"
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
      <div
        ref={outputRef}
        data-testid="terminal-output"
        className={`min-h-0 min-w-0 w-full flex-1 overflow-hidden px-4 py-4 text-[12px] leading-[18px] sm:text-[13px] ${wrapsLongLines ? "whitespace-pre-wrap" : "whitespace-pre"}`}
        style={{
          fontFamily: '"SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", monospace',
          fontVariantLigatures: "none",
          fontSynthesis: "none",
          WebkitFontSmoothing: "antialiased",
          textRendering: "geometricPrecision",
        }}
      >
        {lines.map((line, index) => {
          const frame = /^╭─(.+)─╮$/.exec(line.content);
          const frameBase = index > 0 && /^╭─(.+)─╮$/.exec(lines[index - 1].content)
            && /^╰─┬─+╯$/.test(line.content);
          if (frameBase) return null;
          if (frame) {
            return (
              <TerminalHeader key={`${line.content}-${index}`} title={frame[1]} bottom={lines[index + 1]?.content ?? ""} />
            );
          }
          return (
            <span key={`${line.content}-${index}`} className={wrapsLongLines ? "block min-h-[18px]" : "block h-[18px]"}>
              <TerminalContent line={line} wrap={wrapsLongLines} />
            </span>
          );
        })}
      </div>
    </div>
  );
}
