import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, MapPin, Youtube, Calendar, FileText, Home, Wifi, BedDouble, Utensils, WashingMachine, ParkingCircle, Snowflake } from "lucide-react";
import { useState } from "react";
import { useLang, T, useTranslated } from "@/i18n/LanguageProvider";
import type { PropertyMeta } from "@/data/properties";

interface Room { id: string; name?: string | null; current_status?: string | null; base_rate?: number | null; youtube_video_url?: string | null; airbnb_listing_url?: string | null; }

function mapsUrl(address: string, city: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address} ${city}`)}`;
}

function IconBtn({ href, label, color, children }: { href: string; label: string; color: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      title={label}
      aria-label={label}
      className={`w-10 h-10 rounded-full inline-flex items-center justify-center bg-card border border-border hover:border-brand hover:bg-cream transition ${color}`}
    >
      {children}
    </a>
  );
}

export function PropertyCard({ prop, rooms }: { prop: PropertyMeta; rooms: Room[] }) {
  const { t } = useLang();
  const [idx, setIdx] = useState(0);
  const next = () => setIdx((idx + 1) % prop.images.length);
  const prev = () => setIdx((idx - 1 + prop.images.length) % prop.images.length);

  const availableRooms = rooms.filter(r => (r.current_status || "").toLowerCase() === "available");
  const availableCount = availableRooms.length;
  const firstRoom = rooms[0];
  const firstAvailable = availableRooms[0];
  const youtubeUrl = firstRoom?.youtube_video_url || prop.youtube;
  const airbnbUrl = firstRoom?.airbnb_listing_url || null;
  const gmapsUrl = mapsUrl(prop.address, prop.city);

  const watchTour = useTranslated("Watch tour");
  const viewMap = useTranslated("View map");
  const airbnbListing = useTranslated("Airbnb listing");
  const prevImg = useTranslated("Previous image");
  const nextImg = useTranslated("Next image");
  const amenitiesLabel = useTranslated("Amenities");
  const roomsLine = useTranslated(
    rooms.length > 0
      ? `${availableCount} of ${rooms.length} rooms available`
      : `${availableCount} rooms available`,
  );

  return (
    <article className="bg-card rounded-3xl overflow-hidden shadow-sm border border-border/40 hover:shadow-xl hover:-translate-y-0.5 transition">
      <Link
        to="/properties/$id"
        params={{ id: prop.id }}
        aria-label={`View rooms at ${prop.address}`}
        className="block relative aspect-video bg-cream-deep overflow-hidden rounded-3xl m-2 group"
      >
        <img src={prop.images[idx]} alt={prop.address} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" loading="lazy" />
        {prop.images.length > 1 && (
          <>
            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); prev(); }} className="touch-min absolute start-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 flex items-center justify-center shadow" aria-label={prevImg}>
              <ChevronLeft className="w-5 h-5 flip-rtl" />
            </button>
            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); next(); }} className="touch-min absolute end-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 flex items-center justify-center shadow" aria-label={nextImg}>
              <ChevronRight className="w-5 h-5 flip-rtl" />
            </button>
            <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
              {prop.images.map((_, i) => (
                <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === idx ? "bg-white" : "bg-white/50"}`} />
              ))}
            </div>
          </>
        )}
      </Link>

      <div className="p-5 space-y-3">
        <Link to="/properties/$id" params={{ id: prop.id }} className="block hover:text-brand transition">
          <h3 className="font-display text-2xl text-ink">{prop.address}</h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {prop.city}</p>
        </Link>


        {/* Circular icon row */}
        <div className="flex items-center gap-2">
          <IconBtn href={youtubeUrl} label={watchTour} color="text-red-500">
            <Youtube className="w-5 h-5" />
          </IconBtn>
          <IconBtn href={gmapsUrl} label={viewMap} color="text-success">
            <MapPin className="w-5 h-5" />
          </IconBtn>
          {airbnbUrl && (
            <IconBtn href={airbnbUrl} label={airbnbListing} color="text-coral">
              <Home className="w-5 h-5" />
            </IconBtn>
          )}
        </div>

        <div className={`text-xs font-medium ${availableCount === 0 ? "text-destructive" : "text-muted-foreground"}`}>
          {availableCount === 0 ? <T>Fully rented — join the waitlist</T> : roomsLine}
        </div>

        <ul className="flex flex-wrap gap-1.5 pt-1" aria-label={amenitiesLabel}>
          {[
            { Icon: Wifi, label: "Wi-Fi" },
            { Icon: BedDouble, label: "Furnished" },
            { Icon: Utensils, label: "Kitchen" },
            { Icon: WashingMachine, label: "Laundry" },
            { Icon: ParkingCircle, label: "Parking" },
            { Icon: Snowflake, label: "Heat / AC" },
          ].map(({ Icon, label }) => (
            <li key={label} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cream text-ink text-[11px] font-semibold">
              <Icon className="w-3.5 h-3.5" strokeWidth={2.25} /> <T>{label}</T>
            </li>
          ))}
        </ul>

        <div className="grid grid-cols-2 gap-2 pt-1">
          {firstAvailable ? (
            <Link to="/book/$roomId" params={{ roomId: firstAvailable.id }} className="btn-pill btn-ink text-sm py-2.5">
              <Calendar className="w-4 h-4" /> {t.cta.book}
            </Link>
          ) : (
            <span className="btn-pill text-sm py-2.5 bg-cream-deep text-ink/50 cursor-not-allowed justify-center inline-flex items-center gap-1">
              <Calendar className="w-4 h-4" /> <T>No rooms available</T>
            </span>
          )}
          <Link to="/apply" search={{ property: prop.id }} className="btn-pill btn-coral text-sm py-2.5">
            <FileText className="w-4 h-4" /> {t.cta.apply}
          </Link>
        </div>

        <div className="pt-3 border-t border-border/60">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2"><T>Nearby</T></h4>
          <ul className="space-y-1.5 text-sm">
            {prop.walkscore.map(w => (
              <li key={w.name} className="flex justify-between gap-2">
                <span className="font-semibold text-ink"><T>{w.name}</T></span>
                <span className="text-muted-foreground text-xs"><T>{w.detail}</T></span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
