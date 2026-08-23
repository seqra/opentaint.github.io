import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContinuousSecurity } from "../ContinuousSecurity";

describe("ContinuousSecurity", () => {
  it("places the reusable-scan promise after the workflow", () => {
    render(<ContinuousSecurity />);

    const workflow = screen.getByRole("heading", { name: "Triage", level: 3 }).closest(".workflow-card-grid");
    const promise = screen.getByRole("heading", { level: 2 });

    expect(promise).toHaveTextContent("Turn one-off review into unlimited scans");
    expect(screen.getByText("The flexibility of model reasoning and the consistency of formal program analysis combined")).toBeVisible();
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

  it("connects the workflow from security review to repeatable CI checks", () => {
    render(<ContinuousSecurity />);

    expect(screen.getByText("Find application-specific trust boundaries and vulnerability patterns in an agent-led security review.")).toBeVisible();
    expect(screen.getByText("Preserve review knowledge as taint rules and dependency models that can run again.")).toBeVisible();
    expect(screen.getByText("Run deterministic vulnerability checks across the whole project on every change in CI/CD.")).toBeVisible();
    expect(screen.getByText("Confirm findings, tune away false alarms, and retain each refinement for future scans.")).toBeVisible();
    expect(screen.getByText(/Every security review becomes reusable vulnerability coverage/)).toBeVisible();
    expect(screen.queryByText("The same review can produce different findings")).not.toBeInTheDocument();
  });

  it("shows the performance balance and the open-source bundle visually", () => {
    render(<ContinuousSecurity />);

    expect(screen.getByRole("heading", { name: "Practical balance through SOTA static analysis", level: 3 })).toBeVisible();
    expect(screen.getByText("Minimize missed findings and false alarms without making whole-project analysis impractical.")).toBeVisible();
    expect(screen.getByRole("img", { name: "OpenTaint balances scan speed, finding coverage, and precision" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Open source, batteries included", level: 3 })).toBeVisible();
    expect(screen.getByText(/Built for developers: run checks locally and in CI/)).toBeVisible();
    expect(screen.getByText(/Engine, CLI, viewer, and integrations work together, all open source/)).toBeVisible();
    expect(screen.getByRole("img", { name: /open-source OpenTaint bundle/ })).toBeVisible();
  });
});
