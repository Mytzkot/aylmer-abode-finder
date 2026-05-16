import { Link } from "@tanstack/react-router";
import { Menu, X, ChevronDown } from "lucide-react";
import { useState } from "react";
import { LanguageToggle } from "./LanguageToggle";
import { T, useTranslated } from "@/i18n/LanguageProvider";
import { PROPERTIES } from "@/data/properties";
import logo from "@/assets/zorba-logo-transparent.png";

const PRIMARY_NAV = [
  { to: "/", label: "Home" },
  { to: "/rooms", label: "All Rooms" },
  { to: "/apply", label: "Apply Now" },
  { to: "/about", label: "About Us" },
];

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
  const [locOpen, setLocOpen] = useState(false);
  const openMenu = useTranslated("Open menu");
  const closeMenu = useTranslated("Close menu");

  const baseCls = "font-typewriter uppercase tracking-[0.14em] text-[14px] lg:text-[15px] font-bold text-white/90 hover:text-white transition";
  const activeCls = baseCls + " border-b-[3px] border-white pb-1";

  const navLink = (l: { to: string; label: string }, onClick?: () => void) =>
    l.to.startsWith("/#") ? (
      <a key={l.to} href={l.to} onClick={onClick} className={baseCls}>
        <T>{l.label}</T>
      </a>
    ) : (
      <Link
        key={l.to}
        to={l.to}
        onClick={onClick}
        className={baseCls}
        activeProps={{ className: activeCls }}
        activeOptions={{ exact: l.to === "/" }}
      >
        <T>{l.label}</T>
      </Link>
    );

  return (
    <>
      <header className="sticky top-0 z-40 bg-surface-dark text-white border-b border-white/10 w-full">
        <div className="mx-auto max-w-7xl px-4 h-20 flex items-center justify-between gap-3">
          <Link to="/" aria-label="Zorba Guest Houses — Home" className="flex items-center shrink-0">
            <img src={logo} alt="Zorba Guest Houses" className="h-14 md:h-16 w-auto" />
          </Link>

          {/* DESKTOP nav: trimmed + Locations dropdown */}
          <nav className="hidden md:flex items-center gap-6">
            {PRIMARY_NAV.map((l) => navLink(l))}

            <div
              className="relative"
              onMouseEnter={() => setLocOpen(true)}
              onMouseLeave={() => setLocOpen(false)}
            >
              <button
                onClick={() => setLocOpen((v) => !v)}
                className={baseCls + " flex items-center gap-1"}
                aria-haspopup="menu"
                aria-expanded={locOpen}
              >
                <T>Locations</T>
                <ChevronDown className="w-4 h-4" strokeWidth={2.5} />
              </button>
              {locOpen && (
                <div className="absolute end-0 top-full pt-3 min-w-[260px]">
                  <div className="rounded-xl bg-white text-ink shadow-2xl border border-border/40 overflow-hidden">
                    <Link
                      to="/properties"
                      onClick={() => setLocOpen(false)}
                      className="block px-4 py-3 text-sm font-bold uppercase tracking-wide hover:bg-cream"
                    >
                      <T>All Locations</T>
                    </Link>
                    <div className="h-px bg-border/60" />
                    {PROPERTIES.map((p) => (
                      <Link
                        key={p.id}
                        to="/properties/$id"
                        params={{ id: p.id }}
                        onClick={() => setLocOpen(false)}
                        className="block px-4 py-3 text-sm font-semibold hover:bg-cream"
                      >
                        {p.address}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          <div className="flex items-center gap-2 ml-2 pl-3 border-l border-white/20">
            <LanguageToggle />
            {/* Book Now dropdown */}
            <div className="hidden md:block relative group">
              <button
                className="btn-pill bg-white text-surface-dark hover:bg-white/90 text-[14px] px-4 py-2.5 font-typewriter uppercase tracking-[0.14em] font-bold inline-flex items-center gap-1"
                aria-haspopup="menu"
              >
                <T>Book Now</T>
                <ChevronDown className="w-4 h-4" strokeWidth={2.5} />
              </button>
              <div className="absolute end-0 top-full pt-2 min-w-[220px] hidden group-hover:block group-focus-within:block">
                <div className="rounded-xl bg-white text-ink shadow-2xl border border-border/40 overflow-hidden">
                  <Link to="/book" className="block px-4 py-3 text-sm font-bold uppercase tracking-wide hover:bg-cream">
                    <T>Booking Page</T>
                  </Link>
                  <div className="h-px bg-border/60" />
                  <Link to="/pay" className="block px-4 py-3 text-sm font-bold uppercase tracking-wide hover:bg-cream">
                    <T>Pay Online (Monthly)</T>
                  </Link>
                  <div className="h-px bg-border/60" />
                  <Link to="/portal" className="block px-4 py-3 text-sm font-bold uppercase tracking-wide hover:bg-cream">
                    <T>Tenant Portal</T>
                  </Link>
                </div>
              </div>
            </div>
            {/* Hamburger ALWAYS visible */}
            <button
              onClick={() => setOpen(true)}
              className="touch-min p-2.5 rounded-xl hover:bg-white/10 border border-white/20"
              aria-label={openMenu}
            >
              <Menu className="w-6 h-6 text-white" strokeWidth={2.25} />
            </button>
          </div>
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
