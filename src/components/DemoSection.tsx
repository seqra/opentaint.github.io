import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type TouchEvent } from "react";
import { TerminalDemo } from "./TerminalDemo";
import { MediaDemo } from "./MediaDemo";
import { VideoDemo } from "./VideoDemo";
import { DEMO_SLIDES, type DemoSlideId } from "./demo-slides";

const SWIPE_THRESHOLD_PX = 48;
const AUTO_ADVANCE_MS = 7000;
const MOBILE_DEMO_QUERY = "(max-width: 767px), (hover: none) and (pointer: coarse)";

export function DemoSection() {
  const [activeId, setActiveId] = useState<DemoSlideId>(DEMO_SLIDES[0].id);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [mobileDemo, setMobileDemo] = useState(false);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const touchStartX = useRef<number | null>(null);
  const hoverPauseRef = useRef(false);

  const visibleSlides = useMemo(
    () => mobileDemo ? DEMO_SLIDES.filter((slide) => slide.id !== "terminal") : DEMO_SLIDES,
    [mobileDemo],
  );
  const effectiveActiveId = visibleSlides.some((slide) => slide.id === activeId)
    ? activeId
    : visibleSlides[0].id;
  const activeIndex = visibleSlides.findIndex((slide) => slide.id === effectiveActiveId);

  useEffect(() => {
    const query = window.matchMedia(MOBILE_DEMO_QUERY);
    const sync = () => setMobileDemo(query.matches);
    sync();
    query.addEventListener?.("change", sync);
    return () => query.removeEventListener?.("change", sync);
  }, []);

  useEffect(() => {
    if (activeId !== effectiveActiveId) setActiveId(effectiveActiveId);
  }, [activeId, effectiveActiveId]);

  const goTo = (id: DemoSlideId) => {
    const nextIndex = visibleSlides.findIndex((slide) => slide.id === id);
    if (nextIndex < 0) return;
    if (nextIndex === activeIndex) return;
    setDirection(nextIndex > activeIndex ? 1 : -1);
    setActiveId(id);
  };

  const step = (dir: 1 | -1) => {
    const next = visibleSlides[(activeIndex + dir + visibleSlides.length) % visibleSlides.length];
    setDirection(dir);
    setActiveId(next.id);
  };

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    setAutoAdvance(false);
    const dir = event.key === "ArrowRight" ? 1 : -1;
    const next = visibleSlides[(activeIndex + dir + visibleSlides.length) % visibleSlides.length];
    step(dir);
    tabRefs.current[next.id]?.focus();
  };

  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const delta = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;
    setAutoAdvance(false);
    step(delta < 0 ? 1 : -1);
  };

  useEffect(() => {
    if (!autoAdvance) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      if (hoverPauseRef.current) return;
      const index = visibleSlides.findIndex((slide) => slide.id === effectiveActiveId);
      const next = visibleSlides[(index + 1) % visibleSlides.length];
      setDirection(1);
      setActiveId(next.id);
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [autoAdvance, effectiveActiveId, visibleSlides]);

  return (
    <div className="mx-auto max-w-[68rem]">
      <div
        className="relative"
        data-testid="demo-stage"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseEnter={() => { hoverPauseRef.current = true; }}
        onMouseLeave={() => { hoverPauseRef.current = false; }}
      >
        {visibleSlides.map((slide) => (
          // Box 1 — the stage. Same colour as the page so it is invisible. Its
          // aspect is the agent recording's own (3024x1898), so that demo fits
          // exactly and the other two are fitted to it; every tab reserves the
          // same space and the tab row never shifts.
          <div
            key={slide.id}
            role="tabpanel"
            id={`demo-panel-${slide.id}`}
            aria-labelledby={`demo-tab-${slide.id}`}
            hidden={slide.id !== effectiveActiveId}
            className={[
              "relative aspect-[1512/949] w-full bg-background",
              slide.id === "terminal" ? "demo-desktop-only" : "",
            ].join(" ")}
          >
            {slide.id === effectiveActiveId && (
              <div
                className={[
                  "absolute inset-0 flex items-center justify-center",
                  direction === 1 ? "demo-slide-in-next" : "demo-slide-in-prev",
                ].join(" ")}
              >
                {/* Box 2 — the frame. It fills the stage exactly, so every tab
                    is the same size and the tab row never shifts; each demo
                    covers it rather than setting its own height. */}
                <div
                  className={[
                    "absolute inset-0 flex overflow-hidden rounded-xl border border-panel-border",
                    slide.pageBackground
                      ? "bg-background"
                      : "bg-[#feffff] dark:bg-[#1b0100]",
                  ].join(" ")}
                >
                  {slide.kind === "terminal" ? (
                    <TerminalDemo />
                  ) : slide.kind === "video" ? (
                    <VideoDemo
                      sources={slide.sources!}
                      poster={slide.fallback!}
                      alt={slide.alt!}
                      testId={slide.testId!}
                      href={slide.href}
                    />
                  ) : (
                    <MediaDemo
                      sources={slide.sources!}
                      fallback={slide.fallback!}
                      alt={slide.alt!}
                      testId={slide.testId!}
                      href={slide.href}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

      </div>

      <div
        role="tablist"
        aria-label="Demo selector"
        className="mt-6 flex items-center justify-center gap-4 sm:mt-8 sm:gap-8"
      >
        {visibleSlides.map((slide) => {
          const isActive = slide.id === effectiveActiveId;
          return (
            <button
              key={slide.id}
              ref={(el) => {
                tabRefs.current[slide.id] = el;
              }}
              type="button"
              role="tab"
              id={`demo-tab-${slide.id}`}
              aria-selected={isActive}
              aria-controls={`demo-panel-${slide.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => { setAutoAdvance(false); goTo(slide.id); }}
              onKeyDown={onTabKeyDown}
              className={[
                "group flex min-h-[44px] items-center px-1 font-mono text-xs font-medium uppercase tracking-[0.16em] transition-colors sm:min-h-0 lg:text-[13px]",
                slide.id === "terminal" ? "demo-desktop-only" : "",
                isActive ? "text-primary" : "text-muted-foreground hover:text-primary",
              ].join(" ")}
            >
              <span
                className={[
                  "border-b-2 pb-1",
                  isActive ? "border-primary" : "border-transparent",
                ].join(" ")}
              >
                {slide.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
