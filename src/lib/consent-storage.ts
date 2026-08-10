/**
 * Browser access behind the consent policy: reading the visitor's region signal
 * and persisting their choice. Split from `consent.ts` so the policy itself
 * stays pure, and so every failure mode of `Intl` and `localStorage` — private
 * mode, disabled storage, ancient engines — is handled in exactly one place.
 */
import { CONSENT_STORAGE_KEY, parseConsentChoice, type ConsentChoice } from "./consent";

/** The visitor's IANA time zone, or null where the engine will not say. */
export function detectTimeZone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
}

/** The persisted choice, or null if absent or unrecognised. */
export function readStoredChoice(): ConsentChoice | null {
  try {
    return parseConsentChoice(window.localStorage.getItem(CONSENT_STORAGE_KEY));
  } catch {
    return null;
  }
}

/** Persist a choice. Storage being unavailable downgrades to session-only. */
export function storeChoice(choice: ConsentChoice): void {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    /* private mode: the in-memory state still holds for this page view */
  }
}
