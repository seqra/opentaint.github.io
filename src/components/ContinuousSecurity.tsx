import { Check, FileCode2, FileSearch, FolderCode, ShieldAlert, X } from "lucide-react";
import type { ReactNode } from "react";

function VisualFrame({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="workflow-visual relative h-full overflow-hidden rounded-[18px] border border-border bg-code-bg" role="img" aria-label={label}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,hsl(var(--brand)/0.07),transparent_52%)]" aria-hidden="true" />
      {children}
    </div>
  );
}

function Connector({ d }: { d: string }) {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full text-primary" viewBox="0 0 300 270" preserveAspectRatio="none" aria-hidden="true">
      <path className="workflow-connector-base" d={d} />
      <path className="workflow-connector-signal" d={d} />
    </svg>
  );
}

function ProjectNode({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`workflow-diagram-node ${compact ? "w-[5rem]" : "w-[5.5rem]"}`}>
      <div className="flex items-center gap-1.5 border-b border-border px-2.5 py-2">
        <FolderCode className="h-3.5 w-3.5 text-primary" strokeWidth={1.6} />
        <span className="workflow-diagram-label">PROJECT</span>
      </div>
      <div className="grid grid-cols-3 gap-1.5 px-2.5 py-3" aria-hidden="true">
        {Array.from({ length: 9 }, (_, index) => <span key={index} className={`h-4 rounded-[3px] border ${index === 7 ? "border-primary/50 bg-primary/15" : "border-border-strong bg-background"}`} />)}
      </div>
    </div>
  );
}

function ReasoningNode({ label }: { label: string }) {
  return (
    <div className="workflow-reasoning-node">
      <span className="absolute inset-2 rounded-full border border-primary/20" aria-hidden="true" />
      <FileSearch className="h-6 w-6 text-primary" strokeWidth={1.5} />
      <span className="mt-1 font-mono text-[7px] font-semibold uppercase tracking-[0.08em] text-primary">{label}</span>
    </div>
  );
}

function InformalSpecNode() {
  return (
    <div className="workflow-diagram-node w-[6.5rem]">
      <div className="flex items-center gap-1.5 border-b border-border px-2.5 py-2">
        <FileCode2 className="h-3.5 w-3.5 text-primary" strokeWidth={1.6} />
        <span className="workflow-diagram-label">INFORMAL SPEC</span>
      </div>
      <div className="space-y-2 px-2.5 py-3">
        <div className="rounded-md border border-primary/25 bg-primary/[0.06] px-2 py-1.5 font-mono text-[7px] font-semibold leading-3 text-foreground">TRUST BOUNDARY</div>
        <div className="rounded-md border border-primary/25 bg-primary/[0.06] px-2 py-1.5 font-mono text-[7px] font-semibold leading-3 text-foreground">VULNERABILITY PATTERN</div>
      </div>
    </div>
  );
}

function FormalSpecNode({ refined = false }: { refined?: boolean }) {
  return (
    <div className="workflow-diagram-node w-[6.5rem] border-primary/35">
      <div className="flex items-center gap-1.5 border-b border-primary/20 bg-primary/[0.05] px-2.5 py-2">
        <FileCode2 className="h-3.5 w-3.5 text-primary" strokeWidth={1.6} />
        <span className="workflow-diagram-label text-primary">{refined ? "REFINED SPEC" : "FORMAL SPEC"}</span>
      </div>
      <div className="space-y-2 px-2.5 py-3">
        <div className="rounded-md bg-primary px-2 py-1.5 font-mono text-[7px] font-semibold leading-3 text-primary-foreground">TAINT RULE</div>
        <div className="rounded-md border border-primary/30 bg-primary/[0.08] px-2 py-1.5 font-mono text-[7px] font-semibold leading-3 text-primary">DEPENDENCY MODEL</div>
      </div>
    </div>
  );
}

function DiscoverPreview() {
  return (
    <VisualFrame label="Model reasoning extracts an informal security specification from a project">
      <Connector d="M82 135 C102 135 103 135 122 135 M178 135 C197 135 198 135 218 135" />
      <div className="absolute left-3 top-1/2 -translate-y-1/2"><ProjectNode /></div>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"><ReasoningNode label="DISCOVER" /></div>
      <div className="absolute right-3 top-1/2 -translate-y-1/2"><InformalSpecNode /></div>
    </VisualFrame>
  );
}

function EnactPreview() {
  return (
    <VisualFrame label="An agent transforms the informal specification into a formal specification">
      <Connector d="M91 135 C108 135 109 135 123 135 M177 135 C191 135 192 135 209 135" />
      <div className="absolute left-3 top-1/2 -translate-y-1/2"><InformalSpecNode /></div>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"><ReasoningNode label="ENACT" /></div>
      <div className="absolute right-3 top-1/2 -translate-y-1/2"><FormalSpecNode /></div>
    </VisualFrame>
  );
}

function ScanPreview() {
  return (
    <VisualFrame label="Formal program analysis searches the project using its formal security specification">
      <Connector d="M84 102 C107 102 108 126 123 132 M91 189 C110 189 109 146 123 139 M177 135 C197 135 198 135 216 135" />
      <div className="absolute left-3 top-8"><ProjectNode compact /></div>
      <div className="absolute bottom-5 left-3 scale-[0.82] origin-bottom-left"><FormalSpecNode /></div>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="workflow-engine-node">
          <span className="workflow-scan-ring absolute -inset-2 rounded-full border border-dashed border-primary/35" aria-hidden="true" />
          <img src="/favicon.svg" alt="" className="h-7 w-7" aria-hidden="true" />
          <span className="mt-1 font-mono text-[7px] font-semibold text-primary">SEARCH</span>
        </div>
      </div>
      <div className="absolute right-3 top-1/2 w-[5.5rem] -translate-y-1/2 overflow-hidden rounded-xl border border-border-strong bg-background shadow-sm">
        <div className="flex items-center gap-1.5 border-b border-border px-2.5 py-2">
          <ShieldAlert className="h-3.5 w-3.5 text-primary" strokeWidth={1.6} />
          <span className="workflow-diagram-label">FINDINGS</span>
        </div>
        <div className="space-y-2 px-2.5 py-3" aria-hidden="true">
          <span className="block h-5 rounded border border-primary/35 bg-primary/10" />
          <span className="block h-5 rounded border border-border-strong bg-code-bg" />
          <span className="block h-5 rounded border border-primary/35 bg-primary/10" />
        </div>
        <span className="sr-only">opentaint — scan</span>
      </div>
    </VisualFrame>
  );
}

function TriagePreview() {
  return (
    <VisualFrame label="An agent reviews scan results and refines the formal specification to reduce false alarms">
      <Connector d="M84 135 C104 135 105 135 122 135 M178 135 C196 135 197 135 215 135 M251 190 C251 230 62 230 62 189" />
      <div className="absolute left-3 top-1/2 w-[5.5rem] -translate-y-1/2 overflow-hidden rounded-xl border border-border-strong bg-background shadow-sm">
        <div className="border-b border-border px-2.5 py-2"><span className="workflow-diagram-label">SCAN RESULT</span></div>
        <div className="space-y-2 px-2.5 py-3">
          <div className="flex items-center gap-1.5 rounded-md border border-emerald-700/25 px-2 py-1.5"><Check className="h-3 w-3 shrink-0 text-emerald-700 dark:text-emerald-400" /><span className="font-mono text-[7px] font-semibold text-foreground">CONFIRMED</span></div>
          <div className="flex items-center gap-1.5 rounded-md border border-primary/25 px-2 py-1.5"><X className="h-3 w-3 shrink-0 text-primary" /><span className="font-mono text-[7px] font-semibold text-foreground">FALSE ALARM</span></div>
        </div>
        <span className="sr-only">2 candidate findings</span>
      </div>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"><ReasoningNode label="TRIAGE" /></div>
      <div className="absolute right-3 top-1/2 -translate-y-1/2"><FormalSpecNode refined /></div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-primary/25 bg-background px-3 py-1 font-mono text-[7px] font-semibold tracking-[0.08em] text-primary">RESCAN · FEWER FALSE ALARMS</div>
    </VisualFrame>
  );
}

const cards = [
  { number: "01", title: "Discover", description: "Model reasoning extracts an informal security specification from the project.", preview: <DiscoverPreview /> },
  { number: "02", title: "Enact", description: "Agents transform the informal specification into taint rules and dependency models.", preview: <EnactPreview /> },
  { number: "03", title: "Scan", description: "Formal program analysis searches the project using the formal specification.", preview: <ScanPreview /> },
  { number: "04", title: "Triage", description: "Agents review scan results and refine the specification to reduce false alarms.", preview: <TriagePreview /> },
] as const;

export function ContinuousSecurity() {
  return (
    <section className="band continuous-security-band" aria-labelledby="continuous-security-heading">
      <div className="relative z-10 mx-auto max-w-[96rem]">
        <div className="mx-auto max-w-[72rem] text-center">
          <p className="section-eyebrow">The flexibility of model reasoning and the consistency of formal program analysis combined</p>
          <h2 id="continuous-security-heading" className="section-heading">Turn one-off review into unlimited scans</h2>
        </div>

        <div className="section-content grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <article key={card.title} className="workflow-card flex min-h-[30rem] flex-col overflow-hidden rounded-[24px] border border-border-strong bg-background shadow-sm">
              <div className="relative h-[19rem] p-4">{card.preview}</div>
              <div className="flex flex-1 flex-col px-6 pb-8 pt-2">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">{card.number}</p>
                <h3 className="mt-3 font-mono text-2xl font-semibold tracking-[-0.04em] text-foreground">{card.title}</h3>
                <p className="mt-3 text-[13px] leading-6 text-muted-foreground">{card.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
