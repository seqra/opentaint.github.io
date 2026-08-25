import { Download, ScanSearch } from "lucide-react";

export function AnimatedHero() {
  return (
    <div className="hero-composition relative z-0 mx-auto flex w-full max-w-[82rem] flex-1 flex-col text-center">
      <div className="relative z-10">
        <img src="/opentaint-header-light.svg" alt="OpenTaint" className="hero-wordmark mx-0 h-auto w-56 dark:hidden sm:w-64 lg:mx-auto lg:w-72" />
        <img src="/opentaint-header-dark.svg" alt="" aria-hidden="true" className="hero-wordmark mx-0 hidden h-auto w-56 dark:block sm:w-64 lg:mx-auto lg:w-72" />

        <h1 className="hero-heading mx-0 mt-12 max-w-[25ch] text-left font-mono font-semibold text-foreground lg:mx-auto lg:text-center">
          Turn one <span className="text-primary">agent-led security review</span> into continuous vulnerability checks
        </h1>

        <p className="hero-subline mx-0 mt-8 max-w-[62ch] text-left font-mono text-muted-foreground lg:mx-auto lg:text-center">
          <span className="block text-foreground">OpenTaint is the open source taint analysis engine for the AI era.</span>
          <span className="mt-2 block">It turns one-off security findings into unlimited scans across the development lifecycle.</span>
        </p>

        <div className="mt-6 flex items-center justify-start gap-4 lg:justify-center">
          <a href="#install" className="cta-pill hero-cta">
            Install
            <Download aria-hidden="true" className="h-5 w-5" />
          </a>
          <a href="/blog/conductor-rce-cve-2026-58138/" className="cta-pill cta-pill-secondary hero-cta">
            See a real finding
            <ScanSearch aria-hidden="true" className="h-5 w-5" />
          </a>
        </div>
      </div>
    </div>
  );
}
