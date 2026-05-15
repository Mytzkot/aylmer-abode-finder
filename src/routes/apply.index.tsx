import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingContactBar } from "@/components/FloatingContactBar";
import { PROPERTIES } from "@/data/properties";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/apply/")({ component: ApplyChooser });

function ApplyChooser() {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Header />
      <main className="flex-1 mx-auto max-w-3xl w-full px-4 py-12 md:py-16">
        <h1 className="font-display text-4xl md:text-5xl text-ink">Rental Application</h1>
        <p className="text-ink/60 mt-2 mb-10">Pick the property you'd like to apply for.</p>

        <div className="grid gap-4">
          {PROPERTIES.map((p) => (
            <Link
              key={p.id}
              to="/apply/$roomId"
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
      </main>
      <Footer />
      <FloatingContactBar />
    </div>
  );
}
