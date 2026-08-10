/**
 * Wires the consent policy to the Google tag.
 *
 * Every component imports this module rather than reaching for a global, so
 * they share one instance and one state regardless of which script the bundler
 * runs first.
 */
import {
  clearAnalyticsCookies,
  isGoogleTagLoaded,
  loadGoogleTag,
  setDefaultConsent,
  updateAnalyticsConsent,
} from "./analytics";
import { requiresConsent, resolveAnalyticsConsent, type ConsentChoice } from "./consent";
import { detectTimeZone, readStoredChoice, storeChoice } from "./consent-storage";

export type ConsentState = {
  /** Whether this visitor must opt in before analytics may load. */
  readonly required: boolean;
  /** What they have chosen, if anything. */
  readonly choice: ConsentChoice | null;
};

const REOPEN_EVENT = "opentaint:consent-reopen";

let state: ConsentState | null = null;

/**
 * Resolve consent and start measurement if it is already allowed. Idempotent,
 * so any component may call it without caring who got there first.
 */
export function initConsent(): ConsentState {
  if (state) return state;

  const required = requiresConsent(detectTimeZone());
  const choice = readStoredChoice();
  state = { required, choice };

  const analytics = resolveAnalyticsConsent(choice, required);
  setDefaultConsent(analytics);
  if (analytics === "granted") loadGoogleTag();

  return state;
}

export function getConsentState(): ConsentState {
  return state ?? initConsent();
}

/**
 * Record the visitor's answer. Granting starts measurement; withdrawing stops
 * it and clears the identifiers already written.
 *
 * A tag already on the page cannot be taken back off it — gtag.js keeps sending
 * engagement beacons for the rest of the page view even with storage denied —
 * so withdrawing from a measured page reloads it. The stored choice then keeps
 * the tag off for good.
 */
export function setConsentChoice(next: ConsentChoice): void {
  storeChoice(next);
  state = { ...getConsentState(), choice: next };

  updateAnalyticsConsent(next);

  if (next === "granted") {
    loadGoogleTag();
    return;
  }

  const wasMeasuring = isGoogleTagLoaded();
  clearAnalyticsCookies();
  if (wasMeasuring) window.location.reload();
}

/** Ask the consent bar to show itself again, so a choice can be revised. */
export function requestConsentReopen(): void {
  window.dispatchEvent(new CustomEvent(REOPEN_EVENT));
}

export function onConsentReopen(listener: () => void): void {
  window.addEventListener(REOPEN_EVENT, listener);
}
