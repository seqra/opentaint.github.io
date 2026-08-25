import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AnimatedHero } from "../AnimatedHero";

describe("AnimatedHero", () => {
  it("renders the core promise", () => {
    render(<AnimatedHero />);
    expect(screen.getByRole("heading", { level: 1, name: "Turn one agent-led security review into continuous vulnerability checks" })).toBeVisible();
    expect(document.querySelector(".section-banner")).toHaveTextContent("OpenTaint is the open source taint analysis engine for the AI era");
    expect(document.querySelector(".hero-subline")).toHaveTextContent("It turns one-off security findings into unlimited scans across the development lifecycle.");
    expect(screen.queryByText("The flexibility of model reasoning and the consistency of formal program analysis combined")).not.toBeInTheDocument();
    expect(document.querySelector('img[src="/opentaint-header-light.svg"]')).toHaveAttribute("alt", "OpenTaint");
    expect(screen.getByText("agent-led security review", { selector: "span" })).toHaveClass("text-primary");
    expect(document.querySelector(".hero-prefix-slot")).toBeNull();
    expect(document.querySelector(".hero-title-column")).toBeNull();
    expect(document.querySelector(".hero-signal-field")).toBeNull();
    expect(screen.getByRole("link", { name: "Install" })).toHaveAttribute("href", "#install");
    expect(screen.getByRole("link", { name: "See CVE" })).toHaveAttribute("href", "/blog/conductor-rce-cve-2026-58138/");
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
    expect(container.querySelector("h1")?.textContent).toBe("Turn one agent-led security review into continuous vulnerability checks");
  });

  it("renders the headline without glow effects", () => {
    const { container } = render(<AnimatedHero />);
    const heading = container.querySelector("h1");
    expect(heading?.querySelector(".taint-word")).toBeNull();
    expect(heading?.className).not.toContain("crt-headline");
  });
});
