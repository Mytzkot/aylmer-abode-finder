import { MessageCircle, Phone, MessageSquare, Send } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import { CONTACT } from "@/data/properties";

export function FloatingContactBar() {
  const { t } = useLang();
  const items = [
    { href: CONTACT.messenger, label: "FB Messenger", icon: Send, color: "bg-[#0084FF] text-white" },
    { href: CONTACT.whatsapp, label: t.contact.whatsapp, icon: MessageCircle, color: "bg-[#25D366] text-white" },
    { href: CONTACT.tel, label: t.contact.call, icon: Phone, color: "bg-surface-dark text-white" },
    { href: CONTACT.sms, label: t.contact.sms, icon: MessageSquare, color: "bg-cream text-ink" },
  ];
  return (
    <div className="fixed bottom-3 inset-x-3 z-30 md:bottom-4 md:inset-x-0 md:flex md:justify-center pointer-events-none">
      <div className="bg-card/95 backdrop-blur rounded-full shadow-2xl border border-border/60 p-1.5 flex gap-1.5 pointer-events-auto md:gap-2 justify-center">
        {items.map((it) => (
          <a
            key={it.label}
            href={it.href}
            target={it.href.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
            aria-label={it.label}
            title={it.label}
            className={`w-11 h-11 md:w-12 md:h-12 inline-flex items-center justify-center rounded-full ${it.color} active:scale-95 transition shadow`}
          >
            <it.icon className="w-5 h-5 md:w-[22px] md:h-[22px]" strokeWidth={2.25} />
          </a>
        ))}
      </div>
    </div>
  );
}
