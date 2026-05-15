import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingContactBar } from "@/components/FloatingContactBar";
import { supabase } from "@/lib/supabase";
import { PROPERTIES } from "@/data/properties";
import { ArrowLeft, Wifi, BedDouble, Utensils, WashingMachine, ParkingCircle, ExternalLink, Footprints } from "lucide-react";
import { AmenityIcons } from "@/components/AmenityIcons";

const WALKSCORE_URLS: Record<string, string> = {
  "102-amour": "https://www.walkscore.com/score/102-chemin-d-amour-gatineau-qc-canada",
  "58-conrad": "https://www.walkscore.com/score/58-rue-conrad-valera-gatineau-qc-canada",
  "260-colline": "https://www.walkscore.com/score/260-avenue-de-la-colline-gatineau-qc-canada",
};

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
                {rooms.length} rooms total · {availableCount} available now
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

            {/* Walk Score + Nearby */}
            <section className="mt-12 grid md:grid-cols-2 gap-6">
              <div className="bg-card border border-border/40 rounded-2xl p-5">
                <h2 className="font-display text-2xl text-ink mb-3">Nearby</h2>
                <ul className="space-y-1.5 text-sm">
                  {(PROPERTIES.find((p) => p.id === slug)?.walkscore || []).map((w) => (
                    <li key={w.name} className="flex justify-between gap-2">
                      <span className="font-semibold text-ink">{w.name}</span>
                      <span className="text-muted-foreground text-xs">{w.detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-card border border-border/40 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <h2 className="font-display text-2xl text-ink mb-2 flex items-center gap-2">
                    <Footprints className="w-5 h-5" /> Walk Score
                  </h2>
                  <p className="text-sm text-ink/70 mb-4">
                    See walkability, transit and bike scores for this address.
                  </p>
                </div>
                {WALKSCORE_URLS[slug] && (
                  <a
                    href={WALKSCORE_URLS[slug]}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-pill btn-outline-ink text-sm self-start"
                  >
                    <ExternalLink className="w-4 h-4" /> View Walk Score
                  </a>
                )}
              </div>
            </section>

            {/* Amenities grid */}
            <div className="mt-8">
              <AmenityIcons />
            </div>
          </>
        )}
      </main>
      <Footer />
      <FloatingContactBar />
    </div>
  );
}
