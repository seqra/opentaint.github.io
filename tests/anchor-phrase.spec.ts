import { expect, test } from "@playwright/test";

test.describe("landing message", () => {
  test("leads with the review-to-scan promise", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", {
      name: "Turn one security review into unlimited security scans",
      level: 1,
    })).toBeVisible();
    await expect(page.getByText(
      "The flexibility of agent reasoning and the consistency of formal analysis combined",
      { exact: true },
    )).toBeVisible();
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
  });
});
