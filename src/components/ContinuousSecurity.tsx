import type { ReactNode } from "react";

function VisualFrame({ children, label, className = "" }: { children: ReactNode; label: string; className?: string }) {
  return (
    <div className={`workflow-visual relative h-full overflow-hidden rounded-[18px] border border-border bg-code-bg ${className}`} role="img" aria-label={label}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,hsl(var(--brand)/0.07),transparent_52%)]" aria-hidden="true" />
      {children}
    </div>
  );
}

function ArtifactNode({ children, extension, title, className = "" }: { children: ReactNode; extension: string; title: string; className?: string }) {
  return (
    <div className={`workflow-diagram-node ${className}`}>
      <div className="workflow-artifact-header">
        <span className="workflow-file-mark" aria-hidden="true">{extension}</span>
        <span className="workflow-diagram-label">{title}</span>
      </div>
      {children}
    </div>
  );
}

function ProjectNode() {
  return (
    <ArtifactNode title="PROJECT" extension="src">
      <div className="workflow-code-lines" aria-hidden="true">
        <i className="w-10" /><i className="ml-2 w-12" /><i className="ml-4 w-8 bg-primary" /><i className="ml-2 w-11" /><i className="w-9" />
      </div>
    </ArtifactNode>
  );
}

function OperationNode({ label }: { label: string }) {
  return (
    <div className="workflow-operation-node">
      <span className="workflow-operation-label">{label}</span>
      <span className="workflow-operation-arrow" aria-hidden="true"><i /></span>
    </div>
  );
}

function InformalSpecNode() {
  return (
    <ArtifactNode title="INFORMAL SPEC" extension="md">
      <div className="workflow-spec-lines" aria-hidden="true">
        <em>TRUST</em><span><i className="w-10" /><i className="w-12" /></span>
        <em>PATTERN</em><span><i className="w-12" /><i className="w-8" /></span>
      </div>
    </ArtifactNode>
  );
}

function FormalSpecNode({ refined = false }: { refined?: boolean }) {
  return (
    <ArtifactNode title={refined ? "TUNED FORMAL SPEC" : "FORMAL SPEC"} extension="yml" className="border-primary/35">
      <div className="workflow-formal-spec" aria-hidden="true">
        <em>RULE</em><span className="bg-primary" />
        <em>MODEL</em><span className={refined ? "border border-emerald-700/30 bg-emerald-700/[0.09]" : "border border-primary/30 bg-primary/[0.08]"} />
      </div>
    </ArtifactNode>
  );
}

function ScanInputNode() {
  return (
    <ArtifactNode title="PROJECT + SPEC" extension="src">
      <div className="grid min-h-[5.5rem] grid-cols-[1fr_auto] items-center gap-2 px-3 py-3" aria-hidden="true">
        <div className="space-y-1.5">
          <span className="block h-1 w-12 rounded-full bg-border-strong" />
          <span className="block h-1 w-10 rounded-full bg-border-strong" />
          <span className="block h-1 w-14 rounded-full bg-primary" />
          <span className="block h-1 w-9 rounded-full bg-border-strong" />
        </div>
        <div className="flex flex-col justify-center gap-1.5">
          <span className="h-2.5 w-4 rounded-sm bg-primary" />
          <span className="h-2.5 w-4 rounded-sm border border-primary/30 bg-primary/[0.08]" />
        </div>
      </div>
    </ArtifactNode>
  );
}

function DataflowTraceNode({ triaged = false }: { triaged?: boolean }) {
  return (
    <ArtifactNode title="DATAFLOW TRACES" extension="json">
      {triaged ? (
        <div className="workflow-triage-lines" aria-hidden="true">
          <span><i className="bg-emerald-700 dark:bg-emerald-400" /><b className="w-9" /></span>
          <span><i className="bg-primary" /><b className="w-6" /></span>
        </div>
      ) : (
        <div className="workflow-dataflow-trace" aria-hidden="true">
          {Array.from({ length: 6 }, (_, index) => <i key={index} />)}
        </div>
      )}
    </ArtifactNode>
  );
}

function DiscoverPreview() {
  return (
    <VisualFrame label="Model reasoning extracts an informal security specification from a project">
      <div className="workflow-stage-rail"><ProjectNode /><OperationNode label="MODEL" /><InformalSpecNode /></div>
    </VisualFrame>
  );
}

function EnactPreview() {
  return (
    <VisualFrame label="An agent transforms the informal specification into a formal specification">
      <div className="workflow-stage-rail"><InformalSpecNode /><OperationNode label="AGENT" /><FormalSpecNode /></div>
    </VisualFrame>
  );
}

function ScanPreview() {
  return (
    <VisualFrame label="Formal program analysis searches the project using its formal security specification">
      <div className="workflow-stage-rail"><ScanInputNode /><OperationNode label="ENGINE" /><DataflowTraceNode /></div>
    </VisualFrame>
  );
}

function TriagePreview() {
  return (
    <VisualFrame label="An agent reviews scan results and refines the formal specification to reduce false alarms">
      <div className="workflow-stage-rail"><DataflowTraceNode triaged /><OperationNode label="AGENT" /><FormalSpecNode refined /></div>
    </VisualFrame>
  );
}

const cards = [
  { number: "01", title: "Discover", description: "Extract trust boundaries and vulnerability patterns.", preview: <DiscoverPreview /> },
  { number: "02", title: "Enact", description: "Turn what the review learned into formal specifications.", preview: <EnactPreview /> },
  { number: "03", title: "Scan", description: "Search the whole project with formal program analysis.", preview: <ScanPreview /> },
  { number: "04", title: "Triage", description: "Confirm findings and tune away false alarms.", preview: <TriagePreview /> },
] as const;

function BalanceVisual() {
  return (
    <div className="value-visual relative min-h-[18rem] overflow-hidden rounded-[18px] border border-border bg-code-bg" role="img" aria-label="OpenTaint balances scan speed, finding coverage, and precision">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 520 290" aria-hidden="true">
        <path d="M260 42 L86 238 L434 238 Z" fill="none" stroke="hsl(var(--border-strong))" strokeWidth="1" />
        <path d="M260 78 L133 215 L387 215 Z" fill="none" stroke="hsl(var(--border))" strokeWidth="1" />
        <path d="M260 114 L180 192 L340 192 Z" fill="none" stroke="hsl(var(--border))" strokeWidth="1" />
        <path d="M260 162 L260 42 M260 162 L86 238 M260 162 L434 238" fill="none" stroke="hsl(var(--border))" strokeWidth="1" />
        <path className="balance-shape" d="M260 59 L111 224 L409 224 Z" fill="hsl(var(--brand) / 0.075)" stroke="hsl(var(--brand))" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="260" cy="59" r="4" fill="hsl(var(--background))" stroke="hsl(var(--brand))" strokeWidth="2" />
        <circle cx="111" cy="224" r="4" fill="hsl(var(--background))" stroke="hsl(var(--brand))" strokeWidth="2" />
        <circle cx="409" cy="224" r="4" fill="hsl(var(--background))" stroke="hsl(var(--brand))" strokeWidth="2" />
      </svg>
      <div className="absolute left-1/2 top-5 -translate-x-1/2 rounded-md border border-border-strong bg-background px-3 py-2 text-center"><span className="block font-mono text-[10px] font-semibold text-primary">FAST</span><span className="mt-1 block font-mono text-[7px] font-semibold uppercase tracking-[0.1em] text-foreground">SCAN SPEED</span></div>
      <div className="absolute bottom-5 left-5 rounded-md border border-border-strong bg-background px-3 py-2 text-center"><span className="block font-mono text-[10px] font-semibold text-primary">MINIMAL</span><span className="mt-1 block font-mono text-[7px] font-semibold uppercase tracking-[0.1em] text-foreground">MISSED FINDINGS</span></div>
      <div className="absolute bottom-5 right-5 rounded-md border border-border-strong bg-background px-3 py-2 text-center"><span className="block font-mono text-[10px] font-semibold text-primary">MINIMAL</span><span className="mt-1 block font-mono text-[7px] font-semibold uppercase tracking-[0.1em] text-foreground">FALSE ALARMS</span></div>
      <div className="absolute left-1/2 top-[10rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/45 bg-background px-4 py-3 text-center shadow-[0_0_0_8px_hsl(var(--brand)/0.05)]"><span className="font-mono text-[8px] font-semibold uppercase tracking-[0.1em] text-primary">SOTA</span><span className="mt-1 block font-mono text-[6px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">STATIC ANALYSIS</span></div>
    </div>
  );
}

type BundleKind = "engine" | "rules" | "models" | "skills" | "cli" | "viewer";

function BundleMark({ kind }: { kind: BundleKind }) {
  if (kind === "engine") return <div className="bundle-graph"><i /><i /><i /><i /></div>;
  if (kind === "rules") return <div className="bundle-code"><i className="w-7 bg-primary" /><i className="ml-2 w-5" /><i className="ml-2 w-8" /></div>;
  if (kind === "models") return <div className="bundle-model"><span>f()</span><b>→</b><span>g()</span></div>;
  if (kind === "skills") return <div className="bundle-code"><i className="w-8 bg-primary" /><i className="w-6" /><i className="w-9" /></div>;
  if (kind === "cli") return <div className="font-mono text-[9px] font-semibold text-primary"><span className="text-muted-foreground">$</span> opentaint scan<span className="bundle-caret">_</span></div>;
  return <div className="bundle-trace"><i /><i /><i /><i /><i /></div>;
}

const bundleItems = [
  { label: "ENGINE", kind: "engine" },
  { label: "RULES", kind: "rules" },
  { label: "MODELS", kind: "models" },
  { label: "AGENT SKILLS", kind: "skills" },
  { label: "CLI", kind: "cli" },
  { label: "VIEWER + CI", kind: "viewer" },
] as const satisfies readonly { label: string; kind: BundleKind }[];

function BundleVisual() {
  return (
    <div className="value-visual relative min-h-[18rem] overflow-hidden rounded-[18px] border border-border bg-code-bg p-6" role="img" aria-label="The open-source OpenTaint bundle includes the engine, rules, dependency models, agent skills, CLI, report viewer, and CI integration">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--brand)/0.08),transparent_58%)]" aria-hidden="true" />
      <div className="relative grid h-full min-h-[15rem] grid-cols-3 gap-3">
        {bundleItems.map(({ label, kind }, index) => (
          <div key={label} className={`bundle-tile flex flex-col items-center justify-center rounded-xl border bg-background text-center ${index === 0 ? "border-primary/50" : "border-border-strong"}`}>
            <BundleMark kind={kind} />
            <span className="mt-3 font-mono text-[8px] font-semibold uppercase tracking-[0.09em] text-foreground">{label}</span>
          </div>
        ))}
        <div className="pointer-events-none absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-primary/45 bg-background shadow-[0_0_0_10px_hsl(var(--brand)/0.05)]">
          <span className="font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-primary">OPEN</span>
          <span className="font-mono text-[7px] font-semibold uppercase tracking-[0.08em] text-foreground">SOURCE</span>
        </div>
      </div>
    </div>
  );
}

export function ContinuousSecurity() {
  return (
    <section className="band continuous-security-band" aria-labelledby="continuous-security-heading">
      <div className="relative z-10 mx-auto max-w-[96rem]">
        <div className="workflow-card-grid grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <article key={card.title} className="workflow-card flex min-h-[25rem] flex-col overflow-hidden rounded-[24px] border border-border-strong bg-background shadow-sm">
              <div className="relative h-[16rem] p-4">{card.preview}</div>
              <div className="flex flex-1 flex-col px-6 pb-6 pt-2">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">{card.number}</p>
                <h3 className="mt-2 font-mono text-2xl font-semibold tracking-[-0.04em] text-foreground">{card.title}</h3>
                <p className="mt-3 text-[12px] leading-5 text-muted-foreground">{card.description}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-[72rem] text-center">
          <p className="section-eyebrow">The flexibility of model reasoning and the consistency of formal program analysis combined</p>
          <h2 id="continuous-security-heading" className="section-heading">Turn one-off review into unlimited scans</h2>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <article className="value-card overflow-hidden rounded-[24px] border border-border-strong bg-background p-4 shadow-sm sm:p-6">
            <BalanceVisual />
            <div className="px-2 pb-2 pt-6">
              <h3 className="font-mono text-xl font-semibold leading-8 tracking-[-0.03em] text-foreground">Practical balance through state-of-the-art static analysis</h3>
              <p className="mt-3 max-w-[50ch] text-[12px] leading-5 text-muted-foreground">Minimize missed findings and false alarms without making whole-project analysis impractical.</p>
            </div>
          </article>
          <article className="value-card overflow-hidden rounded-[24px] border border-border-strong bg-background p-4 shadow-sm sm:p-6">
            <BundleVisual />
            <div className="px-2 pb-2 pt-6">
              <h3 className="font-mono text-xl font-semibold leading-8 tracking-[-0.03em] text-foreground">Open source, batteries included</h3>
              <p className="mt-3 max-w-[50ch] text-[12px] leading-5 text-muted-foreground">One open-source stack from agent review to CI.</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
