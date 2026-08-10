import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CONSENT_STORAGE_KEY } from "../consent";

/*
 * The runtime holds module state, so each case needs a fresh copy of the
 * module graph with the analytics side effects stubbed out.
 */
const analytics = {
  setDefaultConsent: vi.fn(),
  updateAnalyticsConsent: vi.fn(),
  loadGoogleTag: vi.fn(),
  clearAnalyticsCookies: vi.fn(),
  isGoogleTagLoaded: vi.fn(() => false),
};

/* jsdom has no navigation, so the reload on withdrawal is observed here. */
const reload = vi.fn();

vi.mock("../analytics", () => analytics);

async function loadRuntime(timeZone: string) {
  vi.resetModules();
  vi.doMock("../consent-storage", async () => {
    const actual = await vi.importActual<typeof import("../consent-storage")>("../consent-storage");
    return { ...actual, detectTimeZone: () => timeZone };
  });
  return import("../consent-runtime");
}

beforeEach(() => {
  window.localStorage.clear();
  Object.values(analytics).forEach((fn) => fn.mockClear());
  analytics.isGoogleTagLoaded.mockReturnValue(false);
  reload.mockClear();
  Object.defineProperty(window, "location", {
    value: { ...window.location, reload },
    configurable: true,
  });
});

afterEach(() => {
  vi.doUnmock("../consent-storage");
});

describe("initConsent", () => {
  it("holds the tag back in a consent-required region", async () => {
    const runtime = await loadRuntime("Europe/Berlin");
    const state = runtime.initConsent();

    expect(state).toEqual({ required: true, choice: null });
    expect(analytics.setDefaultConsent).toHaveBeenCalledWith("denied");
    expect(analytics.loadGoogleTag).not.toHaveBeenCalled();
  });

  it("starts measuring elsewhere", async () => {
    const runtime = await loadRuntime("America/New_York");
    const state = runtime.initConsent();

    expect(state).toEqual({ required: false, choice: null });
    expect(analytics.setDefaultConsent).toHaveBeenCalledWith("granted");
    expect(analytics.loadGoogleTag).toHaveBeenCalledOnce();
  });

  it("honours a stored grant in a consent-required region", async () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, "granted");
    const runtime = await loadRuntime("Europe/Berlin");

    expect(runtime.initConsent()).toEqual({ required: true, choice: "granted" });
    expect(analytics.loadGoogleTag).toHaveBeenCalledOnce();
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
  it("granting persists, updates, and loads the tag", async () => {
    const runtime = await loadRuntime("Europe/Berlin");
    runtime.initConsent();
    runtime.setConsentChoice("granted");

    expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).toBe("granted");
    expect(analytics.updateAnalyticsConsent).toHaveBeenCalledWith("granted");
    expect(analytics.loadGoogleTag).toHaveBeenCalledOnce();
    expect(runtime.getConsentState().choice).toBe("granted");
  });

  it("withdrawing clears the cookies already written", async () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, "granted");
    const runtime = await loadRuntime("Europe/Berlin");
    runtime.initConsent();
    runtime.setConsentChoice("denied");

    expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).toBe("denied");
    expect(analytics.updateAnalyticsConsent).toHaveBeenCalledWith("denied");
    expect(analytics.clearAnalyticsCookies).toHaveBeenCalledOnce();
  });

  it("reloads when withdrawing from a page that was already measuring", async () => {
    analytics.isGoogleTagLoaded.mockReturnValue(true);
    const runtime = await loadRuntime("America/New_York");
    runtime.initConsent();
    runtime.setConsentChoice("denied");

    expect(reload).toHaveBeenCalledOnce();
  });

  it("does not reload when no tag was ever loaded", async () => {
    const runtime = await loadRuntime("Europe/Berlin");
    runtime.initConsent();
    runtime.setConsentChoice("denied");

    expect(reload).not.toHaveBeenCalled();
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
