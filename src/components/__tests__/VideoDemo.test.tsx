import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VideoDemo } from "../VideoDemo";

const sources = { light: "/a-light.mp4", dark: "/a-dark.mp4" };
const poster = { light: "/a-light.png", dark: "/a-dark.png" };

const setMatchMedia = (reduced: boolean) => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduced && query.includes("prefers-reduced-motion"),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

// jsdom does not implement media playback — stub it so the component can call it.
const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
const pause = vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});

beforeEach(() => {
  document.documentElement.classList.remove("dark");
  setMatchMedia(false);
});
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("VideoDemo", () => {
  // Theme is chosen by CSS off the `.dark` class, not JS, so both videos are
  // always rendered and the correct one shows before the island hydrates.
  it("renders both the light and dark video sources for a CSS theme swap", () => {
    render(<VideoDemo sources={sources} poster={poster} alt="x" testId="v" />);
    const light = screen.getByTestId("v");
    const dark = screen.getByTestId("v-dark");
    expect(light).toHaveAttribute("src", "/a-light.mp4");
    expect(light).toHaveAttribute("poster", "/a-light.png");
    expect(dark).toHaveAttribute("src", "/a-dark.mp4");
    expect(dark).toHaveAttribute("poster", "/a-dark.png");
    expect(light.className).toContain("dark:hidden");
    expect(dark.className).toContain("dark:block");
  });

  it("loops muted inline and plays only the visible source, never preloading either", () => {
    render(<VideoDemo sources={sources} poster={poster} alt="x" testId="v" />);
    const video = screen.getByTestId("v") as HTMLVideoElement;
    expect(video.loop).toBe(true);
    expect(video.muted).toBe(true);
    expect(video.playsInline).toBe(true);
    // No `autoPlay` attribute + preload="none" so the browser never fetches the
    // hidden ~4 MB variant; JS plays only the theme-visible video.
    expect(video.autoplay).toBe(false);
    expect(video).toHaveAttribute("preload", "none");
    expect(screen.getByTestId("v-dark")).toHaveAttribute("preload", "none");
    // On a light page the effect starts the visible (light) video.
    expect(play).toHaveBeenCalled();
  });

  it("renders static posters and no controls under reduced motion", () => {
    setMatchMedia(true);
    render(<VideoDemo sources={sources} poster={poster} alt="x" testId="v" />);
    const light = screen.getByTestId("v");
    const dark = screen.getByTestId("v-dark");
    expect(light.tagName).toBe("IMG");
    expect(dark.tagName).toBe("IMG");
    expect(light).toHaveAttribute("src", "/a-light.png");
    expect(dark).toHaveAttribute("src", "/a-dark.png");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("pauses the video and offers Play when the stop control is clicked", () => {
    render(<VideoDemo sources={sources} poster={poster} alt="x" testId="v" />);
    fireEvent.click(screen.getByRole("button", { name: /pause/i }));
    expect(pause).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /play/i })).toBeInTheDocument();
  });

  it("resumes the video and offers Pause when play is clicked after a stop", () => {
    render(<VideoDemo sources={sources} poster={poster} alt="x" testId="v" />);
    fireEvent.click(screen.getByRole("button", { name: /pause/i }));
    fireEvent.click(screen.getByRole("button", { name: /play/i }));
    expect(play).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /pause/i })).toBeInTheDocument();
  });
});
