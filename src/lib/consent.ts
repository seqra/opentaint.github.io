/**
 * Analytics preference and regional notice policy.
 *
 * The site is a static build served from GitHub Pages, so there is no
 * server-side geo header to read and no CMP vendor in the stack. The visitor's
 * IANA time zone is the closest signal available without adding a third party.
 *
 * The notice audience is deliberately over-inclusive: every `Europe/` zone
 * counts, including non-EU ones, plus EU/EEA territories outside that tree.
 * An undetectable time zone receives the notice as the safer fallback.
 */

export const CONSENT_STORAGE_KEY = "opentaint:analytics-consent";

export type ConsentChoice = "granted" | "denied";

const EUROPE_ZONE_PREFIX = "Europe/";

/**
 * EU/EEA/UK territories whose IANA zone is not under `Europe/`: Spanish and
 * Portuguese Atlantic islands, Ceuta, Cyprus, Iceland, and the French overseas
 * departments, which are part of the EU for GDPR purposes.
 */
export const COOKIE_NOTICE_TIME_ZONES: readonly string[] = [
  "Africa/Ceuta",
  "America/Cayenne",
  "America/Guadeloupe",
  "America/Martinique",
  "America/Miquelon",
  "Asia/Famagusta",
  "Asia/Nicosia",
  "Atlantic/Azores",
  "Atlantic/Canary",
  "Atlantic/Faroe",
  "Atlantic/Madeira",
  "Atlantic/Reykjavik",
  "Indian/Mayotte",
  "Indian/Reunion",
];

/** Whether a visitor in `timeZone` should see the first-visit cookie notice. */
export function shouldShowCookieNotice(timeZone: string | null | undefined): boolean {
  if (!timeZone) return true;
  return (
    timeZone.startsWith(EUROPE_ZONE_PREFIX) ||
    COOKIE_NOTICE_TIME_ZONES.includes(timeZone)
  );
}

/** Narrow a persisted value to a choice, discarding anything unrecognised. */
export function parseConsentChoice(
  value: string | null | undefined,
): ConsentChoice | null {
  return value === "granted" || value === "denied" ? value : null;
}

/**
 * Resolve the effective analytics permission. Analytics starts enabled when
 * no preference exists; an explicit opt-out always wins.
 */
export function resolveAnalyticsConsent(
  choice: ConsentChoice | null,
): ConsentChoice {
  return choice ?? "granted";
}
