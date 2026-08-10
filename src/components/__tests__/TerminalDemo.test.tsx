import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TerminalDemo } from "../TerminalDemo";

const mockMatchMedia = (reducedMotion = false) => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reducedMotion && query.includes("prefers-reduced-motion"),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

beforeEach(() => {
  vi.useFakeTimers();
  mockMatchMedia();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("TerminalDemo", () => {
  it("renders a native terminal without loading a recording", () => {
    render(<TerminalDemo />);
    expect(screen.getByTestId("demo-hero-player")).toBeVisible();
    expect(screen.getByText(/\$ opentaint scan/)).toBeInTheDocument();
  });

  it("plays the real anonymous security-review scan timeline", () => {
    render(<TerminalDemo scenario="security-review" />);

    act(() => { vi.runAllTimers(); });

    expect(screen.getByText(/\$ opentaint scan/)).toBeInTheDocument();
    expect(screen.getByText(/graaljs-code-injection: 1 error \[CWE-94\]/)).toBeInTheDocument();
    expect(screen.getByText(/Report: results\/report\.sarif/)).toBeInTheDocument();
  });

  it("shows the complete output immediately when reduced motion is enabled", () => {
    mockMatchMedia(true);
    render(<TerminalDemo scenario="security-review" />);

    expect(screen.getByText(/Total: 1 error/)).toBeInTheDocument();
  });
});
