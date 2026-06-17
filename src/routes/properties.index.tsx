import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PropertyCard } from "@/components/PropertyCard";
import { PROPERTIES } from "@/data/properties";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { T } from "@/i18n/LanguageProvider";

export const Route = createFileRoute("/properties/")({
  component: PropertiesPage,
  head: () => ({
    meta: [
      { title: "Our Locations — Zorba Rentals Aylmer-Gatineau" },
      { name: "description", content: "Three furnished guest houses across Aylmer-Gatineau: 102 Chemin d'Amour, 58 Rue Conrad Valéra, and 260 Av. de la Colline." },
      { property: "og:title", content: "Our Locations — Zorba Rentals" },
      { property: "og:description", content: "Three furnished guest houses across Aylmer-Gatineau." },
      { property: "og:url", content: "/properties" },
    ],
    links: [{ rel: "canonical", href: "/properties" }],
  }),
});

interface RoomRow { id: string; property_id?: string | null; current_status?: string | null; base_rate?: number | null; externally_managed?: boolean | null; manual_available?: boolean | null; }

function PropertiesPage() {
  const [roomsByProp, setRoomsByProp] = useState<Record<string, RoomRow[]>>({});

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    (async () => {
      const [{ data: rooms }, { data: props }] = await Promise.all([
        supabase.from("rooms").select("id, property_id, current_status, base_rate, externally_managed, manual_available"),
        supabase.from("properties").select("id, slug"),
      ]);
      if (!rooms || !props) return;
      const slugById: Record<string, string> = {};
      for (const p of props as Array<{ id: string; slug: string }>) slugById[p.id] = p.slug;
      const grouped: Record<string, RoomRow[]> = {};
      for (const p of PROPERTIES) grouped[p.id] = [];
      for (const r of rooms as RoomRow[]) {
        const slug = r.property_id ? slugById[r.property_id] : undefined;
        if (slug && grouped[slug]) grouped[slug].push(r);
      }
      setRoomsByProp(grouped);
    })();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-12 md:py-16">
        <h1 className="font-display text-4xl md:text-5xl text-ink"><T>Available Properties</T></h1>
        <p className="text-ink/60 mt-2 mb-10"><T>Three cozy houses across Aylmer-Gatineau.</T></p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PROPERTIES.map((p) => (
            <PropertyCard key={p.id} prop={p} rooms={roomsByProp[p.id] || []} />
          ))}
        </div>
      </main>
    </div>
  );
}
