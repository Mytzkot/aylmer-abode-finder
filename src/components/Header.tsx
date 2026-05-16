import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { LanguageToggle } from "./LanguageToggle";
import { T, useTranslated } from "@/i18n/LanguageProvider";
import { PROPERTIES } from "@/data/properties";
import logo from "@/assets/zorba-logo-transparent.png";

const FULL_NAV = [
  { to: "/", label: "Home" },
  { to: "/rooms", label: "All Rooms" },
  { to: "/properties", label: "Locations" },
  { to: "/book", label: "Booking Page" },
  { to: "/pay", label: "Pay Online" },
  { to: "/portal", label: "Tenant Portal" },
  { to: "/apply", label: "Apply Now" },
  { to: "/about", label: "About Us" },
  { to: "/faq", label: "FAQ" },
  { to: "/newcomer", label: "Newcomer Guide" },
  { to: "/transit", label: "Transit" },
  { to: "/#contact", label: "Contact Us" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const openMenu = useTranslated("Open menu");
  const closeMenu = useTranslated("Close menu");

  return (
    <>
      <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur text-surface-dark border-b border-ink/10 w-full">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 h-16 md:h-20 flex items-center justify-between gap-2">
          <Link to="/" aria-label="Zorba Guest Houses — Home" className="flex items-center shrink-0 min-w-0">
            <img
              src={logo}
              alt="Zorba Guest Houses"
              className="h-10 sm:h-12 md:h-16 w-auto"
            />
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <LanguageToggle />
            <Link
              to="/book"
              className="btn-pill bg-surface-dark text-white hover:brightness-110 text-[11px] sm:text-[13px] md:text-[14px] px-2.5 sm:px-3.5 md:px-4 py-2 md:py-2.5 font-typewriter uppercase tracking-[0.1em] sm:tracking-[0.14em] font-bold whitespace-nowrap"
            >
              <T>Book Now</T>
            </Link>
            <button
              onClick={() => setOpen(true)}
              className="touch-min p-2 sm:p-2.5 rounded-xl hover:bg-surface-dark/10 border border-surface-dark/20 text-surface-dark"
              aria-label={openMenu}
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.25} />
            </button>
          </div>
        </div>
      </header>

      {/* Slide-out drawer (full menu) */}
      <div
        className={`fixed inset-0 z-50 transition ${open ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          className={`absolute inset-0 bg-ink/50 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
          onClick={() => setOpen(false)}
        />
        <aside
          className={`absolute top-0 end-0 h-full w-80 max-w-[85vw] bg-surface-dark text-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "translate-x-full rtl:-translate-x-full"
          }`}
        >
          <div className="flex justify-between items-center p-5 border-b border-white/15">
            <img src={logo} alt="Zorba Guest Houses" className="h-10 w-auto" />
            <button
              onClick={() => setOpen(false)}
              className="touch-min p-2 rounded-xl hover:bg-white/10"
              aria-label={closeMenu}
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-1">
            {FULL_NAV.map((l) =>
              l.to.startsWith("/#") ? (
                <a
                  key={l.to}
                  href={l.to}
                  onClick={() => setOpen(false)}
                  className="touch-min px-5 py-3.5 rounded-xl hover:bg-white/10 font-typewriter uppercase tracking-[0.12em] text-sm font-bold text-white"
                >
                  <T>{l.label}</T>
                </a>
              ) : (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="touch-min px-5 py-3.5 rounded-xl hover:bg-white/10 font-typewriter uppercase tracking-[0.12em] text-sm font-bold text-white"
                  activeProps={{ className: "bg-white/15" }}
                  activeOptions={{ exact: l.to === "/" }}
                >
                  <T>{l.label}</T>
                </Link>
              )
            )}

            <div className="mt-4 px-5 text-xs uppercase tracking-wider font-bold text-white/60">
              <T>Properties</T>
            </div>
            {PROPERTIES.map((p) => (
              <Link
                key={p.id}
                to="/properties/$id"
                params={{ id: p.id }}
                onClick={() => setOpen(false)}
                className="touch-min px-5 py-3 rounded-xl hover:bg-white/10 text-sm font-semibold text-white/90"
              >
                {p.address}
              </Link>
            ))}

            <Link
              to="/book"
              onClick={() => setOpen(false)}
              className="mt-4 btn-pill bg-white text-surface-dark hover:bg-white/90 font-typewriter uppercase tracking-[0.12em] text-sm px-5 py-3 justify-center font-bold"
            >
              <T>Book Now</T>
            </Link>
          </nav>
        </aside>
      </div>
    </>
  );
}
