import { expect, test } from "@playwright/test";

// The CLI/terminal cast is no longer the default slide (the order is
// Agent, Viewer, CLI), so each test selects the CLI tab to mount the player.
const THEME_CLASS = /asciinema-player-theme-opentaint-(light|dark)/;

test.describe("landing page demo section", () => {
  test("hero cast renders with a theme class", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("tab", { name: "CLI" }).click();
    const hero = page.getByTestId("demo-hero-player");
    await hero.scrollIntoViewIfNeeded();
    await expect(hero).toBeVisible();
    // asciinema mounts inside the container and stamps the theme onto its player.
    await expect(hero.locator(".ap-player")).toHaveClass(THEME_CLASS);
  });

  test("theme toggle swaps the scan panel wrapper class", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("tab", { name: "CLI" }).click();
    const hero = page.getByTestId("demo-hero-player");
    await hero.scrollIntoViewIfNeeded();
    const player = hero.locator(".ap-player");
    await expect(player).toHaveClass(THEME_CLASS);

    const initial = (await player.getAttribute("class")) ?? "";
    const initialIsDark = initial.includes("asciinema-player-theme-opentaint-dark");

    await page.locator("[data-theme-toggle]").first().click();

    await expect
      .poll(async () => (await player.getAttribute("class")) ?? "")
      .toContain(
        initialIsDark
          ? "asciinema-player-theme-opentaint-light"
          : "asciinema-player-theme-opentaint-dark",
      );
  });

  test("mobile layout fits the scan cast within the page without overflow", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await page.getByRole("tab", { name: "CLI" }).click();

    const hero = page.getByTestId("demo-hero-player");
    await hero.scrollIntoViewIfNeeded();
    await expect(hero).toBeVisible();
    // Wait for the player to lay out before measuring its width.
    await expect(hero.locator(".ap-player")).toHaveClass(THEME_CLASS);

    const viewportWidth = await page.evaluate(() => window.innerWidth);

    // The cast fills the content area symmetrically within the page gutters.
    const { left, width } = await hero.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { left: r.left, width: r.width };
    });
    expect(left).toBeGreaterThan(0);
    expect(left * 2 + width).toBeGreaterThanOrEqual(viewportWidth - 1);
    expect(left * 2 + width).toBeLessThanOrEqual(viewportWidth + 1);

    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth + 1);
  });
});
