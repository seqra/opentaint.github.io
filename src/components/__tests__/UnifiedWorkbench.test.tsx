import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UnifiedWorkbench } from "../UnifiedWorkbench";

vi.mock("../TerminalDemo", () => ({
  TerminalDemo: () => <div data-testid="demo-hero-player">OpenTaint CLI</div>,
}));

beforeEach(() => {
  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));
  vi.stubGlobal("scrollTo", vi.fn());
  Element.prototype.scrollTo = vi.fn();
});

describe("UnifiedWorkbench", () => {
  it("starts with a versionless security-review request and review report", () => {
    render(<UnifiedWorkbench />);

    expect(screen.getByText("Review this application for unauthenticated code execution and write a security review report.")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Unauthenticated script execution" })).toBeVisible();
    expect(screen.queryByText(/Conductor/i)).toBeNull();
    expect(screen.queryByText(/3\.23\.0/)).toBeNull();
  });

  it("uses the stage navigation to time-travel through one agent transcript", () => {
    render(<UnifiedWorkbench />);

    fireEvent.click(screen.getByRole("button", { name: "Enact" }));
    expect(screen.getByText("rules/java/security/graaljs-code-injection.yaml")).toBeVisible();
    expect(screen.getByText("model/org.graalvm.polyglot.yaml")).toBeVisible();

    const sinkArtifact = screen.getByRole("button", { name: /rules\/java\/lib\/generic\/graal-eval\.yaml/ });
    expect(sinkArtifact).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(sinkArtifact);
    expect(sinkArtifact).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(screen.getByRole("button", { name: "Scan" }));
    expect(screen.getByTestId("demo-hero-player")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Report" }));
    expect(screen.getByTestId("simplified-report-view")).toBeVisible();
    expect(screen.getByText('Method entry marks the 1st argument of "submit" as $UNTRUSTED')).toBeVisible();
    expect(screen.getByRole("button", { name: "First step" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Last step" }));
    expect(screen.getByText("ScriptRuntime.java")).toBeVisible();
    expect(screen.getByText(/Untrusted HTTP input reaches a host-enabled GraalVM/)).toBeVisible();
    expect(screen.queryByText(/3\.23\.0/)).toBeNull();
  });

  it("shows the scan and summary commands in the agent session", () => {
    render(<UnifiedWorkbench />);

    expect(screen.getAllByText("opentaint scan", { exact: false }).length).toBeGreaterThan(0);
    expect(screen.getByText(/opentaint summary results\/report\.sarif/)).toBeInTheDocument();
    expect(screen.getByText(/--show-findings --verbose-flow --show-code-snippets/)).toBeInTheDocument();
  });
});
