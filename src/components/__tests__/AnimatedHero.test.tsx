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

  it("renders the headline without a cursor", () => {
    const { container } = render(<AnimatedHero />);
    expect(container.querySelector("h1 .crt-cursor")).toBeNull();
    expect(container.querySelector("h1")?.textContent).toBe(
      "The open source taint analysis engine for the AI era",
    );
  });

  it("renders the headline without glow effects", () => {
    const { container } = render(<AnimatedHero />);
    const heading = container.querySelector("h1");
    expect(heading?.querySelector(".taint-word")).toBeNull();
    expect(heading?.className).not.toContain("crt-headline");
  });

  it("uses the solid panel border", () => {
    const { container } = render(<AnimatedHero />);
    expect(container.querySelector(".bg-panel")?.className).toContain(
      "border-panel-border",
    );
  });
});
