import { MessageCircle, Phone, MessageSquare } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import { CONTACT } from "@/data/properties";

export function FloatingContactBar() {
  const { t } = useLang();
  const items = [
    { href: CONTACT.whatsapp, label: t.contact.whatsapp, icon: MessageCircle, color: "bg-[#25D366] text-white" },
    { href: CONTACT.tel, label: t.contact.call, icon: Phone, color: "bg-primary text-primary-foreground" },
    { href: CONTACT.sms, label: t.contact.sms, icon: MessageSquare, color: "bg-foreground text-background" },
  ];
  return (
    <div className="fixed bottom-3 inset-x-3 z-30 md:bottom-4 md:inset-x-0 md:flex md:justify-center pointer-events-none">
      <div className="bg-card/95 backdrop-blur rounded-full shadow-2xl border border-border p-1.5 flex gap-1.5 pointer-events-auto md:gap-2">
        {items.map((it) => (
          <a key={it.label} href={it.href} target="_blank" rel="noreferrer"
            className={`flex-1 md:flex-none md:px-5 inline-flex items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-semibold ${it.color} active:scale-95 transition`}>
            <it.icon className="w-4 h-4" />
            <span>{it.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
