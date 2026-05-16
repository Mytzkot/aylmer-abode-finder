import { MessageCircle, Phone, Facebook, Youtube, Instagram, Send, Mail, MapPin } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { CONTACT, PROPERTIES } from "@/data/properties";
import { T } from "@/i18n/LanguageProvider";
import logo from "@/assets/zorba-logo-blue.png";

const SOCIALS = [
  { href: CONTACT.whatsapp, Icon: MessageCircle, label: "WhatsApp", color: "bg-[#25D366] text-white" },
  { href: CONTACT.tel, Icon: Phone, label: "Phone", color: "bg-white text-surface-dark" },
  { href: CONTACT.facebook, Icon: Facebook, label: "Facebook", color: "bg-[#1877F2] text-white" },
  { href: CONTACT.youtube, Icon: Youtube, label: "YouTube", color: "bg-[#FF0000] text-white" },
  { href: "https://instagram.com", Icon: Instagram, label: "Instagram", color: "bg-gradient-to-tr from-[#FEDA75] via-[#FA7E1E] to-[#D62976] text-white" },
  { href: CONTACT.messenger, Icon: Send, label: "Messenger", color: "bg-[#0084FF] text-white" },
];

function ColTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="font-display text-lg font-bold text-white mb-4 tracking-wide">{children}</h3>;
}

const itemCls = "flex items-center gap-2 py-1.5 text-sm font-semibold text-white/95 hover:text-white transition";

function FLink({ to, href, children }: { to?: string; href?: string; children: React.ReactNode }) {
  const cls = "block py-1.5 text-sm font-semibold text-white/95 hover:text-white transition";
  if (href) return <a href={href} className={cls} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{children}</a>;
  return <Link to={to!} className={cls}>{children}</Link>;
}

export function Footer() {
  return (
    <footer className="bg-surface-dark text-white pb-32 md:pb-24 overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 pt-16 md:pt-20">
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
              <Link key={p.id} to="/properties/$id" params={{ id: p.id }} className="block py-1.5 text-sm font-semibold text-white/95 hover:text-white transition">
                {p.address}
              </Link>
            ))}
            <FLink to="/book"><T>Booking Page</T></FLink>
            <FLink to="/pay"><T>Pay Online (Monthly)</T></FLink>
            <FLink to="/portal"><T>Tenant Portal</T></FLink>
          </div>

          <div>
            <ColTitle><T>Apply</T></ColTitle>
            <FLink to="/apply"><T>Apply Now</T></FLink>
            <FLink href="/#contact"><T>Contact</T></FLink>
            <FLink to="/faq"><T>How it works</T></FLink>
          </div>

          <div>
            <ColTitle><T>Support &amp; Contact</T></ColTitle>
            <a href={CONTACT.tel} className={itemCls}><Phone className="w-4 h-4 shrink-0" /><span>+1 343 987 4565</span></a>
            <a href={CONTACT.email} className={itemCls}><Mail className="w-4 h-4 shrink-0" /><span>zorbagraphic@gmail.com</span></a>
            <a href={CONTACT.whatsapp} target="_blank" rel="noreferrer" className={itemCls}><MessageCircle className="w-4 h-4 shrink-0" /><span>WhatsApp</span></a>
            <a href={CONTACT.messenger} target="_blank" rel="noreferrer" className={itemCls}><Send className="w-4 h-4 shrink-0" /><span>Messenger</span></a>
            <div className={itemCls}><MapPin className="w-4 h-4 shrink-0" /><span>Aylmer-Gatineau, QC</span></div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/15 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex flex-wrap items-center gap-3">
            {SOCIALS.map(({ href, Icon, label, color }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} title={label}
                className={`touch-min w-11 h-11 rounded-full ${color} shadow hover:scale-110 transition flex items-center justify-center`}>
                <Icon className="w-5 h-5" strokeWidth={2.25} />
              </a>
            ))}
          </div>
          <p className="text-xs font-semibold text-white/80">
            © {new Date().getFullYear()} ZORBA RENTALS · Aylmer-Gatineau, QC
          </p>
        </div>

        {/* Payment methods */}
        <div className="mt-10 pt-6 border-t border-white/15">
          <h3 className="font-bold text-white/95 text-sm uppercase tracking-[0.14em] mb-3"><T>Payment Methods</T></h3>
          <div className="flex flex-wrap items-center gap-2">
            {["Visa", "Mastercard", "Amex", "Stripe", "PayPal", "e-Transfer", "Apple Pay", "Google Pay"].map((m) => (
              <span key={m} className="px-3 py-1.5 rounded-md bg-white text-surface-dark text-xs font-bold tracking-wide">{m}</span>
            ))}
          </div>
        </div>

        {/* Google Map */}
        <div className="mt-10">
          <h3 className="font-bold text-white/95 text-sm uppercase tracking-[0.14em] mb-3"><T>Find Us</T></h3>
          <div className="rounded-2xl overflow-hidden border border-white/15 shadow-2xl">
            <iframe
              title="Zorba Rentals — Aylmer-Gatineau map"
              src="https://www.google.com/maps?q=Aylmer+Gatineau+QC&output=embed"
              width="100%"
              height="320"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              style={{ border: 0, display: "block" }}
            />
          </div>
        </div>
      </div>

      {/* Giant logo wordmark */}
      <div className="mt-10 md:mt-14 px-4 select-none flex justify-center" aria-hidden="true">
        <img
          src={logo}
          alt=""
          className="w-full max-w-[1200px] h-auto opacity-95"
        />
      </div>
    </footer>
  );
}
