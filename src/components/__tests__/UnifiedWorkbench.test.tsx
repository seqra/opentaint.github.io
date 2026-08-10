import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UnifiedWorkbench } from "../UnifiedWorkbench";

beforeEach(() => {
  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));
  vi.stubGlobal("IntersectionObserver", undefined);
});

describe("UnifiedWorkbench", () => {
  it("opens as an agent review rather than a media carousel", () => {
    const { container } = render(<UnifiedWorkbench />);

    expect(screen.getByText("Review this application for exploitable vulnerabilities.")).toBeVisible();
    expect(screen.getByText("MarketingTemplateService.java", { exact: true })).toBeVisible();
    expect(container.querySelector("video")).toBeNull();
  });

  it("shows the CLI invocation within the agent run", () => {
    render(<UnifiedWorkbench />);

    fireEvent.click(screen.getByRole("button", { name: "Running OpenTaint" }));
    expect(screen.getByText(/opentaint scan/)).toBeVisible();
    expect(screen.getByText("Scan completed in 8.4s")).toBeVisible();
  });

  it("shows the produced rule, model, and report", () => {
    render(<UnifiedWorkbench />);

    fireEvent.click(screen.getByRole("button", { name: "Writing security specifications" }));
    expect(screen.getByText("server-side-template-injection.yaml")).toBeVisible();
    expect(screen.getByText("org.thymeleaf.yaml")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Opening finding" }));
    expect(screen.getByRole("link", { name: "Open the OpenTaint report viewer" })).toBeVisible();
  });
});
