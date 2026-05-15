import { useLang } from "@/i18n/LanguageProvider";
import type { Lang } from "@/i18n/translations";

export function LanguageToggle() {
  const { lang, setLang } = useLang();
  const opts: { code: Lang; label: string }[] = [
    { code: "en", label: "EN" }, { code: "fr", label: "FR" }, { code: "ar", label: "AR" },
  ];
  return (
    <div className="inline-flex rounded-full bg-cream-deep p-1 text-sm">
      {opts.map((o) => (
        <button
          key={o.code}
          onClick={() => setLang(o.code)}
          className={`touch-min px-3 rounded-full transition font-semibold ${lang === o.code ? "bg-ink text-primary-foreground" : "text-ink/70 hover:text-ink"}`}
          aria-label={`Switch to ${o.label}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
