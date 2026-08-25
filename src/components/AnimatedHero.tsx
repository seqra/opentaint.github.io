import { Download, ScanSearch } from "lucide-react";

const heroPrefixes = ["Continuous", "Lean", "Agentic"];

export function AnimatedHero() {
  return (
    <div className="hero-composition relative z-0 mx-auto flex w-full max-w-[82rem] flex-1 flex-col text-center">
      <div className="relative z-10">
        <img src="/opentaint-header-light.svg" alt="OpenTaint" className="hero-wordmark mx-0 h-auto w-56 dark:hidden sm:w-64 lg:mx-auto lg:w-72" />
        <img src="/opentaint-header-dark.svg" alt="" aria-hidden="true" className="hero-wordmark mx-0 hidden h-auto w-56 dark:block sm:w-64 lg:mx-auto lg:w-72" />

        <h1 className="hero-heading mx-0 mt-12 max-w-full text-left font-mono font-semibold text-foreground lg:mx-auto lg:text-center">
          <span className="sr-only">Continuous, lean, and agentic application security testing</span>
          <span aria-hidden="true" className="hero-title-lockup">
            <span className="hero-prefix-slot relative block h-[1em] w-[10ch] shrink-0">
              {heroPrefixes.map((prefix) => (
                <span key={prefix} className="hero-prefix-word absolute inset-0 text-left text-primary lg:text-right">
                  {prefix}
                </span>
              ))}
            </span>
            <span className="hero-title-column">
              <span>Application</span>
              <span>Security</span>
              <span>Testing</span>
            </span>
          </span>
        </h1>

        <p className="hero-subline hero-promise mx-0 mt-8 font-mono lg:mx-auto">
          Turn frontier model reasoning into reliable <span className="whitespace-nowrap">static-analysis</span> checks that detect vulnerabilities at low cost
        </p>
        <p className="section-banner mx-0 mt-5 max-w-[92ch] text-left lg:mx-auto lg:text-center">
          The open source taint analysis engine for the AI era
        </p>

        <div className="mt-6 flex items-center justify-start gap-4 lg:justify-center">
          <a href="#install" className="cta-pill hero-cta">
            Install
            <Download aria-hidden="true" className="h-5 w-5" />
          </a>
          <a href="/blog/conductor-rce-cve-2026-58138/" className="cta-pill cta-pill-secondary hero-cta">
            See CVE
            <ScanSearch aria-hidden="true" className="h-5 w-5" />
          </a>
        </div>
      </div>
    </div>
  );
}
