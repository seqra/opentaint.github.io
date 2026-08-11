import { expect, test } from "@playwright/test";

test.describe("landing message", () => {
  test("leads with the open source engine position", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("The open source taint analysis engine for the AI era", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", {
      name: "Continuous, lean, and agentic application security testing",
      level: 1,
    })).toBeVisible();
  });

  test("frames the product proof with the real Conductor review", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "How OpenTaint Agent found CVE-2026-58138" })).toBeVisible();
    await expect(page.getByText("What works once must keep working")).toHaveCount(0);
    await expect(page.getByText("One review versus continuous use")).toHaveCount(0);
  });

  test("highlights the learn-search operating model", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Turn one security review into unlimited security scans", level: 2 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Fast scans. Fewer false alarms. Fewer missed findings" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Open source, batteries included" })).toBeVisible();
    await expect(page.getByText(/symbolic execution/i)).toHaveCount(0);
  });

  test("shows formal coverage accumulating across reviews", async ({ page }) => {
    await page.goto("/");

    const comparison = page.getByRole("region", {
      name: "Turn one security review into unlimited security scans",
    });
    const revision = comparison.getByRole("button", { name: "Revision 3" });
    await revision.scrollIntoViewIfNeeded();
    await expect(revision).toBeVisible();
    await expect(revision.locator("xpath=ancestor::astro-island")).not.toHaveAttribute("ssr", "");
    await revision.click();

    await expect(comparison.getByLabel("Formal specification contains R₁, R₂, R₃, M₁")).toBeVisible();
    await expect(comparison.getByLabel("The formal specification is applied by taint analysis")).toBeVisible();
    await expect(comparison.locator("[aria-live='polite']")).toContainText("A ∪ B ∪ C");
  });
});
