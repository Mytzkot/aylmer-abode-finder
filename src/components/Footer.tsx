import { MessageCircle, Phone, Facebook, Youtube, Instagram, Send, Mail, MapPin } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { CONTACT, PROPERTIES } from "@/data/properties";
import { T } from "@/i18n/LanguageProvider";

const SOCIALS = [
  { href: CONTACT.whatsapp, Icon: MessageCircle, label: "WhatsApp", color: "bg-[#25D366] text-white" },
  { href: CONTACT.tel, Icon: Phone, label: "Phone", color: "bg-white text-ink" },
  { href: CONTACT.facebook, Icon: Facebook, label: "Facebook", color: "bg-[#1877F2] text-white" },
  { href: CONTACT.youtube, Icon: Youtube, label: "YouTube", color: "bg-[#FF0000] text-white" },
  { href: "https://instagram.com", Icon: Instagram, label: "Instagram", color: "bg-gradient-to-tr from-[#FEDA75] via-[#FA7E1E] to-[#D62976] text-white" },
  { href: CONTACT.messenger, Icon: Send, label: "Messenger", color: "bg-[#0084FF] text-white" },
];

function ColTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-display text-base text-white/95 mb-4 tracking-wide">
      {children}
    </h3>
  );
}

function FLink({ to, href, children }: { to?: string; href?: string; children: React.ReactNode }) {
  const cls = "block py-1 text-sm text-white/65 hover:text-brand transition min-h-0";
  if (href) return <a href={href} className={cls} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{children}</a>;
  return <Link to={to!} className={cls}>{children}</Link>;
}

export function Footer() {
  return (
    <footer className="bg-ink text-white/80 pb-32 md:pb-24 overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 pt-16 md:pt-20">
        {/* Four columns */}
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <ColTitle><T>Zorba</T></ColTitle>
            <FLink to="/"><T>Home</T></FLink>
            <FLink to="/about"><T>About Us</T></FLink>
            <FLink to="/faq"><T>FAQ</T></FLink>
            <FLink to="/newcomer"><T>Newcomer Guide</T></FLink>
            <FLink to="/transit"><T>Transit</T></FLink>
          </div>

          <div>
            <ColTitle><T>Stay</T></ColTitle>
            <FLink to="/rooms"><T>All Rooms</T></FLink>
            {PROPERTIES.map((p) => (
              <Link
                key={p.id}
                to="/properties/$id"
                params={{ id: p.id }}
                className="block py-1 text-sm text-white/65 hover:text-brand transition"
              >
                {p.address}
              </Link>
            ))}
            <FLink to="/book"><T>Daily / Weekly Booking</T></FLink>
          </div>

          <div>
            <ColTitle><T>Apply</T></ColTitle>
            <FLink to="/apply"><T>Apply Now</T></FLink>
            <FLink href="/#contact"><T>Contact</T></FLink>
            <FLink to="/faq"><T>How it works</T></FLink>
          </div>

          <div>
            <ColTitle><T>Support &amp; Contact</T></ColTitle>
            <a href={CONTACT.tel} className="flex items-center gap-2 py-1 text-sm text-white/65 hover:text-brand transition">
              <Phone className="w-4 h-4" /> +1 343 987 4565
            </a>
            <a href={CONTACT.email} className="flex items-center gap-2 py-1 text-sm text-white/65 hover:text-brand transition">
              <Mail className="w-4 h-4" /> zorbagraphic@gmail.com
            </a>
            <a href={CONTACT.whatsapp} target="_blank" rel="noreferrer" className="flex items-center gap-2 py-1 text-sm text-white/65 hover:text-brand transition">
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
            <a href={CONTACT.messenger} target="_blank" rel="noreferrer" className="flex items-center gap-2 py-1 text-sm text-white/65 hover:text-brand transition">
              <Send className="w-4 h-4" /> Messenger
            </a>
            <div className="flex items-center gap-2 py-1 text-sm text-white/65">
              <MapPin className="w-4 h-4" /> Aylmer-Gatineau, QC
            </div>
          </div>
        </div>

        {/* Divider + socials row */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex flex-wrap items-center gap-3">
            {SOCIALS.map(({ href, Icon, label, color }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                title={label}
                className={`touch-min w-11 h-11 rounded-full ${color} shadow hover:scale-110 transition flex items-center justify-center`}
              >
                <Icon className="w-5 h-5" strokeWidth={2.25} />
              </a>
            ))}
          </div>
          <p className="text-xs text-white/45">
            © {new Date().getFullYear()} ZORBA RENTALS · Aylmer-Gatineau, QC
          </p>
        </div>
      </div>

      {/* Giant ZORBA wordmark */}
      <div className="mt-10 md:mt-14 px-2 select-none" aria-hidden="true">
        <div
          className="font-display text-brand leading-[0.85] tracking-tight text-center"
          style={{ fontSize: "clamp(5rem, 22vw, 22rem)" }}
        >
          ZORBA
        </div>
      </div>
    </footer>
  );
}
