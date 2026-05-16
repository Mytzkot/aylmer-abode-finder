import { MessageCircle, Phone, Send } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import { CONTACT } from "@/data/properties";

export function FloatingContactBar() {
  const { t } = useLang();
  const items = [
    { href: CONTACT.messenger, label: "FB Messenger", icon: Send, color: "bg-[#0084FF] text-white" },
    { href: CONTACT.whatsapp, label: t.contact.whatsapp, icon: MessageCircle, color: "bg-[#25D366] text-white" },
    { href: CONTACT.tel, label: t.contact.call, icon: Phone, color: "bg-surface-dark text-white" },
  ];
  return (
    <div className="fixed inset-x-0 bottom-3 z-[70] flex justify-center px-3 md:bottom-4 pointer-events-none overflow-visible isolate">
      <div className="relative z-10 w-fit max-w-full bg-card rounded-full shadow-2xl border border-border/60 p-1.5 grid grid-cols-3 gap-1.5 pointer-events-auto md:gap-2 justify-center overflow-hidden isolate contain-layout [&>*:not(a)]:hidden [&>*:nth-child(n+4)]:hidden">
        {items.map((it) => (
          <a
            key={it.label}
            href={it.href}
            target={it.href.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
            aria-label={it.label}
            title={it.label}
            className={`relative z-10 w-11 h-11 md:w-12 md:h-12 inline-flex items-center justify-center rounded-full ${it.color} active:scale-95 transition shrink-0 overflow-hidden`}
          >
            <it.icon className="w-5 h-5 md:w-[22px] md:h-[22px]" strokeWidth={2.25} />
          </a>
        ))}
      </div>
    </div>
  );
}
