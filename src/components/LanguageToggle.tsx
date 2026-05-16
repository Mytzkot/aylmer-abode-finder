import { useLang } from "@/i18n/LanguageProvider";
import type { Lang } from "@/i18n/translations";

export function LanguageToggle() {
  const { lang, setLang } = useLang();
  const opts: { code: Lang; label: string }[] = [
    { code: "en", label: "EN" }, { code: "fr", label: "FR" }, { code: "ar", label: "AR" },
  ];
  return (
    <div className="inline-flex rounded-full bg-cream-deep p-0.5 sm:p-1 text-[11px] sm:text-sm">
      {opts.map((o) => (
        <button
          key={o.code}
          onClick={() => setLang(o.code)}
          className={`px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-full transition font-semibold ${lang === o.code ? "bg-ink text-primary-foreground" : "text-ink/70 hover:text-ink"}`}
          aria-label={`Switch to ${o.label}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
