import { useEffect, useRef, useState } from "react";
import "asciinema-player/dist/bundle/asciinema-player.css";

type PlayerStatus = "loading" | "ready" | "error";
type Theme = "light" | "dark";
type DemoTheme = "opentaint-light" | "opentaint-dark";

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

const demoThemeFor = (pageTheme: Theme): DemoTheme =>
  pageTheme === "dark" ? "opentaint-light" : "opentaint-dark";

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

  const demoTheme = demoThemeFor(theme);

  useEffect(() => {
    if (reducedMotion) return;

    let cancelled = false;
    const load = async () => {
      try {
        const mod = (await import("asciinema-player")) as PlayerModule;
        if (cancelled || !heroRef.current) return;
        heroHandleRef.current = mod.create(HERO_SRC, heroRef.current, {
          autoPlay: true,
          loop: true,
          preload: true,
          controls: false,
          poster: "npt:0:0.1",
          theme: demoTheme,
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
  }, [reducedMotion, demoTheme]);

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

  return (
    <div className="mx-auto max-w-[68.4rem]">
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
            aria-label="OpenTaint scan demo, running continuously"
          />
        )}
      </div>
    </div>
  );
}
