import { Download, Star } from "lucide-react";

export function AnimatedHero() {
  return (
    <div className="mx-auto max-w-[90rem] text-center">
      <h1 className="mx-auto font-mono text-[28px] font-bold leading-[1.15] tracking-tight text-foreground sm:text-[32px] md:text-[36px] lg:whitespace-nowrap lg:text-[38px] xl:text-[40px]">
        The open source taint analysis engine for the AI era
      </h1>

      <div className="mx-auto mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a
          href="https://github.com/seqra/opentaint#quick-start"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 w-fit items-center justify-center gap-2 rounded-lg bg-primary px-3 text-[15px] font-semibold leading-none text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Download className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
          Try OpenTaint
        </a>
        <a
          href="https://github.com/seqra/opentaint"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 w-fit items-center justify-center gap-2 rounded-lg border border-border-strong bg-background px-3 text-[15px] font-semibold leading-none text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <Star className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
          Star on GitHub
        </a>
      </div>
    </div>
  );
}
