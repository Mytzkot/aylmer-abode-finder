import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Phone } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingContactBar } from "@/components/FloatingContactBar";
import { NEWCOMER_LINKS, EMERGENCY } from "@/data/properties";
import { T } from "@/i18n/LanguageProvider";

export const Route = createFileRoute("/newcomer")({ component: NewcomerPage });

function NewcomerPage() {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Header />
      <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-12 md:py-16">
        <h1 className="font-display text-4xl md:text-5xl text-ink">Newcomer Guide</h1>
        <p className="text-ink/60 mt-2 mb-10">Helpful links for settling into Aylmer-Gatineau.</p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {NEWCOMER_LINKS.map((l) => (
            <a
              key={l.name}
              href={l.url}
              target="_blank"
              rel="noreferrer"
              className="block rounded-2xl bg-card border border-border/60 p-5 hover:border-cyan-pop hover:shadow-md transition"
            >
              <div className="font-display text-xl text-ink flex items-center justify-between gap-2">
                {l.name} <ExternalLink className="w-4 h-4 text-ink/40" />
              </div>
              <div className="text-sm text-ink/70 mt-2">{l.desc}</div>
            </a>
          ))}
        </div>

        <div className="mt-12 rounded-3xl bg-destructive/5 border border-destructive/20 p-6">
          <h2 className="font-display text-2xl mb-4 flex items-center gap-2 text-destructive">
            <Phone className="w-6 h-6" /> Emergency Numbers
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {EMERGENCY.map((e) => (
              <a
                key={e.number}
                href={`tel:${e.number.replace(/\D/g, "")}`}
                className="flex justify-between items-center rounded-full bg-card border border-border/60 px-5 py-3 hover:border-destructive transition"
              >
                <span className="font-semibold text-sm text-ink">{e.name}</span>
                <span className="font-bold text-destructive">{e.number}</span>
              </a>
            ))}
          </div>
        </div>
      </main>
      <Footer />
      <FloatingContactBar />
    </div>
  );
}
