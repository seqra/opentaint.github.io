import { expect, test } from "@playwright/test";

const ANCHOR = "AST-pattern rules. Whole-program taint analysis.";

test.describe("anchor phrase distinction", () => {
  test("hero shows the anchor eyebrow above the H1", async ({ page }) => {
    await page.goto("/");
    const h1 = page.getByRole("heading", {
      name: /open source taint analysis engine for the AI era/i,
      level: 1,
    });
    await expect(h1).toBeVisible();
    const eyebrow = page.getByText(ANCHOR, { exact: true }).first();
    await expect(eyebrow).toBeVisible();
  });
});
