import { useState } from "react";
import { MessageCircle, Phone, Facebook, Youtube, Instagram, Mail, MapPin, Send } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { CONTACT, PROPERTIES } from "@/data/properties";
import { T } from "@/i18n/LanguageProvider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import logo from "@/assets/zorba-logo-blue.png";
import LocationsMap from "@/components/LocationsMap";

const SOCIALS = [
  { href: CONTACT.whatsapp, Icon: MessageCircle, label: "WhatsApp", color: "bg-[#25D366] text-white" },
  { href: CONTACT.tel, Icon: Phone, label: "Phone", color: "bg-white text-surface-dark" },
  { href: CONTACT.messenger, Icon: Send, label: "Messenger", color: "bg-[#0084FF] text-white" },
  { href: CONTACT.facebook, Icon: Facebook, label: "Facebook", color: "bg-[#1877F2] text-white" },
  { href: CONTACT.youtube, Icon: Youtube, label: "YouTube", color: "bg-[#FF0000] text-white" },
  { href: "https://instagram.com", Icon: Instagram, label: "Instagram", color: "bg-gradient-to-tr from-[#FEDA75] via-[#FA7E1E] to-[#D62976] text-white" },
];

const PAYMENT_METHODS = ["Visa", "Mastercard", "Amex", "Stripe", "PayPal", "e-Transfer", "Apple Pay", "Google Pay"];

function ColTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="font-bold text-white text-sm uppercase tracking-[0.14em] mb-3">{children}</h3>;
}

const linkCls = "block py-0.5 text-sm font-semibold text-white/90 hover:text-white hover:underline transition";
const itemCls = "flex items-center gap-2 py-0.5 text-sm font-semibold text-white/90 hover:text-white transition";

function FLink({ to, href, children }: { to?: string; href?: string; children: React.ReactNode }) {
  if (href) return <a href={href} className={linkCls} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{children}</a>;
  return <Link to={to!} className={linkCls}>{children}</Link>;
}

export function Footer() {
  const [paymentsOpen, setPaymentsOpen] = useState(false);

  return (
    <footer className="bg-surface-dark text-white pb-32 md:pb-24 overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 pt-16 md:pt-20">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          {/* Col 1 — Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-md shrink-0 overflow-hidden">
                <img src={logo} alt="Zorba Rentals" className="w-9 h-9 object-contain" />
              </div>
              <span className="font-display text-xl font-bold text-white"><T>Zorba Rentals</T></span>
            </div>
            <p className="text-sm text-white/80 leading-relaxed mb-4">
              <T>Furnished monthly rooms in Aylmer-Gatineau. No credit check, only first month to move in. 15 min direct bus to downtown Ottawa.</T>
            </p>
            <div className="space-y-1 mb-4">
              <div className={itemCls}><MapPin className="w-4 h-4 shrink-0" /><span>Aylmer-Gatineau, QC</span></div>
              <a href={CONTACT.tel} className={itemCls}><Phone className="w-4 h-4 shrink-0" /><span>+1 343 202 5460</span></a>
              <a href={CONTACT.email} className={itemCls}><Mail className="w-4 h-4 shrink-0" /><span>zorbagraphic@gmail.com</span></a>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {SOCIALS.map(({ href, Icon, label, color }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} title={label}
                  className={`w-9 h-9 rounded-full ${color} shadow hover:scale-110 transition flex items-center justify-center`}>
                  <Icon className="w-4 h-4" strokeWidth={2.25} />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2 — Stay */}
          <div>
            <ColTitle><T>Stay</T></ColTitle>
            <FLink to="/rooms"><T>All Rooms</T></FLink>
            {PROPERTIES.map((p) => (
              <Link key={p.id} to="/properties/$id" params={{ id: p.id }} className={linkCls}>
                {p.address}
              </Link>
            ))}
            <FLink to="/book"><T>Booking Page</T></FLink>
            <FLink to="/pay"><T>Pay Online (Monthly)</T></FLink>
            <FLink to="/portal"><T>Tenant Portal</T></FLink>
          </div>

          {/* Col 3 — Support */}
          <div>
            <ColTitle><T>Support</T></ColTitle>
            <FLink href="/#contact"><T>Contact</T></FLink>
            <FLink to="/faq"><T>FAQ</T></FLink>
            <FLink to="/faq"><T>How it works</T></FLink>
            <FLink href={CONTACT.whatsapp}><T>WhatsApp</T></FLink>
            <FLink href={CONTACT.tel}><T>Phone</T></FLink>
            <FLink href={CONTACT.email}><T>Email</T></FLink>
          </div>

          {/* Col 4 — Our Company */}
          <div>
            <ColTitle><T>Our Company</T></ColTitle>
            <FLink to="/about"><T>About Us</T></FLink>
            <FLink to="/newcomer"><T>Newcomer Guide</T></FLink>
            <FLink to="/transit"><T>Transit</T></FLink>
            <FLink to="/apply"><T>Apply Now</T></FLink>

            <h3 className="font-bold text-white text-sm uppercase tracking-[0.14em] mt-6 mb-3"><T>Payments</T></h3>
            <Dialog open={paymentsOpen} onOpenChange={setPaymentsOpen}>
              <DialogTrigger asChild>
                <button type="button" className={linkCls + " text-left w-full"}>
                  <T>Payment Methods</T> →
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle><T>Accepted Payment Methods</T></DialogTitle>
                </DialogHeader>
                <div className="flex flex-wrap gap-2 pt-2">
                  {PAYMENT_METHODS.map((m) => (
                    <span key={m} className="px-3 py-1.5 rounded-md bg-surface-dark text-white text-xs font-bold tracking-wide">{m}</span>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Map */}
        <div className="mt-12">
          <h3 className="font-bold text-white/95 text-sm uppercase tracking-[0.14em] mb-3"><T>Find Us</T></h3>
          <div className="rounded-2xl overflow-hidden border border-white/15 shadow-2xl">
            <LocationsMap />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/15">
          <p className="text-xs font-semibold text-white/80 text-center">
            © {new Date().getFullYear()} ZORBA RENTALS · Aylmer-Gatineau, QC
          </p>
        </div>
      </div>
    </footer>
  );
}
