import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PROPERTIES } from "@/data/properties";
import { T, useTranslated } from "@/i18n/LanguageProvider";
import housekeepingIcon from "@/assets/housekeeping-icon.jpg";

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

type Sort = "alpha" | "available" | "price_desc" | "price_asc";

// Properties we hide from the sidebar filter (kept in DB for future use)
const HIDDEN_PROPERTY_SLUGS = new Set(["162-eddy"]);

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-ink/20 pt-3">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between text-ink font-bold py-1">
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
  // Map: room_id -> latest active lease_end ISO date (for real-time availability)
  const [leaseEndByRoom, setLeaseEndByRoom] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());

  // category: 'all' | 'rentals' | 'extras' | property_id
  const [category, setCategory] = useState<string>("all");
  const [propsOpen, setPropsOpen] = useState(true);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [availOnly, setAvailOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("alpha");

  const loadAvailability = useMemo(
    () => async () => {
      const todayIso = new Date().toISOString().slice(0, 10);
      const [{ data: rs }, { data: ps }, { data: ts }] = await Promise.all([
        supabase
          .from("rooms")
          .select(
            "id, slug, property_id, name, room_number, current_status, base_rate, rate_monthly, image_urls, booked_until, created_at",
          ),
        supabase.from("properties").select("id, slug, address, short_name").order("address"),
        // Active leases — anything ending today or later still occupies the room.
        supabase
          .from("tenants")
          .select("room_id, lease_end")
          .gte("lease_end", todayIso),
      ]);
      setRooms((rs as RoomRow[]) || []);
      setProps((ps as PropertyRow[]) || []);
      const next: Record<string, string> = {};
      for (const t of (ts as Array<{ room_id: string | null; lease_end: string | null }>) || []) {
        if (!t.room_id || !t.lease_end) continue;
        const prev = next[t.room_id];
        // Keep the latest lease_end per room (longest occupation).
        if (!prev || t.lease_end > prev) next[t.room_id] = t.lease_end;
      }
      setLeaseEndByRoom(next);
      setNow(Date.now());
      setLoading(false);
    },
    [],
  );

  useEffect(() => {
    loadAvailability();

    // Real-time: refresh when rooms or tenants change in the backend.
    const channel = supabase
      .channel("rooms-availability")
      .on("postgres_changes", { event: "*", schema: "public", table: "rooms" }, () => loadAvailability())
      .on("postgres_changes", { event: "*", schema: "public", table: "tenants" }, () => loadAvailability())
      .subscribe();

    // Refresh when the tab regains focus / becomes visible.
    const onFocus = () => loadAvailability();
    const onVis = () => { if (document.visibilityState === "visible") loadAvailability(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);

    // Tick the clock once an hour so date-based ordering stays accurate
    // for long-lived sessions (lease ends crossing midnight).
    const tick = window.setInterval(() => setNow(Date.now()), 60 * 60 * 1000);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
      window.clearInterval(tick);
    };
  }, [loadAvailability]);

  const visibleProps = useMemo(() => props.filter(p => !HIDDEN_PROPERTY_SLUGS.has(p.slug)), [props]);
  const propById = useMemo(() => Object.fromEntries(props.map(p => [p.id, p])), [props]);

  const filtered = useMemo(() => {
    let out = rooms.slice();
    // Hide rooms belonging to hidden properties
    out = out.filter(r => !r.property_id || !HIDDEN_PROPERTY_SLUGS.has(propById[r.property_id]?.slug || ""));
    // Hide the 5x5 storage extra
    out = out.filter(r => !/storage|5x5/i.test(r.name || ""));

    if (category === "extras") {
      out = out.filter(r => !r.property_id);
    } else if (category === "rentals") {
      out = out.filter(r => !!r.property_id);
    } else if (category !== "all") {
      out = out.filter(r => r.property_id === category);
    }
    // Effective "free on" timestamp combining manual booked_until and live
    // lease_end from the tenants table. Past dates collapse to "available now".
    const freeOn = (r: RoomRow): number => {
      const status = (r.current_status || "").toLowerCase();
      const candidates: number[] = [];
      if (r.booked_until) {
        const t = Date.parse(r.booked_until);
        if (Number.isFinite(t)) candidates.push(t);
      }
      const leaseEnd = leaseEndByRoom[r.id];
      if (leaseEnd) {
        const t = Date.parse(leaseEnd);
        if (Number.isFinite(t)) candidates.push(t);
      }
      const latest = candidates.length ? Math.max(...candidates) : 0;
      // If status says available and nothing in the future occupies it → 0.
      if (latest <= now) return status === "rented" ? Number.POSITIVE_INFINITY : 0;
      return latest;
    };
    const isAvailableNow = (r: RoomRow) => freeOn(r) === 0;

    if (availOnly) out = out.filter(isAvailableNow);
    const lo = minPrice ? Number(minPrice) : null;
    const hi = maxPrice ? Number(maxPrice) : null;
    out = out.filter(r => {
      const p = r.rate_monthly ?? r.base_rate ?? 0;
      if (lo != null && p < lo) return false;
      if (hi != null && p > hi) return false;
      return true;
    });
    const price = (r: RoomRow) => r.rate_monthly ?? r.base_rate ?? 0;
    const propName = (r: RoomRow) => {
      const p = r.property_id ? propById[r.property_id] : null;
      return (p?.short_name || p?.address || "zzz").toLowerCase();
    };
    const roomLabel = (r: RoomRow) => (r.name || r.room_number || "").toLowerCase();
    const alphaCmp = (a: RoomRow, b: RoomRow) =>
      propName(a).localeCompare(propName(b)) || roomLabel(a).localeCompare(roomLabel(b));

    if (sort === "price_asc") out.sort((a, b) => price(a) - price(b) || alphaCmp(a, b));
    else if (sort === "price_desc") out.sort((a, b) => price(b) - price(a) || alphaCmp(a, b));
    else if (sort === "available") {
      // Available rooms first; remaining sorted by soonest return-to-market
      // (effective free-on date ascending; never-free last), then alphabetical.
      out.sort((a, b) => freeOn(a) - freeOn(b) || alphaCmp(a, b));
    } else {
      // Default: alphabetical by property (Amour, Colline, Conrad…) then room.
      out.sort(alphaCmp);
    }
    return out;
  }, [rooms, propById, leaseEndByRoom, now, category, minPrice, maxPrice, availOnly, sort]);

  const heading =
    category === "all" ? "All Rooms"
    : category === "rentals" ? "Rentals"
    : category === "extras" ? "Extras"
    : (propById[category]?.short_name || propById[category]?.address || "Rooms");
  const resultsLine = useTranslated(`${filtered.length} results`);

  const hasExtras = useMemo(() => rooms.some(r => !r.property_id), [rooms]);

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-8 md:py-12">
        <div className="grid md:grid-cols-[220px_1fr] gap-8">
          {/* SIDEBAR */}
          <aside className="space-y-4 text-sm text-ink">
            <div>
              <p className="font-bold text-ink mb-2"><T>Browse by category</T></p>
              <ul className="space-y-1">
                <li>
                  <button onClick={() => setCategory("all")}
                    className={`text-left w-full ${category === "all" ? "font-bold text-ink underline" : "text-ink hover:underline"}`}>
                    <T>All Rooms</T>
                  </button>
                </li>
                <li>
                  <button onClick={() => setCategory("rentals")}
                    className={`text-left w-full ${category === "rentals" ? "font-bold text-ink underline" : "text-ink hover:underline"}`}>
                    <T>Rentals</T>
                  </button>
                </li>
                <li>
                  <button onClick={() => setPropsOpen(!propsOpen)}
                    className="text-left w-full inline-flex items-center gap-1 text-ink hover:underline">
                    {propsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    <span><T>Properties</T></span>
                  </button>
                  {propsOpen && (
                    <ul className="ps-5 mt-1 space-y-1">
                      {visibleProps.map(p => (
                        <li key={p.id}>
                          <button onClick={() => setCategory(p.id)}
                            className={`text-left w-full ${category === p.id ? "font-bold text-ink underline" : "text-ink hover:underline"}`}>
                            {p.short_name || p.address}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
                {hasExtras && (
                  <li>
                    <button onClick={() => setCategory("extras")}
                      className={`text-left w-full ${category === "extras" ? "font-bold text-ink underline" : "text-ink hover:underline"}`}>
                      <T>Extras</T>
                    </button>
                  </li>
                )}
              </ul>
            </div>

            <Section title="Price range (CAD$)">
              <div className="flex items-center gap-2">
                <input value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="Min" inputMode="numeric"
                  className="w-full px-2 py-1.5 rounded border border-ink/30 bg-background text-sm text-ink" />
                <span className="text-ink">–</span>
                <input value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Max" inputMode="numeric"
                  className="w-full px-2 py-1.5 rounded border border-ink/30 bg-background text-sm text-ink" />
              </div>
            </Section>

            <Section title="Availability">
              <label className="flex items-center gap-2 text-ink">
                <input type="checkbox" checked={availOnly} onChange={e => setAvailOnly(e.target.checked)} />
                <T>Available only</T>
              </label>
            </Section>
          </aside>

          {/* GRID */}
          <section>
            {category !== "all" && (
              <h1 className="font-display text-3xl md:text-4xl text-ink mb-4"><T>{heading}</T></h1>
            )}
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm font-semibold text-ink">{resultsLine}</p>
              <select value={sort} onChange={e => setSort(e.target.value as Sort)}
                className="px-3 py-2 rounded-lg border border-ink/30 bg-background text-sm text-ink font-medium">
                <option value="alpha">Alphabetical (A–Z)</option>
                <option value="available">Available first</option>
                <option value="price_desc">Price (High - Low)</option>
                <option value="price_asc">Price (Low - High)</option>
              </select>
            </div>

            {loading ? (
              <p className="text-ink"><T>Loading…</T></p>
            ) : filtered.length === 0 ? (
              <p className="text-ink"><T>No rooms match these filters.</T></p>
            ) : (
              <div className="grid gap-x-5 gap-y-8 grid-cols-2 md:grid-cols-3">
                {filtered.map(r => {
                  const p = r.property_id ? propById[r.property_id] : null;
                  const fallback = PROPERTIES.find(x => p && x.id === p.slug)?.images[0];
                  const isHousekeeping = /housekeep|cleaning/i.test(r.name || "");
                  const img = (r.image_urls && r.image_urls[0]) || (isHousekeeping ? housekeepingIcon : fallback);
                  const price = r.rate_monthly ?? r.base_rate;
                  const to = p ? "/properties/$id/$roomSlug" : "/rooms";
                  return (
                    <Link key={r.id}
                      to={to}
                      params={p ? { id: p.slug, roomSlug: r.slug || r.id } : undefined}
                      className="group block">
                      <div className="aspect-square bg-cream-deep overflow-hidden rounded-md">
                        {img && <img src={img} alt={r.name || ""} loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />}
                      </div>
                      <div className="pt-2">
                        <h3 className="text-sm font-semibold text-ink group-hover:underline leading-tight">{r.name || `Room ${r.room_number}`}</h3>
                        {price != null && <p className="text-sm text-ink font-medium">CAD${Number(price).toFixed(2)}</p>}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
