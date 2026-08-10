import "@testing-library/jest-dom";

/*
 * Node 26 defines its own `localStorage` global that is unavailable unless the
 * process was started with --localstorage-file, and it shadows the one jsdom
 * would otherwise provide — leaving `window.localStorage` undefined. Supply an
 * in-memory implementation of the same interface so browser code that persists
 * state can be tested as written.
 */
function installMemoryStorage(): void {
  const store = new Map<string, string>();

  const storage: Storage = {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key) => (store.has(key) ? store.get(key)! : null),
    key: (index) => [...store.keys()][index] ?? null,
    removeItem: (key) => {
      store.delete(key);
    },
    setItem: (key, value) => {
      store.set(key, String(value));
    },
  };

  Object.defineProperty(window, "localStorage", { value: storage, configurable: true });
}

/* Suites that opt into the node environment have no window to patch. */
if (typeof window !== "undefined") {
  try {
    if (!window.localStorage) installMemoryStorage();
  } catch {
    /* jsdom throws for opaque origins; the same shim covers that case */
    installMemoryStorage();
  }
}
