/**
 * The Google tag, expressed as a handful of verbs. Nothing here decides whether
 * measurement is allowed — that is the consent domain's job; this module only
 * knows how to speak to gtag.js.
 */
import type { ConsentChoice } from "./consent";

/** Google Analytics 4 measurement ID for opentaint.org. */
export const GA_MEASUREMENT_ID = "G-7412RN2Q85";

export const GA_TAG_URL = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;

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

/**
 * Declare the starting consent state. Ads stay denied unconditionally: this
 * site runs no advertising and never asks for it.
 */
export function setDefaultConsent(analytics: ConsentChoice): void {
  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: analytics,
  });
}

/** Revise the consent state after the visitor answers. */
export function updateAnalyticsConsent(next: ConsentChoice): void {
  gtag("consent", "update", { analytics_storage: next });
}

let tagRequested = false;

/** Whether gtag.js has been put on the page during this page view. */
export function isGoogleTagLoaded(): boolean {
  return tagRequested;
}

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
  const domains = [undefined, location.hostname, `.${location.hostname}`];

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
