import { useEffect, useRef, useState, type KeyboardEvent, type TouchEvent } from "react";
import { TerminalDemo } from "./TerminalDemo";
import { MediaDemo } from "./MediaDemo";
import { VideoDemo } from "./VideoDemo";
import { DEMO_SLIDES, type DemoSlideId } from "./demo-slides";

const SWIPE_THRESHOLD_PX = 48;
const AUTO_ADVANCE_MS = 7000;

export function DemoSection() {
  const [activeId, setActiveId] = useState<DemoSlideId>(DEMO_SLIDES[0].id);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const touchStartX = useRef<number | null>(null);
  const hoverPauseRef = useRef(false);

  const activeIndex = DEMO_SLIDES.findIndex((s) => s.id === activeId);

  const goTo = (id: DemoSlideId) => {
    const nextIndex = DEMO_SLIDES.findIndex((s) => s.id === id);
    if (nextIndex === activeIndex) return;
    setDirection(nextIndex > activeIndex ? 1 : -1);
    setActiveId(id);
  };

  const step = (dir: 1 | -1) => {
    const next = DEMO_SLIDES[(activeIndex + dir + DEMO_SLIDES.length) % DEMO_SLIDES.length];
    setDirection(dir);
    setActiveId(next.id);
  };

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    setAutoAdvance(false);
    const dir = event.key === "ArrowRight" ? 1 : -1;
    const next = DEMO_SLIDES[(activeIndex + dir + DEMO_SLIDES.length) % DEMO_SLIDES.length];
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
      const index = DEMO_SLIDES.findIndex((s) => s.id === activeId);
      const next = DEMO_SLIDES[(index + 1) % DEMO_SLIDES.length];
      setDirection(1);
      setActiveId(next.id);
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [autoAdvance, activeId]);

  return (
    <div className="mx-auto max-w-[80rem]">
      <div
        className="relative"
        data-testid="demo-stage"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseEnter={() => { hoverPauseRef.current = true; }}
        onMouseLeave={() => { hoverPauseRef.current = false; }}
      >
        {DEMO_SLIDES.map((slide) => (
          // Box 1 — the stage. Same colour as the page so it is invisible; its
          // constant aspect reserves identical space on every tab, aligning the
          // demos and holding the tab row steady.
          <div
            key={slide.id}
            role="tabpanel"
            id={`demo-panel-${slide.id}`}
            aria-labelledby={`demo-tab-${slide.id}`}
            hidden={slide.id !== activeId}
            className="relative aspect-[3/2] w-full bg-background"
          >
            {slide.id === activeId && (
              <div
                className={[
                  "absolute inset-0 flex items-center justify-center",
                  direction === 1 ? "demo-slide-in-next" : "demo-slide-in-prev",
                ].join(" ")}
              >
                {/* Box 2 — wraps its demo exactly (full width, height driven by
                    the content), glowing frame, rounded. There is no empty
                    inverted slack: the cast player and the media images each set
                    the box height, and the leftover space lives in box 1. */}
                <div
                  className={[
                    "demo-glow w-full overflow-hidden",
                    // The viewer screenshot is a browser window with its own
                    // ~17px rounded corners; its box must clip at a larger radius
                    // or the window corner pokes out and reveals the box bg as a
                    // white (light) / black (dark) arc. The other slides fill
                    // opaque to the edge, so they keep the sharper rounded-xl.
                    slide.pageBackground
                      ? "rounded-[22px] bg-background"
                      : "rounded-xl bg-[#feffff] dark:bg-[#1b0100]",
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
        className="mt-2 flex items-center justify-center gap-4 sm:mt-3 sm:gap-8"
      >
        {DEMO_SLIDES.map((slide) => {
          const isActive = slide.id === activeId;
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
