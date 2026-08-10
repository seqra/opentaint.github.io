import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { CONSENT_STORAGE_KEY } from "../src/lib/consent";

/*
 * Under advanced consent mode the tag loads for everyone, so what distinguishes
 * a consenting visitor from a refusing one is not whether Google is contacted
 * but what the contact says. Each measurement hit carries `gcs`, the consent
 * state gtag.js applied to it: G100 denies analytics storage, G101 allows it.
 * Cookies are the other half — denied storage must leave none behind.
 */
const COLLECT = /google-analytics\.com\/g\/collect/;
const DENIED = "G100";

type Signal = { gcs: string; event: string | null };

function recordConsentSignals(page: Page): Signal[] {
  const signals: Signal[] = [];
  page.on("request", (request) => {
    if (!COLLECT.test(request.url())) return;
    const params = new URL(request.url()).searchParams;
    const gcs = params.get("gcs");
    if (gcs) signals.push({ gcs, event: params.get("en") });
  });
  return signals;
}

/*
 * Assertions look at page_view hits. An engagement beacon queued while consent
 * still stood can flush afterwards carrying that older state — gtag.js decides
 * a hit's consent when it queues it, and we cannot recall one already in the
 * air. It writes nothing, since storage is denied by the time it lands, and the
 * next page view starts clean.
 */
function pageViews(signals: Signal[]): string[] {
  return signals.filter((s) => s.event === "page_view").map((s) => s.gcs);
}

function analyticsCookies(context: BrowserContext) {
  return context.cookies().then((cookies) => cookies.filter((c) => c.name.startsWith("_ga")));
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

    test("is measured with storage denied until they accept", async ({ page, context }) => {
      const signals = recordConsentSignals(page);

      await page.goto("/");
      await expect(page.locator("#consent-banner")).toBeVisible();

      await expect.poll(() => signals, { timeout: 15_000 }).not.toHaveLength(0);
      expect(signals.map((s) => s.gcs)).toEqual(signals.map(() => DENIED));
      expect(await analyticsCookies(context), "denied storage sets no cookies").toEqual([]);
    });

    test("accepting lets the tag store its identifiers", async ({ page, context }) => {
      await page.goto("/");
      const banner = page.locator("#consent-banner");
      await banner.getByRole("button", { name: "Accept" }).click();
      await expect(banner).toBeHidden();

      await expect
        .poll(async () => (await analyticsCookies(context)).map((c) => c.name), { timeout: 15_000 })
        .toContain("_ga");
      await expect.poll(() => storedChoice(page)).toBe("granted");
    });

    test("declining keeps storage denied across a reload", async ({ page, context }) => {
      await page.goto("/");
      const banner = page.locator("#consent-banner");
      await banner.getByRole("button", { name: "Decline" }).click();
      await expect(banner).toBeHidden();
      await expect.poll(() => storedChoice(page)).toBe("denied");

      const signals = recordConsentSignals(page);
      await page.reload();
      await expect(banner, "the answer is remembered, so no second ask").toBeHidden();

      await expect.poll(() => pageViews(signals), { timeout: 15_000 }).not.toHaveLength(0);
      expect(pageViews(signals)).toEqual(pageViews(signals).map(() => DENIED));
      expect(await analyticsCookies(context)).toEqual([]);
    });

    test("accepting is remembered across a reload", async ({ page }) => {
      await page.goto("/");
      await page.locator("#consent-banner").getByRole("button", { name: "Accept" }).click();

      await page.reload();
      await expect(page.locator("#consent-banner")).toBeHidden();
      await expect.poll(() => storedChoice(page)).toBe("granted");
    });
  });

  test.describe("non-EU visitor", () => {
    test.use({ timezoneId: "America/New_York" });

    test("sees no banner and is measured with storage allowed", async ({ page, context }) => {
      await page.goto("/");
      await expect(page.locator("#consent-banner")).toBeHidden();

      await expect
        .poll(async () => (await analyticsCookies(context)).map((c) => c.name), { timeout: 15_000 })
        .toContain("_ga");
    });
  });

  test.describe("withdrawing consent", () => {
    test.use({ timezoneId: "America/New_York" });

    test("the footer reopens the bar, and declining clears the cookies", async ({ page, context }) => {
      await page.goto("/");

      // Measured by default here, so the tag has had a chance to set cookies.
      await expect
        .poll(async () => (await analyticsCookies(context)).length, { timeout: 15_000 })
        .toBeGreaterThan(0);

      const banner = page.locator("#consent-banner");
      await expect(banner).toBeHidden();

      await openConsentSettings(page);
      await expect(banner).toBeVisible();

      await banner.getByRole("button", { name: "Decline" }).click();
      await expect(banner).toBeHidden();
      await expect.poll(() => storedChoice(page)).toBe("denied");
      await expect.poll(() => analyticsCookies(context)).toEqual([]);
    });

    test("the withdrawal survives a reload", async ({ page, context }) => {
      await page.goto("/");
      await openConsentSettings(page);
      await page.locator("#consent-banner").getByRole("button", { name: "Decline" }).click();
      await expect.poll(() => storedChoice(page)).toBe("denied");

      const signals = recordConsentSignals(page);
      await page.reload();

      await expect.poll(() => pageViews(signals), { timeout: 15_000 }).not.toHaveLength(0);
      expect(pageViews(signals)).toEqual(pageViews(signals).map(() => DENIED));
      expect(await analyticsCookies(context)).toEqual([]);
    });
  });
});
