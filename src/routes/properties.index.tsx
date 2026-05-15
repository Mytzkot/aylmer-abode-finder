import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingContactBar } from "@/components/FloatingContactBar";
import { PropertyCard } from "@/components/PropertyCard";
import { PROPERTIES } from "@/data/properties";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export const Route = createFileRoute("/properties/")({ component: PropertiesPage });

interface RoomRow { id: string; property_id?: string | null; address?: string | null; current_status?: string | null; base_rate?: number | null; }

function PropertiesPage() {
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
        let pid = PROPERTIES.find((p) => key.includes(p.address.toLowerCase().split(" ")[0]))?.id;
        if (!pid && r.property_id) pid = r.property_id;
        if (pid && grouped[pid]) grouped[pid].push(r);
      }
      setRoomsByProp(grouped);
    })();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Header />
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-12 md:py-16">
        <h1 className="font-display text-4xl md:text-5xl text-ink">Available Properties</h1>
        <p className="text-ink/60 mt-2 mb-10">Three cozy houses across Aylmer-Gatineau.</p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PROPERTIES.map((p) => (
            <PropertyCard key={p.id} prop={p} rooms={roomsByProp[p.id] || []} />
          ))}
        </div>
      </main>
      <Footer />
      <FloatingContactBar />
    </div>
  );
}
