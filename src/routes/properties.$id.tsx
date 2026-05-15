import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingContactBar } from "@/components/FloatingContactBar";
import { supabase } from "@/lib/supabase";
import { PROPERTIES } from "@/data/properties";
import { ArrowLeft, Wifi, BedDouble, Utensils, WashingMachine, ParkingCircle } from "lucide-react";

export const Route = createFileRoute("/properties/$id")({ component: PropertyHub });

interface PropertyRow {
  id: string; slug: string; address: string; city: string;
  short_name: string | null; image_urls: string[] | null;
}
interface RoomRow {
  id: string; slug: string | null; room_number: string | null; name: string | null;
  current_status: string | null; rate_monthly: number | null; base_rate: number | null;
  image_urls: string[] | null; booked_until: string | null;
}

function PropertyHub() {
  const { id: slug } = Route.useParams();
  const [prop, setProp] = useState<PropertyRow | null>(null);
  const [rooms, setRooms] = useState<RoomRow[]>([]);
  const [loading, setLoading] = useState(true);

  // fallback static image keyed by slug
  const fallbackImg = PROPERTIES.find((p) => p.id === slug)?.images[0];

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: p } = await supabase
        .from("properties")
        .select("id, slug, address, city, short_name, image_urls")
        .eq("slug", slug)
        .maybeSingle();
      if (!p) { setLoading(false); return; }
      setProp(p as PropertyRow);
      const { data: rs } = await supabase
        .from("rooms")
        .select("id, slug, room_number, name, current_status, rate_monthly, base_rate, image_urls, booked_until")
        .eq("property_id", p.id)
        .order("room_number", { ascending: true });
      setRooms((rs as RoomRow[]) || []);
      setLoading(false);
    })();
  }, [slug]);

  if (!loading && !prop) throw notFound();

  const availableCount = rooms.filter((r) => (r.current_status || "").toLowerCase() === "available").length;

  const chips = [
    { Icon: Wifi, label: "Wi-Fi" },
    { Icon: BedDouble, label: "Furnished" },
    { Icon: Utensils, label: "Kitchen" },
    { Icon: WashingMachine, label: "Laundry" },
    { Icon: ParkingCircle, label: "Parking" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Header />
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-8 md:py-12">
        <Link to="/properties" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/70 hover:text-ink mb-6">
          <ArrowLeft className="w-4 h-4 flip-rtl" /> All Properties
        </Link>

        {prop && (
          <>
            <header className="mb-8">
              <h1 className="font-display text-4xl md:text-5xl text-ink">{prop.address}</h1>
              <p className="text-ink/60 mt-1">{prop.city}, QC</p>
              <ul className="flex flex-wrap gap-1.5 mt-4">
                {chips.map(({ Icon, label }) => (
                  <li key={label} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-card border border-border text-ink text-xs font-semibold">
                    <Icon className="w-3.5 h-3.5" strokeWidth={2.25} /> {label}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm font-semibold text-ink/70">
                {availableCount} {availableCount === 1 ? "room" : "rooms"} available
              </p>
            </header>

            {loading ? (
              <p className="text-ink/60">Loading rooms…</p>
            ) : rooms.length === 0 ? (
              <p className="text-ink/60">No rooms listed yet for this property.</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rooms.map((r) => {
                  const img = (r.image_urls && r.image_urls[0]) || fallbackImg;
                  const isAvail = (r.current_status || "").toLowerCase() === "available";
                  const price = r.rate_monthly ?? r.base_rate;
                  return (
                    <Link
                      key={r.id}
                      to="/properties/$id/$roomSlug"
                      params={{ id: slug, roomSlug: r.slug || r.id }}
                      className="group block bg-card rounded-3xl overflow-hidden border border-border/40 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition"
                    >
                      <div className="aspect-[4/3] bg-cream-deep overflow-hidden">
                        {img && (
                          <img src={img} alt={r.name || `Room ${r.room_number}`} loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                        )}
                      </div>
                      <div className="p-5 space-y-2">
                        <h3 className="font-display text-xl text-ink leading-tight">
                          {prop.short_name || prop.address} - Room {r.room_number} / Chambre {r.room_number}
                        </h3>
                        {price != null && (
                          <p className="text-ink font-semibold">CAD ${Number(price).toFixed(0)} / month</p>
                        )}
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          isAvail ? "bg-success text-white" : "bg-destructive text-white"
                        }`}>
                          {isAvail ? "Available" : r.booked_until ? `Booked until ${r.booked_until}` : "Booked"}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
      <FloatingContactBar />
    </div>
  );
}
