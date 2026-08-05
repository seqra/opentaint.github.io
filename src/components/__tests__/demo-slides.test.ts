import { describe, expect, it } from "vitest";
import { DEMO_SLIDES } from "../demo-slides";

describe("DEMO_SLIDES", () => {
  it("lists agent, viewer, terminal in order", () => {
    expect(DEMO_SLIDES.map((s) => s.id)).toEqual(["agent", "viewer", "terminal"]);
  });

  it("gives the terminal slide the cast kind and no media sources", () => {
    const terminal = DEMO_SLIDES.find((s) => s.id === "terminal");
    expect(terminal?.kind).toBe("terminal");
    expect(terminal?.sources).toBeUndefined();
  });

  it("gives the viewer slide a live-site href and a theme-paired recording", () => {
    const viewer = DEMO_SLIDES.find((s) => s.id === "viewer");
    expect(viewer?.kind).toBe("video");
    expect(viewer?.href).toBe("https://viewer.opentaint.org/");
    expect(viewer?.sources).toEqual({
      light: "/video/viewer-light.mp4",
      dark: "/video/viewer-dark.mp4",
    });
    expect(viewer?.fallback).toEqual({
      light: "/video/viewer-poster-light.webp",
      dark: "/video/viewer-poster-dark.webp",
    });
  });

  it("maps the agent video and its first-frame poster by page theme", () => {
    const agent = DEMO_SLIDES.find((s) => s.id === "agent");
    expect(agent?.kind).toBe("video");
    expect(agent?.sources).toEqual({ light: "/agent-video-light.mp4", dark: "/agent-video-dark.mp4" });
    expect(agent?.fallback).toEqual({ light: "/agent-poster-light.webp", dark: "/agent-poster-dark.webp" });
  });
});
