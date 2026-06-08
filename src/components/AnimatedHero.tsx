import { Check, Copy } from "lucide-react";
import { Fragment, useMemo, useState, type CSSProperties } from "react";

type InstallMethod = {
  id: string;
  label: string;
  command: string;
};

const installMethods: InstallMethod[] = [
  { id: "curl", label: "curl", command: "curl -fsSL https://opentaint.org/install.sh | bash" },
  { id: "skills", label: "skills", command: "npx skills add https://github.com/seqra/opentaint" },
  { id: "npm", label: "npm", command: "npm install -g @seqra/opentaint" },
  { id: "brew", label: "brew", command: "brew install --cask seqra/tap/opentaint" },
  { id: "windows", label: "powershell", command: "irm https://opentaint.org/install.ps1 | iex" },
  { id: "docker", label: "docker", command: "docker pull ghcr.io/seqra/opentaint:latest" },
];

const headlineWords = [
  "The", "open", "source", "taint", "analysis", "engine", "for", "the", "AI", "era",
];

export function AnimatedHero() {
  const [activeMethod, setActiveMethod] = useState(installMethods[0]?.id ?? "curl");
  const [copied, setCopied] = useState(false);

  const activeInstallMethod = useMemo(
    () => installMethods.find((method) => method.id === activeMethod) ?? installMethods[0],
    [activeMethod],
  );

  const copyCommand = async () => {
    if (!activeInstallMethod) {
      return;
    }

    await navigator.clipboard.writeText(activeInstallMethod.command);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="crt-headline font-mono text-[28px] font-bold tracking-tight text-foreground sm:text-[34px] md:text-[40px] md:leading-[1.2] lg:text-[44px] lg:leading-[1.18]">
        {headlineWords.map((word, index) => (
          <Fragment key={word + index}>
            {index > 0 && " "}
            <span
              className="taint-word"
              style={{ "--taint-i": index } as CSSProperties}
            >
              {word}
            </span>
          </Fragment>
        ))}
        <span className="crt-cursor" aria-hidden="true">.</span>
      </h1>

      <p className="subheadline">
        AST-pattern rules. Whole-program taint analysis. Formal substrate for AI application security.
      </p>

      <div className="mt-8 flex w-full flex-col gap-3 sm:hidden">
        <a
          href="https://github.com/seqra/opentaint#quick-start"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 w-full min-w-[44px] items-center justify-center rounded-lg bg-primary px-4 text-[17px] font-normal leading-[1.6] text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Try OpenTaint
        </a>
        <a
          href="https://github.com/seqra/opentaint"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 w-full min-w-[44px] items-center justify-center rounded-lg border border-border bg-secondary px-4 text-[17px] font-normal leading-[1.6] text-secondary-foreground transition-colors hover:border-border-strong"
        >
          Star on GitHub
        </a>
      </div>

      <div className="mt-8 hidden text-left sm:block lg:mt-10">
        <div className="terminal-glow overflow-hidden rounded-xl border border-panel-border bg-panel">
          <div className="flex items-center gap-6 overflow-x-auto border-b border-panel-border px-4 py-3 scrollbar-thin lg:gap-8 lg:px-5 lg:py-4">
            {installMethods.map((method) => {
              const isActive = method.id === activeInstallMethod?.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setActiveMethod(method.id)}
                  className={[
                    "font-mono text-xs font-medium uppercase tracking-[0.16em] transition-colors lg:text-[13px]",
                    isActive ? "text-panel-accent" : "text-panel-foreground/70 hover:text-panel-accent",
                  ].join(" ")}
                >
                  {method.label}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3 px-4 py-3 lg:px-5 lg:py-4">
            <code
              role="button"
              tabIndex={0}
              onClick={copyCommand}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); copyCommand(); } }}
              className="flex-1 cursor-pointer overflow-x-auto whitespace-nowrap rounded-lg px-1 font-mono text-[15px] text-panel-foreground/90 scrollbar-thin transition-colors hover:bg-panel-accent/10 hover:text-panel-foreground lg:text-base"
            >
              {activeInstallMethod?.command}
            </code>
            <button
              type="button"
              onClick={copyCommand}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-panel-foreground/15 px-3 py-1.5 font-mono text-xs text-panel-foreground/70 transition-colors hover:border-panel-foreground/35 hover:text-panel-foreground lg:px-3.5 lg:py-2 lg:text-[13px]"
            >
              {copied ? <Check className="h-3 w-3 text-panel-accent" /> : <Copy className="h-3 w-3" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
