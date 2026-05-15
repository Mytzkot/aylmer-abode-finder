import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, ChevronRight, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/applications")({ component: AppsPage });

interface App { id: string; first_name?: string; surname?: string; email?: string; telephone?: string; stay_type?: string; status?: string; created_at?: string; [k: string]: any }
interface Room { id: string; address?: string; current_status?: string; base_rate?: number }

function AppsPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selected, setSelected] = useState<App | null>(null);
  const [roomId, setRoomId] = useState("");
  const [term, setTerm] = useState<1 | 2 | 6>(1);

  const load = async () => {
    const [{ data: a }, { data: r }] = await Promise.all([
      supabase.from("applications").select("*").order("created_at", { ascending: false }),
      supabase.from("rooms").select("*"),
    ]);
    setApps((a as App[]) || []);
    setRooms((r as Room[]) || []);
  };
  useEffect(() => { load(); }, []);

  const approve = async () => {
    if (!selected || !roomId) { toast.error("Pick a room first"); return; }
    const { error } = await supabase.rpc("approve_application", {
      application_id: selected.id, room_id: roomId, lease_term_months: term,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Application approved");
    setSelected(null); setRoomId(""); load();
  };

  const pending = apps.filter(a => (a.status || "pending").toLowerCase() === "pending");
  const others = apps.filter(a => (a.status || "pending").toLowerCase() !== "pending");

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Applications</h1>

      <h2 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Pending ({pending.length})</h2>
      <div className="space-y-2 mb-6">
        {pending.length === 0 && <p className="text-sm text-muted-foreground">No pending applications.</p>}
        {pending.map(a => <AppRow key={a.id} a={a} onClick={() => setSelected(a)} />)}
      </div>

      {others.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Processed</h2>
          <div className="space-y-2">{others.map(a => <AppRow key={a.id} a={a} onClick={() => setSelected(a)} />)}</div>
        </>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 bg-foreground/40 grid place-items-end md:place-items-center" onClick={() => setSelected(null)}>
          <div className="w-full md:max-w-2xl md:rounded-2xl bg-card max-h-[92vh] overflow-y-auto rounded-t-2xl" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-card border-b border-border p-4 flex justify-between items-center">
              <h3 className="font-bold">{selected.first_name} {selected.surname}</h3>
              <button onClick={() => setSelected(null)} className="touch-min p-2"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              <Detail label="Email" value={selected.email} />
              <Detail label="Phone" value={selected.telephone} />
              <Detail label="Stay" value={selected.stay_type} />
              <Detail label="Income" value={selected.monthly_income} />
              <Detail label="Occupation" value={selected.present_occupation} />
              <Detail label="Address" value={selected.present_address} />
              <Detail label="Notes" value={selected.additional_information} />

              <div className="border-t border-border pt-4 space-y-3">
                <label className="block">
                  <span className="text-sm font-medium mb-1 block">Assign Room</span>
                  <select value={roomId} onChange={e => setRoomId(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-input bg-background">
                    <option value="">Select a room…</option>
                    {rooms.map(r => <option key={r.id} value={r.id}>{r.address || r.id} — ${r.base_rate || "?"}/mo · {r.current_status}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-medium mb-1 block">Lease Term</span>
                  <div className="grid grid-cols-3 gap-2">
                    {([1, 2, 6] as const).map(m => (
                      <button key={m} type="button" onClick={() => setTerm(m)}
                        className={`touch-min rounded-lg py-2 font-semibold border ${term === m ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border"}`}>
                        {m} mo
                      </button>
                    ))}
                  </div>
                </label>
                <button onClick={approve} className="touch-min w-full rounded-lg bg-success text-white font-bold py-3 inline-flex items-center justify-center gap-2 hover:opacity-90">
                  <CheckCircle2 className="w-5 h-5" /> Approve Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AppRow({ a, onClick }: { a: App; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full text-start bg-card rounded-xl border border-border p-3 flex items-center justify-between hover:border-primary transition">
      <div>
        <div className="font-semibold">{a.first_name} {a.surname}</div>
        <div className="text-xs text-muted-foreground">{a.email} · {a.stay_type || "—"} · {a.status || "pending"}</div>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground" />
    </button>
  );
}

function Detail({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <div className="text-xs uppercase font-semibold text-muted-foreground">{label}</div>
      <div className="text-sm">{value ?? "—"}</div>
    </div>
  );
}
