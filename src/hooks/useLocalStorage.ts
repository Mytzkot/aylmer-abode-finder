import { useCallback, useEffect, useState } from "react";

/**
 * SSR-safe localStorage hook.
 *
 * On the server (Cloudflare Workers SSR) there is no `window`, so we render the
 * `initial` value and only read the persisted value once mounted in the browser.
 * This avoids hydration mismatches. The `hydrated` flag lets callers wait for the
 * real value before rendering persisted UI if they want to.
 */
export function useLocalStorage<T>(
  key: string,
  initial: T,
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  // Read the persisted value after mount (client only).
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw != null) setValue(JSON.parse(raw) as T);
    } catch {
      // Ignore corrupt/inaccessible storage and keep the initial value.
    }
    setHydrated(true);
  }, [key]);

  // Persist on change (only once hydrated, so we never overwrite stored data
  // with the initial value during the first render).
  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or blocked — fail silently.
    }
  }, [key, value, hydrated]);

  // Keep state in sync across browser tabs.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue != null) {
        try {
          setValue(JSON.parse(e.newValue) as T);
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key]);

  const set = useCallback((v: T | ((prev: T) => T)) => {
    setValue((prev) => (typeof v === "function" ? (v as (p: T) => T)(prev) : v));
  }, []);

  return [value, set, hydrated];
}
