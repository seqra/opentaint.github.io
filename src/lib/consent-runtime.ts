/**
 * Wires the consent policy to the Google tag.
 *
 * Every component imports this module rather than reaching for a global, so
 * they share one instance and one state regardless of which script the bundler
 * runs first.
 */
import {
  clearAnalyticsCookies,
  loadGoogleTag,
  setDefaultConsent,
  updateAnalyticsConsent,
} from "./analytics";
import {
  shouldShowCookieNotice,
  resolveAnalyticsConsent,
  type ConsentChoice,
} from "./consent";
import { detectTimeZone, readStoredChoice, storeChoice } from "./consent-storage";

export type ConsentState = {
  /** Whether this visitor should receive the first-visit cookie notice. */
  readonly noticeRequired: boolean;
  /** What they have chosen, if anything. */
  readonly choice: ConsentChoice | null;
};

const REOPEN_EVENT = "opentaint:consent-reopen";

let state: ConsentState | null = null;

/**
 * Resolve consent and start the tag. Idempotent, so any component may call it
 * without caring who got there first.
 *
 * The order is fixed and load-bearing: the preference default is declared
 * before the tag loads, so the first page view respects a remembered opt-out.
 * With no preference Analytics starts enabled everywhere. The regional signal
 * now controls disclosure only, not collection.
 */
export function initConsent(): ConsentState {
  if (state) return state;

  const noticeRequired = shouldShowCookieNotice(detectTimeZone());
  const choice = readStoredChoice();
  state = { noticeRequired, choice };

  const analytics = resolveAnalyticsConsent(choice);
  setDefaultConsent(analytics);
  if (analytics === "granted") loadGoogleTag();

  return state;
}

export function getConsentState(): ConsentState {
  return state ?? initConsent();
}

/**
 * Record the visitor's answer, revising the consent state and starting the tag
 * if it was being withheld. Withdrawing clears the identifiers written while
 * consent stood — the tag may already be running because Analytics is enabled
 * by default until a visitor opts out.
 */
export function setConsentChoice(next: ConsentChoice): void {
  storeChoice(next);
  state = { ...getConsentState(), choice: next };

  updateAnalyticsConsent(next);
  if (next === "granted") loadGoogleTag();
  else clearAnalyticsCookies();
}

/** Ask the consent bar to show itself again, so a choice can be revised. */
export function requestConsentReopen(): void {
  window.dispatchEvent(new CustomEvent(REOPEN_EVENT));
}

export function onConsentReopen(listener: () => void): void {
  window.addEventListener(REOPEN_EVENT, listener);
}
