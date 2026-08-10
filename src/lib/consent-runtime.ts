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
 * Advanced consent mode, so the order is fixed and load-bearing: the defaults
 * have to be complete before the tag loads, because the first page_view goes
 * out with whatever state is declared by then. A remembered choice is part of
 * those defaults rather than a later update, and it drops the region scoping —
 * their own answer governs wherever they are.
 */
export function initConsent(): ConsentState {
  if (state) return state;

  const required = requiresConsent(detectTimeZone());
  const choice = readStoredChoice();
  state = { required, choice };

  setDefaultConsent(
    resolveAnalyticsConsent(choice, required),
    choice ? undefined : CONSENT_REQUIRED_REGIONS,
  );
  loadGoogleTag();

  return state;
}

export function getConsentState(): ConsentState {
  return state ?? initConsent();
}

/**
 * Record the visitor's answer. The tag is already running either way, so this
 * revises what it may store; withdrawing also clears the identifiers written
 * while consent stood.
 */
export function setConsentChoice(next: ConsentChoice): void {
  storeChoice(next);
  state = { ...getConsentState(), choice: next };

  updateAnalyticsConsent(next);
  if (next === "denied") clearAnalyticsCookies();
}

/** Ask the consent bar to show itself again, so a choice can be revised. */
export function requestConsentReopen(): void {
  window.dispatchEvent(new CustomEvent(REOPEN_EVENT));
}

export function onConsentReopen(listener: () => void): void {
  window.addEventListener(REOPEN_EVENT, listener);
}
