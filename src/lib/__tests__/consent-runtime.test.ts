import { beforeEach, describe, expect, it, vi } from "vitest";
import { CONSENT_STORAGE_KEY } from "../consent";

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
  it("enables Analytics by default where the cookie notice is shown", async () => {
    const runtime = await loadRuntime("Europe/Berlin");

    expect(runtime.initConsent()).toEqual({ noticeRequired: true, choice: null });
    expect(analytics.setDefaultConsent).toHaveBeenCalledWith("granted");
    expect(analytics.loadGoogleTag).toHaveBeenCalledOnce();
  });

  it("enables Analytics by default where no notice is shown", async () => {
    const runtime = await loadRuntime("America/New_York");

    expect(runtime.initConsent()).toEqual({ noticeRequired: false, choice: null });
    expect(analytics.setDefaultConsent).toHaveBeenCalledWith("granted");
    expect(analytics.loadGoogleTag).toHaveBeenCalledOnce();
  });

  it("loads only after declaring the default", async () => {
    const runtime = await loadRuntime("Europe/Berlin");
    runtime.initConsent();

    expect(callOrder()).toEqual(["default", "load"]);
  });

  it("uses a remembered opt-in as the initial preference", async () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, "granted");
    const runtime = await loadRuntime("Europe/Berlin");

    expect(runtime.initConsent()).toEqual({ noticeRequired: true, choice: "granted" });
    expect(analytics.setDefaultConsent).toHaveBeenCalledWith("granted");
    expect(analytics.loadGoogleTag).toHaveBeenCalledOnce();
  });

  it("keeps Analytics off for a visitor who previously disabled it", async () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, "denied");
    const runtime = await loadRuntime("America/New_York");
    runtime.initConsent();

    expect(analytics.setDefaultConsent).toHaveBeenCalledWith("denied");
    expect(analytics.loadGoogleTag).not.toHaveBeenCalled();
  });

  it("does not issue a preference update during initialization", async () => {
    const runtime = await loadRuntime("Europe/Berlin");
    runtime.initConsent();

    expect(analytics.updateAnalyticsConsent).not.toHaveBeenCalled();
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

    expect(runtime.getConsentState()).toEqual({ noticeRequired: true, choice: null });
    expect(analytics.setDefaultConsent).toHaveBeenCalledOnce();
  });
});

describe("setConsentChoice", () => {
  it("persists and applies an explicit opt-in", async () => {
    const runtime = await loadRuntime("Europe/Berlin");
    runtime.initConsent();
    runtime.setConsentChoice("granted");

    expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).toBe("granted");
    expect(analytics.updateAnalyticsConsent).toHaveBeenCalledWith("granted");
    expect(analytics.loadGoogleTag).toHaveBeenCalled();
    expect(analytics.clearAnalyticsCookies).not.toHaveBeenCalled();
    expect(runtime.getConsentState().choice).toBe("granted");
    expect(callOrder()).toEqual(["default", "load", "update"]);
  });

  it("disabling updates consent and clears Analytics cookies", async () => {
    const runtime = await loadRuntime("Europe/Berlin");
    runtime.initConsent();
    runtime.setConsentChoice("denied");

    expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).toBe("denied");
    expect(analytics.updateAnalyticsConsent).toHaveBeenLastCalledWith("denied");
    expect(analytics.clearAnalyticsCookies).toHaveBeenCalledOnce();
  });

  it("leaves the regional notice verdict unchanged", async () => {
    const runtime = await loadRuntime("Europe/Berlin");
    runtime.initConsent();
    runtime.setConsentChoice("denied");

    expect(runtime.getConsentState().noticeRequired).toBe(true);
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
