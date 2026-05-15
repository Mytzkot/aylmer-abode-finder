import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingContactBar } from "@/components/FloatingContactBar";
import { supabase } from "@/lib/supabase";
import { PROPERTIES } from "@/data/properties";
import { T, useTranslated } from "@/i18n/LanguageProvider";

export const Route = createFileRoute("/rooms")({ component: RoomsShop });

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
}
interface PropertyRow { id: string; slug: string; address: string; short_name: string | null; }

type Sort = "popularity" | "price_asc" | "price_desc" | "name";

function RoomsShop() {
  const [rooms, setRooms] = useState<RoomRow[]>([]);
  const [props, setProps] = useState<PropertyRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [category, setCategory] = useState<string>("all"); // 'all' or property_id
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [availOnly, setAvailOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("popularity");

  useEffect(() => {
    (async () => {
      const [{ data: rs }, { data: ps }] = await Promise.all([
        supabase.from("rooms").select("id, slug, property_id, name, room_number, current_status, base_rate, rate_monthly, image_urls, booked_until"),
        supabase.from("properties").select("id, slug, address, short_name"),
      ]);
      setRooms((rs as RoomRow[]) || []);
      setProps((ps as PropertyRow[]) || []);
      setLoading(false);
    })();
  }, []);

  const propById = useMemo(() => Object.fromEntries(props.map(p => [p.id, p])), [props]);

  const filtered = useMemo(() => {
    let out = rooms.slice();
    if (category !== "all") out = out.filter(r => r.property_id === category);
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
    if (sort === "price_asc") out.sort((a,b)=>price(a)-price(b));
    else if (sort === "price_desc") out.sort((a,b)=>price(b)-price(a));
    else if (sort === "name") out.sort((a,b)=>(a.name||"").localeCompare(b.name||""));
    return out;
  }, [rooms, category, minPrice, maxPrice, availOnly, sort]);

  const resultsLine = useTranslated(`${filtered.length} results`);

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Header />
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-10 md:py-14">
        <div className="grid md:grid-cols-[240px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="space-y-6 text-sm">
            <div>
              <h3 className="font-semibold text-ink mb-2"><T>Browse by category</T></h3>
              <ul className="space-y-1">
                <li>
                  <button onClick={() => setCategory("all")}
                    className={`text-left w-full ${category==="all" ? "font-bold text-ink underline" : "text-ink/70 hover:text-ink"}`}>
                    <T>All Items</T>
                  </button>
                </li>
                {props.map(p => (
                  <li key={p.id}>
                    <button onClick={() => setCategory(p.id)}
                      className={`text-left w-full ${category===p.id ? "font-bold text-ink underline" : "text-ink/70 hover:text-ink"}`}>
                      {p.short_name || p.address}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-border/60 pt-4">
              <h3 className="font-semibold text-ink mb-2"><T>Price range (CAD$)</T></h3>
              <div className="flex gap-2">
                <input value={minPrice} onChange={e=>setMinPrice(e.target.value)} placeholder="Min" inputMode="numeric"
                  className="w-full px-2 py-1.5 rounded border border-input bg-background" />
                <input value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} placeholder="Max" inputMode="numeric"
                  className="w-full px-2 py-1.5 rounded border border-input bg-background" />
              </div>
            </div>

            <div className="border-t border-border/60 pt-4">
              <h3 className="font-semibold text-ink mb-2"><T>Availability</T></h3>
              <label className="flex items-center gap-2 text-ink/80">
                <input type="checkbox" checked={availOnly} onChange={e=>setAvailOnly(e.target.checked)} />
                <T>Available only</T>
              </label>
            </div>
          </aside>

          {/* Grid */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-ink/70">{resultsLine}</p>
              <select value={sort} onChange={e=>setSort(e.target.value as Sort)}
                className="px-3 py-2 rounded-lg border border-input bg-background text-sm">
                <option value="popularity">Popularity</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name">Name</option>
              </select>
            </div>

            {loading ? (
              <p className="text-ink/60"><T>Loading…</T></p>
            ) : filtered.length === 0 ? (
              <p className="text-ink/60"><T>No rooms match these filters.</T></p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map(r => {
                  const p = r.property_id ? propById[r.property_id] : null;
                  const fallback = PROPERTIES.find(x => p && x.id === p.slug)?.images[0];
                  const img = (r.image_urls && r.image_urls[0]) || fallback;
                  const isAvail = (r.current_status || "").toLowerCase() === "available";
                  const price = r.rate_monthly ?? r.base_rate;
                  return (
                    <Link key={r.id}
                      to="/properties/$id/$roomSlug"
                      params={{ id: p?.slug || "", roomSlug: r.slug || r.id }}
                      className="group block bg-card rounded-2xl overflow-hidden border border-border/40 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition">
                      <div className="aspect-square bg-cream-deep overflow-hidden">
                        {img && <img src={img} alt={r.name || ""} loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />}
                      </div>
                      <div className="p-4 space-y-1">
                        <h3 className="font-semibold text-ink leading-tight">{r.name || `Room ${r.room_number}`}</h3>
                        {price != null && <p className="text-sm text-ink/80">CAD${Number(price).toFixed(2)}</p>}
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isAvail ? "bg-success text-white" : "bg-destructive text-white"
                        }`}>
                          {isAvail ? <T>Available</T> : <T>Booked</T>}
                        </span>
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
