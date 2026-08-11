import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AnimatedHero } from "../AnimatedHero";

describe("AnimatedHero", () => {
  it("renders the core promise", () => {
    render(<AnimatedHero />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Turn one security review into unlimited security scans",
    );
    expect(screen.getByText("The open source taint analysis engine for the AI era")).toBeVisible();
    expect(screen.getByText("The flexibility of agent reasoning and the consistency of formal analysis combined")).toBeVisible();
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
    expect(container.querySelector("h1")?.textContent).toBe(
      "Turn one security review into unlimited security scans",
    );
  });

  it("renders the headline without glow effects", () => {
    const { container } = render(<AnimatedHero />);
    const heading = container.querySelector("h1");
    expect(heading?.querySelector(".taint-word")).toBeNull();
    expect(heading?.className).not.toContain("crt-headline");
  });
});
