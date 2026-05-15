import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Bus, ExternalLink, Phone } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingContactBar } from "@/components/FloatingContactBar";
import { FaqChatbot } from "@/components/FaqChatbot";
import { PropertyCard } from "@/components/PropertyCard";
import { useLang } from "@/i18n/LanguageProvider";
import { PROPERTIES, STO_LINES, NEWCOMER_LINKS, EMERGENCY } from "@/data/properties";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export const Route = createFileRoute("/")({ component: HomePage });

interface RoomRow { id: string; property_id?: string | null; address?: string | null; current_status?: string | null; base_rate?: number | null; }

function HomePage() {
  const { t } = useLang();
  const [roomsByProp, setRoomsByProp] = useState<Record<string, RoomRow[]>>({});

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    (async () => {
      const { data: rooms } = await supabase.from("rooms").select("*");
      if (!rooms) return;
      const grouped: Record<string, RoomRow[]> = {};
      for (const p of PROPERTIES) grouped[p.id] = [];
      for (const r of rooms as RoomRow[]) {
        const key = (r.address || "").toLowerCase();
        let pid = PROPERTIES.find(p => key.includes(p.address.toLowerCase().split(" ")[0]))?.id;
        if (!pid && r.property_id) pid = r.property_id;
        if (pid && grouped[pid]) grouped[pid].push(r);
      }
      setRoomsByProp(grouped);
    })();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden bg-cream">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="font-display text-4xl md:text-6xl leading-[1.05] text-ink">
              {t.hero.title.split(" ").slice(0, -2).join(" ")}{" "}
              <span className="accent-text">{t.hero.title.split(" ").slice(-2).join(" ")}</span>
            </h1>
            <p className="mt-5 text-base md:text-lg text-ink/70 max-w-xl">{t.hero.subtitle}</p>

            <div className="mt-7 flex flex-wrap gap-2">
              {t.hero.badges.map((b) => (
                <span key={b} className="inline-flex items-center gap-1.5 rounded-full bg-card border border-border/50 px-3.5 py-1.5 text-sm font-semibold text-ink shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-success" /> {b}
                </span>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#properties" className="btn-pill btn-coral text-base px-6">{t.cta.book}</a>
              <a href="#properties" className="btn-pill btn-outline-ink text-base px-6">{t.cta.apply}</a>
            </div>

            <div className="mt-6 inline-flex items-center rounded-full bg-cream-deep text-ink px-5 py-2.5 font-bold text-sm">
              {t.hero.pricing}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-cyan-pop/20 rounded-[2rem] blur-2xl" />
            <img
              src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1400&q=85"
              alt="Furnished room interior"
              className="relative rounded-[2rem] aspect-[4/3] w-full object-cover shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* PROPERTIES */}
      <section id="properties" className="mx-auto max-w-6xl px-4 py-12 md:py-16 scroll-mt-20">
        <h2 className="font-display text-3xl md:text-5xl text-ink mb-2">{t.sections.properties}</h2>
        <p className="text-ink/60 mb-8">Three cozy houses across Aylmer-Gatineau.</p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PROPERTIES.map((p) => (
            <PropertyCard key={p.id} prop={p} rooms={roomsByProp[p.id] || []} />
          ))}
        </div>
        {!isSupabaseConfigured && (
          <p className="mt-4 text-xs text-muted-foreground italic">
            ⚠️ Supabase not connected yet — rooms data will load once you add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in src/lib/supabase.ts.
          </p>
        )}
      </section>

      {/* TRANSIT */}
      <section id="transit" className="bg-card border-y border-border scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2"><Bus className="w-7 h-7 text-primary" /> {t.sections.transit}</h2>
          <p className="text-muted-foreground mb-6 text-sm">Direct STO lines to downtown Ottawa</p>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {STO_LINES.map((l) => (
              <div key={l.line} className="rounded-xl border border-border p-4 bg-background">
                <div className="text-3xl font-black text-primary">#{l.line}</div>
                <div className="text-sm text-muted-foreground mt-1">{l.desc}</div>
              </div>
            ))}
          </div>
          <a href="https://www.sto.ca" target="_blank" rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3 font-semibold hover:opacity-90">
            <ExternalLink className="w-4 h-4" /> {t.sections.schedule}
          </a>
        </div>
      </section>

      {/* NEWCOMER */}
      <section id="newcomer" className="mx-auto max-w-6xl px-4 py-10 scroll-mt-20">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">{t.sections.newcomer}</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {NEWCOMER_LINKS.map(l => (
            <a key={l.name} href={l.url} target="_blank" rel="noreferrer"
              className="block rounded-xl bg-card border border-border p-4 hover:border-primary hover:shadow-md transition">
              <div className="font-bold flex items-center justify-between gap-2">{l.name} <ExternalLink className="w-4 h-4 text-muted-foreground" /></div>
              <div className="text-sm text-muted-foreground mt-1">{l.desc}</div>
            </a>
          ))}
        </div>
        <div className="mt-6 rounded-xl bg-destructive/5 border border-destructive/20 p-4">
          <h3 className="font-bold mb-3 flex items-center gap-2 text-destructive"><Phone className="w-5 h-5" /> Emergency Numbers</h3>
          <div className="grid gap-2 sm:grid-cols-3">
            {EMERGENCY.map(e => (
              <a key={e.number} href={`tel:${e.number.replace(/\D/g, "")}`} className="flex justify-between items-center rounded-lg bg-card border border-border px-3 py-2 hover:border-destructive">
                <span className="font-medium text-sm">{e.name}</span>
                <span className="font-bold text-destructive">{e.number}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <FloatingContactBar />
      <FaqChatbot />
    </div>
  );
}
