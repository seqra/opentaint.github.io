import { Check, Copy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type InstallMethod = {
  id: string;
  label: string;
  command: string;
};

const installMethods: InstallMethod[] = [
  { id: "npm", label: "npm", command: "npm install -g @seqra/opentaint" },
  { id: "curl", label: "curl", command: "curl -fsSL https://opentaint.org/install.sh | bash" },
  { id: "skills", label: "skills", command: "npx skills add https://github.com/seqra/opentaint" },
  { id: "brew", label: "brew", command: "brew install --cask seqra/tap/opentaint" },
  { id: "windows", label: "powershell", command: "irm https://opentaint.org/install.ps1 | iex" },
  { id: "docker", label: "docker", command: "docker pull ghcr.io/seqra/opentaint:latest" },
];

const heroPrefixes = ["Continuous", "Lean", "Agentic"];

export function AnimatedHero() {
  const [activeMethod, setActiveMethod] = useState(installMethods[0]?.id ?? "npm");
  const [copied, setCopied] = useState(false);
  const [activePrefix, setActivePrefix] = useState(0);

  useEffect(() => {
    if (typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const interval = window.setInterval(() => {
      setActivePrefix((current) => (current + 1) % heroPrefixes.length);
    }, 2200);
    return () => window.clearInterval(interval);
  }, []);

  const activeInstallMethod = useMemo(
    () => installMethods.find((method) => method.id === activeMethod) ?? installMethods[0],
    [activeMethod],
  );

  const copyCommand = async () => {
    if (!activeInstallMethod) return;
    await navigator.clipboard.writeText(activeInstallMethod.command);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="relative mx-auto max-w-[82rem] text-center">
      <img src="/favicon.svg" alt="" className="mx-auto h-16 w-16 sm:h-20 sm:w-20" aria-hidden="true" />

      <h1 className="mx-auto mt-6 max-w-full font-mono text-[36px] font-semibold leading-[1.06] tracking-[-0.045em] text-foreground sm:text-[42px] md:text-[46px] lg:text-[48px] 2xl:text-[54px]">
        <span className="sr-only">Continuous, lean, and agentic application security testing</span>
        <span aria-hidden="true" className="xl:flex xl:items-start xl:justify-center xl:gap-3">
          <span className="relative block h-[1.06em] xl:w-[7ch] xl:shrink-0">
            <span
              key={heroPrefixes[activePrefix]}
              className="hero-prefix-in absolute inset-x-0 top-0 text-center text-primary xl:left-auto xl:right-0 xl:w-[10ch] xl:text-right"
            >
              {heroPrefixes[activePrefix]}
            </span>
          </span>
          <span className="block xl:shrink-0 xl:whitespace-nowrap xl:text-left">Application Security Testing</span>
        </span>
      </h1>

      <p className="section-banner mx-auto mt-6">The open source taint analysis engine for the AI era</p>

      <div className="mx-auto mt-8 max-w-2xl text-left">
        <div className="overflow-hidden rounded-xl border border-panel-border bg-panel">
          <div className="flex h-10 items-center gap-6 overflow-x-auto border-b border-panel-border px-4 scrollbar-thin sm:px-6 lg:gap-8">
            {installMethods.map((method) => {
              const isActive = method.id === activeInstallMethod?.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => {
                    setActiveMethod(method.id);
                    setCopied(false);
                  }}
                  className={[
                    "h-10 shrink-0 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors sm:text-xs",
                    isActive ? "text-panel-accent" : "text-panel-foreground/65 hover:text-panel-accent",
                  ].join(" ")}
                >
                  {method.label}
                </button>
              );
            })}
          </div>

          <div className="flex min-h-16 items-center gap-3 px-4 py-3 sm:px-6">
            <code
              role="button"
              tabIndex={0}
              aria-label={`Copy ${activeInstallMethod?.label ?? "install"} command`}
              onClick={copyCommand}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  copyCommand();
                }
              }}
              className="min-w-0 flex-1 cursor-pointer overflow-x-auto whitespace-nowrap rounded px-1 font-mono text-xs text-panel-foreground/90 scrollbar-thin transition-colors hover:bg-panel-accent/10 hover:text-panel-foreground sm:text-sm"
            >
              {activeInstallMethod?.command}
            </code>
            <button
              type="button"
              onClick={copyCommand}
              aria-label={copied ? "Install command copied" : "Copy install command"}
              className="inline-flex h-10 min-w-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-panel-foreground/15 px-3 font-mono text-xs text-panel-foreground/70 transition-colors hover:border-panel-foreground/35 hover:text-panel-foreground sm:px-4"
            >
              {copied ? <Check className="h-4 w-4 text-panel-accent" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
