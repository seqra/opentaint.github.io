import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AnimatedHero } from "../AnimatedHero";

describe("AnimatedHero", () => {
  it("renders the core promise", () => {
    render(<AnimatedHero />);
    expect(screen.getByRole("heading", { level: 1, name: "Continuous, lean, and agentic application security testing" })).toBeVisible();
    expect(screen.getByText("The open source taint analysis engine for the AI era")).toHaveClass("section-banner");
    expect(document.querySelector('img[src="/opentaint-header-light.svg"]')).toHaveAttribute("alt", "OpenTaint");
    expect(screen.getByText("Continuous", { selector: "span" })).toHaveClass("text-primary");
    expect(screen.getByText("Lean", { selector: "span" })).toHaveClass("hero-prefix-word");
    expect(screen.getByText("Agentic", { selector: "span" })).toHaveClass("hero-prefix-word");
    expect(document.querySelector(".hero-prefix-slot")?.children).toHaveLength(3);
    expect(document.querySelector(".hero-title-column")?.textContent).toBe("ApplicationSecurityTesting");
    expect(document.querySelector(".hero-signal-field")).toBeNull();
    expect(screen.getByRole("link", { name: "Install" })).toHaveAttribute("href", "#install");
    expect(screen.getByRole("link", { name: "Star" })).toHaveAttribute("href", "https://github.com/seqra/opentaint");
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
    expect(Array.from(container.querySelectorAll(".hero-title-column > span")).map((word) => word.textContent)).toEqual([
      "Application",
      "Security",
      "Testing",
    ]);
  });

  it("renders the headline without glow effects", () => {
    const { container } = render(<AnimatedHero />);
    const heading = container.querySelector("h1");
    expect(heading?.querySelector(".taint-word")).toBeNull();
    expect(heading?.className).not.toContain("crt-headline");
  });
});
