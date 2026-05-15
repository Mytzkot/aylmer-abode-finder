import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { LanguageToggle } from "./LanguageToggle";
import logo from "@/assets/zorba-logo.png";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/apply", label: "Apply Now" },
  { to: "/about", label: "About Us" },
  { to: "/properties", label: "Locations" },
  { to: "/#contact", label: "Contact Us" },
  { to: "/faq", label: "FAQ" },
  { to: "/newcomer", label: "Newcomer Guide" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  const navLink = (l: { to: string; label: string }, onClick?: () => void) =>
    l.to.startsWith("/#") ? (
      <a
        key={l.to}
        href={l.to}
        onClick={onClick}
        className="font-typewriter uppercase tracking-[0.12em] text-[12px] text-ink/80 hover:text-ink transition"
      >
        {l.label}
      </a>
    ) : (
      <Link
        key={l.to}
        to={l.to}
        onClick={onClick}
        className="font-typewriter uppercase tracking-[0.12em] text-[12px] text-ink/80 hover:text-ink transition"
        activeProps={{ className: "font-typewriter uppercase tracking-[0.12em] text-[12px] text-ink underline underline-offset-8 decoration-2" }}
        activeOptions={{ exact: l.to === "/" }}
      >
        {l.label}
      </Link>
    );

  return (
    <>
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border/60">
        <div className="mx-auto max-w-7xl px-4 h-20 flex items-center justify-between gap-4">
          <Link to="/" aria-label="Zorba Guest Houses — Home" className="flex items-center shrink-0">
            <img src={logo} alt="Zorba Guest Houses" className="h-12 md:h-14 w-auto" />
          </Link>

          {/* DESKTOP nav */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-7">
            {NAV.map((l) => navLink(l))}
          </nav>

          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Link
              to="/book"
              className="hidden md:inline-flex btn-pill btn-coral text-sm px-5 py-2.5 font-typewriter uppercase tracking-[0.12em]"
            >
              Book Now
            </Link>
            {/* MOBILE hamburger */}
            <button
              onClick={() => setOpen(true)}
              className="md:hidden touch-min p-2.5 rounded-xl hover:bg-cream border border-border/60"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6 text-ink" strokeWidth={2.25} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition ${open ? "pointer-events-auto" : "pointer-events-none"}`}
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
            <img src={logo} alt="Zorba Guest Houses" className="h-10 w-auto" />
            <button
              onClick={() => setOpen(false)}
              className="touch-min p-2 rounded-xl hover:bg-cream"
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
                  className="touch-min px-5 py-3.5 rounded-xl hover:bg-cream font-typewriter uppercase tracking-[0.12em] text-sm text-ink"
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="touch-min px-5 py-3.5 rounded-xl hover:bg-cream font-typewriter uppercase tracking-[0.12em] text-sm text-ink"
                  activeProps={{ className: "bg-cream-deep text-ink" }}
                  activeOptions={{ exact: l.to === "/" }}
                >
                  {l.label}
                </Link>
              )
            )}
            <Link
              to="/book"
              onClick={() => setOpen(false)}
              className="mt-3 btn-pill btn-coral font-typewriter uppercase tracking-[0.12em] text-sm px-5 py-3 justify-center"
            >
              Book Now
            </Link>
          </nav>

          <div className="p-5 border-t border-border/60 text-xs text-ink/60">
            Comfortable Living · Hébergement Confortable
          </div>
        </aside>
      </div>
    </>
  );
}
