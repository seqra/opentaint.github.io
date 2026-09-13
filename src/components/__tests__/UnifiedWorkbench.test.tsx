import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UnifiedWorkbench } from "../UnifiedWorkbench";

beforeEach(() => {
  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));
  vi.stubGlobal("scrollTo", vi.fn());
  Element.prototype.scrollTo = vi.fn();
});

describe("UnifiedWorkbench", () => {
  it("starts with a focused discovery output and no agent transcript", () => {
    render(<UnifiedWorkbench />);

    expect(screen.queryByLabelText("Coding agent session")).not.toBeInTheDocument();
    expect(screen.getByText("Informal security knowledge")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Unauthenticated execution review" })).toBeVisible();
    expect(screen.queryByText(/Conductor/i)).toBeNull();
    expect(screen.queryByText(/3\.23\.0/)).toBeNull();
  });

  it("uses the stage navigation to move through the analysis outputs", () => {
    render(<UnifiedWorkbench />);

    fireEvent.click(screen.getByRole("button", { name: "Enact" }));
    expect(screen.getByText("rules/java/security/graaljs-code-injection.yaml")).toBeVisible();
    expect(screen.getByText("model/org.graalvm.polyglot.yaml")).toBeVisible();

    const sinkArtifact = screen.getByRole("button", { name: /rules\/java\/lib\/generic\/graal-eval\.yaml/ });
    expect(sinkArtifact).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(sinkArtifact);
    expect(sinkArtifact).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(screen.getByRole("button", { name: "Scan" }));
    expect(screen.getByTestId("scan-results-view")).toBeVisible();
    expect(screen.getByText("Fast scans", { exact: true })).toBeVisible();
    expect(screen.getByText("2 candidate findings")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Triage" }));
    expect(screen.getByText("Fewer false alarms")).toBeVisible();
    expect(screen.getByText("rules/java/lib/generic/graal-eval.yaml")).toBeVisible();
    expect(within(screen.getByTestId("triage-view")).getByText(/pattern-inside/)).toBeVisible();
    expect(within(screen.getByTestId("triage-view")).getByText("FALSE ALARMS")).toBeVisible();
    expect(within(screen.getByTestId("triage-view")).getByText("0")).toBeVisible();
    expect(within(screen.getByTestId("triage-view")).queryByText("PreviewRenderer.java:11")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Report" }));
    const report = screen.getByTestId("simplified-report-view");
    expect(report).toBeVisible();
    expect(screen.getByText("Detailed dataflow trace", { exact: true })).toBeVisible();
    expect(screen.getByText("Formal proof of how untrusted data reaches the vulnerable operation.", { exact: true })).toBeVisible();
    expect(within(report).queryByRole("tablist")).not.toBeInTheDocument();
    expect(within(report).getByText("JobController.java")).toBeVisible();
    expect(within(report).getByRole("img", { name: /Dataflow trace progress: HTTP INPUT, step 1 of 10/ })).toBeVisible();
    expect(screen.getByText('Method entry marks the 1st argument of "submit" as $UNTRUSTED')).toBeVisible();
    expect(screen.getByRole("button", { name: "First step" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Last step" }));
    expect(within(report).getByText("10/10")).toBeVisible();
    expect(within(report).getByRole("status")).toHaveTextContent("Step 10 of 10");
    expect(within(report).getByText("ScriptRuntime.java")).toBeVisible();
    expect(within(report).getByRole("img", { name: /Dataflow trace progress: EVAL, step 10 of 10/ })).toBeVisible();
    expect(within(report).queryByText("JobController.java")).not.toBeInTheDocument();
    expect(screen.getByText(/Untrusted HTTP input reaches a host-enabled GraalVM/)).toBeVisible();
    expect(screen.queryByText(/3\.23\.0/)).toBeNull();
  });

  it("keeps the sticky visual focused on product output", () => {
    render(<UnifiedWorkbench />);

    expect(screen.queryByLabelText("Agent transcript")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Discover output")).toBeVisible();
    expect(screen.getByLabelText("Demo steps")).toBeVisible();
  });

});
