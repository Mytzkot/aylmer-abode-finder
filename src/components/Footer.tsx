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
  Play,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CONTACT, PROPERTIES, PROPERTY_MAP_LINKS } from "@/data/properties";
import { T } from "@/i18n/LanguageProvider";
import { useServerFn } from "@tanstack/react-start";
import { getVisitorCount } from "@/lib/visitor-counter.functions";
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

const SHORT_ADDRESSES: Record<string, string> = {
  "102-amour": "102 Chemin d'Amour",
  "58-conrad": "58 Rue Conrad-Valéra",
  "260-colline": "260 Avenue de la Colline",
};

export function Footer() {
  return (
    <footer className="bg-surface-dark text-white pb-32 md:pb-24">
      <div className="mx-auto max-w-6xl px-6 pt-16 md:pt-20">
        <div className="grid gap-12 sm:gap-10 sm:grid-cols-2 lg:grid-cols-4 items-start">
          {/* Col 1 — Brand */}
          <div>
            <div className="bg-white rounded-2xl p-3 inline-flex items-center justify-center shadow-md mb-4">
              <img src={logo} alt="Zorba Rentals" className="h-16 w-auto object-contain" />
            </div>
            <p className="text-[15px] text-white/85 leading-relaxed mb-3 font-medium">
              <T>Furnished monthly rooms in Aylmer-Gatineau. No credit check, only first month to move in. 15 min direct bus to downtown Ottawa.</T>
            </p>
            <div className="flex items-center gap-2 text-[15px] font-semibold text-white/85">
              <MapPin className="w-4 h-4 shrink-0 text-coral" />
              <span>Aylmer-Gatineau, QC</span>
            </div>
            <a
              href={CONTACT.youtube}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-[14px] font-semibold text-coral hover:underline"
            >
              <Youtube className="w-4 h-4 text-[#FF0000]" /> <T>View room tours on YouTube</T>
            </a>
          </div>

          {/* Col 2 — Stay */}
          <div>
            <ColTitle><T>Stay</T></ColTitle>
            <ul className="space-y-2">
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

          {/* Col 3 — Company */}
          <div>
            <ColTitle><T>Company</T></ColTitle>
            <ul className="space-y-2">
              <li><FLink to="/about"><T>About Us</T></FLink></li>
              <li><FLink to="/faq"><T>FAQ</T></FLink></li>
              <li><FLink to="/faq"><T>How It Works</T></FLink></li>
              <li><FLink to="/newcomer"><T>Newcomer Guide</T></FLink></li>
              <li><FLink to="/transit"><T>Transit</T></FLink></li>
              <li><FLink to="/apply"><T>Apply Now</T></FLink></li>
            </ul>
          </div>

          {/* Col 4 — Connect */}
          <div>
            <ColTitle><T>Connect</T></ColTitle>
            <ul className="space-y-2">
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
        <div className="mt-8 pt-5 border-t border-white/15 flex flex-col sm:flex-row flex-wrap items-center justify-between gap-3 text-[13px] text-white/75 text-center sm:text-left">
          <p className="font-semibold">© 2026 Zorba Rentals · Ottawa/Hull NCR — National Capital Region</p>
          <VisitorCount />
          <a
            href="https://aylmer-rooms-hub.lovable.app/"
            target="_blank"
            rel="noreferrer"
            className="font-semibold hover:text-white hover:underline"
          >
            zorbaco.com
          </a>
          <p className="font-medium italic inline-flex items-center gap-1">
            Website made with love <span className="text-coral not-italic">♥</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
