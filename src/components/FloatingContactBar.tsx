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
      <div className="bg-card/95 backdrop-blur rounded-full shadow-2xl border border-border/60 p-1.5 flex gap-1.5 pointer-events-auto md:gap-2 overflow-x-auto">
        {items.map((it) => (
          <a
            key={it.label}
            href={it.href}
            target={it.href.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
            className={`flex-1 md:flex-none md:px-5 inline-flex items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-semibold whitespace-nowrap ${it.color} active:scale-95 transition`}
          >
            <it.icon className="w-4 h-4 shrink-0" />
            <span>{it.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
