import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingContactBar } from "@/components/FloatingContactBar";
import { supabase } from "@/lib/supabase";
import { PROPERTIES } from "@/data/properties";
import { ArrowLeft, ChevronLeft, ChevronRight, Youtube, MapPin, ExternalLink, Calendar, FileText } from "lucide-react";

export const Route = createFileRoute("/properties/$id/$roomSlug")({ component: RoomDetail });

interface PropertyRow {
  id: string; slug: string; address: string; city: string;
  short_name: string | null; google_maps_url: string | null;
}
interface RoomRow {
  id: string; slug: string | null; room_number: string | null; name: string | null;
  current_status: string | null;
  rate_monthly: number | null; rate_weekly: number | null; rate_nightly: number | null; base_rate: number | null;
  image_urls: string[] | null; booked_until: string | null;
  youtube_video_url: string | null; airbnb_listing_url: string | null;
  description_en: string | null; description_fr: string | null;
}

function RoomDetail() {
  const { id: slug, roomSlug } = Route.useParams();
  const [prop, setProp] = useState<PropertyRow | null>(null);
  const [room, setRoom] = useState<RoomRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);

  const fallbackImg = PROPERTIES.find((p) => p.id === slug)?.images[0];

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: p } = await supabase
        .from("properties")
        .select("id, slug, address, city, short_name, google_maps_url")
        .eq("slug", slug)
        .maybeSingle();
      if (!p) { setLoading(false); return; }
      setProp(p as PropertyRow);
      const { data: r } = await supabase
        .from("rooms")
        .select("*")
        .eq("property_id", p.id)
        .eq("slug", roomSlug)
        .maybeSingle();
      setRoom((r as RoomRow) || null);
      setLoading(false);
    })();
  }, [slug, roomSlug]);

  if (!loading && (!prop || !room)) throw notFound();

  const images = (room?.image_urls && room.image_urls.length > 0)
    ? room.image_urls
    : (fallbackImg ? [fallbackImg] : []);
  const next = () => setIdx((idx + 1) % Math.max(images.length, 1));
  const prev = () => setIdx((idx - 1 + Math.max(images.length, 1)) % Math.max(images.length, 1));

  const isAvail = (room?.current_status || "").toLowerCase() === "available";

  const features = {
    en: ["Twin/Queen bed", "Duvet, linens, towels", "Keypad lock", "Coffee maker", "Mini-fridge",
      "36-inch smart TV", "Desk, chair, lamp", "Wardrobe"],
    fr: ["Lit simple/Queen", "Couette, draps, serviettes", "Serrure à code", "Cafetière", "Mini-frigo",
      "TV intelligente 36 po", "Bureau, chaise, lampe", "Garde-robe"],
  };
  const shared = {
    en: ["Wi-Fi", "Heat", "Hydro", "A/C", "Housekeeping twice weekly", "Free laundry", "Free parking", "Security", "Kitchen", "2 bathrooms"],
    fr: ["Wi-Fi", "Chauffage", "Électricité", "Climatisation", "Ménage deux fois/semaine", "Buanderie gratuite", "Stationnement gratuit", "Sécurité", "Cuisine", "2 salles de bain"],
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Header />
      <main className="flex-1 mx-auto max-w-4xl w-full px-4 py-8 md:py-12">
        <Link to="/properties/$id" params={{ id: slug }} className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/70 hover:text-ink mb-6">
          <ArrowLeft className="w-4 h-4 flip-rtl" /> {prop?.address || "Back"}
        </Link>

        {loading || !room || !prop ? (
          <p className="text-ink/60">Loading…</p>
        ) : (
          <>
            {/* Carousel */}
            <div className="relative aspect-video bg-cream-deep rounded-3xl overflow-hidden mb-6">
              {images.length > 0 && (
                <img src={images[idx]} alt={room.name || ""} className="w-full h-full object-cover" />
              )}
              {images.length > 1 && (
                <>
                  <button onClick={prev} className="touch-min absolute start-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 flex items-center justify-center shadow" aria-label="Previous">
                    <ChevronLeft className="w-5 h-5 flip-rtl" />
                  </button>
                  <button onClick={next} className="touch-min absolute end-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 flex items-center justify-center shadow" aria-label="Next">
                    <ChevronRight className="w-5 h-5 flip-rtl" />
                  </button>
                </>
              )}
            </div>

            <header className="mb-6">
              <h1 className="font-display text-3xl md:text-4xl text-ink">
                {prop.short_name || prop.address} - Room {room.room_number} / Chambre {room.room_number}
              </h1>
              <div className="mt-3 flex flex-wrap gap-3 items-center">
                {room.rate_monthly != null && <span className="font-semibold text-ink">${Number(room.rate_monthly).toFixed(0)}/month</span>}
                {room.rate_weekly != null && <span className="text-ink/70">· ${Number(room.rate_weekly).toFixed(0)}/week</span>}
                {room.rate_nightly != null && <span className="text-ink/70">· ${Number(room.rate_nightly).toFixed(0)}/night</span>}
              </div>
              <span className={`inline-block mt-3 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                isAvail ? "bg-success text-white" : "bg-destructive text-white"
              }`}>
                {isAvail ? "Available" : room.booked_until ? `Booked until ${room.booked_until}` : "Booked"}
              </span>
            </header>

            {/* Features bilingual */}
            <section className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-card border border-border/40 rounded-2xl p-5">
                <h2 className="font-display text-lg text-ink mb-3">ROOM FEATURES</h2>
                <ul className="space-y-1.5 text-sm text-ink/80 list-disc ps-5">
                  {features.en.map((f) => <li key={f}>{f}</li>)}
                </ul>
              </div>
              <div className="bg-card border border-border/40 rounded-2xl p-5">
                <h2 className="font-display text-lg text-ink mb-3">CARACTÉRISTIQUES DE LA CHAMBRE</h2>
                <ul className="space-y-1.5 text-sm text-ink/80 list-disc ps-5">
                  {features.fr.map((f) => <li key={f}>{f}</li>)}
                </ul>
              </div>
            </section>

            {/* Shared & amenities */}
            <section className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-card border border-border/40 rounded-2xl p-5">
                <h2 className="font-display text-lg text-ink mb-3">SHARED & AMENITIES</h2>
                <ul className="space-y-1.5 text-sm text-ink/80 list-disc ps-5">
                  {shared.en.map((f) => <li key={f}>{f}</li>)}
                </ul>
              </div>
              <div className="bg-card border border-border/40 rounded-2xl p-5">
                <h2 className="font-display text-lg text-ink mb-3">SERVICES ET ÉQUIPEMENTS PARTAGÉS</h2>
                <ul className="space-y-1.5 text-sm text-ink/80 list-disc ps-5">
                  {shared.fr.map((f) => <li key={f}>{f}</li>)}
                </ul>
              </div>
            </section>

            {/* Tour links */}
            <div className="grid sm:grid-cols-3 gap-3 mb-8">
              {room.youtube_video_url && (
                <a href={room.youtube_video_url} target="_blank" rel="noreferrer" className="btn-pill btn-cream text-sm">
                  <Youtube className="w-4 h-4 text-red-500" /> Watch YouTube Tour
                </a>
              )}
              {prop.google_maps_url && (
                <a href={prop.google_maps_url} target="_blank" rel="noreferrer" className="btn-pill btn-cream text-sm">
                  <MapPin className="w-4 h-4" /> View on Google Maps
                </a>
              )}
              {room.airbnb_listing_url && (
                <a href={room.airbnb_listing_url} target="_blank" rel="noreferrer" className="btn-pill btn-cream text-sm">
                  <ExternalLink className="w-4 h-4" /> Airbnb Listing
                </a>
              )}
            </div>

            {/* Big CTAs */}
            <div className="grid sm:grid-cols-2 gap-3">
              <Link to="/book/$roomId" params={{ roomId: room.id }} className="btn-pill btn-ink text-base py-3.5 justify-center">
                <Calendar className="w-5 h-5" /> Book Daily/Weekly
              </Link>
              <Link to="/apply" search={{ property: slug, room: room.id }} className="btn-pill btn-coral text-base py-3.5 justify-center">
                <FileText className="w-5 h-5" /> Apply for Monthly
              </Link>
            </div>
          </>
        )}
      </main>
      <Footer />
      <FloatingContactBar />
    </div>
  );
}
