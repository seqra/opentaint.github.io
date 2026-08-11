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
  CONSENT_REQUIRED_REGIONS,
  requiresConsent,
  resolveAnalyticsConsent,
  type ConsentChoice,
} from "./consent";
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
 * Resolve consent and start the tag. Idempotent, so any component may call it
 * without caring who got there first.
 *
 * The order is fixed and load-bearing: the defaults have to be complete before
 * the tag loads, because the first page_view goes out with whatever state is
 * declared by then. A remembered choice is part of those defaults rather than a
 * later update, and it drops the region scoping — their own answer governs
 * wherever they are.
 *
 * The tag then loads only where consent resolves to granted, so nothing
 * precedes an answer from someone we are about to ask, and nothing follows a
 * refusal. Where it does load, the region-scoped default stands guard: Google
 * resolves that from the request IP, so a visitor whose time zone misreported
 * where they are gets storage denied rather than measured.
 */
export function initConsent(): ConsentState {
  if (state) return state;

  const required = requiresConsent(detectTimeZone());
  const choice = readStoredChoice();
  state = { required, choice };

  const analytics = resolveAnalyticsConsent(choice, required);
  setDefaultConsent(analytics, choice ? undefined : CONSENT_REQUIRED_REGIONS);
  if (analytics === "granted") loadGoogleTag();

  return state;
}

export function getConsentState(): ConsentState {
  return state ?? initConsent();
}

/**
 * Record the visitor's answer, revising the consent state and starting the tag
 * if it was being withheld. Withdrawing clears the identifiers written while
 * consent stood — the tag may already be running, since only the visitors we
 * ask up front are made to wait for it.
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
