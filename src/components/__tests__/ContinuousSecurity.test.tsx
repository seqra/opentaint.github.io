import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContinuousSecurity } from "../ContinuousSecurity";

describe("ContinuousSecurity", () => {
  it("places each visual group before its supporting promise", () => {
    render(<ContinuousSecurity />);

    const workflow = screen.getByRole("heading", { name: "Triage", level: 3 }).closest(".workflow-card-grid");
    const promise = screen.getByRole("heading", { name: "Turn one-off review into unlimited scans", level: 2 });
    const firstAdvantage = screen.getByRole("heading", { name: "Lean specs, continuous scans", level: 3 });
    const valuePromise = screen.getByRole("heading", { name: "The open source taint analysis engine for the AI era", level: 2 });

    expect(valuePromise).toBeVisible();
    expect(screen.getByText("Lean specifications, practical SOTA analysis, and an open-source stack built to work together")).toBeVisible();
    expect(promise).toHaveTextContent("Turn one-off review into unlimited scans");
    expect(screen.queryByText("The flexibility of model reasoning and the consistency of formal program analysis combined")).not.toBeInTheDocument();
    expect(firstAdvantage.compareDocumentPosition(valuePromise) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(valuePromise.compareDocumentPosition(workflow as Node) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect((workflow as Node).compareDocumentPosition(promise) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
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

  it("shows the continuous loop, performance balance, and open-source bundle visually", () => {
    render(<ContinuousSecurity />);

    expect(screen.getByRole("heading", { name: "Lean specs, continuous scans", level: 3 })).toBeVisible();
    expect(screen.getByText("Grow a formal specification from each reviewed diff, then run it against every future project change.")).toBeVisible();
    const leanVisual = screen.getByRole("img", { name: /Lean reusable specifications power continuous formal scans/ });
    expect(leanVisual).toBeVisible();
    expect(leanVisual).toHaveTextContent("LEAN SPEC");
    expect(leanVisual).toHaveTextContent("CONTINUOUS SCANS");
    expect(screen.getByRole("heading", { name: "Practical SOTA static analysis", level: 3 })).toBeVisible();
    expect(screen.getByText("Minimize missed findings and false alarms without making whole-project analysis impractical.")).toBeVisible();
    const balanceVisual = screen.getByRole("img", { name: "OpenTaint balances scan speed, finding coverage, and precision" });
    expect(balanceVisual).toBeVisible();
    expect(balanceVisual).toHaveTextContent("FAST SCAN TIME");
    expect(balanceVisual).toHaveTextContent("FEWER MISSED FINDINGS");
    expect(balanceVisual).toHaveTextContent("FEWER FALSE ALARMS");
    expect(balanceVisual).not.toHaveTextContent("SOTA");
    expect(balanceVisual).not.toHaveTextContent("MINIMAL");
    expect(screen.getByRole("heading", { name: "Open source, batteries included", level: 3 })).toBeVisible();
    expect(screen.getByText("Engine, rules, models, agent skills, CLI, viewer, and CI integrations — all open source and built to work together.")).toBeVisible();
    const openSourceVisual = screen.getByRole("img", { name: /OpenTaint open-source components/ });
    expect(openSourceVisual).toBeVisible();
    expect(openSourceVisual).toHaveTextContent("Analysis engine");
    expect(openSourceVisual).toHaveTextContent("CLI and CI");
  });
});
