/**
 * The Google tag, expressed as a handful of verbs. Nothing here decides whether
 * measurement is allowed — that is the consent domain's job; this module only
 * knows how to speak to gtag.js.
 */
import type { ConsentChoice } from "./consent";

/** Google Analytics 4 measurement ID for opentaint.org. */
const GA_MEASUREMENT_ID = "G-7412RN2Q85";

const GA_TAG_URL = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;

/** Cookie prefixes gtag.js sets, cleared when consent is withdrawn. `_ga`
 *  covers both the client id and the per-property `_ga_<id>` session cookie. */
const GA_COOKIE_PREFIXES = ["_ga", "_gid"];

type DataLayer = IArguments[];

function dataLayer(): DataLayer {
  const scope = window as Window & { dataLayer?: DataLayer };
  scope.dataLayer = scope.dataLayer || [];
  return scope.dataLayer;
}

/**
 * The gtag shim. Declared as a function expression so the body can push the
 * real `arguments` object, which is what gtag.js expects to find on the queue,
 * while callers still get a typed variadic signature.
 */
export const gtag: (...args: unknown[]) => void = function () {
  // eslint-disable-next-line prefer-rest-params
  dataLayer().push(arguments);
};

const DENY_ADS = {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
} as const;

/**
 * Declare the starting consent state, before the tag loads. Everything the tag
 * sends afterwards carries this state, so it has to be the final answer for
 * this page view — an update arriving later applies only to subsequent hits.
 *
 * `regions` adds the region-scoped default that Google's advanced consent mode
 * prescribes, denying storage across the countries listed. Google resolves it
 * from the request IP, so it still covers a visitor our own region check waved
 * through. Pass it only when the answer is genuinely unknown: for a visitor who
 * has already chosen, their choice governs everywhere, and a region default
 * would override it — region entries win over the general one.
 *
 * Ads stay denied unconditionally — this site runs no advertising — so ads data
 * is redacted too.
 */
export function setDefaultConsent(analytics: ConsentChoice, regions?: readonly string[]): void {
  gtag("set", "ads_data_redaction", true);

  if (regions?.length) {
    gtag("consent", "default", {
      ...DENY_ADS,
      analytics_storage: "denied",
      region: regions,
    });
  }

  gtag("consent", "default", {
    ...DENY_ADS,
    analytics_storage: analytics,
  });
}

/** Revise the consent state after the visitor answers. */
export function updateAnalyticsConsent(next: ConsentChoice): void {
  gtag("consent", "update", { analytics_storage: next });
}

let tagRequested = false;

/** Load gtag.js and configure the property. Idempotent. */
export function loadGoogleTag(): void {
  if (tagRequested) return;
  tagRequested = true;

  gtag("js", new Date());
  gtag("config", GA_MEASUREMENT_ID);

  const script = document.createElement("script");
  script.async = true;
  script.src = GA_TAG_URL;
  document.head.appendChild(script);
}

/**
 * Expire the analytics cookies already set. Consent withdrawn has to mean the
 * identifiers go too, not merely that no new ones are written.
 */
export function clearAnalyticsCookies(): void {
  /* Host-only, as set on localhost, and domain-scoped, as gtag.js sets them on
     the live site. A leading dot is the only form worth sending: browsers
     normalise it, so `domain=x` and `domain=.x` delete the same cookie. */
  const domains = [undefined, `.${location.hostname}`];

  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0]?.trim();
    if (!name || !GA_COOKIE_PREFIXES.some((prefix) => name.startsWith(prefix))) continue;

    for (const domain of domains) {
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${
        domain ? `; domain=${domain}` : ""
      }`;
    }
  }
}
