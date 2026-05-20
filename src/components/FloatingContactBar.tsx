import { MessageCircle, Phone } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import { CONTACT } from "@/data/properties";

export function FloatingContactBar() {
  const { t } = useLang();
  const items = [
    { href: CONTACT.messenger, label: "Messenger", icon: MessageCircle, color: "bg-[#0084FF] text-white" },
    { href: CONTACT.whatsapp, label: t.contact.whatsapp, icon: MessageCircle, color: "bg-[#25D366] text-white" },
    { href: CONTACT.tel, label: t.contact.call, icon: Phone, color: "bg-surface-dark text-white" },
  ];
  return (
    <div className="fixed bottom-4 end-4 z-[60] flex flex-col items-end gap-2 pointer-events-none">
      {items.map((it) => (
        <a
          key={it.label}
          href={it.href}
          target={it.href.startsWith("http") ? "_blank" : undefined}
          rel="noreferrer"
          aria-label={it.label}
          title={it.label}
          className={`pointer-events-auto w-11 h-11 inline-flex items-center justify-center rounded-full ${it.color} shadow-xl active:scale-95 hover:scale-105 transition ring-2 ring-white/40`}
        >
          <it.icon className="w-[18px] h-[18px]" strokeWidth={2.25} />
        </a>
      ))}
    </div>
  );
}
