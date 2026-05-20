import { MessageCircle } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import { CONTACT } from "@/data/properties";

// Only WhatsApp here. The chatbot bubble (FaqChatbot) renders directly above
// it. Both are vertically centered on the right edge of the viewport.
export function FloatingContactBar() {
  const { t } = useLang();
  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-[60] pointer-events-none">
      <a
        href={CONTACT.whatsapp}
        target="_blank"
        rel="noreferrer"
        aria-label={t.contact.whatsapp}
        title={t.contact.whatsapp}
        className="pointer-events-auto mt-[64px] w-[54px] h-[54px] inline-flex items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl active:scale-95 hover:scale-105 transition ring-2 ring-white/40"
      >
        <MessageCircle className="w-6 h-6" strokeWidth={2.25} />
      </a>
    </div>
  );
}
