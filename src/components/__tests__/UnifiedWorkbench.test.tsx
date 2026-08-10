import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UnifiedWorkbench } from "../UnifiedWorkbench";

vi.mock("../TerminalDemo", () => ({
  TerminalDemo: () => <div data-testid="demo-hero-player">OpenTaint CLI</div>,
}));

beforeEach(() => {
  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));
  vi.stubGlobal("IntersectionObserver", undefined);
});

describe("UnifiedWorkbench", () => {
  it("opens as an agent review rather than a media carousel", () => {
    const { container } = render(<UnifiedWorkbench />);

    expect(screen.getByText("Review Conductor 3.23.0 for unauthenticated code execution.")).toBeVisible();
    expect(screen.getByText("ScriptEvaluator.java", { exact: true })).toBeVisible();
    expect(container.querySelector("video")).toBeNull();
  });

  it("shows the CLI invocation within the agent run", () => {
    render(<UnifiedWorkbench />);

    fireEvent.click(screen.getByRole("button", { name: "Running OpenTaint" }));
    expect(screen.getByTestId("demo-hero-player")).toBeVisible();
  });

  it("shows the produced rule, model, and report", () => {
    render(<UnifiedWorkbench />);

    fireEvent.click(screen.getByRole("button", { name: "Writing security specifications" }));
    expect(screen.getByText("graalvm-polyglot-eval.yaml")).toBeVisible();
    expect(screen.getByText("org.graalvm.polyglot.yaml")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Opening finding" }));
    expect(screen.getByTitle("Interactive OpenTaint vulnerability report")).toHaveAttribute(
      "src",
      "/reports/conductor-cve-2026-58138.html",
    );
  });
});
