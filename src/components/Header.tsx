import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import { LanguageToggle } from "./LanguageToggle";

export function Header() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/", label: t.nav.home },
    { to: "/#properties", label: t.nav.properties },
    { to: "/#transit", label: t.nav.transit },
    { to: "/#newcomer", label: t.nav.newcomer },
    { to: "/admin", label: t.nav.admin },
  ];

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border/60">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2 font-display tracking-tight">
          <span className="inline-flex w-9 h-9 rounded-xl bg-ink text-primary-foreground items-center justify-center font-display text-lg shrink-0">Z</span>
          <span className="text-ink font-black text-base sm:text-xl whitespace-nowrap">ZORBA RENTALS</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.slice(0, 4).map(l => (
            <a key={l.to} href={l.to} className="px-3 py-2 rounded-full text-sm font-semibold text-ink/80 hover:text-ink hover:bg-cream">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <a href="#properties" className="hidden sm:inline-flex btn-pill btn-outline-ink text-sm">Book Now</a>
          <button onClick={() => setOpen(true)} className="touch-min p-2 rounded-lg hover:bg-cream md:hidden" aria-label="Menu">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-ink/40 md:hidden" onClick={() => setOpen(false)}>
          <aside
            className="absolute top-0 end-0 h-full w-80 max-w-[85vw] bg-card shadow-xl p-6 flex flex-col gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <span className="font-display text-2xl text-ink">Menu</span>
              <button onClick={() => setOpen(false)} className="touch-min p-2 rounded-lg hover:bg-cream" aria-label="Close">
                <X className="w-6 h-6" />
              </button>
            </div>
            {links.map((l) => (
              <a
                key={l.to}
                href={l.to}
                onClick={() => setOpen(false)}
                className="touch-min px-4 py-3 rounded-full hover:bg-cream text-base font-semibold text-ink"
              >
                {l.label}
              </a>
            ))}
          </aside>
        </div>
      )}
    </header>
  );
}
