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

      <PaymentsSection
        tenantId={t.id}
        rent={rent}
        payments={payments}
        tenant={t}
        roomLabel={t.room_id ? rooms.find(r => r.id === t.room_id)?.room_number ? `Room ${rooms.find(r => r.id === t.room_id)?.room_number}` : null : null}
        onChanged={load}
      />
      <BalanceBlock rent={rent} paid={paid} outstanding={outstanding} payments={payments} />

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

const METHODS = ["Interac e-Transfer", "Cash", "Card", "Other"] as const;

function BalanceBlock({ rent, paid, outstanding, payments }: { rent: number; paid: number; outstanding: number; payments: Payment[] }) {
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const paidThisMonth = payments
    .filter(p => new Date(p.paid_on) >= monthStart)
    .reduce((s, p) => s + Number(p.amount || 0), 0);
  const owedThisMonth = Math.max(0, rent - paidThisMonth);
  return (
    <section className="bg-card rounded-2xl border border-border p-4 space-y-3">
      <h2 className="font-bold text-sm uppercase tracking-wider text-ink/60">This month</h2>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <Stat label="Rent" value={`$${rent.toFixed(2)}`} />
        <Stat label="Paid this month" value={`$${paidThisMonth.toFixed(2)}`} tone="good" />
        <Stat label="Owes this month" value={`$${owedThisMonth.toFixed(2)}`} tone={owedThisMonth > 0 ? "bad" : "good"} />
      </div>
      <div className="text-xs text-muted-foreground">
        Lifetime — paid ${paid.toFixed(2)}, outstanding ${outstanding.toFixed(2)} across {payments.length} payment{payments.length === 1 ? "" : "s"}.
      </div>
    </section>
  );
}

function PaymentsSection({ tenantId, rent, payments, onChanged }: {
  tenantId: string; rent: number; payments: Payment[]; onChanged: () => void;
}) {
  const [amount, setAmount] = useState<string>("");
  const [method, setMethod] = useState<string>("Interac e-Transfer");
  const [paidOn, setPaidOn] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const quickPay = async () => {
    const amt = Number(amount || rent);
    if (!amt || amt <= 0) { toast.error("Enter an amount"); return; }
    setBusy(true);
    const { error } = await supabase.from("payment_ledger").insert({
      tenant_id: tenantId,
      amount: amt,
      method,
      paid_on: paidOn,
      notes: notes || null,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Recorded $${amt.toFixed(2)}`);
    setAmount(""); setNotes("");
    onChanged();
  };

  const removePayment = async (id: string) => {
    if (!confirm("Delete this payment?")) return;
    const { error } = await supabase.from("payment_ledger").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    onChanged();
  };

  return (
    <section className="bg-card rounded-2xl border border-border p-4 space-y-3">
      <h2 className="font-bold text-sm uppercase tracking-wider text-ink/60">Record a payment</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <label className="text-xs text-muted-foreground block">
          Amount
          <input type="number" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)}
            placeholder={rent ? `$${rent}` : "0.00"}
            className="mt-1 w-full px-3 py-2 rounded-xl border border-input bg-background text-sm" />
        </label>
        <label className="text-xs text-muted-foreground block">
          Method
          <select value={method} onChange={e => setMethod(e.target.value)}
            className="mt-1 w-full px-3 py-2 rounded-xl border border-input bg-background text-sm">
            {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
        <label className="text-xs text-muted-foreground block">
          Date
          <input type="date" value={paidOn} onChange={e => setPaidOn(e.target.value)}
            className="mt-1 w-full px-3 py-2 rounded-xl border border-input bg-background text-sm" />
        </label>
        <label className="text-xs text-muted-foreground block">
          Note (optional)
          <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="e.g. June rent"
            className="mt-1 w-full px-3 py-2 rounded-xl border border-input bg-background text-sm" />
        </label>
      </div>
      <button onClick={quickPay} disabled={busy}
        className="touch-min w-full sm:w-auto btn-pill btn-brand px-4 disabled:opacity-50">
        {busy ? "Recording…" : `Record payment${amount ? "" : rent ? ` of $${rent}` : ""}`}
      </button>

      {payments.length > 0 && (
        <div className="pt-2 border-t border-border">
          <div className="text-xs uppercase font-semibold text-muted-foreground mb-2">Payment history</div>
          <ul className="divide-y divide-border">
            {payments.map(p => (
              <li key={p.id} className="py-2 flex items-center justify-between gap-2 text-sm">
                <div className="min-w-0">
                  <div className="font-semibold">${Number(p.amount).toFixed(2)} <span className="text-muted-foreground font-normal">· {p.method || "—"}</span></div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(p.paid_on).toLocaleDateString()}{p.notes ? ` · ${p.notes}` : ""}
                  </div>
                </div>
                <button onClick={() => removePayment(p.id)} className="text-xs text-destructive hover:underline shrink-0">Delete</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
