import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ContinuousSecurity } from "../ContinuousSecurity";

beforeEach(() => {
  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));
  vi.stubGlobal("scrollTo", vi.fn());
});

describe("ContinuousSecurity", () => {
  it("leads with the reusable-scan promise", () => {
    render(<ContinuousSecurity />);

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Turn one security review into unlimited security scans");
    expect(screen.getByText("The flexibility of model reasoning and the consistency of formal program analysis combined")).toBeVisible();
  });

  it("starts with the variability of repeated model review", () => {
    render(<ContinuousSecurity />);

    expect(screen.getByRole("heading", { name: "The same review can produce different findings" })).toBeVisible();
    expect(screen.getByText("Review₁ △ Review₂ ≠ ∅")).toBeVisible();
    expect(screen.getByLabelText("Two model reviews of the same project return different findings")).toBeVisible();
  });

  it("contrasts model variability with deterministic formal analysis", () => {
    render(<ContinuousSecurity />);

    fireEvent.click(screen.getByRole("button", { name: /Searching/ }));
    expect(screen.getByRole("heading", { name: "The same inputs produce the same report" })).toBeVisible();
    expect(screen.getByText("Report₁ = Report₂")).toBeVisible();
    expect(screen.getByLabelText("Two formal scans of the same project and specification return the same report")).toBeVisible();
  });

  it("shows both engine failure modes when the specification is incomplete", () => {
    render(<ContinuousSecurity />);

    fireEvent.click(screen.getByRole("button", { name: /Engine limits/ }));
    expect(screen.getByText("Missed finding")).toBeVisible();
    expect(screen.getByText("False alarm")).toBeVisible();
    expect(screen.getByLabelText("An incomplete formal specification creates a missed finding and a false alarm")).toBeVisible();
  });

  it("shows review knowledge accumulating into whole-project coverage", () => {
    render(<ContinuousSecurity />);

    fireEvent.click(screen.getByRole("button", { name: /Continuous/ }));
    expect(screen.getByRole("heading", { name: "Review the change. Scan the whole project" })).toBeVisible();
    expect(screen.getByText("Report₂ ⊇ Review₁ ∪ Review₂")).toBeVisible();
    expect(screen.getByLabelText("Formal specification R₁, R₂")).toBeVisible();
    expect(screen.getByText("Lean, continuous coverage")).toBeVisible();
  });
});
