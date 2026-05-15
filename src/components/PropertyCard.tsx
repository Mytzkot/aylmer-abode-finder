import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, MapPin, Youtube, Calendar, FileText, ExternalLink } from "lucide-react";
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
    <article className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-lg transition">
      <div className="relative aspect-video bg-secondary overflow-hidden">
        <img src={prop.images[idx]} alt={prop.address} className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute top-3 start-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${available ? "bg-success text-white" : "bg-foreground/70 text-white"}`}>
            {available ? "Available" : "Limited"}
          </span>
        </div>
        {prop.images.length > 1 && (
          <>
            <button onClick={prev} className="touch-min absolute start-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center" aria-label="Previous image">
              <ChevronLeft className="w-5 h-5 flip-rtl" />
            </button>
            <button onClick={next} className="touch-min absolute end-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center" aria-label="Next image">
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

      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-bold text-lg">{prop.address}</h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {prop.city}</p>
        </div>

        <div className="text-xs text-muted-foreground">
          {rooms.length > 0 ? `${rooms.filter(r => (r.current_status || "").toLowerCase() === "available").length} of ${rooms.length} rooms available` : "Contact us for availability"}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <a href={prop.youtube} target="_blank" rel="noreferrer" className="touch-min inline-flex items-center justify-center gap-1.5 rounded-lg bg-secondary hover:bg-accent px-3 py-2 text-sm font-medium">
            <Youtube className="w-4 h-4 text-red-500" /> {t.cta.tour}
          </a>
          <a href={prop.maps} target="_blank" rel="noreferrer" className="touch-min inline-flex items-center justify-center gap-1.5 rounded-lg bg-secondary hover:bg-accent px-3 py-2 text-sm font-medium">
            <MapPin className="w-4 h-4" /> {t.cta.maps}
          </a>
          <a href={prop.airbnb} target="_blank" rel="noreferrer" className="touch-min col-span-2 inline-flex items-center justify-center gap-1.5 rounded-lg bg-secondary hover:bg-accent px-3 py-2 text-sm font-medium">
            <ExternalLink className="w-4 h-4" /> {t.cta.airbnb}
          </a>
          <Link to="/book/$roomId" params={{ roomId: firstRoom?.id || prop.id }}
            className="touch-min inline-flex items-center justify-center gap-1.5 rounded-lg bg-foreground text-background px-3 py-2 text-sm font-bold hover:opacity-90">
            <Calendar className="w-4 h-4" /> {t.cta.book}
          </Link>
          <Link to="/apply/$roomId" params={{ roomId: firstRoom?.id || prop.id }}
            className="touch-min inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-sm font-bold hover:opacity-90">
            <FileText className="w-4 h-4" /> {t.cta.apply}
          </Link>
        </div>

        <div className="pt-3 border-t border-border">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Nearby</h4>
          <ul className="space-y-1 text-sm">
            {prop.walkscore.map(w => (
              <li key={w.name} className="flex justify-between gap-2"><span className="font-medium">{w.name}</span><span className="text-muted-foreground text-xs">{w.detail}</span></li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
