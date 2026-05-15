import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { LanguageToggle } from "./LanguageToggle";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/properties", label: "Properties" },
  { to: "/transit", label: "Transit & Maps" },
  { to: "/newcomer", label: "Newcomer Guide" },
  { to: "/faq", label: "FAQ" },
  { to: "/apply", label: "Apply" },
  { to: "/#contact", label: "Contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border/60">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="inline-flex w-9 h-9 rounded-xl bg-ink text-primary-foreground items-center justify-center font-display text-lg shrink-0">
              Z
            </span>
            <span className="text-ink font-black text-base sm:text-xl tracking-tight whitespace-nowrap">
              ZORBA RENTALS
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <LanguageToggle />
            <button
              onClick={() => setOpen(true)}
              className="touch-min p-2.5 rounded-full hover:bg-cream border border-border/60"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6 text-ink" strokeWidth={2.25} />
            </button>
          </div>
        </div>
      </header>

      {/* Drawer */}
      <div
        className={`fixed inset-0 z-50 transition ${open ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          className={`absolute inset-0 bg-ink/40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
          onClick={() => setOpen(false)}
        />
        <aside
          className={`absolute top-0 end-0 h-full w-80 max-w-[85vw] bg-card shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "translate-x-full rtl:-translate-x-full"
          }`}
        >
          <div className="flex justify-between items-center p-5 border-b border-border/60">
            <span className="font-display text-2xl text-ink">Menu</span>
            <button
              onClick={() => setOpen(false)}
              className="touch-min p-2 rounded-full hover:bg-cream"
              aria-label="Close menu"
            >
              <X className="w-6 h-6 text-ink" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-1">
            {NAV.map((l) =>
              l.to.startsWith("/#") ? (
                <a
                  key={l.to}
                  href={l.to}
                  onClick={() => setOpen(false)}
                  className="touch-min px-5 py-3.5 rounded-2xl hover:bg-cream text-base font-semibold text-ink"
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="touch-min px-5 py-3.5 rounded-2xl hover:bg-cream text-base font-semibold text-ink"
                  activeProps={{ className: "bg-cream-deep text-ink" }}
                  activeOptions={{ exact: l.to === "/" }}
                >
                  {l.label}
                </Link>
              )
            )}
          </nav>

          <div className="p-5 border-t border-border/60 text-xs text-ink/60">
            Aylmer-Gatineau, QC · 15 min to downtown Ottawa
          </div>
        </aside>
      </div>
    </>
  );
}
