import { expect, test } from "@playwright/test";

test.describe("landing page demo section", () => {
  test("hero cast renders with a theme class", async ({ page }) => {
    await page.goto("/");
    const hero = page.getByTestId("demo-hero-player");
    await hero.scrollIntoViewIfNeeded();
    await expect(hero).toBeVisible();
    const cls = (await hero.getAttribute("class")) ?? "";
    expect(cls).toMatch(/ap-theme-opentaint-(light|dark)/);
  });

  test("theme toggle swaps the scan panel wrapper class", async ({ page }) => {
    await page.goto("/");
    const hero = page.getByTestId("demo-hero-player");
    await hero.scrollIntoViewIfNeeded();

    const initial = (await hero.getAttribute("class")) ?? "";
    const initialIsDark = initial.includes("ap-theme-opentaint-dark");

    await page.locator("[data-theme-toggle]").first().click();

    await expect
      .poll(async () => (await hero.getAttribute("class")) ?? "")
      .toContain(
        initialIsDark ? "ap-theme-opentaint-light" : "ap-theme-opentaint-dark",
      );
  });

  test("mobile layout shows the scan cast edge-to-edge", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");

    const hero = page.getByTestId("demo-hero-player");
    await hero.scrollIntoViewIfNeeded();
    await expect(hero).toBeVisible();

    const viewportWidth = await page.evaluate(() => window.innerWidth);

    const heroWidth = await hero.evaluate((el) => el.getBoundingClientRect().width);
    expect(heroWidth).toBeGreaterThanOrEqual(viewportWidth - 1);

    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth + 1);
  });
});
