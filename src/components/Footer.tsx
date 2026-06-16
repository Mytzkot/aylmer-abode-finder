import {
  MessageCircle,
  Phone,
  Facebook,
  Youtube,
  Instagram,
  Mail,
  MapPin,
  Send,
  CreditCard,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { CONTACT, PROPERTIES, PROPERTY_MAP_LINKS } from "@/data/properties";
import { T } from "@/i18n/LanguageProvider";
import { useServerFn } from "@tanstack/react-start";

import { subscribeNewsletter } from "@/lib/newsletter.functions";
import logo from "@/assets/zorba-logo-blue.png";

function ColTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-extrabold text-coral text-[14px] uppercase tracking-[0.18em] mb-4">
      {children}
    </h3>
  );
}

const linkCls =
  "block text-[14px] md:text-[16px] font-semibold text-white/90 hover:text-white hover:underline transition leading-tight break-words";

function FLink({ to, href, children }: { to?: string; href?: string; children: React.ReactNode }) {
  if (href)
    return (
      <a
        href={href}
        className={linkCls}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel="noreferrer"
      >
        {children}
      </a>
    );
  return (
    <Link to={to!} className={linkCls}>
      {children}
    </Link>
  );
}

function ContactItem({
  href,
  Icon,
  label,
  iconColor,
}: {
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  iconColor: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col items-center gap-1.5 text-white/90 hover:text-white transition group"
    >
      <Icon
        className={`w-6 h-6 ${iconColor} group-hover:scale-110 transition`}
        strokeWidth={1.8}
      />
      <span className="text-[13px] font-semibold leading-tight">{label}</span>
    </a>
  );
}

function NewsletterSignup() {
  const subscribe = useServerFn(subscribeNewsletter);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await subscribe({ data: { email: email.trim() } });
      if (res.ok) {
        setStatus("ok");
        setMsg("Thanks for subscribing!");
        setEmail("");
      } else {
        setStatus("error");
        setMsg(res.error ?? "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMsg("Please enter a valid email.");
    }
  }

  return (
    <div className="mt-6 rounded-2xl bg-white/5 border border-white/10 p-5">
      <h4 className="font-extrabold text-white text-[16px] mb-1">
        <T>Get Notified About Available Rooms</T>
      </h4>
      <p className="text-[13px] text-white/75 mb-3 leading-snug">
        <T>Want us to email you when a room opens up? Join our mailing list.</T>
      </p>
      {status === "ok" ? (
        <p className="text-[14px] font-semibold text-coral"><T>You&apos;re on the list — thanks!</T></p>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="flex-1 rounded-md bg-white text-surface-dark px-3 py-2 text-[14px] placeholder:text-surface-dark/50 focus:outline-none focus:ring-2 focus:ring-coral"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-md bg-coral text-white font-bold text-[14px] px-4 py-2 hover:opacity-90 transition disabled:opacity-60 whitespace-nowrap"
          >
            {status === "loading" ? "..." : "Sign Me Up"}
          </button>
        </form>
      )}
      {status === "error" && (
        <p className="text-[12px] text-red-300 mt-2">{msg}</p>
      )}
    </div>
  );
}

const SHORT_ADDRESSES: Record<string, string> = {
  "102-amour": "102 Chemin d'Amour",
  "58-conrad": "58 Rue Conrad-Valéra",
  "260-colline": "260 Avenue de la Colline",
};

export function Footer() {
  return (
    <footer className="bg-surface-dark text-white pb-10 md:pb-20">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 pt-16 md:pt-20">
        <div className="grid gap-12 lg:gap-10 lg:grid-cols-12 items-start">
          {/* Left section — brand + newsletter */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl p-3 inline-flex items-center justify-center shadow-md mb-4">
              <img src={logo} alt="Zorba Rentals" className="h-[60px] w-auto object-contain" />
            </div>
            <p className="text-[15px] text-white/85 leading-relaxed mb-3 font-medium">
              <T>Furnished monthly rooms in Ottawa/Hull NCR. No credit check, only first month to move in. 15 min direct bus to downtown Ottawa.</T>
            </p>
            <div className="flex items-center gap-2 text-[15px] font-semibold text-white/85">
              <MapPin className="w-4 h-4 shrink-0 text-coral" />
              <span>Ottawa/Hull NCR — National Capital Region</span>
            </div>
            <a
              href={CONTACT.youtube}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-[14px] font-semibold text-coral hover:underline"
            >
              <Youtube className="w-4 h-4" /> <T>View room tours on YouTube</T>
            </a>
            <NewsletterSignup />
          </div>

          {/* Right section — 3 link columns grouped together */}
          <div className="lg:col-span-7 grid gap-10 sm:grid-cols-3 sm:gap-8">
            <div>
              <ColTitle><T>Stay</T></ColTitle>
              <ul className="space-y-1">
                <li><FLink to="/rooms"><T>All Rooms</T></FLink></li>
                {PROPERTIES.map((p) => {
                  const map = PROPERTY_MAP_LINKS[p.id];
                  return (
                    <li key={p.id}>
                      <a
                        href={map?.short ?? "#"}
                        target="_blank"
                        rel="noreferrer"
                        className={linkCls}
                        title={map?.full}
                      >
                        {SHORT_ADDRESSES[p.id] ?? p.address}
                      </a>
                    </li>
                  );
                })}
                <li><FLink to="/book"><T>Booking Page</T></FLink></li>
                <li><FLink to="/portal"><T>Tenant Portal</T></FLink></li>
                <li><FLink to="/extras"><T>Extras</T></FLink></li>
                <li>
                  <Link to="/pay" className={linkCls + " text-coral hover:text-coral"}>
                    <span className="inline-flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4" /> <T>Payment Options →</T>
                    </span>
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <ColTitle><T>Company</T></ColTitle>
              <ul className="space-y-1">
                <li><FLink to="/about"><T>About Us</T></FLink></li>
                <li><FLink to="/faq"><T>FAQ</T></FLink></li>
                <li><FLink to="/faq"><T>How It Works</T></FLink></li>
                <li><FLink to="/newcomer"><T>Newcomer Guide</T></FLink></li>
                <li><FLink to="/transit"><T>Transit</T></FLink></li>
                <li><FLink to="/apply"><T>Apply Now</T></FLink></li>
              </ul>
            </div>

            <div>
              {/* Contact Us */}
              <ColTitle><T>Contact Us</T></ColTitle>
              <div className="flex flex-wrap gap-4 mb-6">
                <ContactItem
                  href={CONTACT.tel}
                  Icon={Phone}
                  label="Call"
                  iconColor="text-emerald-400"
                />
                <ContactItem
                  href={CONTACT.whatsapp}
                  Icon={MessageCircle}
                  label="WhatsApp"
                  iconColor="text-[#25D366]"
                />
                <ContactItem
                  href={CONTACT.email}
                  Icon={Mail}
                  label="Email"
                  iconColor="text-coral"
                />
                <ContactItem
                  href={CONTACT.messenger}
                  Icon={Send}
                  label="Messenger"
                  iconColor="text-[#0084FF]"
                />
              </div>

              {/* Follow Us */}
              <ColTitle><T>Follow Us</T></ColTitle>
              <div className="flex flex-wrap gap-4 mb-4">
                <ContactItem
                  href={CONTACT.facebook}
                  Icon={Facebook}
                  label="Facebook"
                  iconColor="text-[#1877F2]"
                />
                <ContactItem
                  href={CONTACT.facebookProfile}
                  Icon={Facebook}
                  label="Facebook"
                  iconColor="text-[#1877F2]"
                />
                <ContactItem
                  href={CONTACT.instagram}
                  Icon={Instagram}
                  label="Instagram"
                  iconColor="text-[#D62976]"
                />
                <ContactItem
                  href={CONTACT.youtube}
                  Icon={Youtube}
                  label="YouTube"
                  iconColor="text-[#FF0000]"
                />
              </div>

              <p className="text-[13px] italic text-white/70 pt-2 font-medium">
                Je parle arabe et anglais — Texte en français
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 py-6 border-t border-white/15 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-[12px] md:text-[13px] text-white/80">
          <div className="space-y-1 text-center md:text-left">
            <p className="font-semibold text-white">
              &copy; 2026 Zorba Rentals. All rights reserved.
            </p>
            <p className="text-white/75">
              Ottawa/Hull NCR — National Capital Region
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-2 gap-y-1">
            <a
              href="https://aylmer-rooms-hub.lovable.app/"
              target="_blank"
              rel="noreferrer"
              className="font-semibold hover:text-white hover:underline"
            >
              zorbaco.com
            </a>
            <span className="text-white/30">·</span>
            <span className="font-medium italic inline-flex items-center gap-1">
              Website made with love <span className="text-coral not-italic">♥</span>
            </span>
          </div>
        </div>
      </div>

      {/* Designer credit strip */}
      <div className="bg-cream text-ink/80 border-t border-cream-deep/40">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-8 py-6 md:py-10 text-center text-[14px] md:text-[15px] leading-relaxed">
          Designed by{" "}
          <a
            href="https://RootsWingsFly.com"
            target="_blank"
            rel="noreferrer"
            className="font-bold text-ink hover:text-coral hover:underline"
          >
            @RootsWingsFly
          </a>{" "}
          — website design &amp; builds, inquiries welcome
        </div>
      </div>
    </footer>
  );
}
