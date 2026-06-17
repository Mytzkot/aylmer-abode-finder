import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ArrowLeft, Save, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/tenants/$id")({ component: TenantFilePage });

interface Tenant {
  id: string;
  first_name?: string; surname?: string;
  email?: string; telephone?: string;
  room_id?: string | null;
  status?: string; notes?: string | null;
  move_in_date?: string | null;
  lease_start?: string | null; lease_end?: string | null;
  monthly_rent?: number | null;
  deposit_amount?: number | null;
  deposit_returned?: boolean;
  payment_status?: string;
  [k: string]: any;
}
interface Room { id: string; room_number?: number | string }
interface Payment { id: string; amount: number; paid_on: string; method?: string | null; notes?: string | null }

const STATUSES = ["current", "past", "applicant"] as const;

function TenantFilePage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [t, setT] = useState<Tenant | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [{ data, error }, { data: r }, { data: p }] = await Promise.all([
      supabase.from("tenants").select("*").eq("id", id).maybeSingle(),
      supabase.from("rooms").select("id, room_number").order("room_number"),
      supabase.from("payment_ledger").select("*").eq("tenant_id", id).order("paid_on", { ascending: false }),
    ]);
    if (error) toast.error(error.message);
    setT((data as Tenant) || null);
    setRooms((r as Room[]) || []);
    setPayments((p as Payment[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [id]);

  const update = (patch: Partial<Tenant>) => setT(prev => prev ? { ...prev, ...patch } : prev);

  const save = async () => {
    if (!t) return;
    setSaving(true);
    const payload = {
      first_name: t.first_name || null,
      surname: t.surname || null,
      email: t.email || null,
      telephone: t.telephone || null,
      room_id: t.room_id || null,
      status: t.status || "current",
      notes: t.notes || null,
      move_in_date: t.move_in_date || null,
      monthly_rent: t.monthly_rent ?? null,
      deposit_amount: t.deposit_amount ?? 0,
      deposit_returned: !!t.deposit_returned,
    };
    const { error } = await supabase.from("tenants").update(payload).eq("id", t.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
  };

  const remove = async () => {
    if (!t) return;
    if (!confirm("Delete this tenant? This cannot be undone.")) return;
    const { error } = await supabase.from("tenants").delete().eq("id", t.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    navigate({ to: "/admin/tenants" });
  };

  if (loading) return <div className="p-6 text-muted-foreground">Loading…</div>;
  if (!t) return (
    <div className="p-6">
      <Link to="/admin/tenants" className="text-sm text-brand">← Back</Link>
      <div className="mt-4 text-muted-foreground">Tenant not found.</div>
    </div>
  );

  const rent = Number(t.monthly_rent || 0);
  const paid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const outstanding = Math.max(0, rent - paid);
  const deposit = Number(t.deposit_amount || 0);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Link to="/admin/tenants" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-ink">
          <ArrowLeft className="w-4 h-4" /> Tenants
        </Link>
        <div className="flex gap-2">
          <button onClick={remove} className="touch-min btn-pill border border-destructive/40 text-destructive flex items-center gap-1 px-3">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
          <button onClick={save} disabled={saving} className="touch-min btn-pill btn-brand flex items-center gap-1 px-4">
            <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <h1 className="text-2xl font-bold">{t.first_name} {t.surname}</h1>

      <section className="bg-card rounded-2xl border border-border p-4 space-y-3">
        <h2 className="font-bold text-sm uppercase tracking-wider text-ink/60">Contact</h2>
        <div className="grid grid-cols-2 gap-2">
          <Field label="First name" value={t.first_name || ""} onChange={v => update({ first_name: v })} />
          <Field label="Surname" value={t.surname || ""} onChange={v => update({ surname: v })} />
        </div>
        <Field label="Phone" type="tel" value={t.telephone || ""} onChange={v => update({ telephone: v })} />
        <Field label="Email" type="email" value={t.email || ""} onChange={v => update({ email: v })} />
      </section>

      <section className="bg-card rounded-2xl border border-border p-4 space-y-3">
        <h2 className="font-bold text-sm uppercase tracking-wider text-ink/60">Tenancy</h2>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-muted-foreground">Status
            <select value={t.status || "current"} onChange={e => update({ status: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-xl border border-input bg-background text-sm capitalize">
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="text-xs text-muted-foreground">Room
            <select value={t.room_id || ""} onChange={e => update({ room_id: e.target.value || null })}
              className="mt-1 w-full px-3 py-2 rounded-xl border border-input bg-background text-sm">
              <option value="">No room</option>
              {rooms.map(r => <option key={r.id} value={r.id}>Room {r.room_number}</option>)}
            </select>
          </label>
          <Field label="Move-in date" type="date" value={t.move_in_date || ""} onChange={v => update({ move_in_date: v })} />
          <Field label="Monthly rent" type="number" value={String(t.monthly_rent ?? "")} onChange={v => update({ monthly_rent: v === "" ? null : Number(v) })} />
        </div>
      </section>

      <section className="bg-card rounded-2xl border border-border p-4 space-y-3">
        <h2 className="font-bold text-sm uppercase tracking-wider text-ink/60">Balance</h2>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <Stat label="Rent" value={`$${rent.toFixed(2)}`} />
          <Stat label="Paid" value={`$${paid.toFixed(2)}`} tone="good" />
          <Stat label="Outstanding" value={`$${outstanding.toFixed(2)}`} tone={outstanding > 0 ? "bad" : "good"} />
        </div>
        {payments.length > 0 && (
          <div className="text-xs text-muted-foreground">
            {payments.length} payment{payments.length === 1 ? "" : "s"} on record.
          </div>
        )}
      </section>

      <section className="bg-card rounded-2xl border border-border p-4 space-y-3">
        <h2 className="font-bold text-sm uppercase tracking-wider text-ink/60">Deposit</h2>
        <div className="grid grid-cols-2 gap-2 items-end">
          <Field label="Deposit amount" type="number" value={String(t.deposit_amount ?? "")} onChange={v => update({ deposit_amount: v === "" ? null : Number(v) })} />
          <label className="flex items-center gap-2 text-sm py-2">
            <input type="checkbox" checked={!!t.deposit_returned} onChange={e => update({ deposit_returned: e.target.checked })} />
            Deposit returned
          </label>
        </div>
        <div className="text-xs text-muted-foreground">
          {t.deposit_returned ? `Returned` : `Held: $${deposit.toFixed(2)}`}
        </div>
      </section>

      <section className="bg-card rounded-2xl border border-border p-4 space-y-2">
        <h2 className="font-bold text-sm uppercase tracking-wider text-ink/60">Notes</h2>
        <textarea
          value={t.notes || ""}
          onChange={e => update({ notes: e.target.value })}
          rows={5}
          placeholder="Internal notes about this tenant…"
          className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm"
        />
      </section>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="text-xs text-muted-foreground block">
      {label}
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        className="mt-1 w-full px-3 py-2 rounded-xl border border-input bg-background text-sm" />
    </label>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "good" | "bad" }) {
  const color = tone === "good" ? "text-success" : tone === "bad" ? "text-destructive" : "text-ink";
  return (
    <div className="rounded-xl border border-border p-3 bg-cream/40">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{label}</div>
      <div className={`text-lg font-bold ${color}`}>{value}</div>
    </div>
  );
}
