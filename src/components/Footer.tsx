import {
  MessageCircle,
  Phone,
  Facebook,
  Youtube,
  Instagram,
  Mail,
  MapPin,
  Send,
  Globe,
  Eye,
  CreditCard,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { CONTACT, PROPERTIES, PROPERTY_MAP_LINKS } from "@/data/properties";
import { T } from "@/i18n/LanguageProvider";
import { useServerFn } from "@tanstack/react-start";
import { getVisitorCount } from "@/lib/visitor-counter.functions";
import { subscribeNewsletter } from "@/lib/newsletter.functions";
import logo from "@/assets/zorba-logo-blue.png";

const SOCIALS = [
  { href: CONTACT.facebook, Icon: Facebook, label: "Facebook", color: "bg-[#1877F2] text-white" },
  { href: CONTACT.messenger, Icon: Send, label: "Messenger", color: "bg-[#0084FF] text-white" },
  { href: CONTACT.whatsapp, Icon: MessageCircle, label: "WhatsApp", color: "bg-[#25D366] text-white" },
  { href: CONTACT.youtube, Icon: Youtube, label: "YouTube", color: "bg-[#FF0000] text-white" },
  { href: CONTACT.instagram, Icon: Instagram, label: "Instagram", color: "bg-gradient-to-tr from-[#FEDA75] via-[#FA7E1E] to-[#D62976] text-white" },
  { href: CONTACT.email, Icon: Mail, label: "Email", color: "bg-white text-surface-dark" },
];

function ColTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-extrabold text-coral text-[14px] uppercase tracking-[0.18em] mb-4">
      {children}
    </h3>
  );
}

const linkCls =
  "block text-[15px] md:text-[16px] font-semibold text-white/90 hover:text-white hover:underline transition leading-tight";

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

function IconLink({
  href,
  Icon,
  iconColor,
  children,
}: {
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
      className="flex items-center gap-2.5 text-[15px] md:text-[16px] font-semibold text-white/90 hover:text-white hover:underline transition leading-tight"
    >
      <Icon className={`w-[18px] h-[18px] shrink-0 ${iconColor}`} />
      <span className="truncate">{children}</span>
    </a>
  );
}

function VisitorCount() {
  const fetchCount = useServerFn(getVisitorCount);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchCount()
      .then((r) => {
        if (!cancelled) setCount(r.count);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [fetchCount]);

  return (
    <span className="inline-flex items-center gap-1.5 text-white/70">
      <Eye className="w-3.5 h-3.5" />
      {count !== null ? `${count.toLocaleString()} ` : ""}
      <T>visitors</T>
    </span>
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
        <p className="text-[14px] font-semibold text-coral"><T>You're on the list — thanks!</T></p>
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
    <footer className="bg-surface-dark text-white pb-32 md:pb-24">
      <div className="mx-auto w-full max-w-[1280px] px-6 sm:px-8 pt-16 md:pt-20">
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
              <Youtube className="w-4 h-4 text-[#FF0000]" /> <T>View room tours on YouTube</T>
            </a>
            <NewsletterSignup />
          </div>

          {/* Right section — 3 link columns grouped together */}
          <div className="lg:col-span-7 grid gap-10 sm:grid-cols-3 sm:gap-8">
            <div>
              <ColTitle><T>Stay</T></ColTitle>
              <ul className="space-y-2.5">
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
              <ul className="space-y-2.5">
                <li><FLink to="/about"><T>About Us</T></FLink></li>
                <li><FLink to="/faq"><T>FAQ</T></FLink></li>
                <li><FLink to="/faq"><T>How It Works</T></FLink></li>
                <li><FLink to="/newcomer"><T>Newcomer Guide</T></FLink></li>
                <li><FLink to="/transit"><T>Transit</T></FLink></li>
                <li><FLink to="/apply"><T>Apply Now</T></FLink></li>
              </ul>
            </div>

            <div>
              <ColTitle><T>Connect</T></ColTitle>
              <ul className="space-y-2.5">
                <li><IconLink href={CONTACT.tel} Icon={Phone} iconColor="text-emerald-400">1-343-202-5460</IconLink></li>
                <li><IconLink href={CONTACT.whatsapp} Icon={MessageCircle} iconColor="text-[#25D366]">{CONTACT.whatsappShort}</IconLink></li>
                <li><IconLink href={CONTACT.messenger} Icon={Send} iconColor="text-[#0084FF]">{CONTACT.messengerShort}</IconLink></li>
                <li><IconLink href={CONTACT.facebook} Icon={Facebook} iconColor="text-[#1877F2]">{CONTACT.facebookShort}</IconLink></li>
                <li><IconLink href={CONTACT.youtube} Icon={Youtube} iconColor="text-[#FF0000]">{CONTACT.youtubeShort}</IconLink></li>
                <li><IconLink href={CONTACT.instagram} Icon={Instagram} iconColor="text-[#D62976]">{CONTACT.instagramShort}</IconLink></li>
                <li><IconLink href={CONTACT.email} Icon={Mail} iconColor="text-coral">{CONTACT.emailShort}</IconLink></li>
                <li><IconLink href={CONTACT.website} Icon={Globe} iconColor="text-sky-400">{CONTACT.websiteShort}</IconLink></li>
              </ul>
              <p className="text-[13px] italic text-white/70 pt-3 font-medium">
                Je parle arabe et anglais — Texte en français
              </p>
            </div>
          </div>
        </div>

        {/* Social icons row */}
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
                className={`w-11 h-11 rounded-full ${color} shadow hover:scale-110 transition flex items-center justify-center`}
              >
                <Icon className="w-4 h-4" strokeWidth={2.25} />
              </a>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-5 border-t border-white/15 grid gap-4 md:grid-cols-3 items-center text-[13px] text-white/75">
          <p className="font-semibold text-center md:text-left">
            © 2026 Zorba Rentals · Ottawa/Hull NCR — National Capital Region
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <VisitorCount />
            <span className="text-white/30">·</span>
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
          <div className="text-center md:text-right">
            <a
              href="https://RootsWingsFly.com"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-white hover:text-coral hover:underline"
            >
              Designed by @RootsWingsFly
            </a>
            <p className="text-[11px] text-white/55 mt-0.5 italic">
              Website design &amp; builds — inquiries welcome
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
