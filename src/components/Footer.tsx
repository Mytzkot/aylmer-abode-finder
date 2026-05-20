import { MessageCircle, Phone, Facebook, Youtube, Instagram, Mail, MapPin, Send } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { CONTACT, PROPERTIES } from "@/data/properties";
import { T } from "@/i18n/LanguageProvider";
import logo from "@/assets/zorba-logo-blue.png";

const SOCIALS = [
  { href: CONTACT.facebook, Icon: Facebook, label: "Facebook", color: "bg-[#1877F2] text-white" },
  { href: CONTACT.messenger, Icon: Send, label: "Messenger", color: "bg-[#0084FF] text-white" },
  { href: CONTACT.whatsapp, Icon: MessageCircle, label: "WhatsApp", color: "bg-[#25D366] text-white" },
  { href: CONTACT.youtube, Icon: Youtube, label: "YouTube", color: "bg-[#FF0000] text-white" },
  { href: "https://instagram.com", Icon: Instagram, label: "Instagram", color: "bg-gradient-to-tr from-[#FEDA75] via-[#FA7E1E] to-[#D62976] text-white" },
  { href: CONTACT.email, Icon: Mail, label: "Email", color: "bg-white text-surface-dark" },
];

const PAYMENT_METHODS = ["Visa", "Mastercard", "Amex", "Stripe", "PayPal", "Interac e-Transfer", "Apple Pay", "Google Pay"];

function ColTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="font-bold text-white text-sm uppercase tracking-[0.14em] mb-4">{children}</h3>;
}

const linkCls = "block text-sm font-medium text-white/80 hover:text-white hover:underline transition";

function FLink({ to, href, children }: { to?: string; href?: string; children: React.ReactNode }) {
  if (href) return <a href={href} className={linkCls} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{children}</a>;
  return <Link to={to!} className={linkCls}>{children}</Link>;
}

export function Footer() {
  return (
    <footer className="bg-surface-dark text-white pb-32 md:pb-24">
      <div className="mx-auto max-w-6xl px-6 pt-16 md:pt-20">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Col 1 — Brand */}
          <div>
            <div className="bg-white rounded-2xl p-3 inline-flex items-center justify-center shadow-md mb-4">
              <img src={logo} alt="Zorba Rentals" className="h-16 w-auto object-contain" />
            </div>
            <p className="text-sm text-white/80 leading-relaxed mb-4">
              <T>Furnished monthly rooms in Aylmer-Gatineau. No credit check, only first month to move in. 15 min direct bus to downtown Ottawa.</T>
            </p>
            <div className="flex items-center gap-2 text-sm font-medium text-white/80">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>Aylmer-Gatineau, QC</span>
            </div>
          </div>

          {/* Col 2 — Stay */}
          <div>
            <ColTitle><T>Stay</T></ColTitle>
            <div className="space-y-2">
              <FLink to="/rooms"><T>All Rooms</T></FLink>
              {PROPERTIES.map((p) => (
                <Link key={p.id} to="/properties/$id" params={{ id: p.id }} className={linkCls}>
                  {p.address}
                </Link>
              ))}
              <FLink to="/book"><T>Booking Page</T></FLink>
              <FLink to="/portal"><T>Tenant Portal</T></FLink>
              <FLink to="/extras"><T>Extras</T></FLink>
            </div>
          </div>

          {/* Col 3 — Company */}
          <div>
            <ColTitle><T>Company</T></ColTitle>
            <div className="space-y-2">
              <FLink to="/about"><T>About Us</T></FLink>
              <FLink to="/faq"><T>FAQ</T></FLink>
              <FLink to="/faq"><T>How It Works</T></FLink>
              <FLink to="/newcomer"><T>Newcomer Guide</T></FLink>
              <FLink to="/transit"><T>Transit</T></FLink>
              <FLink to="/apply"><T>Apply Now</T></FLink>
            </div>
          </div>

          {/* Col 4 — Contact */}
          <div>
            <ColTitle><T>Contact</T></ColTitle>
            <div className="space-y-2">
              <a href={CONTACT.tel} className={linkCls + " flex items-center gap-2"}>
                <Phone className="w-4 h-4 shrink-0" /> 1-343-202-5460
              </a>
              <a href={CONTACT.whatsapp} target="_blank" rel="noreferrer" className={linkCls + " flex items-center gap-2"}>
                <MessageCircle className="w-4 h-4 shrink-0" /> WhatsApp
              </a>
              <a href={CONTACT.email} className={linkCls + " flex items-center gap-2"}>
                <Mail className="w-4 h-4 shrink-0" /> zorbagraphic@gmail.com
              </a>
              <p className="text-xs italic text-white/70 pt-2">
                Je parle arabe et anglais — Texte en français
              </p>
            </div>
          </div>
        </div>

        {/* Social row */}
        <div className="mt-12 pt-8 border-t border-white/15">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {SOCIALS.map(({ href, Icon, label, color }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                aria-label={label}
                title={label}
                className={`w-10 h-10 rounded-full ${color} shadow hover:scale-110 transition flex items-center justify-center`}
              >
                <Icon className="w-4 h-4" strokeWidth={2.25} />
              </a>
            ))}
          </div>
        </div>

        {/* Payment methods */}
        <div className="mt-8">
          <p className="text-xs uppercase tracking-[0.14em] text-white/60 text-center mb-3 font-semibold">
            <T>Accepted Payment Methods</T>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {PAYMENT_METHODS.map((m) => (
              <span key={m} className="px-3 py-1.5 rounded-md bg-white/10 text-white/90 text-xs font-semibold tracking-wide border border-white/15">
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/70">
          <p className="font-medium">
            © {new Date().getFullYear()} Zorba Rentals · Aylmer-Gatineau, QC
          </p>
          <div className="flex items-center gap-4">
            <a href="https://aylmer-rooms-hub.lovable.app" target="_blank" rel="noreferrer" className="hover:text-white hover:underline">
              aylmer-rooms-hub.lovable.app
            </a>
            <span className="text-white/40">·</span>
            <span className="text-white/60">zorbaco.com (coming soon)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
