import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ContinuousSecurity } from "../ContinuousSecurity";

beforeEach(() => {
  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));
});

describe("ContinuousSecurity", () => {
  it("leads with the reusable-scan promise", () => {
    render(<ContinuousSecurity />);

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Turn one security review into unlimited security scans");
    expect(screen.getByText("The flexibility of agent reasoning and the consistency of formal analysis combined")).toBeVisible();
  });

  it("uses the review and scan operating model", () => {
    render(<ContinuousSecurity />);

    expect(screen.getByText("Security agent")).toBeVisible();
    expect(screen.getByText("Taint analysis engine")).toBeVisible();
    expect(screen.getByText("Formal inter-procedural dataflow analysis")).toBeVisible();
    expect(screen.getByText("Taint rules and dependency models")).toBeVisible();
  });

  it("contrasts repeated agent review with a stable formal scan", () => {
    render(<ContinuousSecurity />);

    fireEvent.click(screen.getByRole("button", { name: "Same review" }));
    expect(screen.getByText("28k tokens")).toBeVisible();
    expect(screen.getByText("unchanged")).toBeVisible();
    expect(screen.getByText("0 model tokens")).toBeVisible();
  });

  it("accumulates enacted coverage across revisions", () => {
    render(<ContinuousSecurity />);

    fireEvent.click(screen.getByRole("button", { name: "Revision 3" }));
    expect(screen.getByLabelText("Formal specification contains R₁, R₂, R₃, M₁")).toBeVisible();
    expect(screen.getByText("A ∪ B ∪ C")).toBeVisible();
    expect(screen.getByLabelText("The formal specification is applied by taint analysis")).toBeVisible();
  });
});
