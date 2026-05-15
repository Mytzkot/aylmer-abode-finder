import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingContactBar } from "@/components/FloatingContactBar";
import { PropertyCard } from "@/components/PropertyCard";
import { PROPERTIES } from "@/data/properties";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/properties/$id")({ component: PropertyDetail });

interface RoomRow { id: string; property_id?: string | null; address?: string | null; current_status?: string | null; base_rate?: number | null; }

function PropertyDetail() {
  const { id } = Route.useParams();
  const prop = PROPERTIES.find((p) => p.id === id);
  const [rooms, setRooms] = useState<RoomRow[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured || !prop) return;
    (async () => {
      const { data } = await supabase.from("rooms").select("*");
      if (!data) return;
      const key = prop.address.toLowerCase().split(" ")[0];
      setRooms((data as RoomRow[]).filter((r) => (r.address || "").toLowerCase().includes(key) || r.property_id === prop.id));
    })();
  }, [prop]);

  if (!prop) throw notFound();

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Header />
      <main className="flex-1 mx-auto max-w-3xl w-full px-4 py-8 md:py-12">
        <Link to="/properties" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/70 hover:text-ink mb-6">
          <ArrowLeft className="w-4 h-4 flip-rtl" /> All Properties
        </Link>
        <PropertyCard prop={prop} rooms={rooms} />
      </main>
      <Footer />
      <FloatingContactBar />
    </div>
  );
}
