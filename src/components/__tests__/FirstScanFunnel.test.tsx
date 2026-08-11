import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FirstScanFunnel } from "../FirstScanFunnel";

describe("FirstScanFunnel", () => {
  it("shows the complete five-minute path", () => {
    render(<FirstScanFunnel />);

    expect(screen.getByRole("heading", { name: "Five-minute quickstart" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Install OpenTaint with builtin rules and models" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Install AppSec agent skills" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Prompt your agent to write custom rules and models, then run an OpenTaint scan with them" })).toBeVisible();
    expect(screen.queryByText("Run your first agentic application security test in 5 minutes")).not.toBeInTheDocument();
    expect(screen.getByText("npm install -g @seqra/opentaint")).toBeVisible();
    expect(screen.getByText("npx skills add https://github.com/seqra/opentaint")).toBeVisible();
    expect(screen.getByText("Run deep security scan and static triage with appsec-agent skill")).toBeVisible();
    expect(screen.getByText("Open source, batteries included")).toBeVisible();
    expect(screen.queryByText(/Engine, rules, dependency models/)).not.toBeInTheDocument();
  });

  it("changes the OpenTaint installation method independently", () => {
    render(<FirstScanFunnel />);

    fireEvent.click(screen.getByRole("button", { name: "curl" }));
    expect(screen.getByText("curl -fsSL https://opentaint.org/install.sh | bash")).toBeVisible();
    expect(screen.getByText("npx skills add https://github.com/seqra/opentaint")).toBeVisible();
  });

  it("keeps every command directly copyable", () => {
    render(<FirstScanFunnel />);

    expect(screen.getByRole("button", { name: "Copy OpenTaint install command by clicking command" })).toHaveTextContent("npm install -g @seqra/opentaint");
    expect(screen.getByRole("button", { name: "Copy skills install command by clicking command" })).toHaveTextContent("npx skills add");
    expect(screen.getByRole("button", { name: "Copy first security-review prompt by clicking command" })).toHaveTextContent("Run deep security scan");
  });
});
