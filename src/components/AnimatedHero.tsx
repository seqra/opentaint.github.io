import { Check, Copy } from "lucide-react";
import { useMemo, useState } from "react";

type InstallMethod = {
  id: string;
  label: string;
  command: string;
};

const installMethods: InstallMethod[] = [
  { id: "curl", label: "curl", command: "curl -fsSL https://opentaint.org/install.sh | bash" },
  { id: "brew", label: "brew", command: "brew install --cask seqra/tap/opentaint" },
  { id: "windows", label: "powershell", command: "irm https://opentaint.org/install.ps1 | iex" },
  { id: "docker", label: "docker", command: "docker pull ghcr.io/seqra/opentaint:latest" },
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
    <div>
      <h1 className="font-mono text-[26px] font-bold tracking-tight text-foreground sm:text-[30px] md:text-[38px] md:leading-[1.15] lg:text-[42px]">
        The open source taint analysis engine for the AI era
      </h1>

      <p className="mt-5 font-mono text-[15px] leading-[200%] text-muted-foreground sm:max-w-[82%] lg:text-base lg:mt-6">
        Formal inter-procedural taint analysis — finds what pattern matching engines miss, enacts what AI agents discover as permanent rules, scales where neither can alone.
      </p>

      <div className="mt-8 flex gap-3 sm:hidden">
        <a
          href="https://github.com/seqra/opentaint"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded border border-border bg-secondary/50 px-4 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-foreground/80 transition-colors hover:border-border-strong hover:text-foreground"
        >
          <svg role="img" viewBox="0 0 98 96" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" aria-hidden="true">
            <path d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" />
          </svg>
          GitHub
        </a>
        <a
          href="https://discord.gg/6BXDfbP4p9"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded border border-border bg-secondary/50 px-4 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-foreground/80 transition-colors hover:border-border-strong hover:text-foreground"
        >
          <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" aria-hidden="true">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z" />
          </svg>
          Discord
        </a>
      </div>

      <div className="mt-8 mx-auto hidden max-w-2xl sm:block lg:mt-10 lg:max-w-3xl">
        <div className="overflow-hidden rounded-md border border-border bg-secondary/50">
          <div className="flex items-center gap-1.5 overflow-x-auto border-b border-border px-3 py-2.5 scrollbar-thin lg:px-4 lg:py-3">
            {installMethods.map((method) => {
              const isActive = method.id === activeInstallMethod?.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setActiveMethod(method.id)}
                  className={[
                    "rounded border px-3 py-1.5 font-mono text-xs uppercase tracking-[0.14em] transition-colors lg:px-3.5 lg:py-2 lg:text-[13px]",
                    isActive
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:text-foreground hover:border-border-strong",
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
              className="flex-1 cursor-pointer overflow-x-auto whitespace-nowrap rounded px-1 font-mono text-[15px] text-foreground/90 scrollbar-thin transition-colors hover:bg-red-500/10 hover:text-foreground lg:text-base"
            >
              {activeInstallMethod?.command}
            </code>
            <button
              type="button"
              onClick={copyCommand}
              className="inline-flex shrink-0 items-center gap-1.5 rounded border border-border px-3 py-1.5 font-mono text-xs text-foreground/70 transition-colors hover:border-border-strong hover:text-foreground lg:px-3.5 lg:py-2 lg:text-[13px]"
            >
              {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
