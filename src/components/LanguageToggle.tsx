import { Globe, Check } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import type { Lang } from "@/i18n/translations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const OPTS: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "ar", label: "العربية" },
];

export function LanguageToggle() {
  const { lang, setLang } = useLang();
  const current = OPTS.find((o) => o.code === lang) ?? OPTS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex items-center gap-1 px-2 py-2 rounded-lg hover:bg-surface-dark/10 text-surface-dark font-semibold text-sm"
        aria-label="Change language"
      >
        <Globe className="w-5 h-5" strokeWidth={2} />
        <span className="uppercase text-xs">{current.code}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        {OPTS.map((o) => (
          <DropdownMenuItem
            key={o.code}
            onClick={() => setLang(o.code)}
            className="flex items-center justify-between gap-2 cursor-pointer"
          >
            <span>{o.label}</span>
            {lang === o.code && <Check className="w-4 h-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
