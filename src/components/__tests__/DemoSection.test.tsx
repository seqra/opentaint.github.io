import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DemoSection } from "../DemoSection";

// asciinema is exercised in TerminalDemo.test.tsx; stub it here so the
// Terminal slide mounts without loading the real player.
vi.mock("asciinema-player", () => ({ create: () => ({ dispose: vi.fn() }) }));
vi.mock("asciinema-player/dist/bundle/asciinema-player.css", () => ({}));

// The agent slide's video plays via an effect on mount; jsdom has no media
// playback, so stub it to keep the console clean.
vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});

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
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("DemoSection", () => {
  it("renders three tabs with Agent selected by default", () => {
    render(<DemoSection />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs.map((t) => t.textContent)).toEqual(["Agent", "Viewer", "CLI"]);
    expect(screen.getByRole("tab", { name: "Agent" })).toHaveAttribute("aria-selected", "true");
  });

  it("plays the agent video with a stop control on the default tab", () => {
    render(<DemoSection />);
    const video = screen.getByTestId("demo-agent-media");
    expect(video).toBeInTheDocument();
    // Direct mapping: a light page shows the light-named asset.
    expect(video).toHaveAttribute("src", "/agent-video-light.mp4");
    expect(screen.getByRole("button", { name: /pause demo/i })).toBeInTheDocument();
    expect(screen.queryByTestId("demo-viewer-media")).not.toBeInTheDocument();
  });

  it("switches to the viewer slide and links its media to the live site", () => {
    render(<DemoSection />);
    fireEvent.click(screen.getByRole("tab", { name: "Viewer" }));
    expect(screen.getByRole("tab", { name: "Viewer" })).toHaveAttribute("aria-selected", "true");
    const media = screen.getByTestId("demo-viewer-media");
    expect(media).toBeInTheDocument();
    expect(media.closest("a")).toHaveAttribute("href", "https://viewer.opentaint.org/");
  });

  it("switches to the CLI slide and shows the terminal player", () => {
    render(<DemoSection />);
    fireEvent.click(screen.getByRole("tab", { name: "CLI" }));
    expect(screen.getByRole("tab", { name: "CLI" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByTestId("demo-hero-player")).toBeInTheDocument();
    expect(screen.queryByTestId("demo-agent-media")).not.toBeInTheDocument();
  });

  it("moves between tabs with the right arrow key", () => {
    render(<DemoSection />);
    const agentTab = screen.getByRole("tab", { name: "Agent" });
    agentTab.focus();
    fireEvent.keyDown(agentTab, { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "Viewer" })).toHaveAttribute("aria-selected", "true");
  });

  it("wraps to the last tab when ArrowLeft is pressed on the first tab", () => {
    render(<DemoSection />);
    const agentTab = screen.getByRole("tab", { name: "Agent" });
    agentTab.focus();
    fireEvent.keyDown(agentTab, { key: "ArrowLeft" });
    expect(screen.getByRole("tab", { name: "CLI" })).toHaveAttribute("aria-selected", "true");
  });

  it("moves DOM focus to the newly active tab on arrow navigation", () => {
    render(<DemoSection />);
    const agentTab = screen.getByRole("tab", { name: "Agent" });
    agentTab.focus();
    fireEvent.keyDown(agentTab, { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "Viewer" })).toHaveFocus();
  });

  it("links the viewer media to the live site but leaves the agent media unlinked", () => {
    render(<DemoSection />);
    fireEvent.click(screen.getByRole("tab", { name: "Viewer" }));
    expect(screen.getByTestId("demo-viewer-media").closest("a")).toHaveAttribute(
      "href",
      "https://viewer.opentaint.org/",
    );
    fireEvent.click(screen.getByRole("tab", { name: "Agent" }));
    expect(screen.getByTestId("demo-agent-media").closest("a")).toBeNull();
  });

  it("applies the demo glow to the inverted demo box", () => {
    const { container } = render(<DemoSection />);
    expect(container.querySelector(".demo-glow")).not.toBeNull();
  });

  it("applies the demo glow to every slide including the viewer", () => {
    const { container } = render(<DemoSection />);
    fireEvent.click(screen.getByRole("tab", { name: /viewer/i }));
    expect(container.querySelector(".demo-glow")).not.toBeNull();
  });

  it("advances on swipe left", () => {
    render(<DemoSection />);
    const stage = screen.getByTestId("demo-stage");
    fireEvent.touchStart(stage, { touches: [{ clientX: 300 }] });
    fireEvent.touchEnd(stage, { changedTouches: [{ clientX: 180 }] });
    expect(screen.getByRole("tab", { name: /viewer/i })).toHaveAttribute("aria-selected", "true");
  });

  it("renders text labels as the carousel indicators without arrows", () => {
    render(<DemoSection />);
    expect(screen.getByRole("tab", { name: "CLI" }).textContent).toBe("CLI");
    expect(screen.queryByRole("button", { name: "Next demo" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Previous demo" })).toBeNull();
  });

  it("auto-advances to the next demo after the interval", () => {
    vi.useFakeTimers();
    try {
      render(<DemoSection />);
      act(() => {
        vi.advanceTimersByTime(7000);
      });
      expect(screen.getByRole("tab", { name: "Viewer" })).toHaveAttribute("aria-selected", "true");
    } finally {
      vi.useRealTimers();
    }
  });

  it("stops auto-advancing after a manual selection", () => {
    vi.useFakeTimers();
    try {
      render(<DemoSection />);
      fireEvent.click(screen.getByRole("tab", { name: "CLI" }));
      act(() => {
        vi.advanceTimersByTime(21000);
      });
      expect(screen.getByRole("tab", { name: "CLI" })).toHaveAttribute("aria-selected", "true");
    } finally {
      vi.useRealTimers();
    }
  });
});
