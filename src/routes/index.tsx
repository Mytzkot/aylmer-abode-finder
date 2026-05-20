import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useEffect } from "react";
import { Facebook } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { PROPERTIES, CONTACT } from "@/data/properties";
import { useLang } from "@/i18n/LanguageProvider";
import { FlexibleStays } from "@/components/FlexibleStays";
import { WhatsIncluded } from "@/components/WhatsIncluded";
import { useServerFn } from "@tanstack/react-start";
import { incrementVisitorCount } from "@/lib/visitor-counter.functions";
import { ReviewsSection } from "@/components/ReviewsSection";
import heroImg from "@/assets/hero-room.jpg";

const LocationsMap = lazy(() => import("@/components/LocationsMap"));

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Zorba Rentals — Furnished Monthly Rooms in Aylmer-Gatineau" },
      { name: "description", content: "Furnished monthly room rentals in Aylmer-Gatineau, 15 minutes by direct bus to downtown Ottawa. No credit check, first month only to move in. Wi-Fi and utilities included." },
      { property: "og:title", content: "Zorba Rentals — Furnished Monthly Rooms in Aylmer-Gatineau" },
      { property: "og:description", content: "Furnished monthly rooms, 15-min direct bus to downtown Ottawa. No credit check." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

function HomePage() {
  const { t } = useLang();
  const h = t.home;
  const bump = useServerFn(incrementVisitorCount);
  useEffect(() => {
    bump().catch(() => {});
  }, [bump]);
  return (
    <div className="min-h-screen flex flex-col bg-cream">


      {/* HERO */}
      <section className="bg-cream">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-20 grid md:grid-cols-2 gap-10 md:gap-14 items-center">
          <div>
            <h1 className="font-display text-4xl md:text-6xl leading-[1.05] text-ink">
              {h.title}
            </h1>
            <p className="mt-4 font-display text-xl md:text-2xl text-ink/70 leading-tight">
              {h.subtitle}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/rooms" className="btn-pill btn-coral text-base px-7 py-3.5">
                {h.ctaRooms}
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-brand/15 rounded-[2.5rem] blur-2xl" />
            <img
              src={heroImg}
              alt="Cozy furnished guest room with smart TV, mini-fridge and a cuddly koala on the bed"
              className="relative rounded-[2.5rem] aspect-square w-full object-cover shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* OUR LOCATIONS */}
      <section className="bg-cream">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <h2 className="font-display text-3xl md:text-5xl text-ink text-center">{h.locations}</h2>
          <p className="text-center text-ink/60 mt-2 mb-10">{h.locationsHint}</p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PROPERTIES.map((p) => (
              <Link
                key={p.id}
                to="/properties/$id"
                params={{ id: p.id }}
                className="group block rounded-3xl overflow-hidden bg-card border border-border/40 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition"
              >
                <div className="aspect-[4/3] overflow-hidden bg-cream-deep">
                  <img
                    src={p.images[0]}
                    alt={p.address}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
                <div className="p-5 text-center">
                  <h3 className="font-display text-xl md:text-2xl text-ink leading-tight">
                    {p.address}
                  </h3>
                  <p className="text-sm text-ink/60 mt-1">{p.city}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT'S INCLUDED */}
      <WhatsIncluded variant="condensed" />

      {/* FLEXIBLE STAYS */}
      <section className="bg-cream">
        <div className="mx-auto max-w-3xl px-4 pb-6">
          <FlexibleStays />
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="bg-cream-deep/30 scroll-mt-20">

        <div className="mx-auto max-w-3xl px-4 py-14 md:py-20">
          <h2 className="font-display text-3xl md:text-5xl text-ink text-center">{h.contactTitle}</h2>
          <p className="mt-4 text-center text-ink/70 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            {h.contactBody}
          </p>

          <div className="mt-10">
            <ContactForm />
          </div>

          <div className="mt-8 flex justify-center">
            <a
              href={CONTACT.facebook}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 btn-pill bg-[#1877F2] text-white px-5 py-3 font-bold hover:brightness-110"
            >
              <Facebook className="w-5 h-5" strokeWidth={2.25} />
              Visit us on Facebook
            </a>
          </div>
        </div>
      </section>

      {/* MAP */}
      <section className="bg-cream pb-10 md:pb-14">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="font-display text-2xl md:text-4xl text-ink text-center mb-4">Find Us On The Map</h2>
          <div className="rounded-3xl overflow-hidden border border-border/60 shadow-lg">
            <Suspense fallback={<div className="w-full h-[320px] bg-cream-deep/40 animate-pulse" />}>
              <LocationsMap />
            </Suspense>
          </div>
        </div>
      </section>

      {/* CUSTOMER REVIEWS — just above footer */}
      <ReviewsSection />

    </div>
  );
}
