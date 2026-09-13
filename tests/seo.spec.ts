import { expect, test } from "@playwright/test";

test.describe("search and answer-engine pages", () => {
  test("keeps the landing focused while retaining the taint-analysis FAQ", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle("OpenTaint: Continuous Vulnerability Checks from Security Reviews");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://opentaint.org/");
    await expect(page.getByRole("heading", { level: 2, name: "FAQ" })).toBeVisible();
    await expect(page.getByRole("button", { name: "What is taint analysis?" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "What is taint analysis?" })).toHaveCount(0);
  });
});
