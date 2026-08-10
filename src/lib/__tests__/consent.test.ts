import { describe, expect, it } from "vitest";
import {
  CONSENT_REQUIRED_REGIONS,
  CONSENT_REQUIRED_TIME_ZONES,
  CONSENT_STORAGE_KEY,
  parseConsentChoice,
  requiresConsent,
  resolveAnalyticsConsent,
} from "../consent";

describe("requiresConsent", () => {
  it("covers EU member states", () => {
    for (const zone of ["Europe/Berlin", "Europe/Paris", "Europe/Warsaw", "Europe/Dublin"]) {
      expect(requiresConsent(zone)).toBe(true);
    }
  });

  it("covers the UK, which has its own GDPR and PECR", () => {
    expect(requiresConsent("Europe/London")).toBe(true);
  });

  it("covers EU territories outside the Europe/ tree", () => {
    for (const zone of ["Atlantic/Canary", "Asia/Nicosia", "Indian/Reunion", "America/Cayenne"]) {
      expect(requiresConsent(zone)).toBe(true);
    }
  });

  it("is over-inclusive for non-EU European zones rather than risk a miss", () => {
    expect(requiresConsent("Europe/Istanbul")).toBe(true);
    expect(requiresConsent("Europe/Moscow")).toBe(true);
  });

  it("does not gate the rest of the world", () => {
    for (const zone of ["America/New_York", "Asia/Tokyo", "Australia/Sydney", "Africa/Lagos"]) {
      expect(requiresConsent(zone)).toBe(false);
    }
  });

  it("falls back to requiring consent when the time zone is undetectable", () => {
    expect(requiresConsent(null)).toBe(true);
    expect(requiresConsent(undefined)).toBe(true);
    expect(requiresConsent("")).toBe(true);
  });

  it("lists only zones outside the Europe/ tree, since that prefix is matched separately", () => {
    for (const zone of CONSENT_REQUIRED_TIME_ZONES) {
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
  it("honours an explicit choice in either region", () => {
    expect(resolveAnalyticsConsent("granted", true)).toBe("granted");
    expect(resolveAnalyticsConsent("denied", false)).toBe("denied");
  });

  it("defaults to denied where consent is required", () => {
    expect(resolveAnalyticsConsent(null, true)).toBe("denied");
  });

  it("defaults to granted elsewhere", () => {
    expect(resolveAnalyticsConsent(null, false)).toBe("granted");
  });
});

describe("CONSENT_STORAGE_KEY", () => {
  it("is namespaced so it cannot collide with the theme key", () => {
    expect(CONSENT_STORAGE_KEY).toBe("opentaint:analytics-consent");
  });
});

describe("CONSENT_REQUIRED_REGIONS", () => {
  it("covers the EU, the wider EEA, and the UK", () => {
    for (const code of ["DE", "FR", "PL", "IE", "IS", "LI", "NO", "GB"]) {
      expect(CONSENT_REQUIRED_REGIONS).toContain(code);
    }
  });

  it("omits Switzerland, which the GDPR does not cover", () => {
    expect(CONSENT_REQUIRED_REGIONS).not.toContain("CH");
  });

  it("is uppercase two-letter codes, the only form Google's region accepts", () => {
    for (const code of CONSENT_REQUIRED_REGIONS) {
      expect(code).toMatch(/^[A-Z]{2}$/);
    }
  });
});
