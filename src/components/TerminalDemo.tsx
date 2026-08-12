import { useEffect, useRef } from "react";
import securityScanOutput from "../data/security-scan.txt?raw";
import securitySummaryOutput from "../data/security-summary.txt?raw";

type TerminalTone = "plain" | "muted" | "blue" | "green" | "red" | "purple";
type TerminalDensity = "default" | "compact";

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
  ...securityScanOutput.trimEnd().split("\n").map((content): TerminalLine => {
    if (/^╭─/.test(content)) return { content, tone: "purple", weight: "strong" };
    if (/^✓/.test(content)) return { content, tone: "green", weight: "strong" };
    if (/1 error|graaljs-code-injection/.test(content)) return { content, tone: "red", weight: "strong" };
    if (/Project model|Analyzer|User ruleset|Findings|Output|Total:|Files affected:|Rules (?:executed|triggered):|Report:|Log:/.test(content)) return { content, tone: "blue" };
    if (/To view findings run/.test(content)) return { content, tone: "green", weight: "strong" };
    return { content };
  }),
];

const securitySummaryLines: TerminalLine[] = [
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
  plain: "text-[#302d2a] dark:text-[#e7e1dc]",
  muted: "text-[#756d68] dark:text-[#aaa29d]",
  blue: "text-[#2369b3] dark:text-[#78baff]",
  green: "text-[#237b45] dark:text-[#72c98e]",
  red: "text-[#ca3029] dark:text-[#ff655d]",
  purple: "text-[#a63e58] dark:text-[#f07d91]",
};

const faintClass = "text-[#928c88] dark:text-[#77716e]";
const glyphHeight: Record<TerminalDensity, string> = {
  default: "h-[18px]",
  compact: "h-[16px]",
};
const headerHeight: Record<TerminalDensity, string> = {
  default: "h-9",
  compact: "h-8",
};
const glyphLeading: Record<TerminalDensity, string> = {
  default: "leading-[18px]",
  compact: "leading-[16px]",
};

function ConnectorGlyph({ glyph, density }: { glyph: string; density: TerminalDensity }) {
  if (glyph === " ") return <span className={`relative ${glyphHeight[density]} w-[1ch] shrink-0`} />;
  return (
    <span className={`relative ${glyphHeight[density]} w-[1ch] shrink-0`} aria-hidden="true">
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

function GlyphRun({ content, density }: { content: string; density: TerminalDensity }) {
  return (
    <span className={`inline-flex ${glyphHeight[density]} shrink-0 align-top`}>
      {Array.from(content).map((glyph, index) => <ConnectorGlyph key={`${glyph}-${index}`} glyph={glyph} density={density} />)}
    </span>
  );
}

function TerminalSegments({ line, fallback }: { line: TerminalLine; fallback: string }) {
  if (!line.segments) {
    return <span className={`${toneClass[line.tone ?? "plain"]} ${line.weight === "strong" ? "font-semibold" : "font-normal"}`}>{fallback || " "}</span>;
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

function TerminalContent({ line, density }: { line: TerminalLine; density: TerminalDensity }) {
  const tree = /^([ │├└─]+)(.*)$/.exec(line.content);
  if (!tree || !/[│├└]/.test(tree[1])) return <TerminalSegments line={line} fallback={line.content} />;
  return (
    <span className={`inline-flex ${glyphHeight[density]} items-start align-top`}>
      <span className={faintClass}><GlyphRun content={tree[1]} density={density} /></span>
      <TerminalSegments line={line} fallback={tree[2]} />
    </span>
  );
}

function TerminalHeader({ title, bottom, density }: { title: string; bottom: string; density: TerminalDensity }) {
  return (
    <span className={`block ${headerHeight[density]}`}>
      <span className={`flex ${glyphHeight[density]} ${faintClass}`}>
        <GlyphRun content="╭─" density={density} />
        <span className={`${glyphHeight[density]} font-semibold ${glyphLeading[density]} ${toneClass.purple}`}>{title}</span>
        <GlyphRun content="─╮" density={density} />
      </span>
      <span className={`flex ${glyphHeight[density]} ${faintClass}`}><GlyphRun content={bottom} density={density} /></span>
    </span>
  );
}

export function TerminalDemo({
  scenario = "default",
  ariaLabel = "OpenTaint terminal output",
  progress = 0,
}: TerminalDemoProps = {}) {
  const lines = linesFor(scenario);
  const density: TerminalDensity = scenario === "default" ? "default" : "compact";
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
      className="flex h-full w-full flex-col overflow-hidden bg-[#f8f7f5] dark:bg-[#130d0e]"
    >
      <div className="flex h-10 shrink-0 items-center border-b border-black/10 bg-[#efeeeb] px-4 dark:border-white/10 dark:bg-[#1c1213]">
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
        className={`min-h-0 min-w-0 w-full flex-1 overflow-hidden whitespace-pre ${scenario === "default" ? "px-4 py-4 text-[12px] leading-[18px] sm:text-[13px]" : "px-3 py-2 text-[10.5px] leading-[16px]"}`}
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
              <TerminalHeader key={`${line.content}-${index}`} title={frame[1]} bottom={lines[index + 1]?.content ?? ""} density={density} />
            );
          }
          return (
            <span key={`${line.content}-${index}`} className={`block ${glyphHeight[density]}`}>
              <TerminalContent line={line} density={density} />
            </span>
          );
        })}
      </div>
    </div>
  );
}
