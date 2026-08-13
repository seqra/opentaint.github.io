import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContinuousSecurity } from "../ContinuousSecurity";

describe("ContinuousSecurity", () => {
  it("leads with the reusable-scan promise", () => {
    render(<ContinuousSecurity />);

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Turn one-off review into unlimited scans");
    expect(screen.getByText("The flexibility of model reasoning and the consistency of formal program analysis combined")).toBeVisible();
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

    expect(screen.getByText("Model reasoning extracts an informal security specification from the project.")).toBeVisible();
    expect(screen.getByText("Agents transform the informal specification into taint rules and dependency models.")).toBeVisible();
    expect(screen.getByText("Formal program analysis searches the project using the formal specification.")).toBeVisible();
    expect(screen.getByText("Agents review scan results and refine the specification to reduce false alarms.")).toBeVisible();
    expect(screen.queryByText("The same review can produce different findings")).not.toBeInTheDocument();
  });
});
