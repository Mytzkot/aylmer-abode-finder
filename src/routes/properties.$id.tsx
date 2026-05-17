import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PROPERTIES, CONTACT } from "@/data/properties";
import {
  ArrowLeft, Wifi, BedDouble, Utensils, WashingMachine, ParkingCircle,
  ExternalLink, Footprints, MapPin, CheckCircle2, ShieldCheck, KeyRound,
  Snowflake, Tv, Coffee, Refrigerator, Bath, Lock, Sparkles, Bus, Star,
} from "lucide-react";
import { T, useTranslated } from "@/i18n/LanguageProvider";

const WALKSCORE_URLS: Record<string, string> = {
  "102-amour": "https://www.walkscore.com/score/102-chemin-d-amour-gatineau-qc-canada",
  "58-conrad": "https://www.walkscore.com/score/58-rue-conrad-valera-gatineau-qc-canada",
  "260-colline": "https://www.walkscore.com/score/260-avenue-de-la-colline-gatineau-qc-canada",
};

export const Route = createFileRoute("/properties/$id")({
  component: PropertyHub,
  head: ({ params }) => {
    const prop = PROPERTIES.find((p) => p.id === params.id);
    const title = prop ? `${prop.address} — Furnished Rooms in ${prop.city}` : "Property — Zorba Rentals";
    const desc = prop
      ? `Furnished monthly rooms at ${prop.address}, ${prop.city}. Wi-Fi, utilities and all furnishings included.`
      : "Furnished monthly rooms across Aylmer-Gatineau.";
    const image = prop?.images?.[0];
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "place" },
        { property: "og:url", content: `/properties/${params.id}` },
        ...(image ? [{ property: "og:image", content: image }, { name: "twitter:image", content: image }] : []),
      ],
      links: [{ rel: "canonical", href: `/properties/${params.id}` }],
    };
  },
});

interface PropertyRow {
  id: string; slug: string; address: string; city: string;
  short_name: string | null; image_urls: string[] | null;
}
interface RoomRow {
  id: string; slug: string | null; room_number: string | null; name: string | null;
  current_status: string | null; rate_monthly: number | null; base_rate: number | null;
  image_urls: string[] | null; booked_until: string | null;
}

const POPULAR_FACILITIES = [
  { Icon: Wifi, label: "Free Wi-Fi" },
  { Icon: ParkingCircle, label: "Free parking" },
  { Icon: WashingMachine, label: "Laundry" },
  { Icon: Utensils, label: "Shared kitchen" },
  { Icon: Snowflake, label: "Heating & A/C" },
  { Icon: Bus, label: "15 min to Ottawa" },
];

const ROOM_AMENITIES = [
  { Icon: BedDouble, label: "Queen bed, fresh linens" },
  { Icon: Tv, label: "Smart TV" },
  { Icon: Refrigerator, label: "Mini-fridge" },
  { Icon: Coffee, label: "Coffee maker" },
  { Icon: Lock, label: "Keypad door lock" },
  { Icon: Wifi, label: "High-speed Wi-Fi" },
];

const SHARED_AMENITIES = [
  { Icon: Utensils, label: "Fully equipped shared kitchen" },
  { Icon: Bath, label: "Shared bathroom(s) — cleaned weekly" },
  { Icon: WashingMachine, label: "On-site laundry" },
  { Icon: ParkingCircle, label: "Free outdoor parking" },
  { Icon: Sparkles, label: "Common area cleaning included" },
  { Icon: ShieldCheck, label: "Smoke detectors + safe entry" },
];

const HOUSE_RULES = [
  { label: "Check-in", value: "Anytime — keypad self check-in" },
  { label: "Check-out", value: "Flexible — coordinate with host" },
  { label: "Minimum stay", value: "1 month" },
  { label: "Payment", value: "First month's rent to move in · no credit check" },
  { label: "Pets", value: "Not allowed" },
  { label: "Smoking", value: "No smoking indoors" },
  { label: "Quiet hours", value: "10 pm – 8 am" },
];

const FAQ = [
  { q: "Are utilities included?", a: "Yes — heating, electricity, water, and Wi-Fi are all included in the monthly rate." },
  { q: "Do you require a credit check?", a: "No. You only need the first month's rent to move in." },
  { q: "What's the minimum stay?", a: "We rent on a monthly basis only — minimum one month, with flexible month-to-month renewal." },
  { q: "How do I get the keys?", a: "Every door has a personal keypad code so you can self check-in anytime, day or night." },
];

function PropertyHub() {
  const { id: slug } = Route.useParams();
  const [prop, setProp] = useState<PropertyRow | null>(null);
  const [rooms, setRooms] = useState<RoomRow[]>([]);
  const [loading, setLoading] = useState(true);

  const meta = PROPERTIES.find((p) => p.id === slug);
  const fallbackImg = meta?.images[0];

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
  const minPrice = useMemo(() => {
    const prices = rooms
      .map((r) => r.rate_monthly ?? r.base_rate)
      .filter((n): n is number => typeof n === "number" && n > 0);
    return prices.length ? Math.min(...prices) : null;
  }, [rooms]);

  // Hero gallery: merge property images + static fallback
  const galleryImgs = useMemo(() => {
    const fromDb = prop?.image_urls?.length ? prop.image_urls : [];
    const fromStatic = meta?.images || [];
    const merged = [...fromDb, ...fromStatic].filter(Boolean);
    return merged.length ? merged.slice(0, 5) : (fallbackImg ? [fallbackImg] : []);
  }, [prop, meta, fallbackImg]);

  const totalsLine = useTranslated(`${rooms.length} rooms total · ${availableCount} available now`);

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-6 md:py-8">
        <Link to="/properties" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/70 hover:text-ink mb-4">
          <ArrowLeft className="w-4 h-4 flip-rtl" /> <T>All Properties</T>
        </Link>

        {loading && !prop && (
          <div className="animate-pulse space-y-4" aria-label="Loading property">
            <div className="h-8 w-2/3 bg-cream-deep rounded" />
            <div className="h-4 w-1/3 bg-cream-deep rounded" />
            <div className="h-[280px] md:h-[440px] bg-cream-deep rounded-2xl" />
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="h-32 bg-cream-deep rounded-2xl" />
              <div className="h-32 bg-cream-deep rounded-2xl" />
            </div>
          </div>
        )}

        {prop && (
          <>
            {/* Title row */}
            <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-ink/60 uppercase tracking-wider">
                  <span className="px-2 py-0.5 rounded bg-brand text-white">Guest house</span>
                  <span className="inline-flex items-center gap-1">
                    {[0,1,2,3,4].map((i) => <Star key={i} className="w-3.5 h-3.5 fill-current text-yellow-500" />)}
                  </span>
                </div>
                <h1 className="font-display text-3xl md:text-4xl text-ink mt-2">{prop.address}</h1>
                <p className="text-ink/70 text-sm mt-1 inline-flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {prop.city}, QC
                </p>
              </div>
              <div className="flex flex-col items-start md:items-end gap-2">
                {minPrice != null && (
                  <p className="text-ink/60 text-sm">
                    <T>From</T> <span className="font-display text-2xl text-ink">CAD ${minPrice.toFixed(0)}</span> / <T>month</T>
                  </p>
                )}
                <a href="#rooms" className="btn-pill btn-coral px-6 py-2.5 text-sm font-semibold">
                  <T>Reserve a room</T>
                </a>
              </div>
            </header>

            {/* Gallery */}
            {galleryImgs.length > 0 && (
              <section className="grid grid-cols-4 grid-rows-2 gap-2 h-[280px] md:h-[440px] rounded-2xl overflow-hidden mb-6">
                <img src={galleryImgs[0]} alt="" className="col-span-4 md:col-span-2 row-span-2 w-full h-full object-cover" />
                {galleryImgs.slice(1, 5).map((src, i) => (
                  <img key={i} src={src} alt="" className="hidden md:block w-full h-full object-cover" />
                ))}
              </section>
            )}

            {/* Anchor nav like booking.com */}
            <nav className="sticky top-20 z-30 bg-cream/95 backdrop-blur border-b border-border/60 -mx-4 px-4 mb-6 overflow-x-auto">
              <ul className="flex gap-1 text-sm font-semibold">
                {[
                  { id: "overview", label: "Overview" },
                  { id: "rooms", label: "Info & prices" },
                  { id: "facilities", label: "Facilities" },
                  { id: "rules", label: "House rules" },
                  { id: "location", label: "Location" },
                  { id: "faq", label: "FAQ" },
                ].map((t) => (
                  <li key={t.id}>
                    <a href={`#${t.id}`} className="block px-4 py-3 text-ink/70 hover:text-ink border-b-2 border-transparent hover:border-brand transition whitespace-nowrap">
                      <T>{t.label}</T>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Two column: description + reserve card */}
            <section id="overview" className="grid lg:grid-cols-3 gap-6 mb-10 scroll-mt-32">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-card border border-border/60 rounded-2xl p-6">
                  <h2 className="font-display text-2xl text-ink mb-3"><T>About this property</T></h2>
                  <p className="text-ink/80 leading-relaxed">
                    <T>Comfortable furnished rooms in a quiet, well-kept guest house — just 15 minutes by direct bus to downtown Ottawa. Each room comes ready to live in: queen bed, smart TV, mini-fridge, coffee maker, keypad lock, and high-speed Wi-Fi. Utilities, laundry and parking are all included. No credit check, only the first month's rent to move in.</T>
                  </p>
                </div>

                <div className="bg-card border border-border/60 rounded-2xl p-6">
                  <h2 className="font-display text-2xl text-ink mb-4"><T>Most popular facilities</T></h2>
                  <ul className="grid sm:grid-cols-2 gap-y-3 gap-x-6">
                    {POPULAR_FACILITIES.map(({ Icon, label }) => (
                      <li key={label} className="flex items-center gap-3 text-sm text-ink">
                        <Icon className="w-5 h-5 text-brand shrink-0" />
                        <span><T>{label}</T></span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-card border border-border/60 rounded-2xl p-6">
                  <h2 className="font-display text-2xl text-ink mb-4"><T>Property highlights</T></h2>
                  <ul className="space-y-2 text-sm text-ink/80">
                    <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-success shrink-0" /><T>15-minute direct bus to downtown Ottawa (STO 40, 50, 59, 800)</T></li>
                    <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-success shrink-0" /><T>All utilities, Wi-Fi, laundry & parking included</T></li>
                    <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-success shrink-0" /><T>Self check-in with personal keypad code</T></li>
                    <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-success shrink-0" /><T>Walking distance to groceries & the Aylmer marina</T></li>
                  </ul>
                </div>
              </div>

              {/* Sticky reserve card */}
              <aside className="lg:sticky lg:top-32 self-start">
                <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
                  <p className="text-xs uppercase tracking-wider font-semibold text-ink/60"><T>Availability</T></p>
                  <p className="font-display text-2xl text-ink mt-1">
                    {availableCount} <span className="text-ink/60 text-base font-normal"><T>rooms available now</T></span>
                  </p>
                  {minPrice != null && (
                    <p className="mt-3 text-ink/80 text-sm">
                      <T>From</T> <span className="font-display text-3xl text-ink">CAD ${minPrice.toFixed(0)}</span>
                      <span className="text-ink/60"> / <T>month</T></span>
                    </p>
                  )}
                  <div className="mt-5 space-y-2">
                    <a href="#rooms" className="btn-pill btn-coral w-full justify-center py-3 font-semibold">
                      <T>See available rooms</T>
                    </a>
                    <a href={CONTACT.whatsapp} target="_blank" rel="noreferrer"
                      className="btn-pill btn-outline-ink w-full justify-center py-3 font-semibold">
                      <T>Ask on WhatsApp</T>
                    </a>
                  </div>
                  <ul className="mt-5 pt-5 border-t border-border/60 space-y-2 text-xs text-ink/70">
                    <li className="flex items-center gap-2"><KeyRound className="w-4 h-4 text-brand" /><T>Self check-in anytime</T></li>
                    <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-brand" /><T>No credit check</T></li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand" /><T>Utilities included</T></li>
                  </ul>
                </div>
              </aside>
            </section>

            {/* Rooms section */}
            <section id="rooms" className="mb-12 scroll-mt-32">
              <h2 className="font-display text-3xl text-ink mb-2"><T>Available rooms</T></h2>
              <p className="text-sm text-ink/60 mb-5">{totalsLine}</p>

              {loading ? (
                <p className="text-ink/60"><T>Loading rooms…</T></p>
              ) : rooms.length === 0 ? (
                <p className="text-ink/60"><T>No rooms listed yet for this property.</T></p>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {rooms.map((r) => {
                    const img = (r.image_urls && r.image_urls[0]) || fallbackImg;
                    const isAvail = (r.current_status || "").toLowerCase() === "available";
                    const price = r.rate_monthly ?? r.base_rate;
                    // Derive room number: prefer DB column, else parse first digit run from name
                    const parsedNum = (r.name || "").match(/\d+/)?.[0];
                    const roomNum = r.room_number || parsedNum;
                    // Clean display name: strip the "Property - " prefix and French duplicate after slash
                    const cleanName = (r.name || "")
                      .replace(/^[^-]+-\s*/, "")
                      .split("/")[0]
                      .trim();
                    return (
                      <Link
                        key={r.id}
                        to="/properties/$id/$roomSlug"
                        params={{ id: slug, roomSlug: r.slug || r.id }}
                        className="group block bg-card rounded-2xl overflow-hidden border border-border/60 hover:shadow-lg hover:-translate-y-0.5 transition"
                      >
                        <div className="aspect-[4/3] bg-cream-deep overflow-hidden">
                          {img && (
                            <img src={img} alt={cleanName || `Room ${roomNum || ""}`} loading="lazy"
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                          )}
                        </div>
                        <div className="p-5 space-y-2">
                          <h3 className="font-display text-xl text-ink leading-tight">
                            {prop.short_name || prop.address}
                            {roomNum ? <> — <T>Room</T> {roomNum}</> : cleanName ? <> — {cleanName}</> : null}
                          </h3>
                          {price != null && (
                            <p className="text-ink font-semibold">CAD ${Number(price).toFixed(0)} / <T>month</T></p>
                          )}
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isAvail ? "bg-success text-white" : "bg-destructive text-white"
                          }`}>
                            {isAvail ? <T>Available</T> : r.booked_until ? <><T>Booked until</T> {r.booked_until}</> : <T>Booked</T>}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Facilities */}
            <section id="facilities" className="mb-12 scroll-mt-32">
              <h2 className="font-display text-3xl text-ink mb-5"><T>Facilities</T></h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card border border-border/60 rounded-2xl p-6">
                  <h3 className="font-display text-xl text-ink mb-4"><T>In your room</T></h3>
                  <ul className="space-y-2.5">
                    {ROOM_AMENITIES.map(({ Icon, label }) => (
                      <li key={label} className="flex items-center gap-3 text-sm text-ink/80">
                        <Icon className="w-4 h-4 text-brand" /> <T>{label}</T>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-card border border-border/60 rounded-2xl p-6">
                  <h3 className="font-display text-xl text-ink mb-4"><T>Shared amenities</T></h3>
                  <ul className="space-y-2.5">
                    {SHARED_AMENITIES.map(({ Icon, label }) => (
                      <li key={label} className="flex items-center gap-3 text-sm text-ink/80">
                        <Icon className="w-4 h-4 text-brand" /> <T>{label}</T>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* House rules */}
            <section id="rules" className="mb-12 scroll-mt-32">
              <h2 className="font-display text-3xl text-ink mb-5"><T>House rules</T></h2>
              <div className="bg-card border border-border/60 rounded-2xl divide-y divide-border/60">
                {HOUSE_RULES.map((r) => (
                  <div key={r.label} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 px-6 py-4">
                    <div className="font-semibold text-ink w-40 shrink-0"><T>{r.label}</T></div>
                    <div className="text-sm text-ink/75"><T>{r.value}</T></div>
                  </div>
                ))}
              </div>
            </section>

            {/* Location */}
            <section id="location" className="mb-12 scroll-mt-32 grid md:grid-cols-2 gap-6">
              <div className="bg-card border border-border/60 rounded-2xl p-6">
                <h2 className="font-display text-2xl text-ink mb-4"><T>What's nearby</T></h2>
                <ul className="space-y-2 text-sm">
                  {(meta?.walkscore || []).map((w) => (
                    <li key={w.name} className="flex justify-between gap-2 border-b border-border/50 pb-2 last:border-0">
                      <span className="font-semibold text-ink"><T>{w.name}</T></span>
                      <span className="text-ink/60 text-xs"><T>{w.detail}</T></span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-card border border-border/60 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h2 className="font-display text-2xl text-ink mb-2 flex items-center gap-2">
                    <Footprints className="w-5 h-5" /> <T>Walk Score</T>
                  </h2>
                  <p className="text-sm text-ink/70 mb-4">
                    <T>See walkability, transit and bike scores for this address.</T>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {WALKSCORE_URLS[slug] && (
                    <a href={WALKSCORE_URLS[slug]} target="_blank" rel="noreferrer"
                      className="btn-pill btn-outline-ink text-sm">
                      <ExternalLink className="w-4 h-4" /> <T>Walk Score</T>
                    </a>
                  )}
                  {meta?.maps && (
                    <a href={meta.maps} target="_blank" rel="noreferrer"
                      className="btn-pill btn-outline-ink text-sm">
                      <MapPin className="w-4 h-4" /> <T>Open in Google Maps</T>
                    </a>
                  )}
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="mb-12 scroll-mt-32">
              <h2 className="font-display text-3xl text-ink mb-5"><T>Guest questions</T></h2>
              <div className="space-y-3">
                {FAQ.map((f) => (
                  <details key={f.q} className="group bg-card border border-border/60 rounded-2xl px-5 py-4">
                    <summary className="cursor-pointer list-none font-semibold text-ink flex items-center justify-between">
                      <span><T>{f.q}</T></span>
                      <span className="text-brand text-xl group-open:rotate-45 transition">+</span>
                    </summary>
                    <p className="mt-3 text-sm text-ink/75 leading-relaxed"><T>{f.a}</T></p>
                  </details>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
