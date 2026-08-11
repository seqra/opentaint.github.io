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
  { id: "brew", label: "brew", command: "brew install --cask seqra/tap/opentaint" },
  { id: "windows", label: "powershell", command: "irm https://opentaint.org/install.ps1 | iex" },
  { id: "docker", label: "docker", command: "docker pull ghcr.io/seqra/opentaint:latest" },
];

const skillsCommand = "npx skills add https://github.com/seqra/opentaint";
const firstPrompt = "Run deep security scan and static triage with appsec-agent skill";

type CopyProps = {
  id: string;
  value: string;
  copiedId: string | null;
  onCopy: (id: string, value: string) => void;
};

function CopyButton({ id, value, copiedId, onCopy }: CopyProps) {
  const copied = copiedId === id;
  return (
    <button
      type="button"
      onClick={() => onCopy(id, value)}
      aria-label={copied ? `${id} copied` : `Copy ${id}`}
      className="inline-flex h-10 min-w-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-panel-foreground/15 px-3 font-mono text-xs text-panel-foreground/70 transition-colors hover:border-panel-foreground/35 hover:text-panel-foreground sm:px-4"
    >
      {copied ? <Check className="h-4 w-4 text-panel-accent" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
      <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

function StageLabel({ number, children }: { number: string; children: string }) {
  return (
    <div className="flex items-center gap-3 text-left">
      <span className="font-mono text-[10px] font-semibold text-primary">{number}</span>
      <h3 className="font-mono text-xs font-semibold text-foreground sm:text-sm">{children}</h3>
    </div>
  );
}

function CommandLine({ id, value, prompt = false, copiedId, onCopy }: CopyProps & { prompt?: boolean }) {
  return (
    <div className={["flex min-h-16 items-center gap-3 px-4 py-3 sm:px-6", prompt ? "bg-primary/5" : ""].join(" ")}>
      <code
        role="button"
        tabIndex={0}
        aria-label={`Copy ${id} by clicking command`}
        onClick={() => onCopy(id, value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onCopy(id, value);
          }
        }}
        className="min-w-0 flex-1 cursor-pointer whitespace-pre-wrap break-words rounded px-1 font-mono text-xs leading-5 text-panel-foreground/90 transition-colors hover:bg-panel-accent/10 hover:text-panel-foreground sm:text-sm"
      >
        {value}
      </code>
      <CopyButton id={id} value={value} copiedId={copiedId} onCopy={onCopy} />
    </div>
  );
}

export function FirstScanFunnel() {
  const [activeMethod, setActiveMethod] = useState(installMethods[0]?.id ?? "npm");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const activeInstallMethod = useMemo(
    () => installMethods.find((method) => method.id === activeMethod) ?? installMethods[0],
    [activeMethod],
  );

  const copy = async (id: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId((current) => current === id ? null : current), 1800);
  };

  return (
    <section id="install" className="band quickstart-section" aria-labelledby="quickstart-heading">
      <div className="mx-auto max-w-[82rem]">
        <div className="section-header">
          <h2 id="quickstart-heading" className="section-heading">Five-minute quickstart</h2>
        </div>

        <div className="mx-auto mt-10 max-w-4xl space-y-4 text-left">
          <div className="grid gap-3 md:grid-cols-[12rem_minmax(0,1fr)] md:items-center md:gap-4">
            <StageLabel number="01">Install OpenTaint</StageLabel>
            <div className="min-w-0 overflow-hidden rounded-xl border border-panel-border bg-panel">
              <div className="flex h-12 min-w-0 items-center border-b border-panel-border/30">
                <div className="flex min-w-0 flex-1 items-center gap-6 overflow-x-auto px-4 scrollbar-thin sm:px-6 lg:gap-8">
                  {installMethods.map((method) => {
                    const active = method.id === activeInstallMethod?.id;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => {
                          setActiveMethod(method.id);
                          setCopiedId(null);
                        }}
                        className={[
                          "h-12 shrink-0 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors sm:text-xs",
                          active ? "text-panel-accent" : "text-panel-foreground/60 hover:text-panel-accent",
                        ].join(" ")}
                      >
                        {method.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              {activeInstallMethod && <CommandLine id="OpenTaint install command" value={activeInstallMethod.command} copiedId={copiedId} onCopy={copy} />}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-[12rem_minmax(0,1fr)] md:items-center md:gap-4">
            <StageLabel number="02">Install AppSec Agent</StageLabel>
            <div className="min-w-0 overflow-hidden rounded-xl border border-panel-border bg-panel">
              <CommandLine id="skills install command" value={skillsCommand} copiedId={copiedId} onCopy={copy} />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-[12rem_minmax(0,1fr)] md:items-center md:gap-4">
            <StageLabel number="03">Prompt your agent</StageLabel>
            <div className="min-w-0 overflow-hidden rounded-xl border border-panel-border bg-panel">
              <CommandLine id="first security-review prompt" value={firstPrompt} prompt copiedId={copiedId} onCopy={copy} />
            </div>
          </div>
        </div>

        <div className="mx-auto mt-8 grid max-w-4xl rounded-xl border border-primary/40 bg-primary/[0.06] p-6 shadow-sm md:grid-cols-[12rem_minmax(0,1fr)] md:items-center md:gap-4">
          <p className="font-mono text-lg font-semibold leading-6 text-primary">Open source, batteries included</p>
          <p className="mt-4 font-mono text-xs leading-6 text-foreground md:mt-0">Engine, rules, dependency models, agent skills, CLI, report viewer, and CI integrations ship together under open-source licenses.</p>
        </div>
      </div>
    </section>
  );
}
