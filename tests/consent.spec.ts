import { expect, test, type Page } from "@playwright/test";

/** Any Google measurement traffic: the tag loader itself and its collect hits. */
const GOOGLE_TAG = /googletagmanager\.com|google-analytics\.com/;

const STORAGE_KEY = "opentaint:analytics-consent";

function recordTagRequests(page: Page): string[] {
  const hits: string[] = [];
  page.on("request", (request) => {
    if (GOOGLE_TAG.test(request.url())) hits.push(request.url());
  });
  return hits;
}

test.describe("analytics consent", () => {
  test.describe("EU visitor", () => {
    test.use({ timezoneId: "Europe/Berlin" });

    test("sees the banner, and the tag stays unloaded until they accept", async ({ page }) => {
      const hits = recordTagRequests(page);

      await page.goto("/");
      const banner = page.locator("#consent-banner");
      await expect(banner).toBeVisible();

      await page.waitForTimeout(2000);
      expect(hits, "nothing reaches Google before a choice").toHaveLength(0);

      await banner.getByRole("button", { name: "Accept" }).click();
      await expect(banner).toBeHidden();

      await page.waitForRequest((request) => GOOGLE_TAG.test(request.url()), { timeout: 15_000 });
      expect(hits.length).toBeGreaterThan(0);
    });

    test("declining sends nothing, on this load or the next", async ({ page }) => {
      const hits = recordTagRequests(page);

      await page.goto("/");
      const banner = page.locator("#consent-banner");
      await banner.getByRole("button", { name: "Decline" }).click();
      await expect(banner).toBeHidden();

      await expect
        .poll(() => page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY))
        .toBe("denied");

      await page.reload();
      await expect(banner).toBeHidden();
      await page.waitForTimeout(2000);
      expect(hits).toHaveLength(0);
    });

    test("remembers acceptance across reloads", async ({ page }) => {
      await page.goto("/");
      await page.locator("#consent-banner").getByRole("button", { name: "Accept" }).click();

      await page.reload();
      await expect(page.locator("#consent-banner")).toBeHidden();
      await expect
        .poll(() => page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY))
        .toBe("granted");
    });
  });

  test.describe("non-EU visitor", () => {
    test.use({ timezoneId: "America/New_York" });

    test("sees no banner and is measured by default", async ({ page }) => {
      const hits = recordTagRequests(page);

      await page.goto("/");
      await expect(page.locator("#consent-banner")).toBeHidden();

      // The tag loads during head parsing here, so poll the recorded requests
      // rather than waiting for one that has most likely already fired.
      await expect.poll(() => hits.some((url) => url.includes("/g/collect")), {
        timeout: 15_000,
      }).toBe(true);
    });
  });
});
