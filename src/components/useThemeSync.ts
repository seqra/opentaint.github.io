import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

export const readInitialTheme = (): Theme =>
  typeof document !== "undefined" &&
  document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";

const readReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function useThemeSync(): { theme: Theme; reducedMotion: boolean } {
  const [theme, setTheme] = useState<Theme>(() => readInitialTheme());
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => readReducedMotion());

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

  return { theme, reducedMotion };
}
