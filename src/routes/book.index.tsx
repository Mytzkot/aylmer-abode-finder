import { createFileRoute, Link } from "@tanstack/react-router";
import { PROPERTIES } from "@/data/properties";
import { ArrowRight, CreditCard } from "lucide-react";
import { T } from "@/i18n/LanguageProvider";

export const Route = createFileRoute("/book/")({
  component: BookChooser,
  head: () => ({
    meta: [
      { title: "Book a Room — Zorba Rentals" },
      { name: "description", content: "Book a monthly stay at one of our furnished guest houses in Aylmer-Gatineau." },
      { property: "og:title", content: "Book a Room — Zorba Rentals" },
      { property: "og:description", content: "Monthly furnished rooms across Aylmer-Gatineau." },
      { property: "og:url", content: "/book" },
    ],
    links: [{ rel: "canonical", href: "/book" }],
  }),
});

function BookChooser() {
  return (
    <main className="flex-1 mx-auto max-w-3xl w-full px-4 py-12 md:py-16">
      <h1 className="font-display text-4xl md:text-5xl text-ink"><T>Booking Page</T></h1>
      <p className="text-ink/60 mt-2 mb-10"><T>Pick the property you'd like to book.</T></p>

      <div className="grid gap-4">
        {PROPERTIES.map((p) => (
          <Link
            key={p.id}
            to="/book/$roomId"
            params={{ roomId: p.id }}
            className="group flex items-center gap-4 rounded-3xl bg-card border border-border/60 p-4 hover:border-coral hover:shadow-lg transition"
          >
            <img src={p.images[0]} alt={p.address} className="w-24 h-24 rounded-2xl object-cover" />
            <div className="flex-1 min-w-0">
              <div className="font-display text-xl text-ink leading-tight">{p.address}</div>
              <div className="text-sm text-ink/60">{p.city}</div>
            </div>
            <ArrowRight className="w-5 h-5 text-ink/40 group-hover:text-coral flip-rtl" />
          </Link>
        ))}
      </div>

      <Link
        to="/pay"
        className="mt-10 flex items-center gap-4 rounded-3xl bg-surface-dark text-white p-5 hover:opacity-95 transition"
      >
        <div className="w-12 h-12 rounded-xl bg-white text-surface-dark flex items-center justify-center shrink-0">
          <CreditCard className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="font-display text-xl"><T>Already a monthly tenant?</T></div>
          <div className="text-sm text-white/80"><T>Pay your rent online — card, PayPal, e-Transfer.</T></div>
        </div>
        <ArrowRight className="w-5 h-5 flip-rtl" />
      </Link>
    </main>
  );
}
