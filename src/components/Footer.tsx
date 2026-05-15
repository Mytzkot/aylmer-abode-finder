import { MessageCircle, Facebook, Youtube, Mail, Globe, Send } from "lucide-react";
import { CONTACT } from "@/data/properties";

export function Footer() {
  const links = [
    { href: CONTACT.whatsapp, icon: MessageCircle, label: "WhatsApp" },
    { href: CONTACT.messenger, icon: Send, label: "Messenger" },
    { href: CONTACT.facebook, icon: Facebook, label: "Facebook" },
    { href: CONTACT.youtube, icon: Youtube, label: "YouTube" },
    { href: CONTACT.email, icon: Mail, label: "Email" },
    { href: CONTACT.website, icon: Globe, label: "Website" },
  ];
  return (
    <footer className="mt-16 pb-32 md:pb-24 border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {links.map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noreferrer"
              className="touch-min flex items-center gap-2 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground px-4 py-2 text-sm font-medium transition"
              aria-label={l.label}>
              <l.icon className="w-4 h-4" /> {l.label}
            </a>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Zorba Rentals · Aylmer-Gatineau, QC
        </p>
      </div>
    </footer>
  );
}
