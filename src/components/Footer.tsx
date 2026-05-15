import { MessageCircle, Phone, Facebook, Youtube, Instagram, Send } from "lucide-react";
import { CONTACT } from "@/data/properties";

const SOCIALS = [
  { href: CONTACT.whatsapp, Icon: MessageCircle, label: "WhatsApp", color: "bg-[#25D366] text-white" },
  { href: CONTACT.tel, Icon: Phone, label: "Phone", color: "bg-ink text-cream" },
  { href: CONTACT.facebook, Icon: Facebook, label: "Facebook", color: "bg-[#1877F2] text-white" },
  { href: CONTACT.youtube, Icon: Youtube, label: "YouTube", color: "bg-[#FF0000] text-white" },
  { href: "https://instagram.com", Icon: Instagram, label: "Instagram", color: "bg-gradient-to-tr from-[#FEDA75] via-[#FA7E1E] to-[#D62976] text-white" },
  { href: CONTACT.messenger, Icon: Send, label: "Messenger", color: "bg-[#0084FF] text-white" },
];

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card pb-32 md:pb-24">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <p className="text-center font-display text-2xl md:text-3xl text-ink mb-6">
          Stay Connected
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
          {SOCIALS.map(({ href, Icon, label, color }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              title={label}
              className={`touch-min w-14 h-14 md:w-16 md:h-16 rounded-full ${color} shadow-md hover:scale-110 hover:shadow-lg transition flex items-center justify-center`}
            >
              <Icon className="w-6 h-6 md:w-7 md:h-7" strokeWidth={2.25} />
            </a>
          ))}
        </div>
        <p className="mt-8 text-center text-xs text-ink/50">
          © {new Date().getFullYear()} ZORBA RENTALS · Aylmer-Gatineau, QC
        </p>
      </div>
    </footer>
  );
}
