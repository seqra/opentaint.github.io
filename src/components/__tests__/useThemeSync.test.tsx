import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useThemeSync } from "../useThemeSync";

function Probe() {
  const { theme, reducedMotion } = useThemeSync();
  return <span data-testid="probe">{`${theme}:${reducedMotion}`}</span>;
}

beforeEach(() => {
  document.documentElement.classList.remove("dark");
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

afterEach(() => vi.clearAllMocks());

describe("useThemeSync", () => {
  it("reads the initial light theme and no reduced motion", () => {
    render(<Probe />);
    expect(screen.getByTestId("probe").textContent).toBe("light:false");
  });

  it("reads dark when the html element has the dark class", () => {
    document.documentElement.classList.add("dark");
    render(<Probe />);
    expect(screen.getByTestId("probe").textContent).toBe("dark:false");
  });

  it("updates theme when [data-theme-toggle] is clicked", async () => {
    const toggle = document.createElement("button");
    toggle.setAttribute("data-theme-toggle", "");
    document.body.appendChild(toggle);

    render(<Probe />);
    expect(screen.getByTestId("probe").textContent).toBe("light:false");

    await act(async () => {
      document.documentElement.classList.add("dark");
      toggle.click();
      await Promise.resolve();
    });

    expect(screen.getByTestId("probe").textContent).toBe("dark:false");
    toggle.remove();
  });

  it("reports reduced motion when the media query matches", () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    render(<Probe />);
    expect(screen.getByTestId("probe").textContent).toBe("light:true");
  });
});
