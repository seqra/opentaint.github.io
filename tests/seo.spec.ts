import { expect, test } from "@playwright/test";

test.describe("search and answer-engine pages", () => {
  test("renders the taint-analysis answer and internal guide link in the landing HTML", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle("OpenTaint: Continuous Vulnerability Checks from Security Reviews");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://opentaint.org/");
    await expect(page.getByRole("heading", { level: 2, name: "What is taint analysis?" })).toBeVisible();
    await expect(page.getByText(/Every security review becomes reusable vulnerability coverage/)).toBeVisible();
    await expect(page.getByRole("link", { name: "Read the taint analysis guide" })).toHaveAttribute("href", "/taint-analysis/");
  });

  test("publishes a focused, canonical taint-analysis guide", async ({ page }) => {
    await page.goto("/taint-analysis/");

    await expect(page).toHaveTitle("What Is Taint Analysis? Taint Flow & SAST Guide | OpenTaint");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://opentaint.org/taint-analysis/");
    await expect(page.getByRole("heading", { level: 1, name: "What is taint analysis?" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Analysis depth determines what a tool can find" })).toBeVisible();

    const schemaTypes = await page.locator('script[type="application/ld+json"]').evaluateAll((scripts) =>
      scripts.map((script) => JSON.parse(script.textContent || "{}")?.["@type"]),
    );
    expect(schemaTypes).toEqual(["TechArticle", "BreadcrumbList", "FAQPage"]);
  });
});
