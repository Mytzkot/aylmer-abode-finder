import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PROPERTIES } from "@/data/properties";
import { ArrowLeft, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Youtube, MapPin, Calendar, FileText, Home } from "lucide-react";

function mapsUrl(address: string, city: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address} ${city}`)}`;
}

// Strict YouTube URL → embed URL. Returns null for anything that isn't a
// valid youtube.com / youtu.be video link, preventing broken iframes.
const YT_ID_RE = /^[A-Za-z0-9_-]{11}$/;
const YT_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
  "youtu.be",
]);

function ytEmbedUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  let u: URL;
  try {
    u = new URL(trimmed);
  } catch {
    return null;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;
  const host = u.hostname.toLowerCase();
  if (!YT_HOSTS.has(host)) return null;

  let id: string | null = null;
  let start: string | null = null;

  if (host === "youtu.be") {
    id = u.pathname.slice(1).split("/")[0] || null;
  } else if (u.pathname === "/watch") {
    id = u.searchParams.get("v");
  } else {
    const parts = u.pathname.split("/").filter(Boolean);
    // /embed/<id>, /shorts/<id>, /live/<id>, /v/<id>
    if (parts.length >= 2 && ["embed", "shorts", "live", "v"].includes(parts[0])) {
      id = parts[1];
    }
  }

  if (!id || !YT_ID_RE.test(id)) return null;

  // Preserve a start time if present (?t=90, ?start=90, ?t=1m30s)
  const t = u.searchParams.get("start") || u.searchParams.get("t");
  if (t) {
    const seconds = parseYtTime(t);
    if (seconds > 0) start = String(seconds);
  }

  const qs = start ? `?start=${start}` : "";
  return `https://www.youtube.com/embed/${id}${qs}`;
}

function parseYtTime(v: string): number {
  if (/^\d+$/.test(v)) return Number(v);
  const m = v.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!m) return 0;
  const [, h, mi, s] = m;
  return (Number(h) || 0) * 3600 + (Number(mi) || 0) * 60 + (Number(s) || 0);
}


export const Route = createFileRoute("/properties/$id/$roomSlug")({
  component: RoomDetail,
  head: ({ params }) => ({
    meta: [
      { title: `Furnished Room — ${params.id} — Zorba Rentals` },
      { name: "description", content: "Furnished monthly room with Wi-Fi, smart TV, mini-fridge, coffee maker and keypad lock — all utilities included." },
      { property: "og:title", content: `Furnished Room — Zorba Rentals` },
      { property: "og:description", content: "Furnished monthly room — Wi-Fi and utilities included." },
      { property: "og:type", content: "product" },
      { property: "og:url", content: `/properties/${params.id}/${params.roomSlug}` },
    ],
    links: [{ rel: "canonical", href: `/properties/${params.id}/${params.roomSlug}` }],
  }),
});

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
interface SimilarRow {
  id: string; slug: string | null; name: string | null;
  rate_monthly: number | null; base_rate: number | null;
  image_urls: string[] | null;
}

function RoomDetail() {
  const { id: slug, roomSlug } = Route.useParams();
  const [prop, setProp] = useState<PropertyRow | null>(null);
  const [room, setRoom] = useState<RoomRow | null>(null);
  const [similar, setSimilar] = useState<SimilarRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [descOpen, setDescOpen] = useState(true);

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
      if (r) {
        const { data: sim } = await supabase
          .from("rooms")
          .select("id, slug, name, rate_monthly, base_rate, image_urls")
          .eq("property_id", p.id)
          .neq("id", (r as RoomRow).id)
          .limit(8);
        setSimilar((sim as SimilarRow[]) || []);
      }
      setLoading(false);
      setIdx(0);
    })();
  }, [slug, roomSlug]);

  if (!loading && (!prop || !room)) throw notFound();

  const images = (room?.image_urls && room.image_urls.length > 0)
    ? room.image_urls
    : (fallbackImg ? [fallbackImg] : []);
  const next = () => setIdx((idx + 1) % Math.max(images.length, 1));
  const prev = () => setIdx((idx - 1 + Math.max(images.length, 1)) % Math.max(images.length, 1));

  const isAvail = (room?.current_status || "").toLowerCase() === "available";
  const price = room?.rate_monthly ?? room?.base_rate;

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
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-6 md:py-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-ink/80 mb-4 font-medium">
          <Link to="/rooms" className="hover:underline">Rentals</Link>
          <span className="mx-2">&gt;</span>
          <span className="text-ink">{room?.name || "Room"}</span>
        </nav>

        {loading || !room || !prop ? (
          <p className="text-ink">Loading…</p>
        ) : (
          <>
            <div className="grid md:grid-cols-[80px_1fr_360px] gap-5">
              {/* Thumbnail column */}
              <div className="hidden md:flex flex-col items-center gap-2">
                {images.length > 1 && (
                  <button onClick={prev} aria-label="Previous" className="w-8 h-8 inline-flex items-center justify-center text-ink hover:text-coral">
                    <ChevronUp className="w-5 h-5" />
                  </button>
                )}
                <div className="flex flex-col gap-2 max-h-[480px] overflow-y-auto">
                  {images.map((src, i) => (
                    <button key={i} onClick={() => setIdx(i)}
                      className={`w-16 h-16 rounded-md overflow-hidden border-2 ${i === idx ? "border-ink" : "border-transparent"}`}>
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                {images.length > 1 && (
                  <button onClick={next} aria-label="Next" className="w-8 h-8 inline-flex items-center justify-center text-ink hover:text-coral">
                    <ChevronDown className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Main image */}
              <div className="relative aspect-square bg-cream-deep rounded-2xl overflow-hidden">
                {images.length > 0 && (
                  <img src={images[idx]} alt={room.name || ""} className="w-full h-full object-contain" />
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

              {/* Right: title, price, description */}
              <aside className="space-y-4">
                <div>
                  <h1 className="font-display text-2xl md:text-3xl text-ink leading-tight">{room.name}</h1>
                  {price != null && <p className="mt-1 text-xl font-bold text-ink">CAD${Number(price).toFixed(2)}</p>}
                </div>

                <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                  isAvail ? "bg-success text-white" : "bg-destructive text-white"
                }`}>
                  {isAvail ? "Available" : room.booked_until ? `Booked until ${room.booked_until}` : "Booked"}
                </span>

                {/* Description accordion */}
                <div className="border-t border-ink/20 pt-3">
                  <button onClick={() => setDescOpen(!descOpen)} className="w-full flex items-center justify-between font-bold text-ink">
                    <span>Description</span>
                    <ChevronDown className={`w-4 h-4 transition ${descOpen ? "" : "-rotate-90"}`} />
                  </button>
                  {descOpen && (
                    <div className="mt-3 space-y-4 text-sm text-ink">
                      <div>
                        <p className="font-bold underline mb-2">ROOM FEATURES:</p>
                        <ul className="space-y-0.5">
                          {features.en.map(f => <li key={f}>• {f}</li>)}
                        </ul>
                      </div>
                      <div>
                        <p className="font-bold underline mb-2">CARACTÉRISTIQUES DE LA CHAMBRE :</p>
                        <ul className="space-y-0.5">
                          {features.fr.map(f => <li key={f}>- {f}</li>)}
                        </ul>
                      </div>
                      <div>
                        <p className="font-bold underline mb-2">SHARED & AMENITIES</p>
                        <ul className="space-y-0.5">
                          {shared.en.map(f => <li key={f}>• {f}</li>)}
                        </ul>
                      </div>
                      <div>
                        <p className="font-bold underline mb-2">SERVICES ET ÉQUIPEMENTS PARTAGÉS</p>
                        <ul className="space-y-0.5">
                          {shared.fr.map(f => <li key={f}>- {f}</li>)}
                        </ul>
                      </div>
                      {(room.description_en || room.description_fr) && (
                        <div className="pt-2 border-t border-ink/10 whitespace-pre-line">
                          {room.description_en || room.description_fr}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Embedded YouTube tour */}
                {room.youtube_video_url && ytEmbedUrl(room.youtube_video_url) && (
                  <div className="pt-2">
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-ink/15 bg-black">
                      <iframe
                        src={ytEmbedUrl(room.youtube_video_url)!}
                        title="Room video tour"
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                      />
                    </div>
                  </div>
                )}

                {/* Tour icons */}
                <div className="flex items-center gap-3 pt-2">
                  {room.youtube_video_url && (
                    <a href={room.youtube_video_url} target="_blank" rel="noreferrer" aria-label="Watch tour"
                      className="w-10 h-10 rounded-full inline-flex items-center justify-center bg-card border border-ink/20 text-red-500 hover:border-ink transition">
                      <Youtube className="w-5 h-5" />
                    </a>
                  )}
                  <a href={prop.google_maps_url || mapsUrl(prop.address, prop.city)} target="_blank" rel="noreferrer" aria-label="View map"
                    className="w-10 h-10 rounded-full inline-flex items-center justify-center bg-card border border-ink/20 text-success hover:border-ink transition">
                    <MapPin className="w-5 h-5" />
                  </a>
                  {room.airbnb_listing_url && (
                    <a href={room.airbnb_listing_url} target="_blank" rel="noreferrer" aria-label="Airbnb listing"
                      className="w-10 h-10 rounded-full inline-flex items-center justify-center bg-card border border-ink/20 text-coral hover:border-ink transition">
                      <Home className="w-5 h-5" />
                    </a>
                  )}
                </div>

                {/* CTAs */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link to="/book/$roomId" params={{ roomId: room.id }} className="btn-pill btn-ink text-sm py-2.5 justify-center">
                    <Calendar className="w-4 h-4" /> Book
                  </Link>
                  <Link to="/apply" search={{ property: slug, room: room.id }} className="btn-pill btn-coral text-sm py-2.5 justify-center">
                    <FileText className="w-4 h-4" /> Apply
                  </Link>
                </div>
              </aside>
            </div>

            {/* Back link */}
            <div className="mt-10">
              <Link to="/properties/$id" params={{ id: slug }} className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:underline">
                <ArrowLeft className="w-4 h-4 flip-rtl" /> {prop.address}
              </Link>
            </div>

            {/* Similar items */}
            {similar.length > 0 && (
              <section className="mt-10">
                <h2 className="font-display text-2xl md:text-3xl text-ink mb-4">Similar Items</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  {similar.slice(0, 4).map(s => {
                    const sImg = (s.image_urls && s.image_urls[0]) || fallbackImg;
                    const sPrice = s.rate_monthly ?? s.base_rate;
                    return (
                      <Link key={s.id} to="/properties/$id/$roomSlug" params={{ id: slug, roomSlug: s.slug || s.id }} className="group block">
                        <div className="aspect-square bg-cream-deep rounded-md overflow-hidden">
                          {sImg && <img src={sImg} alt={s.name || ""} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" loading="lazy" />}
                        </div>
                        <div className="pt-2">
                          <h3 className="text-sm font-semibold text-ink group-hover:underline leading-tight">{s.name}</h3>
                          {sPrice != null && <p className="text-sm text-ink font-medium">CAD${Number(sPrice).toFixed(2)}</p>}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
