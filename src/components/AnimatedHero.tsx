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
        Enterprise-grade dataflow analysis with code-native rules — no paywall, no pattern-matching compromises.
      </p>

      <div className="mt-8 mx-auto max-w-2xl lg:mt-10 lg:max-w-3xl">
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
              className="flex-1 cursor-pointer overflow-x-auto whitespace-nowrap rounded px-1 font-mono text-sm text-foreground/90 scrollbar-thin transition-colors hover:bg-red-500/10 hover:text-foreground sm:text-[15px] lg:text-base"
            >
              {activeInstallMethod?.command}
            </code>
            <button
              type="button"
              onClick={copyCommand}
              className="inline-flex shrink-0 items-center gap-1.5 rounded border border-border px-3 py-1.5 font-mono text-xs text-foreground/70 transition-colors hover:border-border-strong hover:text-foreground lg:px-3.5 lg:py-2 lg:text-[13px]"
            >
              {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
              {copied ? "" : ""}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
