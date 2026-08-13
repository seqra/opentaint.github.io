import type { ReactNode } from "react";

function VisualFrame({ children, label, className = "" }: { children: ReactNode; label: string; className?: string }) {
  return (
    <div className={`workflow-visual relative h-full overflow-hidden rounded-[18px] border border-border bg-code-bg ${className}`} role="img" aria-label={label}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,hsl(var(--brand)/0.07),transparent_52%)]" aria-hidden="true" />
      {children}
    </div>
  );
}

function ArtifactNode({ children, extension, title, className = "" }: { children: ReactNode; extension: string | readonly string[]; title: string; className?: string }) {
  const extensions = typeof extension === "string" ? [extension] : extension;
  return (
    <div className={`workflow-diagram-node ${className}`}>
      <div className="workflow-artifact-header">
        <span className="workflow-file-marks" aria-hidden="true">
          {extensions.map((item) => <i className="workflow-file-mark" key={item}>{item}</i>)}
        </span>
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
        <em>TRUST BOUNDARY</em><span><i className="w-10" /><i className="w-12" /></span>
        <em>VULNERABILITY PATTERN</em><span><i className="w-12" /><i className="w-8" /></span>
      </div>
    </ArtifactNode>
  );
}

function FormalSpecNode({ refined = false }: { refined?: boolean }) {
  return (
    <ArtifactNode title={refined ? "TUNED FORMAL SPEC" : "FORMAL SPEC"} extension="yml" className="border-primary/35">
      <div className="workflow-formal-spec" aria-hidden="true">
        <em>TAINT RULE</em><span className={refined ? "border border-emerald-700 bg-emerald-700 dark:border-emerald-400 dark:bg-emerald-400" : "bg-primary"} />
        <em>DEPENDENCY MODEL</em><span className={refined ? "border border-emerald-700/30 bg-emerald-700/[0.09]" : "border border-primary/30 bg-primary/[0.08]"} />
      </div>
    </ArtifactNode>
  );
}

function ScanInputNode() {
  return (
    <ArtifactNode title="PROJECT AND SPEC" extension={["src", "yml"]}>
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
          <em>CONFIRMED</em><span><i className="bg-emerald-700 dark:bg-emerald-400" /><b className="w-9" /></span>
          <em>FALSE ALARM</em><span><i className="bg-primary" /><b className="w-6" /></span>
        </div>
      ) : (
        <div className="workflow-dataflow-trace" aria-hidden="true">
          <svg viewBox="0 0 96 72" preserveAspectRatio="xMidYMid meet">
            <path className="trace-muted-edge" d="M13 20 C25 20 24 11 37 11 M13 20 C25 20 25 36 37 36 M45 11 C58 11 57 23 68 23 M45 36 C57 36 57 23 68 23 M45 36 C58 36 57 55 69 55 M76 23 C84 23 84 36 89 36" />
            <path className="trace-active-edge" d="M13 20 C25 20 25 36 37 36 M45 36 C57 36 57 23 68 23 M76 23 C84 23 84 36 89 36" />
            <circle className="trace-source" cx="9" cy="20" r="4" />
            <rect className="trace-muted-node" x="37" y="7" width="8" height="8" rx="2" />
            <rect className="trace-active-node" x="37" y="32" width="8" height="8" rx="2" />
            <rect className="trace-active-node" x="68" y="19" width="8" height="8" rx="2" />
            <rect className="trace-muted-node" x="69" y="51" width="8" height="8" rx="2" />
            <path className="trace-sink" d="m89 31 5 5-5 5-5-5z" />
          </svg>
          <span className="trace-source-label">SOURCE</span>
          <span className="trace-call-label">CALL</span>
          <span className="trace-return-label">RETURN</span>
          <span className="trace-sink-label">SINK</span>
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
  { title: "Discover", description: "Learn trust boundaries and vulnerability patterns as an informal specification.", preview: <DiscoverPreview /> },
  { title: "Enact", description: "Enact the informal specification as taint rules and dependency models.", preview: <EnactPreview /> },
  { title: "Scan", description: "Search the whole project with formal program analysis.", preview: <ScanPreview /> },
  { title: "Triage", description: "Confirm findings and tune away false alarms.", preview: <TriagePreview /> },
] as const;

function BalanceVisual() {
  return (
    <div className="value-visual relative min-h-[20rem] overflow-hidden rounded-[18px] border border-border bg-code-bg" role="img" aria-label="OpenTaint balances scan speed, finding coverage, and precision">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 520 290" aria-hidden="true">
        <path d="M260 42 L86 238 L434 238 Z" fill="none" stroke="hsl(var(--border-strong))" strokeWidth="1" />
        <path d="M260 78 L133 215 L387 215 Z" fill="none" stroke="hsl(var(--border))" strokeWidth="1" />
        <path d="M260 114 L180 192 L340 192 Z" fill="none" stroke="hsl(var(--border))" strokeWidth="1" />
        <path d="M260 162 L260 42 M260 162 L86 238 M260 162 L434 238" fill="none" stroke="hsl(var(--border))" strokeWidth="1" />
        <path className="balance-shape" d="M260 59 L111 224 L409 224 Z" fill="hsl(var(--brand) / 0.075)" stroke="hsl(var(--brand))" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="260" cy="59" r="4" fill="hsl(var(--background))" stroke="hsl(var(--brand))" strokeWidth="2" />
        <circle cx="111" cy="224" r="4" fill="hsl(var(--background))" stroke="hsl(var(--brand))" strokeWidth="2" />
        <circle cx="409" cy="224" r="4" fill="hsl(var(--background))" stroke="hsl(var(--brand))" strokeWidth="2" />
        <foreignObject x="176" y="122" width="168" height="80">
          <div className="flex h-full w-full items-center justify-center">
            <div className="rounded-full border border-primary/45 bg-background px-4 py-3 text-center shadow-[0_0_0_8px_hsl(var(--brand)/0.05)]">
              <span className="font-mono text-[8px] font-semibold uppercase tracking-[0.1em] text-primary">SOTA</span>
              <span className="mt-1 block whitespace-nowrap font-mono text-[6px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">STATIC ANALYSIS</span>
            </div>
          </div>
        </foreignObject>
      </svg>
      <div className="balance-axis balance-time absolute left-1/2 top-5 -translate-x-1/2 rounded-md border border-border-strong bg-background px-3 py-2 text-center"><span className="block font-mono text-[9px] font-semibold text-primary">SCAN TIME</span><span className="mt-1 block font-mono text-[7px] font-semibold uppercase tracking-[0.1em] text-foreground">MINIMAL</span></div>
      <div className="balance-axis balance-missed absolute bottom-5 left-5 rounded-md border border-border-strong bg-background px-3 py-2 text-center"><span className="block font-mono text-[9px] font-semibold text-primary">MISSED FINDINGS</span><span className="mt-1 block font-mono text-[7px] font-semibold uppercase tracking-[0.1em] text-foreground">MINIMAL</span></div>
      <div className="balance-axis balance-false absolute bottom-5 right-5 rounded-md border border-border-strong bg-background px-3 py-2 text-center"><span className="block font-mono text-[9px] font-semibold text-primary">FALSE ALARMS</span><span className="mt-1 block font-mono text-[7px] font-semibold uppercase tracking-[0.1em] text-foreground">MINIMAL</span></div>
    </div>
  );
}

function BundleVisual() {
  return (
    <div className="bundle-system value-visual relative min-h-[20rem] overflow-hidden rounded-[18px] border border-border bg-code-bg" role="img" aria-label="The open-source OpenTaint bundle connects agent skills, taint rules, dependency models, the scan engine, report viewer, and CI integration">
      <div className="bundle-window-bar" aria-hidden="true">
        <span className="bundle-window-dots"><i /><i /><i /></span>
        <span className="bundle-window-title">opentaint / security stack</span>
        <span className="bundle-open-badge">OPEN SOURCE</span>
      </div>

      <div className="bundle-system-body" aria-hidden="true">
        <section className="bundle-system-column">
          <p className="bundle-system-kicker">SECURITY KNOWLEDGE</p>
          <div className="bundle-file bundle-file-skill">
            <span className="bundle-file-ext">md</span>
            <span><b>appsec-agent</b><small>discover + enact</small></span>
          </div>
          <div className="bundle-file">
            <span className="bundle-file-ext">yml</span>
            <span><b>taint rules</b><small>sources + sinks</small></span>
          </div>
          <div className="bundle-file">
            <span className="bundle-file-ext">yml</span>
            <span><b>dependency models</b><small>opaque methods</small></span>
          </div>
        </section>

        <span className="bundle-system-arrow"><i /></span>

        <section className="bundle-system-column bundle-engine-panel">
          <p className="bundle-system-kicker">FORMAL ANALYSIS</p>
          <div className="bundle-terminal-line"><b>$</b> opentaint scan<span className="bundle-caret">_</span></div>
          <div className="bundle-engine-flow">
            <span><i>01</i><b>Parse project</b><em>DONE</em></span>
            <span><i>02</i><b>Load rules</b><em>DONE</em></span>
            <span><i>03</i><b>Start scan</b><em>DONE</em></span>
          </div>
          <div className="bundle-engine-meter"><i /></div>
          <p className="bundle-engine-result"><b>3</b> complete traces</p>
        </section>

        <span className="bundle-system-arrow"><i /></span>

        <section className="bundle-system-column">
          <p className="bundle-system-kicker">RESULTS</p>
          <div className="bundle-result-card bundle-report-card">
            <span className="bundle-result-icon">{`{ }`}</span>
            <span><b>Report viewer</b><small>report.sarif trace</small></span>
          </div>
          <div className="bundle-trace-line"><i /><i /><i /><i /><i /></div>
          <div className="bundle-result-card bundle-ci-card">
            <span className="bundle-check">✓</span>
            <span><b>Security scan</b><small>CI check passed</small></span>
          </div>
        </section>
      </div>
    </div>
  );
}

export function ContinuousSecurity() {
  return (
    <section className="band continuous-security-band" aria-labelledby="continuous-security-heading">
      <div className="relative z-10 mx-auto max-w-[96rem]">
        <div className="workflow-card-grid mobile-card-rail grid gap-4 md:grid-cols-2 xl:grid-cols-4" role="region" aria-label="OpenTaint workflow" tabIndex={0}>
          {cards.map((card) => (
            <article key={card.title} className="workflow-card mobile-card-rail-item flex min-h-[25rem] flex-col overflow-hidden rounded-[24px] border border-border-strong bg-background shadow-sm">
              <div className="relative h-[16rem] p-4">{card.preview}</div>
              <div className="flex flex-1 flex-col px-6 pb-6 pt-2">
                <h3 className="font-mono text-2xl font-semibold tracking-[-0.04em] text-foreground">{card.title}</h3>
                <p className="mt-3 break-words text-[11px] leading-5 text-muted-foreground">{card.description}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-[72rem] text-center sm:mt-16">
          <h2 id="continuous-security-heading" className="section-heading">Turn one-off review into unlimited scans</h2>
          <p className="section-banner continuous-security-subline mx-auto mt-6 max-w-[68ch]">The flexibility of model reasoning and the consistency of formal program analysis combined</p>
        </div>

        <div className="value-card-grid mobile-card-rail mt-10 grid gap-6 sm:mt-12 lg:grid-cols-2" role="region" aria-label="OpenTaint product advantages" tabIndex={0}>
          <article className="value-card mobile-card-rail-item overflow-hidden rounded-[24px] border border-border-strong bg-background p-4 shadow-sm sm:p-6">
            <BalanceVisual />
            <div className="px-2 pb-2 pt-6">
              <h3 className="font-mono text-xl font-semibold leading-8 tracking-[-0.03em] text-foreground">Practical balance through SOTA static analysis</h3>
              <p className="mt-3 w-full text-[12px] leading-5 text-muted-foreground">Minimize missed findings and false alarms without making whole-project analysis impractical.</p>
            </div>
          </article>
          <article className="value-card mobile-card-rail-item overflow-hidden rounded-[24px] border border-border-strong bg-background p-4 shadow-sm sm:p-6">
            <BundleVisual />
            <div className="px-2 pb-2 pt-6">
              <h3 className="font-mono text-xl font-semibold leading-8 tracking-[-0.03em] text-foreground">Open source, batteries included</h3>
              <p className="mt-3 w-full text-[12px] leading-5 text-muted-foreground">Engine, rules, models, agent skills, CLI, viewer, and CI integrations — all open source and built to work together.</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
