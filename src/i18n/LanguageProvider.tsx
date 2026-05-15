import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { translations, type Lang, type T } from "./translations";

interface Ctx { lang: Lang; setLang: (l: Lang) => void; t: T; dir: "ltr" | "rtl"; }
const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Always start with "en" so SSR and the first client render match.
  // Then sync from localStorage in an effect to avoid hydration mismatches.
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = (typeof window !== "undefined" ? localStorage.getItem("zorba-lang") : null) as Lang | null;
    if (saved && saved !== lang && (saved === "en" || saved === "fr" || saved === "ar")) {
      setLangState(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
