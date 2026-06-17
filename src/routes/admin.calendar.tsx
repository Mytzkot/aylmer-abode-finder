import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/calendar")({ component: CalendarPage });

interface Property { id: string; short_name?: string | null; address?: string }
interface Room { id: string; property_id?: string | null; room_number?: string | null; bed_type?: string | null }
interface Tenant {
  id: string; room_id?: string | null;
  first_name?: string | null; surname?: string | null; telephone?: string | null;
  move_in_date?: string | null; lease_start?: string | null; lease_end?: string | null;
  status?: string | null; monthly_rent?: number | null;
}

const MONTHS_VISIBLE = 12;

function startOfMonth(d: Date) { return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)); }
function addMonths(d: Date, n: number) { return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1)); }
function fmtMonth(d: Date) { return d.toLocaleDateString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" }); }
function toISO(d: Date) { return d.toISOString().slice(0, 10); }
function parseISO(s?: string | null) { return s ? new Date(s + "T00:00:00Z") : null; }

const BAR_COLORS = [
  "bg-brand text-white",
  "bg-success text-white",
  "bg-amber-500 text-white",
  "bg-sky-500 text-white",
  "bg-fuchsia-500 text-white",
  "bg-emerald-600 text-white",
];
function colorFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return BAR_COLORS[h % BAR_COLORS.length];
}

function CalendarPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyId, setPropertyId] = useState<string>("all");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [windowStart, setWindowStart] = useState<Date>(() => {
    const d = new Date();
    return startOfMonth(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - 1, 1)));
  });
  const [editing, setEditing] = useState<{ tenant?: Tenant; roomId?: string; initialDate?: string } | null>(null);

  const months = useMemo(() => Array.from({ length: MONTHS_VISIBLE }, (_, i) => addMonths(windowStart, i)), [windowStart]);
  const windowEnd = addMonths(windowStart, MONTHS_VISIBLE);

  const load = async () => {
    setLoading(true);
    const [{ data: ps }, { data: rs }, { data: ts }] = await Promise.all([
      supabase.from("properties").select("id, short_name, address").order("short_name"),
      supabase.from("rooms").select("id, property_id, room_number, bed_type").order("room_number"),
      supabase.from("tenants").select("id, room_id, first_name, surname, telephone, move_in_date, lease_start, lease_end, status, monthly_rent"),
    ]);
    setProperties((ps as Property[]) || []);
    setRooms((rs as Room[]) || []);
    setTenants((ts as Tenant[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const visibleRooms = useMemo(() => {
    return rooms.filter(r => propertyId === "all" || r.property_id === propertyId);
  }, [rooms, propertyId]);

  const tenantsByRoom = useMemo(() => {
    const map: Record<string, Tenant[]> = {};
    for (const t of tenants) {
      if (!t.room_id) continue;
      (map[t.room_id] ||= []).push(t);
    }
    return map;
  }, [tenants]);

  const totalMs = windowEnd.getTime() - windowStart.getTime();
  const pct = (d: Date) => {
    const clamped = Math.max(windowStart.getTime(), Math.min(windowEnd.getTime(), d.getTime()));
    return ((clamped - windowStart.getTime()) / totalMs) * 100;
  };

  const handleEmptyClick = (roomId: string, monthDate: Date) => {
    setEditing({ roomId, initialDate: toISO(monthDate) });
  };

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold">Occupancy Calendar</h1>
          <p className="text-sm text-muted-foreground">Click a bar to edit, click an empty cell to add a tenancy.</p>
        </div>
        <div className="sm:ml-auto flex flex-wrap items-end gap-2">
          <label className="text-xs text-muted-foreground">Property
            <select value={propertyId} onChange={e => setPropertyId(e.target.value)}
              className="block mt-1 px-3 py-2 rounded-xl border border-input bg-background text-sm min-w-[160px]">
              <option value="all">All properties</option>
              {properties.map(p => <option key={p.id} value={p.id}>{p.short_name || p.address}</option>)}
            </select>
          </label>
          <div className="flex items-center gap-1">
            <button onClick={() => setWindowStart(addMonths(windowStart, -3))} className="p-2 rounded-lg border border-border hover:bg-cream" aria-label="Earlier">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 py-2 text-sm font-semibold min-w-[200px] text-center">
              {fmtMonth(windowStart)} – {fmtMonth(addMonths(windowStart, MONTHS_VISIBLE - 1))}
            </div>
            <button onClick={() => setWindowStart(addMonths(windowStart, 3))} className="p-2 rounded-lg border border-border hover:bg-cream" aria-label="Later">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={() => setWindowStart(startOfMonth(addMonths(new Date(), -1)))}
              className="ml-1 px-3 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-cream">Today</button>
          </div>
        </div>
      </div>

      {loading ? <div className="text-muted-foreground py-6">Loading…</div> : (
        <div className="bg-card rounded-2xl border border-border overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Header */}
            <div className="flex border-b border-border bg-secondary sticky top-0 z-10">
              <div className="w-44 shrink-0 p-2 text-xs font-bold uppercase tracking-wider text-ink/60">Room</div>
              <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${MONTHS_VISIBLE}, minmax(0, 1fr))` }}>
                {months.map((m, i) => (
                  <div key={i} className="p-2 text-xs font-semibold text-ink/70 border-l border-border text-center">
                    {fmtMonth(m)}
                  </div>
                ))}
              </div>
            </div>

            {/* Rows */}
            {visibleRooms.map(room => {
              const occupants = (tenantsByRoom[room.id] || []).filter(t => {
                const s = parseISO(t.move_in_date || t.lease_start) || windowStart;
                const e = parseISO(t.lease_end) || addMonths(windowEnd, 12);
                return e > windowStart && s < windowEnd;
              });
              const prop = properties.find(p => p.id === room.property_id);
              return (
                <div key={room.id} className="flex border-b border-border last:border-b-0 hover:bg-cream/30">
                  <div className="w-44 shrink-0 p-2 border-r border-border">
                    <div className="text-sm font-semibold">Room {room.room_number || "—"}</div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {prop?.short_name || prop?.address || ""}{room.bed_type ? ` · ${room.bed_type}` : ""}
                    </div>
                  </div>
                  <div className="flex-1 relative h-16">
                    {/* Grid cells (click targets) */}
                    <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${MONTHS_VISIBLE}, minmax(0, 1fr))` }}>
                      {months.map((m, i) => (
                        <button key={i}
                          onClick={() => handleEmptyClick(room.id, m)}
                          className="border-l border-border/60 hover:bg-brand/5"
                          aria-label={`Add tenancy ${fmtMonth(m)}`} />
                      ))}
                    </div>
                    {/* Bars */}
                    {occupants.map(t => {
                      const s = parseISO(t.move_in_date || t.lease_start) || windowStart;
                      const e = parseISO(t.lease_end) || windowEnd;
                      const left = pct(s);
                      const right = pct(e);
                      const width = Math.max(2, right - left);
                      return (
                        <button key={t.id}
                          onClick={(ev) => { ev.stopPropagation(); setEditing({ tenant: t }); }}
                          className={`absolute top-2 bottom-2 rounded-md px-2 text-xs font-semibold flex items-center overflow-hidden whitespace-nowrap shadow-sm hover:opacity-90 ${colorFor(t.id)}`}
                          style={{ left: `${left}%`, width: `${width}%` }}
                          title={`${t.first_name || ""} ${t.surname || ""}\n${t.move_in_date || t.lease_start || "?"} → ${t.lease_end || "ongoing"}`}>
                          {t.first_name || "Tenant"} {t.surname || ""}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {visibleRooms.length === 0 && (
              <div className="p-8 text-center text-muted-foreground text-sm">No rooms in this property.</div>
            )}
          </div>
        </div>
      )}

      {editing && (
        <TenancyModal
          initial={editing.tenant}
          defaultRoomId={editing.roomId}
          defaultStart={editing.initialDate}
          rooms={rooms}
          properties={properties}
          allTenants={tenants}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </div>
  );
}

function TenancyModal({
  initial, defaultRoomId, defaultStart, rooms, properties, allTenants, onClose, onSaved,
}: {
  initial?: Tenant;
  defaultRoomId?: string;
  defaultStart?: string;
  rooms: Room[];
  properties: Property[];
  allTenants: Tenant[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = !initial;
  const [mode, setMode] = useState<"existing" | "new">(isNew ? "new" : "existing");
  const [tenantId, setTenantId] = useState<string>(initial?.id || "");
  const [firstName, setFirstName] = useState(initial?.first_name || "");
  const [surname, setSurname] = useState(initial?.surname || "");
  const [telephone, setTelephone] = useState(initial?.telephone || "");
  const [roomId, setRoomId] = useState<string>(initial?.room_id || defaultRoomId || "");
  const [moveIn, setMoveIn] = useState<string>(initial?.move_in_date || initial?.lease_start || defaultStart || "");
  const [leaveOn, setLeaveOn] = useState<string>(initial?.lease_end || "");
  const [monthlyRent, setMonthlyRent] = useState<string>(initial?.monthly_rent != null ? String(initial.monthly_rent) : "");
  const [saving, setSaving] = useState(false);

  const propLabel = (rId: string) => {
    const r = rooms.find(x => x.id === rId);
    const p = properties.find(x => x.id === r?.property_id);
    return `${p?.short_name || p?.address || ""} · Room ${r?.room_number || ""}`.trim();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId) { toast.error("Pick a room"); return; }
    if (!moveIn) { toast.error("Pick a move-in date"); return; }
    setSaving(true);

    const payload: any = {
      room_id: roomId,
      move_in_date: moveIn || null,
      lease_start: moveIn || null,
      lease_end: leaveOn || null,
      monthly_rent: monthlyRent === "" ? null : Number(monthlyRent),
      status: "current",
    };

    let error;
    if (initial) {
      ({ error } = await supabase.from("tenants").update(payload).eq("id", initial.id));
    } else if (mode === "existing" && tenantId) {
      ({ error } = await supabase.from("tenants").update(payload).eq("id", tenantId));
    } else {
      ({ error } = await supabase.from("tenants").insert({
        ...payload,
        first_name: firstName || null,
        surname: surname || null,
        telephone: telephone || null,
      }));
    }
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(initial ? "Tenancy updated" : "Tenancy added");
    onSaved();
  };

  const remove = async () => {
    if (!initial) return;
    if (!confirm("Delete this tenancy? This removes the tenant record.")) return;
    const { error } = await supabase.from("tenants").delete().eq("id", initial.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4" onClick={onClose}>
      <form onClick={e => e.stopPropagation()} onSubmit={submit}
        className="bg-card rounded-2xl border border-border p-5 w-full max-w-md max-h-[92vh] overflow-y-auto space-y-3">
        <h2 className="text-lg font-bold">{initial ? "Edit tenancy" : "Add tenancy"}</h2>

        {!initial && (
          <div className="flex gap-1 p-1 bg-secondary rounded-xl text-sm">
            <button type="button" onClick={() => setMode("existing")}
              className={`flex-1 py-1.5 rounded-lg font-semibold ${mode === "existing" ? "bg-card shadow" : "text-muted-foreground"}`}>
              Existing tenant
            </button>
            <button type="button" onClick={() => setMode("new")}
              className={`flex-1 py-1.5 rounded-lg font-semibold ${mode === "new" ? "bg-card shadow" : "text-muted-foreground"}`}>
              New tenant
            </button>
          </div>
        )}

        {!initial && mode === "existing" && (
          <label className="block text-xs text-muted-foreground">Tenant
            <select value={tenantId} onChange={e => setTenantId(e.target.value)} required
              className="mt-1 w-full px-3 py-2 rounded-xl border border-input bg-background text-sm">
              <option value="">Select tenant…</option>
              {allTenants.map(t => (
                <option key={t.id} value={t.id}>{t.first_name} {t.surname}</option>
              ))}
            </select>
          </label>
        )}

        {(initial || mode === "new") && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs text-muted-foreground">First name
                <input value={firstName} onChange={e => setFirstName(e.target.value)} required={!initial}
                  disabled={!!initial}
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-input bg-background text-sm disabled:opacity-60" />
              </label>
              <label className="text-xs text-muted-foreground">Surname
                <input value={surname} onChange={e => setSurname(e.target.value)} disabled={!!initial}
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-input bg-background text-sm disabled:opacity-60" />
              </label>
            </div>
            <label className="block text-xs text-muted-foreground">Phone
              <input type="tel" value={telephone} onChange={e => setTelephone(e.target.value)} disabled={!!initial}
                className="mt-1 w-full px-3 py-2 rounded-xl border border-input bg-background text-sm disabled:opacity-60" />
            </label>
            {initial && <p className="text-[11px] text-muted-foreground -mt-1">Edit name/phone from the tenant file.</p>}
          </>
        )}

        <label className="block text-xs text-muted-foreground">Room
          <select value={roomId} onChange={e => setRoomId(e.target.value)} required
            className="mt-1 w-full px-3 py-2 rounded-xl border border-input bg-background text-sm">
            <option value="">Select room…</option>
            {rooms.map(r => <option key={r.id} value={r.id}>{propLabel(r.id)}</option>)}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-muted-foreground">Move-in
            <input type="date" value={moveIn} onChange={e => setMoveIn(e.target.value)} required
              className="mt-1 w-full px-3 py-2 rounded-xl border border-input bg-background text-sm" />
          </label>
          <label className="text-xs text-muted-foreground">Move-out (optional)
            <input type="date" value={leaveOn} onChange={e => setLeaveOn(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-xl border border-input bg-background text-sm" />
          </label>
        </div>

        <label className="block text-xs text-muted-foreground">Monthly rent
          <input type="number" step="0.01" value={monthlyRent} onChange={e => setMonthlyRent(e.target.value)}
            className="mt-1 w-full px-3 py-2 rounded-xl border border-input bg-background text-sm" />
        </label>

        <div className="flex gap-2 pt-2">
          {initial && (
            <button type="button" onClick={remove}
              className="touch-min btn-pill border border-destructive/40 text-destructive flex items-center gap-1 px-3">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          )}
          <button type="button" onClick={onClose} className="touch-min flex-1 btn-pill border border-border">Cancel</button>
          <button disabled={saving} className="touch-min flex-1 btn-pill btn-brand">{saving ? "Saving…" : "Save"}</button>
        </div>
      </form>
    </div>
  );
}
