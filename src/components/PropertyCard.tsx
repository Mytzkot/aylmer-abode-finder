import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, MapPin, Youtube, Calendar, FileText, ExternalLink, Wifi, BedDouble, Utensils, WashingMachine, ParkingCircle, Snowflake } from "lucide-react";
import { useState } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import type { PropertyMeta } from "@/data/properties";

interface Room { id: string; name?: string | null; current_status?: string | null; base_rate?: number | null; }

export function PropertyCard({ prop, rooms }: { prop: PropertyMeta; rooms: Room[] }) {
  const { t } = useLang();
  const [idx, setIdx] = useState(0);
  const next = () => setIdx((idx + 1) % prop.images.length);
  const prev = () => setIdx((idx - 1 + prop.images.length) % prop.images.length);

  const available = rooms.some(r => (r.current_status || "").toLowerCase() === "available");
  const firstRoom = rooms[0];

  return (
    <article className="bg-card rounded-3xl overflow-hidden shadow-sm border border-border/40 hover:shadow-xl hover:-translate-y-0.5 transition">
      <div className="relative aspect-video bg-cream-deep overflow-hidden rounded-3xl m-2">
        <img src={prop.images[idx]} alt={prop.address} className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute top-3 start-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${available ? "bg-success text-white" : "bg-ink/80 text-white"}`}>
            {available ? "Available" : "Limited"}
          </span>
        </div>
        {prop.images.length > 1 && (
          <>
            <button onClick={prev} className="touch-min absolute start-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 flex items-center justify-center shadow" aria-label="Previous image">
              <ChevronLeft className="w-5 h-5 flip-rtl" />
            </button>
            <button onClick={next} className="touch-min absolute end-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 flex items-center justify-center shadow" aria-label="Next image">
              <ChevronRight className="w-5 h-5 flip-rtl" />
            </button>
            <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
              {prop.images.map((_, i) => (
                <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === idx ? "bg-white" : "bg-white/50"}`} />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="p-5 space-y-3">
        <div>
          <h3 className="font-display text-2xl text-ink">{prop.address}</h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {prop.city}</p>
        </div>

        <div className="text-xs text-muted-foreground font-medium">
          {rooms.length > 0 ? `${rooms.filter(r => (r.current_status || "").toLowerCase() === "available").length} of ${rooms.length} rooms available` : "Contact us for availability"}
        </div>

        <ul className="flex flex-wrap gap-1.5 pt-1" aria-label="Amenities">
          {[
            { Icon: Wifi, label: "Wi-Fi" },
            { Icon: BedDouble, label: "Furnished" },
            { Icon: Utensils, label: "Kitchen" },
            { Icon: WashingMachine, label: "Laundry" },
            { Icon: ParkingCircle, label: "Parking" },
            { Icon: Snowflake, label: "Heat / AC" },
          ].map(({ Icon, label }) => (
            <li key={label} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cream text-ink text-[11px] font-semibold">
              <Icon className="w-3.5 h-3.5" strokeWidth={2.25} /> {label}
            </li>
          ))}
        </ul>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <a href={prop.youtube} target="_blank" rel="noreferrer" className="btn-pill btn-cream text-sm py-2.5">
            <Youtube className="w-4 h-4 text-red-500" /> {t.cta.tour}
          </a>
          <a href={prop.maps} target="_blank" rel="noreferrer" className="btn-pill btn-cream text-sm py-2.5">
            <MapPin className="w-4 h-4" /> {t.cta.maps}
          </a>
          <a href={prop.airbnb} target="_blank" rel="noreferrer" className="btn-pill btn-cream text-sm py-2.5 col-span-2">
            <ExternalLink className="w-4 h-4" /> {t.cta.airbnb}
          </a>
          <Link to="/book/$roomId" params={{ roomId: firstRoom?.id || prop.id }} className="btn-pill btn-ink text-sm py-2.5">
            <Calendar className="w-4 h-4" /> {t.cta.book}
          </Link>
          <Link to="/apply/$roomId" params={{ roomId: firstRoom?.id || prop.id }} className="btn-pill btn-coral text-sm py-2.5">
            <FileText className="w-4 h-4" /> {t.cta.apply}
          </Link>
        </div>

        <div className="pt-3 border-t border-border/60">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Nearby</h4>
          <ul className="space-y-1.5 text-sm">
            {prop.walkscore.map(w => (
              <li key={w.name} className="flex justify-between gap-2">
                <span className="font-semibold text-ink">{w.name}</span>
                <span className="text-muted-foreground text-xs">{w.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
