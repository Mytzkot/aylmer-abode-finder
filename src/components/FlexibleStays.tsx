import { MessageCircle, Mail } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import { CONTACT } from "@/data/properties";

export function FlexibleStays() {
  const { lang } = useLang();
  const text =
    lang === "fr"
      ? "Vous cherchez des dates différentes ou un séjour personnalisé ? Contactez-nous — nous serons heureux de vous aider."
      : lang === "ar"
        ? "تبحث عن تواريخ مختلفة أو إقامة مخصصة؟ تواصل معنا — يسعدنا مساعدتك في إيجاد ما يناسبك."
        : "Looking for different dates or a custom stay? Contact us — we're happy to help find the right fit for you.";
  const heading =
    lang === "fr" ? "Séjours flexibles" : lang === "ar" ? "إقامات مرنة" : "Flexible Stays";
  const contactLabel =
    lang === "fr" ? "Nous contacter" : lang === "ar" ? "اتصل بنا" : "Contact Us";

  return (
    <section className="bg-card border border-brand/30 rounded-2xl p-5 md:p-6 my-6">
      <h3 className="font-display text-xl md:text-2xl text-ink mb-2">{heading}</h3>
      <p className="text-sm md:text-base text-ink/80 mb-4 leading-relaxed">{text}</p>
      <div className="flex flex-wrap gap-2">
        <a
          href="/#contact"
          className="btn-pill btn-ink text-sm px-4 py-2.5"
        >
          <Mail className="w-4 h-4" /> {contactLabel}
        </a>
        <a
          href={CONTACT.whatsapp}
          target="_blank"
          rel="noreferrer"
          className="btn-pill bg-[#25D366] text-white hover:brightness-110 text-sm px-4 py-2.5 font-bold"
        >
          <MessageCircle className="w-4 h-4" /> WhatsApp
        </a>
      </div>
    </section>
  );
}
