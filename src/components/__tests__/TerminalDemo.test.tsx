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

    const terminal = screen.getByTestId("demo-hero-player");
    expect(terminal).toHaveTextContent(/OpenTaint Scan/);
    expect(terminal).not.toHaveTextContent(/\$ opentaint scan/);
    expect(terminal).not.toHaveTextContent(/\.opentaint\/model/);
    expect(terminal).not.toHaveTextContent(/\.opentaint\/model\/org\.graalvm\.polyglot\.yaml/);
    expect(terminal).toHaveTextContent(/graaljs-code-injection:\s*1 error\s*\[CWE-94\]/);
    expect(terminal).toHaveTextContent(/Report:\s*results\/report\.sarif/);
  });

  it("shows the complete output immediately when reduced motion is enabled", () => {
    mockMatchMedia(true);
    render(<TerminalDemo scenario="security-review" />);

    expect(screen.getByTestId("demo-hero-player")).toHaveTextContent(/Total:\s*1 error/);
  });
});
