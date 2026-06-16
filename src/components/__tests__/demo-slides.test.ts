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

  it("gives the viewer slide a live-site href and theme-paired stills", () => {
    const viewer = DEMO_SLIDES.find((s) => s.id === "viewer");
    expect(viewer?.kind).toBe("media");
    expect(viewer?.href).toBe("https://viewer.opentaint.org/");
    expect(viewer?.sources).toEqual({
      light: "/viewer-screen-light-2.png",
      dark: "/viewer-screen-dark-2.png",
    });
  });

  it("maps the agent video and its screenshot poster by page theme", () => {
    const agent = DEMO_SLIDES.find((s) => s.id === "agent");
    expect(agent?.kind).toBe("video");
    expect(agent?.sources).toEqual({ light: "/agent-video-light.mp4", dark: "/agent-video-dark.mp4" });
    expect(agent?.fallback).toEqual({ light: "/screen-light-3.png", dark: "/screen-dark-3.png" });
  });
});
