export function AnimatedHero() {
  return (
    <div className="mx-auto max-w-6xl text-center">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">Agent reasoning + formal taint analysis</p>
      <h1 className="mx-auto mt-6 max-w-5xl font-mono text-[32px] font-bold leading-[1.15] tracking-tight text-foreground sm:text-[40px] md:text-[48px] lg:text-[56px]">
        Turn one security review into unlimited security scans
      </h1>

      <p className="mx-auto mt-6 max-w-3xl font-mono text-sm leading-7 text-muted-foreground sm:text-base">
        The flexibility of agent reasoning and the consistency of formal analysis combined
      </p>

      <div className="mx-auto mt-8 flex max-w-xl flex-col justify-center gap-3 sm:flex-row">
        <a
          href="https://github.com/seqra/opentaint#quick-start"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg bg-primary px-6 font-mono text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Try OpenTaint
        </a>
        <a
          href="https://github.com/seqra/opentaint"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg border border-border-strong bg-background px-6 font-mono text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          Star on GitHub
        </a>
      </div>
    </div>
  );
}
