import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/rooms")({ component: RoomsPage });

interface Room { id: string; address?: string; name?: string; current_status?: string; base_rate?: number }

const STATUSES = ["Available", "Rented", "Maintenance"] as const;

function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);

  const load = async () => {
    const { data, error } = await supabase.from("rooms").select("*");
    if (error) toast.error(error.message);
    setRooms((data as Room[]) || []);
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (r: Room, status: string) => {
    const { error } = await supabase.from("rooms").update({ current_status: status }).eq("id", r.id);
    if (error) { toast.error(error.message); return; }
    setRooms(rooms.map(x => x.id === r.id ? { ...x, current_status: status } : x));
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Rooms</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map(r => {
          const s = (r.current_status || "Available");
          const tone = s.toLowerCase() === "available" ? "bg-success text-white" : s.toLowerCase() === "rented" ? "bg-foreground text-background" : "bg-destructive/10 text-destructive";
          return (
            <div key={r.id} className="bg-card rounded-2xl border border-border p-4 space-y-2">
              <div className="font-bold">{r.name || r.address || r.id}</div>
              <div className="text-xs text-muted-foreground">{r.address}</div>
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${tone}`}>{s}</span>
                <span className="text-sm font-semibold">${r.base_rate ?? "—"}</span>
              </div>
              <select value={s} onChange={e => setStatus(r, e.target.value)} className="w-full mt-2 px-3 py-2 rounded-lg border border-input bg-background text-sm">
                {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>
          );
        })}
        {rooms.length === 0 && <p className="text-sm text-muted-foreground">No rooms found.</p>}
      </div>
    </div>
  );
}
