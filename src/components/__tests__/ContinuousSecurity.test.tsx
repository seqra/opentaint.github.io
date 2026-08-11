import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ContinuousSecurity } from "../ContinuousSecurity";

beforeEach(() => {
  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));
});

describe("ContinuousSecurity", () => {
  it("uses the review and scan operating model", () => {
    render(<ContinuousSecurity />);

    expect(screen.getByText("Security agent")).toBeVisible();
    expect(screen.getByText("Taint analysis engine")).toBeVisible();
    expect(screen.getByText("Formal inter-procedural dataflow analysis")).toBeVisible();
    expect(screen.getByText("AST-pattern taint rules and dependency models")).toBeVisible();
  });

  it("contrasts repeated agent review with a stable formal scan", () => {
    render(<ContinuousSecurity />);

    fireEvent.click(screen.getByRole("button", { name: "Same review" }));
    expect(screen.getByText("28k tokens")).toBeVisible();
    expect(screen.getByText("specification unchanged")).toBeVisible();
    expect(screen.getByText("CPU scan only")).toBeVisible();
  });

  it("accumulates enacted coverage across revisions", () => {
    render(<ContinuousSecurity />);

    fireEvent.click(screen.getByRole("button", { name: "Revision 3" }));
    expect(screen.getByLabelText("Formal specification contains R₁, R₂, R₃, M₁")).toBeVisible();
    expect(screen.getByText("A ∪ B ∪ C")).toBeVisible();
    expect(screen.getByLabelText("The modeled flow reaches Context.eval")).toBeVisible();
  });
});
