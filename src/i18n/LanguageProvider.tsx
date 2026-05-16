import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { translations, type Lang, type T as Dict } from "./translations";

interface Ctx { lang: Lang; setLang: (l: Lang) => void; t: Dict; dir: "ltr" | "rtl"; }
const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Always start with "en" so SSR and the first client render match.
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = (typeof window !== "undefined" ? localStorage.getItem("zorba-lang") : null) as Lang | null;
    if (saved && (saved === "en" || saved === "fr" || saved === "ar")) {
      setLangState(saved);
    }
  }, []);

  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    localStorage.setItem("zorba-lang", lang);
  }, [lang, dir]);

  return (
    <LanguageContext.Provider value={{ lang, setLang: setLangState, t: translations[lang], dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
}

// ==========================================================================
// Auto-translation of arbitrary English content via Lovable AI.
// Caches results in memory + localStorage so each phrase is only sent once.
// ==========================================================================

const CACHE_KEYS: Record<"fr" | "ar", string> = {
  fr: "translations:fr:v2",
  ar: "translations:ar:v2",
};

const memCache: Record<"fr" | "ar", Map<string, string>> = {
  fr: new Map(),
  ar: new Map(),
};
const inflight: Record<"fr" | "ar", Map<string, Promise<string>>> = {
  fr: new Map(),
  ar: new Map(),
};
const cacheLoaded: Record<"fr" | "ar", boolean> = { fr: false, ar: false };

function loadCache(lang: "fr" | "ar") {
  if (cacheLoaded[lang] || typeof localStorage === "undefined") return;
  try {
    const raw = localStorage.getItem(CACHE_KEYS[lang]);
    if (raw) {
      const obj = JSON.parse(raw) as Record<string, string>;
      for (const [k, v] of Object.entries(obj)) memCache[lang].set(k, v);
    }
  } catch { /* ignore */ }
  cacheLoaded[lang] = true;
}

const saveTimers: Record<"fr" | "ar", ReturnType<typeof setTimeout> | null> = { fr: null, ar: null };
function scheduleSave(lang: "fr" | "ar") {
  if (typeof localStorage === "undefined") return;
  if (saveTimers[lang]) clearTimeout(saveTimers[lang]!);
  saveTimers[lang] = setTimeout(() => {
    try {
      const obj: Record<string, string> = {};
      memCache[lang].forEach((v, k) => { obj[k] = v; });
      localStorage.setItem(CACHE_KEYS[lang], JSON.stringify(obj));
    } catch { /* ignore */ }
  }, 400);
}

const pending: Record<"fr" | "ar", { text: string; resolve: (v: string) => void }[]> = { fr: [], ar: [] };
const flushTimer: Record<"fr" | "ar", ReturnType<typeof setTimeout> | null> = { fr: null, ar: null };

async function flush(lang: "fr" | "ar") {
  flushTimer[lang] = null;
  const batch = pending[lang];
  pending[lang] = [];
  if (batch.length === 0) return;
  const uniqueTexts = Array.from(new Set(batch.map((b) => b.text)));
  const map = new Map<string, string>();
  try {
    const { translateBatch } = await import("@/lib/translate.functions");
    const CHUNK = 60;
    for (let i = 0; i < uniqueTexts.length; i += CHUNK) {
      const slice = uniqueTexts.slice(i, i + CHUNK);
      const { translations: out } = await translateBatch({ data: { texts: slice, targetLang: lang } });
      slice.forEach((src, j) => {
        const tr = out[j] ?? src;
        map.set(src, tr);
        memCache[lang].set(src, tr);
      });
    }
    scheduleSave(lang);
  } catch (e) {
    console.error("translateBatch failed:", e);
  } finally {
    batch.forEach((b) => b.resolve(map.get(b.text) ?? b.text));
  }
}

function requestTranslation(text: string, lang: "fr" | "ar"): Promise<string> {
  loadCache(lang);
  const cached = memCache[lang].get(text);
  if (cached !== undefined) return Promise.resolve(cached);
  const existing = inflight[lang].get(text);
  if (existing) return existing;
  const p = new Promise<string>((resolve) => {
    pending[lang].push({ text, resolve });
    if (!flushTimer[lang]) flushTimer[lang] = setTimeout(() => flush(lang), 80);
  }).then((v) => { inflight[lang].delete(text); return v; });
  inflight[lang].set(text, p);
  return p;
}

export function useTranslated(text: string | null | undefined): string {
  const { lang } = useLang();
  const safe = text ?? "";
  const target = lang === "fr" || lang === "ar" ? lang : null;
  if (target) loadCache(target);
  const initial = target ? (memCache[target].get(safe) ?? safe) : safe;
  const [out, setOut] = useState(initial);

  useEffect(() => {
    if (!target || !safe) { setOut(safe); return; }
    const cached = memCache[target].get(safe);
    if (cached !== undefined) { setOut(cached); return; }
    let cancelled = false;
    setOut(safe); // show English while translating
    requestTranslation(safe, target).then((v) => { if (!cancelled) setOut(v); });
    return () => { cancelled = true; };
  }, [target, safe]);

  return out;
}

// Component wrapper for inline use in JSX. Children must be a plain string.
export function T({ children }: { children: string }) {
  return <>{useTranslated(children)}</>;
}
