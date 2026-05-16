import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingContactBar } from "@/components/FloatingContactBar";
import { supabase } from "@/lib/supabase";
import { PROPERTIES } from "@/data/properties";
import { T, useTranslated } from "@/i18n/LanguageProvider";

export const Route = createFileRoute("/rooms")({
  component: RoomsShop,
  head: () => ({
    meta: [
      { title: "Room Rentals — WingPad" },
      { name: "description", content: "Browse all furnished monthly rooms across our Gatineau / Ottawa locations." },
    ],
  }),
});

interface RoomRow {
  id: string;
  slug: string | null;
  property_id: string | null;
  name: string | null;
  room_number: string | null;
  current_status: string | null;
  base_rate: number | null;
  rate_monthly: number | null;
  image_urls: string[] | null;
  booked_until: string | null;
  created_at: string;
}
interface PropertyRow { id: string; slug: string; address: string; short_name: string | null; }

type Sort = "popularity" | "newest" | "price_desc" | "price_asc" | "az" | "za";

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-ink/15 pt-3">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between text-ink font-semibold py-1">
        <span><T>{title}</T></span>
        <ChevronDown className={`w-4 h-4 transition ${open ? "" : "-rotate-90"}`} />
      </button>
      {open && <div className="mt-2 space-y-2 text-sm">{children}</div>}
    </div>
  );
}

function RoomsShop() {
  const [rooms, setRooms] = useState<RoomRow[]>([]);
  const [props, setProps] = useState<PropertyRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState<string>("all"); // 'all' | 'rentals' | property_id
  const [propsOpen, setPropsOpen] = useState(true);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [availOnly, setAvailOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("popularity");

  useEffect(() => {
    (async () => {
      const [{ data: rs }, { data: ps }] = await Promise.all([
        supabase.from("rooms").select("id, slug, property_id, name, room_number, current_status, base_rate, rate_monthly, image_urls, booked_until, created_at"),
        supabase.from("properties").select("id, slug, address, short_name").order("address"),
      ]);
      setRooms((rs as RoomRow[]) || []);
      setProps((ps as PropertyRow[]) || []);
      setLoading(false);
    })();
  }, []);

  const propById = useMemo(() => Object.fromEntries(props.map(p => [p.id, p])), [props]);

  const filtered = useMemo(() => {
    let out = rooms.slice();
    if (category !== "all" && category !== "rentals") {
      out = out.filter(r => r.property_id === category);
    }
    if (availOnly) out = out.filter(r => (r.current_status || "").toLowerCase() === "available");
    const lo = minPrice ? Number(minPrice) : null;
    const hi = maxPrice ? Number(maxPrice) : null;
    out = out.filter(r => {
      const p = r.rate_monthly ?? r.base_rate ?? 0;
      if (lo != null && p < lo) return false;
      if (hi != null && p > hi) return false;
      return true;
    });
    const price = (r: RoomRow) => r.rate_monthly ?? r.base_rate ?? 0;
    if (sort === "price_asc") out.sort((a, b) => price(a) - price(b));
    else if (sort === "price_desc") out.sort((a, b) => price(b) - price(a));
    else if (sort === "az") out.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    else if (sort === "za") out.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
    else if (sort === "newest") out.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
    return out;
  }, [rooms, category, minPrice, maxPrice, availOnly, sort]);

  const heading = category === "all" || category === "rentals"
    ? "All Rooms"
    : (propById[category]?.short_name || propById[category]?.address || "Rooms");
  const resultsLine = useTranslated(`${filtered.length} results`);

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Header />
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-8 md:py-12">
        <div className="grid md:grid-cols-[220px_1fr] gap-8">
          {/* SIDEBAR */}
          <aside className="space-y-4 text-sm">
            <div>
              <p className="font-semibold text-ink mb-2"><T>Browse by category</T></p>
              <ul className="space-y-1">
                <li>
                  <button onClick={() => setCategory("all")}
                    className={`text-left w-full ${category === "all" ? "font-bold text-ink underline" : "text-ink/80 hover:text-ink"}`}>
                    <T>All Items</T>
                  </button>
                </li>
                <li>
                  <button onClick={() => setCategory("rentals")}
                    className={`text-left w-full ${category === "rentals" ? "font-bold text-ink underline" : "text-ink/80 hover:text-ink"}`}>
                    <T>Rentals</T>
                  </button>
                </li>
                <li>
                  <button onClick={() => setPropsOpen(!propsOpen)}
                    className="text-left w-full inline-flex items-center gap-1 text-ink/80 hover:text-ink">
                    {propsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    <span><T>Properties</T></span>
                  </button>
                  {propsOpen && (
                    <ul className="ps-5 mt-1 space-y-1">
                      {props.map(p => (
                        <li key={p.id}>
                          <button onClick={() => setCategory(p.id)}
                            className={`text-left w-full ${category === p.id ? "font-bold text-ink underline" : "text-ink/70 hover:text-ink"}`}>
                            {p.short_name || p.address}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              </ul>
            </div>

            <Section title="Price range (CAD$)">
              <div className="flex items-center gap-2">
                <input value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="Min" inputMode="numeric"
                  className="w-full px-2 py-1.5 rounded border border-input bg-background text-sm" />
                <span className="text-ink/50">–</span>
                <input value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Max" inputMode="numeric"
                  className="w-full px-2 py-1.5 rounded border border-input bg-background text-sm" />
              </div>
            </Section>

            <Section title="Availability">
              <label className="flex items-center gap-2 text-ink/80">
                <input type="checkbox" checked={availOnly} onChange={e => setAvailOnly(e.target.checked)} />
                <T>Available only</T>
              </label>
            </Section>
          </aside>

          {/* GRID */}
          <section>
            {category !== "all" && category !== "rentals" && (
              <h1 className="font-display text-3xl md:text-4xl text-ink mb-4">{heading}</h1>
            )}
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-ink/70">{resultsLine}</p>
              <select value={sort} onChange={e => setSort(e.target.value as Sort)}
                className="px-3 py-2 rounded-lg border border-input bg-background text-sm">
                <option value="popularity">Popularity</option>
                <option value="newest">Newest</option>
                <option value="price_desc">Price (High-Low)</option>
                <option value="price_asc">Price (Low-High)</option>
                <option value="az">Alphabetical (A-Z)</option>
                <option value="za">Alphabetical (Z-A)</option>
              </select>
            </div>

            {loading ? (
              <p className="text-ink/60"><T>Loading…</T></p>
            ) : filtered.length === 0 ? (
              <p className="text-ink/60"><T>No rooms match these filters.</T></p>
            ) : (
              <div className="grid gap-x-5 gap-y-8 grid-cols-2 md:grid-cols-3">
                {filtered.map(r => {
                  const p = r.property_id ? propById[r.property_id] : null;
                  const fallback = PROPERTIES.find(x => p && x.id === p.slug)?.images[0];
                  const img = (r.image_urls && r.image_urls[0]) || fallback;
                  const price = r.rate_monthly ?? r.base_rate;
                  return (
                    <Link key={r.id}
                      to="/properties/$id/$roomSlug"
                      params={{ id: p?.slug || "", roomSlug: r.slug || r.id }}
                      className="group block">
                      <div className="aspect-square bg-cream-deep overflow-hidden rounded-md">
                        {img && <img src={img} alt={r.name || ""} loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />}
                      </div>
                      <div className="pt-2">
                        <h3 className="text-sm text-ink group-hover:underline leading-tight">{r.name || `Room ${r.room_number}`}</h3>
                        {price != null && <p className="text-sm text-ink/80">CAD${Number(price).toFixed(2)}</p>}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
      <FloatingContactBar />
    </div>
  );
}
