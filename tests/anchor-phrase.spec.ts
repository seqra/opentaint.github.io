import { expect, test } from "@playwright/test";

test.describe("landing message", () => {
  test("leads with the open source engine position", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("The open source taint analysis engine for the AI era", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", {
      name: "Continuous, lean, and agentic application security testing",
      level: 1,
    })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Five-minute quickstart" })).toBeVisible();
    await expect(page.getByText("Run your first agentic application security test in 5 minutes", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Run deep security scan and static triage with OpenTaint appsec-agent skill", { exact: true })).toBeVisible();
  });

  test("frames the product proof with the real Conductor review", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "How OpenTaint found CVE-2026-58138" })).toBeVisible();
    await expect(page.getByText("What works once must keep working")).toHaveCount(0);
    await expect(page.getByText("One review versus continuous use")).toHaveCount(0);
  });

  test("highlights the learn-search operating model", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("Security risk and review cost compound with every change", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Turn one security review into unlimited security scans", level: 2 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Fast scans. Fewer false alarms. Fewer missed findings" })).toHaveCount(0);
    await expect(page.getByText("Open source, batteries included", { exact: true })).toBeVisible();
    await expect(page.getByText(/symbolic execution/i)).toHaveCount(0);
  });

  test("shows formal coverage accumulating across reviews", async ({ page }) => {
    await page.goto("/");

    const comparison = page.getByRole("region", {
      name: "Turn one security review into unlimited security scans",
    });
    const continuous = comparison.getByRole("button", { name: /Continuous/ });
    await continuous.scrollIntoViewIfNeeded();
    await expect(continuous).toBeVisible();
    await expect(continuous.locator("xpath=ancestor::astro-island")).not.toHaveAttribute("ssr", "");
    await continuous.click();

    await expect(comparison.getByRole("heading", { name: "Review the change. Scan the whole project" })).toBeVisible();
    await expect(comparison.getByLabel("Whole project with new code with attached formal specification R₁, R₂", { exact: true })).toBeVisible();
    await expect(comparison.locator("[aria-live='polite']")).toContainText("Report₂ ⊇ Review₁ ∪ Review₂");
  });

  test("groups the landing sections with intentional dividers and backgrounds", async ({ page }) => {
    await page.goto("/");

    const styles = await page.evaluate(() => {
      const section = (id: string) => document.getElementById(id)?.closest("section") as HTMLElement;
      const continuous = section("continuous-security-heading");
      const realWorld = section("what-heading");
      const engine = section("proof-heading");
      const skills = section("agent-skills-heading");

      return {
        continuousDivider: getComputedStyle(continuous, "::before").content,
        continuousBackground: getComputedStyle(continuous).backgroundColor,
        realWorldBackground: getComputedStyle(realWorld).backgroundColor,
        engineBackground: getComputedStyle(engine).backgroundColor,
        skillsBackground: getComputedStyle(skills).backgroundColor,
        skillsDivider: getComputedStyle(skills, "::before").content,
      };
    });

    expect(styles.continuousDivider).not.toBe("none");
    expect(styles.realWorldBackground).not.toBe(styles.continuousBackground);
    expect(styles.engineBackground).toBe(styles.skillsBackground);
    expect(styles.skillsDivider).toBe("none");
  });
});
