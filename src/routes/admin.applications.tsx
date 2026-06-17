import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronRight, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/applications")({ component: AppsPage });

interface App {
  id: string;
  first_name?: string; surname?: string;
  email?: string; telephone?: string;
  stay_type?: string;
  status?: string;
  created_at?: string;
  monthly_income?: number | null;
  present_address?: string;
  additional_information?: string;
  room_id?: string | null;
  [k: string]: any;
}
interface Room {
  id: string;
  name?: string;
  room_number?: string;
  current_status?: string;
  base_rate?: number;
  rate_monthly?: number;
}

const STATUSES = ["new", "reviewing", "approved", "declined"] as const;
type Status = typeof STATUSES[number];

const normalize = (s?: string): Status => {
  const v = (s || "new").toLowerCase();
  if (v === "pending") return "new";
  if ((STATUSES as readonly string[]).includes(v)) return v as Status;
  return "new";
};

const statusStyle = (s: Status) => {
  if (s === "approved") return "bg-success/15 text-success";
  if (s === "declined") return "bg-destructive/15 text-destructive";
  if (s === "reviewing") return "bg-brand/15 text-brand";
  return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
};

function AppsPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selected, setSelected] = useState<App | null>(null);
  const [filter, setFilter] = useState<"all" | Status>("all");

  const load = async () => {
    const [{ data: a }, { data: r }] = await Promise.all([
      supabase.from("applications").select("*").order("created_at", { ascending: false }),
      supabase.from("rooms").select("id, name, room_number, current_status, base_rate, rate_monthly"),
    ]);
    setApps((a as App[]) || []);
    setRooms((r as Room[]) || []);
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (app: App, status: Status) => {
    const { error } = await supabase.from("applications").update({ status }).eq("id", app.id);
    if (error) { toast.error(error.message); return; }
    setApps(prev => prev.map(x => x.id === app.id ? { ...x, status } : x));
    if (selected?.id === app.id) setSelected({ ...selected, status });
    toast.success(`Marked ${status}`);
  };

  const filtered = useMemo(() => {
    if (filter === "all") return apps;
    return apps.filter(a => normalize(a.status) === filter);
  }, [apps, filter]);

  const counts = useMemo(() => {
    const c: Record<Status, number> = { new: 0, reviewing: 0, approved: 0, declined: 0 };
    apps.forEach(a => { c[normalize(a.status)]++; });
    return c;
  }, [apps]);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Applications</h1>

      <div className="flex flex-wrap gap-2 mb-4 text-sm">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")} label={`All (${apps.length})`} />
        {STATUSES.map(s => (
          <FilterChip key={s} active={filter === s} onClick={() => setFilter(s)} label={`${s[0].toUpperCase()}${s.slice(1)} (${counts[s]})`} />
        ))}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && <p className="text-sm text-muted-foreground">No applications.</p>}
        {filtered.map(a => <AppRow key={a.id} a={a} onClick={() => setSelected(a)} />)}
      </div>

      {selected && (
        <ApplicationDetail
          app={selected}
          rooms={rooms}
          onClose={() => setSelected(null)}
          onStatus={(s) => setStatus(selected, s)}
          onApproved={() => { setSelected(null); load(); }}
        />
      )}
    </div>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-1.5 rounded-full border font-medium capitalize transition ${active ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:border-primary/50"}`}>
      {label}
    </button>
  );
}

function AppRow({ a, onClick }: { a: App; onClick: () => void }) {
  const status = normalize(a.status);
  return (
    <button onClick={onClick} className="w-full text-start bg-card rounded-xl border border-border p-3 flex items-center justify-between hover:border-primary transition">
      <div className="min-w-0">
        <div className="font-semibold truncate">{a.first_name} {a.surname}</div>
        <div className="text-xs text-muted-foreground truncate">
          {a.telephone || "—"} · {a.email || "—"}
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {a.stay_type || "—"}{a.monthly_income ? ` · $${a.monthly_income}/mo budget` : ""}
          {a.created_at ? ` · ${new Date(a.created_at).toLocaleDateString()}` : ""}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${statusStyle(status)}`}>{status}</span>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>
    </button>
  );
}

function ApplicationDetail({
  app, rooms, onClose, onStatus, onApproved,
}: {
  app: App; rooms: Room[];
  onClose: () => void;
  onStatus: (s: Status) => void;
  onApproved: () => void;
}) {
  const [showApprove, setShowApprove] = useState(false);
  const status = normalize(app.status);

  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 grid place-items-end md:place-items-center" onClick={onClose}>
      <div className="w-full md:max-w-2xl md:rounded-2xl bg-card max-h-[92vh] overflow-y-auto rounded-t-2xl" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-card border-b border-border p-4 flex justify-between items-center">
          <h3 className="font-bold">{app.first_name} {app.surname}</h3>
          <button onClick={onClose} className="touch-min p-2"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <div className="text-xs uppercase font-semibold text-muted-foreground mb-1.5">Status</div>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map(s => (
                <button key={s} onClick={() => onStatus(s)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full capitalize border ${status === s ? statusStyle(s) + " border-transparent" : "border-border bg-background hover:border-primary/50"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <Detail label="Email" value={app.email} />
          <Detail label="Phone" value={app.telephone} />
          <Detail label="Stay" value={app.stay_type} />
          <Detail label="Income" value={app.monthly_income} />
          <Detail label="Address" value={app.present_address} />
          <Detail label="Notes" value={app.additional_information} />

          {status !== "approved" && !showApprove && (
            <button onClick={() => setShowApprove(true)}
              className="touch-min w-full rounded-lg bg-success text-white font-bold py-3 inline-flex items-center justify-center gap-2 hover:opacity-90">
              <CheckCircle2 className="w-5 h-5" /> Approve & move in
            </button>
          )}

          {status === "approved" && (
            <div className="rounded-lg bg-success/10 border border-success/30 text-success p-3 text-sm font-medium">
              This application has been approved.
            </div>
          )}

          {showApprove && (
            <ApproveForm
              app={app}
              rooms={rooms.filter(r => (r.current_status || "Available") === "Available")}
              onCancel={() => setShowApprove(false)}
              onDone={onApproved}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ApproveForm({
  app, rooms, onCancel, onDone,
}: { app: App; rooms: Room[]; onCancel: () => void; onDone: () => void }) {
  const [roomId, setRoomId] = useState("");
  const [moveIn, setMoveIn] = useState(() => new Date().toISOString().slice(0, 10));
  const [rent, setRent] = useState<string>("");
  const [deposit, setDeposit] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const pickedRoom = rooms.find(r => r.id === roomId);
  // Auto-fill rent when picking a room
  useEffect(() => {
    if (pickedRoom && !rent) {
      const v = pickedRoom.rate_monthly ?? pickedRoom.base_rate;
      if (v != null) setRent(String(v));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const submit = async () => {
    if (!roomId) { toast.error("Pick a room"); return; }
    if (!moveIn) { toast.error("Pick a move-in date"); return; }
    const rentNum = Number(rent);
    if (!rentNum || rentNum <= 0) { toast.error("Enter monthly rent"); return; }
    const depNum = deposit === "" ? 0 : Number(deposit);

    setBusy(true);
    // 1) Create tenant
    const { data: tenant, error: tErr } = await supabase.from("tenants").insert({
      application_id: app.id,
      room_id: roomId,
      first_name: app.first_name || null,
      surname: app.surname || null,
      email: app.email || null,
      telephone: app.telephone || null,
      move_in_date: moveIn,
      lease_start: moveIn,
      monthly_rent: rentNum,
      deposit_amount: depNum,
      status: "current",
      payment_status: "unpaid",
    }).select("id").single();

    if (tErr || !tenant) { setBusy(false); toast.error(tErr?.message || "Failed to create tenant"); return; }

    // 2) Mark room rented
    const { error: rErr } = await supabase.from("rooms").update({ current_status: "Rented" }).eq("id", roomId);
    if (rErr) { setBusy(false); toast.error(rErr.message); return; }

    // 3) Update application
    const { error: aErr } = await supabase.from("applications").update({ status: "approved", room_id: roomId }).eq("id", app.id);
    if (aErr) { setBusy(false); toast.error(aErr.message); return; }

    setBusy(false);
    toast.success("Moved in — tenant created");
    onDone();
  };

  return (
    <div className="border-t border-border pt-4 space-y-3">
      <h4 className="font-bold text-sm">Move-in details</h4>
      {rooms.length === 0 ? (
        <div className="text-sm text-muted-foreground rounded-lg border border-border p-3">
          No rooms are currently marked Available. Update a room's status to Available first.
        </div>
      ) : (
        <>
          <label className="block">
            <span className="text-sm font-medium mb-1 block">Room (available only)</span>
            <select value={roomId} onChange={e => setRoomId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background">
              <option value="">Select a room…</option>
              {rooms.map(r => {
                const label = r.name || (r.room_number ? `Room ${r.room_number}` : r.id.slice(0, 8));
                const rate = r.rate_monthly ?? r.base_rate;
                return <option key={r.id} value={r.id}>{label}{rate != null ? ` — $${rate}/mo` : ""}</option>;
              })}
            </select>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <label className="block">
              <span className="text-xs text-muted-foreground">Move-in date</span>
              <input type="date" value={moveIn} onChange={e => setMoveIn(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" />
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">Monthly rent ($)</span>
              <input type="number" inputMode="decimal" value={rent} onChange={e => setRent(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" />
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">Deposit ($)</span>
              <input type="number" inputMode="decimal" value={deposit} onChange={e => setDeposit(e.target.value)}
                placeholder="0"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" />
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={onCancel} disabled={busy} className="touch-min flex-1 rounded-lg border border-border bg-background py-3 font-semibold">
              Cancel
            </button>
            <button onClick={submit} disabled={busy}
              className="touch-min flex-1 rounded-lg bg-success text-white font-bold py-3 inline-flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50">
              <CheckCircle2 className="w-5 h-5" /> {busy ? "Working…" : "Confirm move-in"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <div className="text-xs uppercase font-semibold text-muted-foreground">{label}</div>
      <div className="text-sm whitespace-pre-wrap">{value ?? "—"}</div>
    </div>
  );
}
