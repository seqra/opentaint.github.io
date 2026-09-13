import { describe, expect, it } from "vitest";
import {
  COOKIE_NOTICE_TIME_ZONES,
  CONSENT_STORAGE_KEY,
  parseConsentChoice,
  resolveAnalyticsConsent,
  shouldShowCookieNotice,
} from "../consent";

describe("shouldShowCookieNotice", () => {
  it("covers EU member states", () => {
    for (const zone of ["Europe/Berlin", "Europe/Paris", "Europe/Warsaw", "Europe/Dublin"]) {
      expect(shouldShowCookieNotice(zone)).toBe(true);
    }
  });

  it("covers the UK", () => {
    expect(shouldShowCookieNotice("Europe/London")).toBe(true);
  });

  it("covers EU territories outside the Europe/ tree", () => {
    for (const zone of ["Atlantic/Canary", "Asia/Nicosia", "Indian/Reunion", "America/Cayenne"]) {
      expect(shouldShowCookieNotice(zone)).toBe(true);
    }
  });

  it("is over-inclusive for non-EU European zones", () => {
    expect(shouldShowCookieNotice("Europe/Istanbul")).toBe(true);
    expect(shouldShowCookieNotice("Europe/Moscow")).toBe(true);
  });

  it("does not show the regional notice elsewhere", () => {
    for (const zone of ["America/New_York", "Asia/Tokyo", "Australia/Sydney", "Africa/Lagos"]) {
      expect(shouldShowCookieNotice(zone)).toBe(false);
    }
  });

  it("falls back to showing the notice when the time zone is unavailable", () => {
    expect(shouldShowCookieNotice(null)).toBe(true);
    expect(shouldShowCookieNotice(undefined)).toBe(true);
    expect(shouldShowCookieNotice("")).toBe(true);
  });

  it("lists only zones outside the Europe/ tree", () => {
    for (const zone of COOKIE_NOTICE_TIME_ZONES) {
      expect(zone.startsWith("Europe/")).toBe(false);
    }
  });
});

describe("parseConsentChoice", () => {
  it("accepts the two persisted values", () => {
    expect(parseConsentChoice("granted")).toBe("granted");
    expect(parseConsentChoice("denied")).toBe("denied");
  });

  it("discards anything else", () => {
    for (const value of [null, undefined, "", "true", "yes", "GRANTED"]) {
      expect(parseConsentChoice(value)).toBeNull();
    }
  });
});

describe("resolveAnalyticsConsent", () => {
  it("honours an explicit preference", () => {
    expect(resolveAnalyticsConsent("granted")).toBe("granted");
    expect(resolveAnalyticsConsent("denied")).toBe("denied");
  });

  it("enables Analytics by default", () => {
    expect(resolveAnalyticsConsent(null)).toBe("granted");
  });
});

describe("CONSENT_STORAGE_KEY", () => {
  it("is namespaced so it cannot collide with the theme key", () => {
    expect(CONSENT_STORAGE_KEY).toBe("opentaint:analytics-consent");
  });
});
