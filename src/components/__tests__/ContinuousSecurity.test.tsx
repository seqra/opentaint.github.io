import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContinuousSecurity } from "../ContinuousSecurity";

describe("ContinuousSecurity", () => {
  it("gives the product advantages a heading before their visuals", () => {
    render(<ContinuousSecurity />);

    const workflow = screen.getByRole("heading", { name: "Triage", level: 3 }).closest(".workflow-card-grid");
    const promise = screen.getByRole("heading", { name: "Turn one-off review into unlimited scans", level: 2 });
    const firstAdvantage = screen.getByRole("heading", { name: "Practical SOTA static analysis", level: 3 });
    const valueHeading = screen.getByRole("heading", { name: "Find hard-to-detect vulnerabilities with exhaustive local analysis you own", level: 2 });

    expect(valueHeading).toBeVisible();
    expect(promise).toHaveTextContent("Turn one-off review into unlimited scans");
    expect(screen.queryByText("The flexibility of model reasoning and the consistency of formal program analysis combined")).not.toBeInTheDocument();
    expect(valueHeading.compareDocumentPosition(firstAdvantage) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(firstAdvantage.compareDocumentPosition(promise) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(promise.compareDocumentPosition(workflow as Node) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("shows the four-part OpenTaint workflow", () => {
    render(<ContinuousSecurity />);

    for (const title of ["Discover", "Enact", "Scan", "Triage"]) {
      expect(screen.getByRole("heading", { name: title, level: 3 })).toBeVisible();
    }
  });

  it("supports every workflow step with a product surface", () => {
    render(<ContinuousSecurity />);

    expect(screen.getByRole("img", { name: "Model reasoning extracts an informal security specification from a project" })).toBeVisible();
    expect(screen.getByRole("img", { name: "An agent transforms the informal specification into a formal specification" })).toBeVisible();
    expect(screen.getByRole("img", { name: "Formal program analysis searches the project using its formal security specification" })).toBeVisible();
    expect(screen.getByRole("img", { name: "An agent reviews scan results and refines the formal specification to reduce false alarms" })).toBeVisible();
  });

  it("keeps the visible workflow copy minimal", () => {
    render(<ContinuousSecurity />);

    expect(screen.getByText("Discover trust boundaries and")).toBeVisible();
    expect(screen.getByText("vulnerability patterns.")).toBeVisible();
    expect(screen.getByText("Enact security knowledge as")).toBeVisible();
    expect(screen.getByText("rules and dependency models.")).toBeVisible();
    expect(screen.getByText("Search the whole project with formal program analysis.")).toBeVisible();
    expect(screen.getByText("Confirm findings and tune away false alarms.")).toBeVisible();
    expect(screen.queryByText("The same review can produce different findings")).not.toBeInTheDocument();
  });

  it("shows performance balance and the open-source bundle visually", () => {
    render(<ContinuousSecurity />);

    expect(screen.queryByRole("heading", { name: "Spec-driven code search", level: 3 })).not.toBeInTheDocument();
    expect(screen.queryByRole("img", { name: /readable AST-pattern security specification/ })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Practical SOTA static analysis", level: 3 })).toBeVisible();
    expect(screen.getByText("Minimize missed findings and false alarms without making whole-project analysis impractical.")).toBeVisible();
    const balanceVisual = screen.getByRole("img", { name: "OpenTaint balances scan speed, finding coverage, and precision" });
    expect(balanceVisual).toBeVisible();
    expect(balanceVisual).toHaveTextContent("FAST SCAN TIME");
    expect(balanceVisual).toHaveTextContent("FEWER MISSED FINDINGS");
    expect(balanceVisual).toHaveTextContent("FEWER FALSE ALARMS");
    expect(balanceVisual).toHaveTextContent("SOTA");
    expect(balanceVisual).not.toHaveTextContent("MINIMAL");

    const geometrySvg = balanceVisual.querySelector<SVGSVGElement>("svg[data-balance-center]")!;
    const parsePoints = (value: string) => value.split(" ").map((point) => point.split(",").map(Number));
    const [viewBoxX, viewBoxY, viewBoxWidth, viewBoxHeight] = geometrySvg.getAttribute("viewBox")!.split(" ").map(Number);
    const [centerX, centerY] = geometrySvg.dataset.balanceCenter!.split(",").map(Number);
    const outerPoints = parsePoints(balanceVisual.querySelector("[data-balance-guide='outer']")!.getAttribute("points")!);
    const activePoints = parsePoints(balanceVisual.querySelector("[data-balance-active]")!.getAttribute("points")!);
    const vertexDots = Array.from(balanceVisual.querySelectorAll<HTMLElement>("[data-balance-dot]"));
    const centerLabel = balanceVisual.querySelector<HTMLElement>("[data-balance-center-label]")!;

    expect(Number.parseFloat(centerLabel.style.left)).toBeCloseTo(((centerX - viewBoxX) / viewBoxWidth) * 100);
    expect(Number.parseFloat(centerLabel.style.top)).toBeCloseTo(((centerY - viewBoxY) / viewBoxHeight) * 100);

    activePoints.forEach(([activeX, activeY], index) => {
      const [outerX, outerY] = outerPoints[index];
      const crossProduct = (outerX - centerX) * (activeY - centerY) - (outerY - centerY) * (activeX - centerX);
      const outerDistance = Math.hypot(outerX - centerX, outerY - centerY);
      const activeDistance = Math.hypot(activeX - centerX, activeY - centerY);

      expect(crossProduct).toBeCloseTo(0);
      expect(activeDistance).toBeLessThan(outerDistance * 0.85);
      expect(Number.parseFloat(vertexDots[index].style.left)).toBeCloseTo(((activeX - viewBoxX) / viewBoxWidth) * 100);
      expect(Number.parseFloat(vertexDots[index].style.top)).toBeCloseTo(((activeY - viewBoxY) / viewBoxHeight) * 100);
    });

    expect(screen.getByRole("heading", { name: "Open source, batteries included", level: 3 })).toBeVisible();
    expect(screen.getByText("Engine, rules, models, agent skills, CLI, viewer, and CI integrations — all open source and built to work together.")).toBeVisible();
    const openSourceVisual = screen.getByRole("img", { name: /OpenTaint open-source components/ });
    expect(openSourceVisual).toBeVisible();
    expect(openSourceVisual).toHaveTextContent("Analysis engine");
    expect(openSourceVisual).toHaveTextContent("CLI and CI");
  });
});
