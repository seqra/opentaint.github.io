import { Check, Copy } from "lucide-react";
import { useMemo, useState } from "react";

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

export function AnimatedHero() {
  const [activeMethod, setActiveMethod] = useState(installMethods[0]?.id ?? "npm");
  const [copied, setCopied] = useState(false);

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
    <div className="relative mx-auto max-w-6xl text-center">
      <p className="section-eyebrow mx-auto">
        The open source taint analysis engine for the AI era
      </p>

      <h1 className="mx-auto mt-4 max-w-[20ch] font-mono text-[36px] font-semibold leading-[1.06] tracking-[-0.045em] text-foreground sm:max-w-[25ch] sm:text-[46px] md:max-w-[28ch] md:text-[54px] lg:max-w-[30ch] lg:text-[60px] xl:text-[64px]">
        Turn one security review into unlimited security scans
      </h1>

      <p className="mx-auto mt-4 max-w-[48rem] font-mono text-sm leading-6 text-muted-foreground sm:text-base lg:text-[17px]">
        The flexibility of agent reasoning and the consistency of formal analysis combined
      </p>

      <div className="mx-auto mt-8 max-w-2xl text-left lg:mt-10">
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
