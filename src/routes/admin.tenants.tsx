import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";

export const Route = createFileRoute("/admin/tenants")({ component: TenantsLayout });

function TenantsLayout() {
  const path = useRouterState({ select: s => s.location.pathname });
  if (path !== "/admin/tenants") return <Outlet />;
  return <TenantsListPage />;
}

interface Room { id: string; room_number?: number | string; property_id?: string; }
interface Tenant {
  id: string;
  first_name?: string;
  surname?: string;
  email?: string;
  telephone?: string;
  status?: string;
  room_id?: string | null;
  [k: string]: any;
}

const STATUSES = ["current", "past", "applicant"] as const;
const statusStyle = (s?: string) => {
  const v = (s || "current").toLowerCase();
  if (v === "current") return "bg-success/15 text-success";
  if (v === "past") return "bg-muted text-muted-foreground";
  return "bg-brand/15 text-brand";
};

function TenantsListPage() {
  const [rows, setRows] = useState<Tenant[]>([]);
  const [rooms, setRooms] = useState<Record<string, Room>>({});
  const [paidThisMonth, setPaidThisMonth] = useState<Record<string, number>>({});
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => {
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
    const [{ data: t, error: te }, { data: r }, { data: pays }] = await Promise.all([
      supabase.from("tenants").select("*").order("created_at", { ascending: false }),
      supabase.from("rooms").select("id, room_number, property_id"),
      supabase.from("payment_ledger").select("tenant_id, amount, paid_on").gte("paid_on", monthStart.toISOString().slice(0, 10)),
    ]);
    if (te) toast.error(te.message);
    setRows((t as Tenant[]) || []);
    const map: Record<string, Room> = {};
    (r as Room[] | null)?.forEach(rm => { map[rm.id] = rm; });
    setRooms(map);
    const sums: Record<string, number> = {};
    (pays as { tenant_id: string; amount: number }[] | null)?.forEach(p => {
      sums[p.tenant_id] = (sums[p.tenant_id] || 0) + Number(p.amount || 0);
    });
    setPaidThisMonth(sums);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter(t => {
      if (filter !== "all" && (t.status || "current").toLowerCase() !== filter) return false;
      if (!needle) return true;
      const hay = `${t.first_name || ""} ${t.surname || ""} ${t.email || ""} ${t.telephone || ""}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [rows, q, filter]);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold">Tenants</h1>
        <button onClick={() => setShowAdd(true)} className="touch-min btn-pill btn-brand flex items-center gap-1.5 px-4">
          <Plus className="w-4 h-4" /> Add tenant
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search name, phone, email…"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-input bg-background text-sm"
          />
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-input bg-background text-sm"
        >
          <option value="all">All statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary">
            <tr>
              <th className="text-start p-3">Name</th>
              <th className="text-start p-3 hidden sm:table-cell">Phone</th>
              <th className="text-start p-3 hidden md:table-cell">Room</th>
              <th className="text-start p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => {
              const rm = t.room_id ? rooms[t.room_id] : null;
              return (
                <tr key={t.id} className="border-t border-border hover:bg-cream/40 cursor-pointer">
                  <td className="p-0">
                    <Link to="/admin/tenants/$id" params={{ id: t.id }} className="block p-3 font-medium text-ink">
                      {(t.first_name || "—")} {t.surname || ""}
                      <div className="sm:hidden text-xs text-muted-foreground font-normal">{t.telephone || t.email || ""}</div>
                    </Link>
                  </td>
                  <td className="p-3 text-muted-foreground hidden sm:table-cell">{t.telephone || "—"}</td>
                  <td className="p-3 text-muted-foreground hidden md:table-cell">{rm ? `Room ${rm.room_number}` : "—"}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${statusStyle(t.status)}`}>
                      {(t.status || "current")}
                    </span>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No tenants found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showAdd && <AddTenantModal onClose={() => setShowAdd(false)} onCreated={() => { setShowAdd(false); load(); }} rooms={Object.values(rooms)} />}
    </div>
  );
}

function AddTenantModal({ onClose, onCreated, rooms }: { onClose: () => void; onCreated: () => void; rooms: Room[] }) {
  const [form, setForm] = useState({
    first_name: "", surname: "", email: "", telephone: "",
    status: "current", room_id: "", move_in_date: "", monthly_rent: "",
  });
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload: any = {
      first_name: form.first_name || null,
      surname: form.surname || null,
      email: form.email || null,
      telephone: form.telephone || null,
      status: form.status,
      room_id: form.room_id || null,
      move_in_date: form.move_in_date || null,
      monthly_rent: form.monthly_rent ? Number(form.monthly_rent) : null,
    };
    const { error } = await supabase.from("tenants").insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Tenant added");
    onCreated();
  };

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <form onClick={e => e.stopPropagation()} onSubmit={submit}
        className="bg-card rounded-2xl border border-border p-5 w-full max-w-md max-h-[90vh] overflow-y-auto space-y-3">
        <h2 className="text-lg font-bold">Add tenant</h2>
        <div className="grid grid-cols-2 gap-2">
          <input required placeholder="First name" value={form.first_name} onChange={e => set("first_name", e.target.value)} className="px-3 py-2 rounded-xl border border-input bg-background text-sm" />
          <input placeholder="Surname" value={form.surname} onChange={e => set("surname", e.target.value)} className="px-3 py-2 rounded-xl border border-input bg-background text-sm" />
        </div>
        <input type="tel" placeholder="Phone" value={form.telephone} onChange={e => set("telephone", e.target.value)} className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm" />
        <input type="email" placeholder="Email" value={form.email} onChange={e => set("email", e.target.value)} className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm" />
        <div className="grid grid-cols-2 gap-2">
          <select value={form.status} onChange={e => set("status", e.target.value)} className="px-3 py-2 rounded-xl border border-input bg-background text-sm capitalize">
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={form.room_id} onChange={e => set("room_id", e.target.value)} className="px-3 py-2 rounded-xl border border-input bg-background text-sm">
            <option value="">No room</option>
            {rooms.map(r => <option key={r.id} value={r.id}>Room {r.room_number}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-muted-foreground">Move-in date
            <input type="date" value={form.move_in_date} onChange={e => set("move_in_date", e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl border border-input bg-background text-sm" />
          </label>
          <label className="text-xs text-muted-foreground">Monthly rent
            <input type="number" step="0.01" value={form.monthly_rent} onChange={e => set("monthly_rent", e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl border border-input bg-background text-sm" />
          </label>
        </div>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="touch-min flex-1 btn-pill border border-border">Cancel</button>
          <button disabled={saving} className="touch-min flex-1 btn-pill btn-brand">{saving ? "Saving…" : "Add tenant"}</button>
        </div>
      </form>
    </div>
  );
}
