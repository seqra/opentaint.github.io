const heroPrefixes = ["Continuous", "Lean", "Agentic"];

export function AnimatedHero() {
  return (
    <div className="relative mx-auto max-w-[82rem] text-center">
      <img src="/favicon.svg" alt="" className="mx-auto h-16 w-16 sm:h-20 sm:w-20" aria-hidden="true" />

      <h1 className="mx-auto mt-6 max-w-full font-mono text-[36px] font-semibold leading-[1.06] tracking-[-0.045em] text-foreground sm:text-[42px] md:text-[46px] lg:text-[48px] 2xl:text-[54px]">
        <span className="sr-only">Continuous, lean, and agentic application security testing</span>
        <span aria-hidden="true" className="xl:flex xl:items-start xl:justify-center xl:gap-3">
          <span className="hero-prefix-slot relative block h-[1.06em] xl:w-[10ch] xl:shrink-0">
            {heroPrefixes.map((prefix) => (
              <span key={prefix} className="hero-prefix-word absolute inset-x-0 top-0 text-center text-primary xl:text-right">
                {prefix}
              </span>
            ))}
          </span>
          <span className="block xl:shrink-0 xl:whitespace-nowrap xl:text-left">Application Security Testing</span>
        </span>
      </h1>

      <p className="section-banner mx-auto mt-6">The open source taint analysis engine for the AI era</p>
    </div>
  );
}
