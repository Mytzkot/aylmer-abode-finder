import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, X, PlayCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PROPERTIES } from "@/data/properties";
import { T, useTranslated } from "@/i18n/LanguageProvider";
import { Slider } from "@/components/ui/slider";
import housekeepingIcon from "@/assets/housekeeping-icon.jpg";

export const Route = createFileRoute("/rooms")({
  component: RoomsShop,
  head: () => ({
    meta: [
      { title: "All Rooms — Zorba Rentals" },
      { name: "description", content: "Browse all furnished rooms across our Aylmer-Gatineau locations." },
      { property: "og:title", content: "All Rooms — Zorba Rentals" },
      { property: "og:description", content: "Browse all furnished rooms across our Aylmer-Gatineau locations." },
      { property: "og:url", content: "/rooms" },
    ],
    links: [{ rel: "canonical", href: "/rooms" }],
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
  available_from: string | null;
  youtube_video_url: string | null;
  externally_managed: boolean | null;
  manual_available: boolean | null;
  created_at: string;
}
interface PropertyRow { id: string; slug: string; address: string; short_name: string | null; }

type Sort = "available" | "price_asc" | "price_desc";

const HIDDEN_PROPERTY_SLUGS = new Set(["162-eddy"]);
const PRICE_MIN = 750;
const PRICE_MAX = 1200;

function RoomsShop() {
  const [rooms, setRooms] = useState<RoomRow[]>([]);
  const [props, setProps] = useState<PropertyRow[]>([]);
  const [leaseEndByRoom, setLeaseEndByRoom] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());

  // Filter state
  const [locationId, setLocationId] = useState<string>("all");
  
  const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);
  const [availOnly, setAvailOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("available");
  const [mobileOpen, setMobileOpen] = useState(false);

  const loadAvailability = useMemo(
    () => async () => {
      const todayIso = new Date().toISOString().slice(0, 10);
      const [{ data: rs }, { data: ps }, { data: ts }] = await Promise.all([
        supabase
          .from("rooms")
          .select(
            "id, slug, property_id, name, room_number, current_status, base_rate, rate_monthly, image_urls, booked_until, available_from, youtube_video_url, externally_managed, manual_available, created_at",
          ),
        supabase.from("properties").select("id, slug, address, short_name").order("address"),
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
    const channel = supabase
      .channel("rooms-availability")
      .on("postgres_changes", { event: "*", schema: "public", table: "rooms" }, () => loadAvailability())
      .subscribe();
    const onFocus = () => loadAvailability();
    const onVis = () => { if (document.visibilityState === "visible") loadAvailability(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
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
    out = out.filter(r => !r.property_id || !HIDDEN_PROPERTY_SLUGS.has(propById[r.property_id]?.slug || ""));
    out = out.filter(r => !/storage|5x5/i.test(r.name || ""));
    // Hide non-property "extras" rows from the public rooms catalogue.
    out = out.filter(r => !!r.property_id);

    if (locationId !== "all") {
      out = out.filter(r => r.property_id === locationId);
    }

    const freeOn = (r: RoomRow): number => {
      // Externally-managed rooms ignore admin status & tenant data: only the
      // manual switch decides availability.
      if (r.externally_managed) return r.manual_available ? 0 : Number.POSITIVE_INFINITY;
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
      if (latest <= now) return status === "rented" ? Number.POSITIVE_INFINITY : 0;
      return latest;
    };
    const isAvailableNow = (r: RoomRow) => freeOn(r) === 0;

    if (availOnly) out = out.filter(isAvailableNow);

    const [lo, hi] = priceRange;
    out = out.filter(r => {
      const p = r.rate_monthly ?? r.base_rate ?? 0;
      if (p <= 0) return true; // keep rooms with no price set
      return p >= lo && p <= hi;
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
    else out.sort((a, b) => freeOn(a) - freeOn(b) || alphaCmp(a, b));

    return out;
  }, [rooms, propById, leaseEndByRoom, now, locationId, priceRange, availOnly, sort]);

  const headingEN = "Available Rooms";
  const headingFR = "Chambres Disponibles";
  const totalVisible = useMemo(
    () => rooms.filter(r =>
      r.property_id &&
      !HIDDEN_PROPERTY_SLUGS.has(propById[r.property_id]?.slug || "") &&
      !/storage|5x5/i.test(r.name || "")
    ),
    [rooms, propById],
  );
  const availableNowCount = useMemo(
    () => totalVisible.filter(r => {
      if (r.externally_managed) return !!r.manual_available;
      const status = (r.current_status || "").toLowerCase();
      if (status !== "available") return false;
      if (r.booked_until && Date.parse(r.booked_until) > now) return false;
      const le = leaseEndByRoom[r.id];
      if (le && Date.parse(le) > now) return false;
      return true;
    }).length,
    [totalVisible, leaseEndByRoom, now],
  );
  const resultsLabel = useTranslated(
    `${availableNowCount} of ${totalVisible.length} rooms available · showing ${filtered.length}`,
  );

  const resetFilters = () => {
    setLocationId("all");
    setPriceRange([PRICE_MIN, PRICE_MAX]);
    setAvailOnly(false);
  };

  const FiltersPanel = (
    <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-5">
      {/* Location */}
      <div className="flex-1 min-w-[160px]">
        <label htmlFor="rooms-location" className="block text-[11px] font-bold uppercase tracking-wider text-ink/60 mb-1.5">
          <T>Location</T>
        </label>
        <select
          id="rooms-location"
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-ink/25 bg-background text-sm text-ink font-medium"
        >
          <option value="all">All Locations</option>
          {visibleProps.map((p) => (
            <option key={p.id} value={p.id}>{p.short_name || p.address}</option>
          ))}
        </select>
      </div>


      {/* Price range slider */}
      <div className="flex-1 min-w-[220px]">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-ink/60 mb-1.5">
          <T>Price</T> · ${priceRange[0]} – ${priceRange[1]}
        </label>
        <div className="px-1 pt-2">
          <Slider
            value={priceRange}
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={50}
            onValueChange={(v) => setPriceRange([v[0], v[1]] as [number, number])}
          />
        </div>
      </div>

      {/* Availability toggle */}
      <div className="md:pb-2">
        <label className="inline-flex items-center gap-2 text-sm font-semibold text-ink cursor-pointer select-none">
          <input
            type="checkbox"
            checked={availOnly}
            onChange={(e) => setAvailOnly(e.target.checked)}
            className="w-4 h-4 accent-coral"
          />
          <T>Show available only</T>
        </label>
      </div>

      {/* Reset */}
      <div className="md:pb-2">
        <button
          type="button"
          onClick={resetFilters}
          className="px-4 py-2.5 rounded-lg border border-ink/25 bg-background text-sm font-bold text-ink hover:bg-cream-deep transition-colors"
        >
          <T>Reset Filters</T>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 md:py-12">
        <header className="mb-6 md:mb-8">
          <h1 className="font-display text-3xl md:text-5xl text-ink leading-tight">
            {headingEN} <span className="text-ink/40">/</span> <span className="text-coral">{headingFR}</span>
          </h1>
          <p className="text-sm text-ink/60 mt-2">{resultsLabel}</p>
        </header>

        {/* Desktop filter bar */}
        <div className="hidden md:block bg-card border border-border/60 rounded-2xl p-5 shadow-sm mb-6">
          {FiltersPanel}
        </div>

        {/* Mobile filter trigger + sort row */}
        <div className="md:hidden flex items-center gap-2 mb-5">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-ink/25 bg-card text-sm font-bold text-ink"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <T>Filters</T>
          </button>
          <label htmlFor="rooms-sort-mobile" className="sr-only">
            <T>Sort</T>
          </label>
          <select
            id="rooms-sort-mobile"
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="flex-1 px-3 py-2.5 rounded-lg border border-ink/25 bg-card text-sm text-ink font-medium"
          >
            <option value="available">Availability</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        {/* Desktop sort row */}
        <div className="hidden md:flex items-center justify-end mb-5">
          <label htmlFor="rooms-sort-desktop" className="text-xs font-bold uppercase tracking-wider text-ink/60 mr-2">
            <T>Sort</T>
          </label>
          <select
            id="rooms-sort-desktop"
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="px-3 py-2 rounded-lg border border-ink/25 bg-card text-sm text-ink font-medium"
          >
            <option value="available">Availability</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-ink/50" onClick={() => setMobileOpen(false)} />
            <div className="absolute bottom-0 inset-x-0 bg-card rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl text-ink"><T>Filters</T></h2>
                <button onClick={() => setMobileOpen(false)} aria-label="Close" className="p-2 -mr-2">
                  <X className="w-5 h-5 text-ink" />
                </button>
              </div>
              {FiltersPanel}
              <div className="mt-6 flex gap-2">
                <button
                  onClick={resetFilters}
                  className="flex-1 py-3 rounded-lg border border-ink/25 text-ink font-bold"
                >
                  <T>Reset</T>
                </button>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 py-3 rounded-lg bg-surface-dark text-white font-bold"
                >
                  <T>Show results</T>
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-ink"><T>Loading…</T></p>
        ) : filtered.length === 0 ? (
          <p className="text-ink"><T>No rooms match these filters.</T></p>
        ) : (
          <div className="grid gap-x-5 gap-y-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map(r => {
              const p = r.property_id ? propById[r.property_id] : null;
              const fallback = PROPERTIES.find(x => p && x.id === p.slug)?.images[0];
              const isHousekeeping = /housekeep|cleaning/i.test(r.name || "");
              const img = (r.image_urls && r.image_urls[0]) || (isHousekeeping ? housekeepingIcon : fallback);
              const price = r.rate_monthly ?? r.base_rate;
              const to = p ? "/properties/$id/$roomSlug" : "/rooms";
              const status = (r.current_status || "").toLowerCase();
              const bookedUntilT = r.booked_until ? Date.parse(r.booked_until) : 0;
              const leaseEndT = leaseEndByRoom[r.id] ? Date.parse(leaseEndByRoom[r.id]) : 0;
              const futureBookT = Math.max(bookedUntilT, leaseEndT);
              const isRented = r.externally_managed
                ? !r.manual_available
                : (status !== "available" || futureBookT > now);
              const availFromT = r.available_from ? Date.parse(r.available_from) : 0;
              const futureAvail = !isRented && availFromT > now;
              const availDateLabel = futureAvail
                ? new Date(availFromT).toLocaleDateString(undefined, { month: "long", day: "numeric" })
                : null;
              const freeOnLabel = isRented && !r.externally_managed && futureBookT > now
                ? new Date(futureBookT).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                : null;
              return (
                <Link key={r.id}
                  to={to}
                  params={p ? { id: p.slug, roomSlug: r.slug || r.id } : undefined}
                  className="group block relative">
                  <div className="aspect-square bg-cream-deep overflow-hidden rounded-md relative">
                    {img && <img src={img} alt={r.name || ""} loading="lazy"
                      className={`w-full h-full object-cover transition duration-500 ${isRented ? "grayscale opacity-60" : "group-hover:scale-105"}`} />}
                    <span className={`absolute top-2 start-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                      isRented ? "bg-ink/70 text-white" : "bg-success text-white"
                    }`}>
                      {isRented ? <T>Not available</T> : futureAvail ? <><T>Available</T> {availDateLabel}</> : <T>Available now</T>}
                    </span>
                    {!isRented && r.youtube_video_url && (
                      <a
                        href={r.youtube_video_url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Watch room tour"
                        className="absolute bottom-2 end-2 w-9 h-9 rounded-full bg-white/95 text-red-600 flex items-center justify-center shadow hover:scale-110 transition"
                      >
                        <PlayCircle className="w-6 h-6" />
                      </a>
                    )}
                  </div>
                  <div className="pt-2">
                    <h3 className={`text-sm font-semibold leading-tight ${isRented ? "text-ink/60" : "text-ink group-hover:underline"}`}>{r.name || `Room ${r.room_number}`}</h3>
                    {price != null && <p className={`text-sm font-medium ${isRented ? "text-ink/50 line-through" : "text-ink"}`}>CAD${Number(price).toFixed(2)} <span className="font-normal">/ <T>month</T></span></p>}
                    {isRented && (
                      <p className="text-[11px] text-ink/60 mt-0.5">
                        {freeOnLabel ? <><T>Free from</T> {freeOnLabel}</> : <T>Not available</T>}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
