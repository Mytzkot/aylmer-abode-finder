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
    <header className="sticky top-0 z-40 bg-card/90 backdrop-blur border-b border-border">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <span className="inline-flex w-8 h-8 rounded-lg bg-primary text-primary-foreground items-center justify-center font-black">Z</span>
          <span>ZORBA <span className="text-primary">RENTALS</span></span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <button onClick={() => setOpen(true)} className="touch-min p-2 rounded-lg hover:bg-secondary" aria-label="Menu">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-foreground/40" onClick={() => setOpen(false)}>
          <aside
            className="absolute top-0 end-0 h-full w-80 max-w-[85vw] bg-card shadow-xl p-6 flex flex-col gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-lg">Menu</span>
              <button onClick={() => setOpen(false)} className="touch-min p-2 rounded-lg hover:bg-secondary" aria-label="Close">
                <X className="w-6 h-6" />
              </button>
            </div>
            {links.map((l) => (
              <a
                key={l.to}
                href={l.to}
                onClick={() => setOpen(false)}
                className="touch-min px-3 py-3 rounded-lg hover:bg-secondary text-base font-medium"
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
