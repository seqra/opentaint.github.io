import { expect, test, type Page } from "@playwright/test";
import { CONSENT_STORAGE_KEY } from "../src/lib/consent";

/** Any Google measurement traffic: the tag loader itself and its collect hits. */
const GOOGLE_TAG = /googletagmanager\.com|google-analytics\.com/;

function recordTagRequests(page: Page): string[] {
  const hits: string[] = [];
  page.on("request", (request) => {
    if (GOOGLE_TAG.test(request.url())) hits.push(request.url());
  });
  return hits;
}

function storedChoice(page: Page) {
  return page.evaluate((key) => localStorage.getItem(key), CONSENT_STORAGE_KEY);
}

/*
 * The footer entry point sits at the very bottom of the page, underneath the
 * Astro dev toolbar when these run against `astro dev`. Drop that overlay —
 * it does not exist in a production build — so the click reaches the button.
 */
async function openConsentSettings(page: Page) {
  await page.evaluate(() => document.querySelector("astro-dev-toolbar")?.remove());
  await page.getByRole("button", { name: "Cookie settings" }).click();
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

      await expect.poll(() => storedChoice(page)).toBe("denied");

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
      await expect.poll(() => storedChoice(page)).toBe("granted");
    });
  });

  test.describe("non-EU visitor", () => {
    test.use({ timezoneId: "America/New_York" });

    test("sees no banner and is measured by default", async ({ page }) => {
      const hits = recordTagRequests(page);

      await page.goto("/");
      await expect(page.locator("#consent-banner")).toBeHidden();

      // The tag loads on page load here, so poll the recorded requests rather
      // than waiting for one that has most likely already fired.
      await expect.poll(() => hits.some((url) => url.includes("/g/collect")), {
        timeout: 15_000,
      }).toBe(true);
    });
  });

  test.describe("withdrawing consent", () => {
    test.use({ timezoneId: "America/New_York" });

    test("the footer reopens the bar, and declining clears the analytics cookies", async ({ page }) => {
      await page.goto("/");

      // Measured by default here, so GA has had a chance to set its cookies.
      await expect
        .poll(async () => (await page.context().cookies()).some((c) => c.name.startsWith("_ga")), {
          timeout: 15_000,
        })
        .toBe(true);

      const banner = page.locator("#consent-banner");
      await expect(banner).toBeHidden();

      await openConsentSettings(page);
      await expect(banner).toBeVisible();

      await banner.getByRole("button", { name: "Decline" }).click();
      await expect(banner).toBeHidden();
      await expect.poll(() => storedChoice(page)).toBe("denied");

      await expect
        .poll(async () => (await page.context().cookies()).filter((c) => c.name.startsWith("_ga")))
        .toEqual([]);
    });

    test("the choice survives a reload", async ({ page }) => {
      await page.goto("/");
      await openConsentSettings(page);
      await page.locator("#consent-banner").getByRole("button", { name: "Decline" }).click();

      const hits = recordTagRequests(page);
      await page.reload();
      await page.waitForTimeout(2000);
      expect(hits, "a withdrawn consent stays withdrawn").toHaveLength(0);
    });
  });
});
