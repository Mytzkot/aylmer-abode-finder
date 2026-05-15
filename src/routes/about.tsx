import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingContactBar } from "@/components/FloatingContactBar";
import { T } from "@/i18n/LanguageProvider";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Zorba Rentals" },
      { name: "description", content: "About Zorba Rentals — comfortable furnished rooms in Aylmer-Gatineau." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Header />
      <main className="flex-1 mx-auto max-w-3xl w-full px-4 py-12 md:py-20">
        <p className="text-sm font-semibold accent-text uppercase tracking-wider">About Us</p>
        <h1 className="font-display text-4xl md:text-6xl text-ink mt-3">Comfortable living, made simple.</h1>

        <div className="mt-8 space-y-5 text-ink/80 text-base md:text-lg leading-relaxed">
          <p>
            Zorba Rentals offers furnished monthly and short-stay rooms across three friendly
            properties in Aylmer-Gatineau, Quebec — just a 15-minute direct bus to downtown Ottawa.
          </p>
          <p>
            Every room comes ready to live in: queen bed, smart TV, mini-fridge, coffee maker,
            keypad lock, fast Wi-Fi, and all utilities included. No credit check, no long lease,
            and only the first month's rent to move in.
          </p>
          <p>
            Whether you're a student, a newcomer, a worker on contract, or just visiting the
            region — we make settling in quick, warm and worry-free.
          </p>
          <p className="text-ink/60 italic">
            Hébergement confortable, simple et accueillant — pour étudiants, nouveaux arrivants
            et voyageurs.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/properties" className="btn-pill btn-coral px-6 py-3 uppercase tracking-wider text-sm">
            See Locations
          </Link>
          <Link to="/apply" className="btn-pill btn-outline-ink px-6 py-3 uppercase tracking-wider text-sm">
            Apply Now
          </Link>
        </div>
      </main>
      <Footer />
      <FloatingContactBar />
    </div>
  );
}
