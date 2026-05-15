import { useLang } from "@/i18n/LanguageProvider";
import type { Lang } from "@/i18n/translations";

export function LanguageToggle() {
  const { lang, setLang } = useLang();
  const opts: { code: Lang; label: string }[] = [
    { code: "en", label: "EN" }, { code: "fr", label: "FR" }, { code: "ar", label: "ع" },
  ];
  return (
    <div className="inline-flex rounded-full border border-border bg-card p-1 text-sm">
      {opts.map((o) => (
        <button
          key={o.code}
          onClick={() => setLang(o.code)}
          className={`touch-min px-3 rounded-full transition ${lang === o.code ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:text-foreground"}`}
          aria-label={`Switch to ${o.label}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
