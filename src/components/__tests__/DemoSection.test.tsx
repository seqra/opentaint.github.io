import { cleanup, render, screen, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { DemoSection } from "../DemoSection";

type PlayerHandle = { dispose: Mock };

let playerInstances: PlayerHandle[] = [];
let createPlayerMock: Mock<(...args: unknown[]) => void>;

vi.mock("asciinema-player", () => {
  return {
    create: (...args: unknown[]) => {
      const handle: PlayerHandle = { dispose: vi.fn() };
      playerInstances.push(handle);
      createPlayerMock(...args);
      return handle;
    },
  };
});

vi.mock("asciinema-player/dist/bundle/asciinema-player.css", () => ({}));

beforeEach(() => {
  playerInstances = [];
  createPlayerMock = vi.fn();
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

const flushAsync = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
};

const lastCreateOptions = () => {
  const call = createPlayerMock.mock.calls.at(-1);
  return (call?.[2] ?? {}) as Record<string, unknown>;
};

describe("DemoSection", () => {
  it("mounts the hero player", async () => {
    render(<DemoSection />);
    await flushAsync();
    expect(screen.getByTestId("demo-hero-player")).toBeInTheDocument();
    expect(createPlayerMock).toHaveBeenCalledTimes(1);
  });

  it("uses the dark cast theme on a light page", async () => {
    render(<DemoSection />);
    await flushAsync();
    expect(lastCreateOptions().theme).toBe("opentaint-dark");
  });

  it("uses the light cast theme on a dark page", async () => {
    document.documentElement.classList.add("dark");
    render(<DemoSection />);
    await flushAsync();
    expect(lastCreateOptions().theme).toBe("opentaint-light");
  });

  it("re-creates the player with the inverse theme when [data-theme-toggle] is clicked", async () => {
    const toggle = document.createElement("button");
    toggle.setAttribute("data-theme-toggle", "");
    document.body.appendChild(toggle);

    render(<DemoSection />);
    await flushAsync();
    expect(lastCreateOptions().theme).toBe("opentaint-dark");
    const firstHandle = playerInstances.at(-1);

    await act(async () => {
      document.documentElement.classList.add("dark");
      toggle.click();
      await Promise.resolve();
    });
    await flushAsync();

    expect(firstHandle?.dispose).toHaveBeenCalled();
    expect(createPlayerMock).toHaveBeenCalledTimes(2);
    expect(lastCreateOptions().theme).toBe("opentaint-light");
    toggle.remove();
  });

  it("renders the reduced-motion fallback in place of the player", async () => {
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

    render(<DemoSection />);
    await flushAsync();

    expect(screen.queryByTestId("demo-hero-player")).not.toBeInTheDocument();
    expect(screen.getByTestId("demo-hero-fallback-image")).toHaveAttribute(
      "src",
      "/demo/hero.svg",
    );
  });

  it("renders the error fallback when the player library fails to load", async () => {
    vi.doMock("asciinema-player", () => {
      throw new Error("boom");
    });
    vi.resetModules();
    const { DemoSection: Fresh } = await import("../DemoSection");
    render(<Fresh />);
    await flushAsync();

    expect(screen.queryByTestId("demo-hero-player")).not.toBeInTheDocument();
    expect(screen.getByTestId("demo-hero-fallback-image")).toHaveAttribute(
      "src",
      "/demo/hero.svg",
    );
  });
});
