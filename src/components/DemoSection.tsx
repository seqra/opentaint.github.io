import { useEffect, useRef, useState } from "react";

type PlayerStatus = "loading" | "ready" | "error";
type Theme = "light" | "dark";

type PlayerHandle = { dispose: () => void };

type PlayerModule = {
  create: (
    source: string,
    container: HTMLElement,
    options?: Record<string, unknown>,
  ) => PlayerHandle;
};

const HERO_SRC = "/demo/hero.cast";
const HERO_FALLBACK_SRC = "/demo/hero.svg";

const themeClass = (theme: Theme) =>
  theme === "dark" ? "ap-theme-opentaint-dark" : "ap-theme-opentaint-light";

const readInitialTheme = (): Theme =>
  typeof document !== "undefined" && document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";

const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function DemoSection() {
  const [theme, setTheme] = useState<Theme>(() => readInitialTheme());
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => prefersReducedMotion());
  const [status, setStatus] = useState<PlayerStatus>("loading");

  const heroRef = useRef<HTMLDivElement | null>(null);
  const heroHandleRef = useRef<PlayerHandle | null>(null);

  useEffect(() => {
    if (reducedMotion) return;

    let cancelled = false;
    const load = async () => {
      try {
        const mod = (await import("asciinema-player")) as PlayerModule;
        await import("asciinema-player/dist/bundle/asciinema-player.css");
        if (cancelled || !heroRef.current || heroHandleRef.current) return;
        heroHandleRef.current = mod.create(HERO_SRC, heroRef.current, {
          autoPlay: true,
          loop: true,
          preload: true,
          controls: false,
          poster: "npt:0:0.1",
          terminalFontFamily: "'JetBrains Mono', monospace",
        });
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    };

    void load();
    return () => {
      cancelled = true;
      heroHandleRef.current?.dispose();
      heroHandleRef.current = null;
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const toggle = document.querySelector("[data-theme-toggle]");
    if (!toggle) return;
    const sync = () => setTheme(readInitialTheme());
    toggle.addEventListener("click", sync);
    return () => toggle.removeEventListener("click", sync);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  const wrapper = themeClass(theme);

  return (
    <div className={`mx-auto max-w-[68.4rem] ${wrapper}`}>
      <div className="overflow-hidden sm:rounded-md sm:border sm:border-border sm:bg-secondary/50">
        {reducedMotion || status === "error" ? (
          <img
            data-testid="demo-hero-fallback-image"
            src={HERO_FALLBACK_SRC}
            alt="OpenTaint scan demo (static fallback)"
            className="block w-full"
          />
        ) : (
          <div
            ref={heroRef}
            data-testid="demo-hero-player"
            className={wrapper}
            aria-label="OpenTaint scan demo, running continuously"
          />
        )}
      </div>
    </div>
  );
}
