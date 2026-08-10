import { afterEach, describe, expect, it, vi } from "vitest";
import { CONSENT_STORAGE_KEY } from "../consent";
import { detectTimeZone, readStoredChoice, storeChoice } from "../consent-storage";

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("detectTimeZone", () => {
  it("returns the engine's zone", () => {
    expect(detectTimeZone()).toMatch(/^[A-Za-z]+\/[A-Za-z_+-]+$|^UTC$/);
  });

  it("returns null rather than throwing when Intl is unusable", () => {
    vi.spyOn(Intl, "DateTimeFormat").mockImplementation(() => {
      throw new Error("no Intl");
    });
    expect(detectTimeZone()).toBeNull();
  });
});

describe("readStoredChoice", () => {
  it("reads a stored choice back", () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, "granted");
    expect(readStoredChoice()).toBe("granted");
  });

  it("is null when nothing is stored", () => {
    expect(readStoredChoice()).toBeNull();
  });

  it("rejects a value that is not a choice", () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, "maybe");
    expect(readStoredChoice()).toBeNull();
  });

  it("returns null rather than throwing when storage is blocked", () => {
    vi.spyOn(window.localStorage, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(readStoredChoice()).toBeNull();
  });
});

describe("storeChoice", () => {
  it("round-trips through readStoredChoice", () => {
    storeChoice("denied");
    expect(readStoredChoice()).toBe("denied");
  });

  it("swallows a storage failure instead of breaking the page", () => {
    vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    expect(() => storeChoice("granted")).not.toThrow();
  });
});
