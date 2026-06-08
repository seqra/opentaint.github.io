import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AnimatedHero } from "../AnimatedHero";

describe("AnimatedHero", () => {
  it("renders the install panel on panel tokens", () => {
    const { container } = render(<AnimatedHero />);
    expect(container.querySelector(".bg-panel")).not.toBeNull();
  });

  it("marks exactly one method tab with the panel accent", () => {
    render(<AnimatedHero />);
    const active = screen
      .getAllByRole("button")
      .filter((b) => b.className.split(/\s+/).includes("text-panel-accent"));
    expect(active).toHaveLength(1);
  });

  it("uses no hard-coded hex colors in class names", () => {
    const { container } = render(<AnimatedHero />);
    for (const el of Array.from(container.querySelectorAll("[class]"))) {
      expect(el.getAttribute("class") ?? "").not.toMatch(/\[#/);
    }
  });

  it("wraps the install panel in the terminal glow", () => {
    const { container } = render(<AnimatedHero />);
    expect(container.querySelector(".terminal-glow.bg-panel")).not.toBeNull();
  });

  it("renders the blinking cursor in the headline", () => {
    const { container } = render(<AnimatedHero />);
    const cursor = container.querySelector("h1 .crt-cursor");
    expect(cursor).not.toBeNull();
    expect(cursor?.textContent).toBe(".");
    expect(cursor?.getAttribute("aria-hidden")).toBe("true");
  });

  it("splits the headline into taint-flow word spans", () => {
    const { container } = render(<AnimatedHero />);
    const words = container.querySelectorAll("h1 .taint-word");
    expect(words.length).toBe(10);
    const heading = container.querySelector("h1");
    expect(heading?.textContent?.replace(/\s+/g, " ").trim()).toBe(
      "The open source taint analysis engine for the AI era.",
    );
    expect(heading?.className).toContain("crt-headline");
  });

  it("uses the solid panel border", () => {
    const { container } = render(<AnimatedHero />);
    expect(container.querySelector(".terminal-glow.bg-panel")?.className).toContain(
      "border-panel-border",
    );
  });
});
