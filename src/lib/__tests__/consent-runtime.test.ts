import { beforeEach, describe, expect, it, vi } from "vitest";
import { CONSENT_REQUIRED_REGIONS, CONSENT_STORAGE_KEY } from "../consent";

/*
 * The runtime holds module state, so each case needs a fresh copy of the
 * module graph with the analytics side effects stubbed out.
 */
const analytics = {
  setDefaultConsent: vi.fn(),
  updateAnalyticsConsent: vi.fn(),
  loadGoogleTag: vi.fn(),
  clearAnalyticsCookies: vi.fn(),
};

vi.mock("../analytics", () => analytics);

async function loadRuntime(timeZone: string) {
  vi.resetModules();
  vi.doMock("../consent-storage", async () => {
    const actual = await vi.importActual<typeof import("../consent-storage")>("../consent-storage");
    return { ...actual, detectTimeZone: () => timeZone };
  });
  return import("../consent-runtime");
}

/** The sequence advanced consent mode requires: defaults, tag, then updates. */
function callOrder(): string[] {
  return (
    [
      ["default", analytics.setDefaultConsent.mock.invocationCallOrder[0]],
      ["load", analytics.loadGoogleTag.mock.invocationCallOrder[0]],
      ["update", analytics.updateAnalyticsConsent.mock.invocationCallOrder[0]],
    ] as [string, number | undefined][]
  )
    .filter(([, order]) => order !== undefined)
    .sort((a, b) => a[1]! - b[1]!)
    .map(([name]) => name);
}

beforeEach(() => {
  window.localStorage.clear();
  Object.values(analytics).forEach((fn) => fn.mockClear());
});

describe("initConsent", () => {
  it("denies by default in a consent-required region", async () => {
    const runtime = await loadRuntime("Europe/Berlin");
    const state = runtime.initConsent();

    expect(state).toEqual({ required: true, choice: null });
    expect(analytics.setDefaultConsent).toHaveBeenCalledWith("denied", CONSENT_REQUIRED_REGIONS);
  });

  it("allows by default elsewhere, still scoping the denial to Google's regions", async () => {
    const runtime = await loadRuntime("America/New_York");
    const state = runtime.initConsent();

    expect(state).toEqual({ required: false, choice: null });
    expect(analytics.setDefaultConsent).toHaveBeenCalledWith("granted", CONSENT_REQUIRED_REGIONS);
  });

  it("loads the tag either way, as advanced mode expects", async () => {
    for (const zone of ["Europe/Berlin", "America/New_York"]) {
      Object.values(analytics).forEach((fn) => fn.mockClear());
      const runtime = await loadRuntime(zone);
      runtime.initConsent();

      expect(analytics.loadGoogleTag, zone).toHaveBeenCalledOnce();
    }
  });

  it("declares defaults before loading the tag", async () => {
    const runtime = await loadRuntime("Europe/Berlin");
    runtime.initConsent();

    expect(callOrder()).toEqual(["default", "load"]);
  });

  it("makes a remembered choice the default, unscoped, so it beats the region entry", async () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, "granted");
    const runtime = await loadRuntime("Europe/Berlin");

    expect(runtime.initConsent()).toEqual({ required: true, choice: "granted" });
    expect(analytics.setDefaultConsent).toHaveBeenCalledWith("granted", undefined);
  });

  it("remembers a refusal the same way", async () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, "denied");
    const runtime = await loadRuntime("America/New_York");
    runtime.initConsent();

    expect(analytics.setDefaultConsent).toHaveBeenCalledWith("denied", undefined);
  });

  it("never updates at load: the first page_view carries the defaults", async () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, "granted");
    const runtime = await loadRuntime("Europe/Berlin");
    runtime.initConsent();

    expect(analytics.updateAnalyticsConsent).not.toHaveBeenCalled();
    expect(callOrder()).toEqual(["default", "load"]);
  });

  it("is idempotent", async () => {
    const runtime = await loadRuntime("America/New_York");
    runtime.initConsent();
    runtime.initConsent();

    expect(analytics.setDefaultConsent).toHaveBeenCalledOnce();
    expect(analytics.loadGoogleTag).toHaveBeenCalledOnce();
  });

  it("runs on demand when a component reads state first", async () => {
    const runtime = await loadRuntime("Europe/Berlin");

    expect(runtime.getConsentState()).toEqual({ required: true, choice: null });
    expect(analytics.setDefaultConsent).toHaveBeenCalledOnce();
  });
});

describe("setConsentChoice", () => {
  it("granting persists and updates", async () => {
    const runtime = await loadRuntime("Europe/Berlin");
    runtime.initConsent();
    runtime.setConsentChoice("granted");

    expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).toBe("granted");
    expect(analytics.updateAnalyticsConsent).toHaveBeenCalledWith("granted");
    expect(analytics.clearAnalyticsCookies).not.toHaveBeenCalled();
    expect(runtime.getConsentState().choice).toBe("granted");
  });

  it("withdrawing clears the cookies already written", async () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, "granted");
    const runtime = await loadRuntime("Europe/Berlin");
    runtime.initConsent();
    runtime.setConsentChoice("denied");

    expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).toBe("denied");
    expect(analytics.updateAnalyticsConsent).toHaveBeenLastCalledWith("denied");
    expect(analytics.clearAnalyticsCookies).toHaveBeenCalledOnce();
  });

  it("leaves the region verdict untouched", async () => {
    const runtime = await loadRuntime("Europe/Berlin");
    runtime.initConsent();
    runtime.setConsentChoice("denied");

    expect(runtime.getConsentState().required).toBe(true);
  });
});

describe("reopen", () => {
  it("notifies a listener", async () => {
    const runtime = await loadRuntime("Europe/Berlin");
    const listener = vi.fn();

    runtime.onConsentReopen(listener);
    runtime.requestConsentReopen();

    expect(listener).toHaveBeenCalledOnce();
  });
});
