/**
 * Consent gating for analytics.
 *
 * The site is a static build served from GitHub Pages, so there is no
 * server-side geo header to read and no CMP vendor in the stack. The visitor's
 * IANA time zone is the closest signal available without adding a third party.
 *
 * It is deliberately over-inclusive: every `Europe/` zone counts, including
 * non-EU ones, plus the EU/EEA territories that sit outside that tree. Showing
 * the banner to someone who did not strictly need it is the cheaper mistake.
 * An undetectable time zone is treated the same way.
 */

export const CONSENT_STORAGE_KEY = "opentaint:analytics-consent";

export type ConsentChoice = "granted" | "denied";

const EUROPE_ZONE_PREFIX = "Europe/";

/**
 * EU/EEA/UK territories whose IANA zone is not under `Europe/`: Spanish and
 * Portuguese Atlantic islands, Ceuta, Cyprus, Iceland, and the French overseas
 * departments, which are part of the EU for GDPR purposes.
 */
export const CONSENT_REQUIRED_TIME_ZONES: readonly string[] = [
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

/** Whether a visitor in `timeZone` must opt in before analytics may load. */
export function requiresConsent(timeZone: string | null | undefined): boolean {
  if (!timeZone) return true;
  return (
    timeZone.startsWith(EUROPE_ZONE_PREFIX) ||
    CONSENT_REQUIRED_TIME_ZONES.includes(timeZone)
  );
}

/** Narrow a persisted value to a choice, discarding anything unrecognised. */
export function parseConsentChoice(
  value: string | null | undefined,
): ConsentChoice | null {
  return value === "granted" || value === "denied" ? value : null;
}

/**
 * Resolve the effective analytics permission. An explicit choice always wins;
 * absent one, consent-required regions start denied and everywhere else starts
 * granted — the same geo-gated model semgrep.dev uses.
 */
export function resolveAnalyticsConsent(
  choice: ConsentChoice | null,
  consentRequired: boolean,
): ConsentChoice {
  if (choice) return choice;
  return consentRequired ? "denied" : "granted";
}
