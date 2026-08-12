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
    expect(screen.getByText("Repeat the review. The findings change.")).toBeVisible();
    expect(screen.getByLabelText("Two model reviews of the same project return different findings")).toBeVisible();
  });

  it("contrasts model variability with deterministic formal analysis", () => {
    render(<ContinuousSecurity />);

    fireEvent.click(screen.getByRole("button", { name: /Searching/ }));
    expect(screen.getByRole("heading", { name: "The same inputs produce the same report" })).toBeVisible();
    expect(screen.getByText("Repeat the scan. The report stays the same.")).toBeVisible();
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
    expect(screen.getByText("The model learns new context. The engine searches the whole project.")).toBeVisible();
    expect(screen.getByLabelText("Formal specification R₁, R₂")).toBeVisible();
  });

  it("advances scenes from its internal scroll track", () => {
    render(<ContinuousSecurity />);

    const track = screen.getByLabelText("Scroll through the security review comparison");
    Object.defineProperty(track, "scrollHeight", { configurable: true, value: 1000 });
    Object.defineProperty(track, "clientHeight", { configurable: true, value: 200 });
    Object.defineProperty(track, "scrollTop", { configurable: true, writable: true, value: 400 });
    fireEvent.scroll(track);

    expect(screen.getByRole("heading", { name: "Search every new version without relearning the project" })).toBeVisible();
    expect(track.querySelector("[aria-hidden='true'] > span[style]")).toHaveStyle({ width: "49.99375%" });
  });
});
