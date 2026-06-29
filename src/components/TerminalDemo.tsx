import { useEffect, useRef, useState } from "react";
import "asciinema-player/dist/bundle/asciinema-player.css";
import { useThemeSync, type Theme } from "./useThemeSync";

type PlayerStatus = "loading" | "ready" | "error";
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
  pageTheme === "dark" ? "opentaint-dark" : "opentaint-light";

export function TerminalDemo() {
  const { theme, reducedMotion } = useThemeSync();
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
          controls: "auto",
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

  if (reducedMotion || status === "error") {
    return (
      <img
        data-testid="demo-hero-fallback-image"
        src={HERO_FALLBACK_SRC}
        alt="OpenTaint scan demo (static fallback)"
        className="block h-auto w-full"
      />
    );
  }

  return (
    <div
      ref={heroRef}
      data-testid="demo-hero-player"
      aria-label="OpenTaint scan demo, running continuously"
      className="w-full"
    />
  );
}
