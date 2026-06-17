import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { X } from "lucide-react";

export const Route = createFileRoute("/admin/board")({ component: BoardPage });

type Status = "Available" | "Rented" | "Maintenance";
const STATUSES: Status[] = ["Available", "Rented", "Maintenance"];

interface Property {
  id: string;
  short_name: string | null;
  address: string;
}
interface Room {
  id: string;
  name: string | null;
  room_number: string | null;
  current_status: string;
  bed_type: string | null;
  property_id: string | null;
}
interface Tenant {
  id: string;
  room_id: string | null;
  first_name: string | null;
  surname: string | null;
  telephone: string | null;
  email: string | null;
}

const statusTone = (s: string) => {
  const k = s.toLowerCase();
  if (k === "available") return "bg-emerald-500 text-white";
  if (k === "rented") return "bg-blue-600 text-white";
  return "bg-slate-400 text-white";
};
const statusLabel = (s: string) => {
  const k = s.toLowerCase();
  if (k === "rented") return "Occupied";
  if (k === "maintenance") return "Closed";
  return "Available";
};

function roomSortKey(r: Room) {
  const n = parseInt(r.room_number || "", 10);
  if (!Number.isNaN(n)) return n;
  const m = (r.name || "").match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 9999;
}

function BoardPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [editing, setEditing] = useState<Room | null>(null);

  const load = async () => {
    const [{ data: p }, { data: r }, { data: t }] = await Promise.all([
      supabase.from("properties").select("id, short_name, address").order("short_name"),
      supabase.from("rooms").select("id, name, room_number, current_status, bed_type, property_id"),
      supabase.from("tenants").select("id, room_id, first_name, surname, telephone, email"),
    ]);
    setProperties((p as Property[]) || []);
    setRooms((r as Room[]) || []);
    setTenants((t as Tenant[]) || []);
  };
  useEffect(() => { load(); }, []);

  const tenantByRoom = useMemo(() => {
    const m = new Map<string, Tenant>();
    for (const t of tenants) if (t.room_id) m.set(t.room_id, t);
    return m;
  }, [tenants]);

  const grouped = useMemo(() => {
    return properties
      .map((p) => ({
        property: p,
        rooms: rooms
          .filter((r) => r.property_id === p.id)
          .sort((a, b) => roomSortKey(a) - roomSortKey(b)),
      }))
      .filter((g) => g.rooms.length > 0);
  }, [properties, rooms]);

  const tally = (list: Room[]) => {
    let occ = 0, ava = 0, clo = 0;
    for (const r of list) {
      const k = (r.current_status || "Available").toLowerCase();
      if (k === "rented") occ++;
      else if (k === "available") ava++;
      else clo++;
    }
    return { occ, ava, clo };
  };
  const overall = tally(rooms.filter((r) => r.property_id));

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Rooms Status Board</h1>
        <SummaryLine label="Overall" {...overall} />
      </div>

      <div className="space-y-8">
        {grouped.map(({ property, rooms: rs }) => {
          const t = tally(rs);
          return (
            <section key={property.id}>
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div>
                  <h2 className="text-lg font-bold">{property.short_name || "Property"}</h2>
                  <p className="text-xs text-muted-foreground">{property.address}</p>
                </div>
                <SummaryLine label={property.short_name || "House"} {...t} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {rs.map((r) => (
                  <RoomCard
                    key={r.id}
                    room={r}
                    propertyName={property.short_name || ""}
                    tenant={tenantByRoom.get(r.id)}
                    onClick={() => setEditing(r)}
                  />
                ))}
              </div>
            </section>
          );
        })}
        {grouped.length === 0 && (
          <p className="text-sm text-muted-foreground">No rooms found.</p>
        )}
      </div>

      {editing && (
        <EditModal
          room={editing}
          tenant={tenantByRoom.get(editing.id)}
          onClose={() => setEditing(null)}
          onSaved={async () => { await load(); setEditing(null); }}
        />
      )}
    </div>
  );
}

function SummaryLine({ label, occ, ava, clo }: { label: string; occ: number; ava: number; clo: number }) {
  return (
    <div className="text-sm font-medium">
      <span className="text-muted-foreground mr-2">{label}:</span>
      <span className="text-blue-600 font-semibold">{occ} occupied</span>
      <span className="mx-1.5 text-muted-foreground">·</span>
      <span className="text-emerald-600 font-semibold">{ava} available</span>
      <span className="mx-1.5 text-muted-foreground">·</span>
      <span className="text-slate-500 font-semibold">{clo} closed</span>
    </div>
  );
}

function RoomCard({
  room, propertyName, tenant, onClick,
}: { room: Room; propertyName: string; tenant?: Tenant; onClick: () => void }) {
  const s = room.current_status || "Available";
  const num = room.room_number || (room.name?.match(/(\d+)/)?.[1] ?? "—");
  const occupied = s.toLowerCase() === "rented";
  return (
    <button
      onClick={onClick}
      className="text-left bg-card rounded-2xl border border-border p-4 hover:shadow-md hover:border-foreground/20 transition"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {propertyName}
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${statusTone(s)}`}>
          {statusLabel(s)}
        </span>
      </div>
      <div className="text-2xl font-extrabold leading-none">Room {num}</div>
      <div className="text-xs text-muted-foreground mt-1">
        {room.bed_type || "Bed type —"}
      </div>
      {occupied && tenant ? (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="text-sm font-semibold truncate">
            {[tenant.first_name, tenant.surname].filter(Boolean).join(" ") || "(unnamed)"}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {tenant.telephone || "no phone"}
          </div>
        </div>
      ) : occupied ? (
        <div className="mt-3 pt-3 border-t border-border text-xs italic text-muted-foreground">
          No resident assigned — click to add
        </div>
      ) : null}
    </button>
  );
}

function EditModal({
  room, tenant, onClose, onSaved,
}: { room: Room; tenant?: Tenant; onClose: () => void; onSaved: () => void | Promise<void> }) {
  const [status, setStatus] = useState<Status>((room.current_status as Status) || "Available");
  const [bedType, setBedType] = useState(room.bed_type || "");
  const [firstName, setFirstName] = useState(tenant?.first_name || "");
  const [surname, setSurname] = useState(tenant?.surname || "");
  const [phone, setPhone] = useState(tenant?.telephone || "");
  const [email, setEmail] = useState(tenant?.email || "");
  const [saving, setSaving] = useState(false);

  const occupied = status.toLowerCase() === "rented";

  const save = async () => {
    setSaving(true);
    try {
      const { error: rErr } = await supabase
        .from("rooms")
        .update({ current_status: status, bed_type: bedType || null })
        .eq("id", room.id);
      if (rErr) throw rErr;

      if (occupied) {
        if (tenant) {
          const { error } = await supabase.from("tenants").update({
            first_name: firstName || null, surname: surname || null,
            telephone: phone || null, email: email || null, room_id: room.id,
          }).eq("id", tenant.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("tenants").insert({
            room_id: room.id,
            first_name: firstName || null, surname: surname || null,
            telephone: phone || null, email: email || null,
            payment_status: "unpaid",
          });
          if (error) throw error;
        }
      } else if (tenant) {
        // Status no longer occupied — clear the resident link.
        const { error } = await supabase.from("tenants").update({ room_id: null }).eq("id", tenant.id);
        if (error) throw error;
      }
      toast.success("Room updated.");
      await onSaved();
    } catch (e) {
      console.error(e);
      toast.error("Could not save changes.");
    } finally {
      setSaving(false);
    }
  };

  const clearResident = async () => {
    if (!tenant) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("tenants").update({ room_id: null }).eq("id", tenant.id);
      if (error) throw error;
      await supabase.from("rooms").update({ current_status: "Available" }).eq("id", room.id);
      toast.success("Resident cleared.");
      await onSaved();
    } catch (e) {
      console.error(e);
      toast.error("Could not clear resident.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4" onClick={onClose}>
      <div className="bg-card w-full max-w-md rounded-2xl border border-border p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">{room.name || "Room"}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
        </div>

        <label className="block text-sm">
          <span className="font-semibold">Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value as Status)}
            className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background">
            {STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)} ({s})</option>)}
          </select>
        </label>

        <label className="block text-sm">
          <span className="font-semibold">Bed type</span>
          <input value={bedType} onChange={(e) => setBedType(e.target.value)} placeholder="e.g. Queen, Double, Single"
            className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background" />
        </label>

        {occupied && (
          <div className="space-y-2 border-t border-border pt-3">
            <div className="text-sm font-semibold">Resident</div>
            <div className="grid grid-cols-2 gap-2">
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name"
                className="px-3 py-2 rounded-lg border border-input bg-background text-sm" />
              <input value={surname} onChange={(e) => setSurname(e.target.value)} placeholder="Surname"
                className="px-3 py-2 rounded-lg border border-input bg-background text-sm" />
            </div>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" />
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" />
            {tenant && (
              <button onClick={clearResident} disabled={saving}
                className="text-xs text-destructive font-semibold hover:underline">
                Clear resident from this room
              </button>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-input text-sm font-semibold">
            Cancel
          </button>
          <button onClick={save} disabled={saving}
            className="flex-1 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-semibold disabled:opacity-50">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
