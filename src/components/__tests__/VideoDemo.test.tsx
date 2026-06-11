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
  it("plays the light video source on a light page", () => {
    render(<VideoDemo sources={sources} poster={poster} alt="x" testId="v" />);
    expect(screen.getByTestId("v")).toHaveAttribute("src", "/a-light.mp4");
  });

  it("plays the dark video source on a dark page", () => {
    document.documentElement.classList.add("dark");
    render(<VideoDemo sources={sources} poster={poster} alt="x" testId="v" />);
    expect(screen.getByTestId("v")).toHaveAttribute("src", "/a-dark.mp4");
  });

  it("autoplays muted, looping, inline, with a themed poster", () => {
    render(<VideoDemo sources={sources} poster={poster} alt="x" testId="v" />);
    const video = screen.getByTestId("v") as HTMLVideoElement;
    expect(video).toHaveAttribute("poster", "/a-light.png");
    expect(video.autoplay).toBe(true);
    expect(video.loop).toBe(true);
    expect(video.muted).toBe(true);
    expect(video.playsInline).toBe(true);
  });

  it("renders a static poster image and no controls under reduced motion", () => {
    setMatchMedia(true);
    render(<VideoDemo sources={sources} poster={poster} alt="x" testId="v" />);
    const img = screen.getByTestId("v");
    expect(img.tagName).toBe("IMG");
    expect(img).toHaveAttribute("src", "/a-light.png");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("pauses the video and offers Play when the stop control is clicked", () => {
    render(<VideoDemo sources={sources} poster={poster} alt="x" testId="v" />);
    fireEvent.click(screen.getByRole("button", { name: /pause/i }));
    expect(pause).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: /play/i })).toBeInTheDocument();
  });

  it("resumes the video and offers Pause when play is clicked after a stop", () => {
    render(<VideoDemo sources={sources} poster={poster} alt="x" testId="v" />);
    fireEvent.click(screen.getByRole("button", { name: /pause/i }));
    fireEvent.click(screen.getByRole("button", { name: /play/i }));
    expect(play).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: /pause/i })).toBeInTheDocument();
  });
});
