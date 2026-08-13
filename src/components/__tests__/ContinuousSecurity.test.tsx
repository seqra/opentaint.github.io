import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContinuousSecurity } from "../ContinuousSecurity";

describe("ContinuousSecurity", () => {
  it("places the reusable-scan promise after the workflow", () => {
    render(<ContinuousSecurity />);

    const workflow = screen.getByRole("heading", { name: "Triage", level: 3 }).closest(".workflow-card-grid");
    const promise = screen.getByRole("heading", { level: 2 });

    expect(promise).toHaveTextContent("Turn one-off review into unlimited scans");
    expect(screen.getByText("The flexibility of model reasoning and the consistency of formal program analysis combined.")).toBeVisible();
    expect(workflow?.compareDocumentPosition(promise) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
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

    expect(screen.getByText("Learn trust boundaries and vulnerability patterns as an informal specification.")).toBeVisible();
    expect(screen.getByText("Enact the informal specification as taint rules and dependency models.")).toBeVisible();
    expect(screen.getByText("Search the whole project with formal program analysis.")).toBeVisible();
    expect(screen.getByText("Confirm findings and tune away false alarms.")).toBeVisible();
    expect(screen.queryByText("The same review can produce different findings")).not.toBeInTheDocument();
  });

  it("shows the performance balance and the open-source bundle visually", () => {
    render(<ContinuousSecurity />);

    expect(screen.getByRole("heading", { name: "Practical balance through SOTA static analysis", level: 3 })).toBeVisible();
    expect(screen.getByText("Minimize missed findings and false alarms without making whole-project analysis impractical.")).toBeVisible();
    expect(screen.getByRole("img", { name: "OpenTaint balances scan speed, finding coverage, and precision" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Open source, batteries included", level: 3 })).toBeVisible();
    expect(screen.getByText("Engine, rules, models, agent skills, CLI, viewer, and CI integrations — all open source and built to work together.")).toBeVisible();
    expect(screen.getByRole("img", { name: /open-source OpenTaint bundle/ })).toBeVisible();
  });
});
