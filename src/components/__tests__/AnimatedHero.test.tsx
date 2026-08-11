import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AnimatedHero } from "../AnimatedHero";

describe("AnimatedHero", () => {
  it("renders the core promise", () => {
    render(<AnimatedHero />);
    expect(screen.getByRole("heading", { level: 1, name: "Continuous, lean, and agentic application security testing" })).toBeVisible();
    expect(screen.getByText("The open source taint analysis engine for the AI era")).toHaveClass("section-banner");
    expect(document.querySelector('img[src="/favicon.svg"]')).not.toBeNull();
    expect(screen.getByText("Continuous", { selector: "span" })).toHaveClass("text-primary");
  });

  it("renders the install panel from the original landing", () => {
    const { container } = render(<AnimatedHero />);
    expect(container.querySelector(".bg-panel")).not.toBeNull();
    expect(screen.getByText("npm install -g @seqra/opentaint")).toBeVisible();
    expect(screen.getByRole("button", { name: "Copy install command" })).toBeVisible();
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
    expect(container.querySelector("h1")?.textContent).toContain("Application Security Testing");
  });

  it("renders the headline without glow effects", () => {
    const { container } = render(<AnimatedHero />);
    const heading = container.querySelector("h1");
    expect(heading?.querySelector(".taint-word")).toBeNull();
    expect(heading?.className).not.toContain("crt-headline");
  });
});
