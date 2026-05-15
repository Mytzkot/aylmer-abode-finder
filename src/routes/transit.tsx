import { createFileRoute } from "@tanstack/react-router";
import { Bus, ExternalLink, MapPin } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingContactBar } from "@/components/FloatingContactBar";
import { PROPERTIES, STO_LINES } from "@/data/properties";
import { T } from "@/i18n/LanguageProvider";

export const Route = createFileRoute("/transit")({ component: TransitPage });

function TransitPage() {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Header />
      <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-12 md:py-16">
        <h1 className="font-display text-4xl md:text-5xl text-ink flex items-center gap-3">
          <Bus className="w-9 h-9 accent-text" /> <T>STO Bus Transit</T>
        </h1>
        <p className="text-ink/60 mt-2 mb-10"><T>Direct STO lines connect Aylmer to downtown Ottawa in about 15 minutes.</T></p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STO_LINES.map((l) => (
            <div key={l.line} className="rounded-3xl border border-border/60 p-6 bg-card">
              <div className="font-display text-5xl accent-text leading-none">#{l.line}</div>
              <div className="text-sm text-ink/70 mt-3 leading-snug"><T>{l.desc}</T></div>
            </div>
          ))}
        </div>

        <a
          href="https://www.sto.ca"
          target="_blank"
          rel="noreferrer"
          className="mt-8 btn-pill btn-ink inline-flex"
        >
          <ExternalLink className="w-4 h-4" /> <T>Live STO Schedule</T>
        </a>

        <h2 className="font-display text-3xl md:text-4xl text-ink mt-16 mb-6"><T>Property Maps</T></h2>
        <div className="grid gap-4 md:grid-cols-3">
          {PROPERTIES.map((p) => (
            <a
              key={p.id}
              href={p.maps}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl bg-card border border-border/60 p-5 hover:border-cyan-pop hover:shadow-md transition flex items-start gap-3"
            >
              <MapPin className="w-5 h-5 accent-text shrink-0 mt-0.5" />
              <div>
                <div className="font-display text-lg text-ink leading-tight">{p.address}</div>
                <div className="text-sm text-ink/60 mt-0.5">{p.city}</div>
                <div className="text-xs accent-text font-semibold mt-2 inline-flex items-center gap-1">
                  <T>Open in Google Maps</T> <ExternalLink className="w-3 h-3" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </main>
      <Footer />
      <FloatingContactBar />
    </div>
  );
}
