import { Check, Copy, Star } from "lucide-react";
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
    <div className="mx-auto max-w-5xl">
      <h1 className="font-mono text-[28px] font-bold tracking-tight text-foreground sm:text-[34px] md:text-[40px] md:leading-[1.1] lg:text-[44px] lg:leading-[1.08]">
        The open source taint analysis engine for the AI era
      </h1>

      <p className="subheadline">
        AST-pattern rules. Whole-program taint analysis. Formal substrate for AI application security.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:hidden">
        <a
          href="https://github.com/seqra/opentaint#quick-start"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-3 font-mono text-[15px] font-medium text-background transition-colors hover:bg-foreground/85"
        >
          <svg role="img" viewBox="0 0 98 96" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" aria-hidden="true">
            <path d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" />
          </svg>
          GitHub
        </a>
        <a
          href="https://github.com/seqra/opentaint"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Star opentaint on GitHub"
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-mono text-[15px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Star className="h-4 w-4" aria-hidden="true" />
          Star
        </a>
      </div>

      <div className="mt-8 hidden text-left sm:block lg:mt-10">
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
