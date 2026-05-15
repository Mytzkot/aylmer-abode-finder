import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingContactBar } from "@/components/FloatingContactBar";
import { ContactForm } from "@/components/ContactForm";
import { PROPERTIES } from "@/data/properties";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Header />

      {/* HERO */}
      <section className="bg-cream">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-20 grid md:grid-cols-2 gap-10 md:gap-14 items-center">
          <div>
            <p className="text-sm md:text-base font-semibold accent-text uppercase tracking-wide">
              Comfortable Living
            </p>
            <h1 className="mt-3 font-display text-4xl md:text-6xl leading-[1.05] text-ink">
              Furnished Monthly Rooms in Ottawa/Gatineau
            </h1>
            <p className="mt-4 font-display text-2xl md:text-3xl text-ink/70 leading-tight">
              Chambres Meublées à Gatineau/Ottawa
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/properties" className="btn-pill btn-coral text-base px-7 py-3.5">
                Room Rentals
              </Link>
              <a
                href="#contact"
                className="btn-pill btn-outline-ink text-base px-7 py-3.5"
              >
                Storage Rentals
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-cyan-pop/20 rounded-[2.5rem] blur-2xl" />
            <img
              src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1400&q=85"
              alt="Welcoming furnished room"
              className="relative rounded-[2.5rem] aspect-[4/3] w-full object-cover shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* OUR LOCATIONS */}
      <section className="bg-cream">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <h2 className="font-display text-3xl md:text-5xl text-ink text-center">Our Locations</h2>
          <p className="text-center text-ink/60 mt-2 mb-10">Tap a card to see details</p>

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

      {/* CONTACT */}
      <section id="contact" className="bg-cream-deep/30 scroll-mt-20">
        <div className="mx-auto max-w-3xl px-4 py-14 md:py-20">
          <h2 className="font-display text-3xl md:text-5xl text-ink text-center">Get in Touch</h2>
          <p className="mt-4 text-center text-ink/70 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            Questions about our furnished rooms? Reach out and we'll respond quickly.
            <br className="hidden sm:inline" />
            <span className="text-ink/60">
              Des questions sur nos chambres meublées ? Écrivez-nous, nous répondons rapidement.
            </span>
          </p>

          <div className="mt-10">
            <ContactForm />
          </div>
        </div>
      </section>

      <Footer />
      <FloatingContactBar />
    </div>
  );
}
