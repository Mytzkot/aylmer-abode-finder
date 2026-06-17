import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Download, Plus } from "lucide-react";

export const Route = createFileRoute("/admin/ledger")({ component: LedgerPage });

interface Property { id: string; short_name?: string | null; address?: string }
interface Room { id: string; property_id?: string | null; room_number?: string | null; bed_type?: string | null; base_rate?: number | null; rate_monthly?: number | null }
interface Tenant { id: string; room_id?: string | null; first_name?: string | null; surname?: string | null; telephone?: string | null; monthly_rent?: number | null; move_in_date?: string | null; lease_start?: string | null; lease_end?: string | null; status?: string | null }
interface Payment { id: string; tenant_id: string; amount: number; method?: string | null; paid_on: string }
interface Expenses {
  id?: string; property_id?: string; year_month?: string;
  electricity: number; insurance: number; gas: number; internet: number;
  cleaning: number; labor_fees: number; maintenance: number; rent_mortgage: number;
}

const EXPENSE_FIELDS: { key: keyof Expenses; label: string }[] = [
  { key: "electricity", label: "Electricity" },
  { key: "insurance", label: "Insurance" },
  { key: "gas", label: "Gas" },
  { key: "internet", label: "Internet" },
  { key: "cleaning", label: "Cleaning" },
  { key: "labor_fees", label: "Labor Fees" },
  { key: "maintenance", label: "Maintenance" },
  { key: "rent_mortgage", label: "Rent/Mortgage" },
];

const emptyExpenses = (): Expenses => ({
  electricity: 0, insurance: 0, gas: 0, internet: 0,
  cleaning: 0, labor_fees: 0, maintenance: 0, rent_mortgage: 0,
});

function monthRange(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 1));
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return { start, end, daysInMonth };
}

function occupiedDays(t: Tenant | undefined, ym: string): number {
  if (!t) return 0;
  const { start, end, daysInMonth } = monthRange(ym);
  const moveIn = t.move_in_date || t.lease_start;
  const leaveOn = t.lease_end;
  const tStart = moveIn ? new Date(moveIn + "T00:00:00Z") : start;
  const tEnd = leaveOn ? new Date(leaveOn + "T00:00:00Z") : end;
  const from = tStart > start ? tStart : start;
  const to = tEnd < end ? tEnd : end;
  if (to <= from) return 0;
  const days = Math.round((to.getTime() - from.getTime()) / 86400000);
  return Math.min(days, daysInMonth);
}

function currentYearMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function LedgerPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyId, setPropertyId] = useState("");
  const [ym, setYm] = useState(currentYearMonth());

  const [rooms, setRooms] = useState<Room[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expenses>(emptyExpenses());
  const [loading, setLoading] = useState(true);
  const [payModal, setPayModal] = useState<{ tenant: Tenant; method: "e_transfer" | "cash" } | null>(null);

  // Load properties once
  useEffect(() => {
    supabase.from("properties").select("id, short_name, address").order("short_name").then(({ data }) => {
      const list = (data as Property[]) || [];
      setProperties(list);
      if (list.length && !propertyId) setPropertyId(list[0].id);
    });
  }, []);

  const load = async () => {
    if (!propertyId) return;
    setLoading(true);
    const { start, end } = monthRange(ym);
    const startIso = start.toISOString().slice(0, 10);
    const endIso = end.toISOString().slice(0, 10);

    const [{ data: rms }, { data: ts }, { data: ex }] = await Promise.all([
      supabase.from("rooms").select("*").eq("property_id", propertyId).order("room_number"),
      supabase.from("tenants").select("*"),
      supabase.from("monthly_expenses").select("*").eq("property_id", propertyId).eq("year_month", ym).maybeSingle(),
    ]);

    const roomList = (rms as Room[]) || [];
    const tenantList = (ts as Tenant[]) || [];
    setRooms(roomList);
    setTenants(tenantList);

    const roomIds = roomList.map(r => r.id);
    const tenantIds = tenantList.filter(t => t.room_id && roomIds.includes(t.room_id)).map(t => t.id);
    if (tenantIds.length) {
      const { data: pays } = await supabase.from("payment_ledger").select("*")
        .in("tenant_id", tenantIds)
        .gte("paid_on", startIso)
        .lt("paid_on", endIso);
      setPayments((pays as Payment[]) || []);
    } else {
      setPayments([]);
    }

    if (ex) setExpenses({ ...emptyExpenses(), ...(ex as Expenses) });
    else setExpenses(emptyExpenses());

    setLoading(false);
  };

  useEffect(() => { load(); }, [propertyId, ym]);

  // Build ledger rows
  const rows = useMemo(() => {
    return rooms.map(room => {
      const tenant = tenants.find(t => t.room_id === room.id && (t.status || "current").toLowerCase() === "current");
      const monthlyRent = Number(tenant?.monthly_rent ?? room.base_rate ?? room.rate_monthly ?? 0);
      const { daysInMonth } = monthRange(ym);
      const days = tenant ? occupiedDays(tenant, ym) : 0;
      const rentDue = days > 0 ? +(monthlyRent * (days / daysInMonth)).toFixed(2) : 0;
      const tPays = tenant ? payments.filter(p => p.tenant_id === tenant.id) : [];
      const eTransfer = tPays.filter(p => (p.method || "").toLowerCase() === "e_transfer").reduce((s, p) => s + Number(p.amount), 0);
      const cash = tPays.filter(p => (p.method || "").toLowerCase() === "cash").reduce((s, p) => s + Number(p.amount), 0);
      const otherPaid = tPays.filter(p => !["e_transfer", "cash"].includes((p.method || "").toLowerCase())).reduce((s, p) => s + Number(p.amount), 0);
      const totalPaid = +(eTransfer + cash + otherPaid).toFixed(2);
      const outstanding = +Math.max(0, rentDue - totalPaid).toFixed(2);
      return {
        room, tenant, monthlyRent, days, rentDue, eTransfer, cash, totalPaid, outstanding,
      };
    });
  }, [rooms, tenants, payments, ym]);

  const totals = useMemo(() => rows.reduce((acc, r) => ({
    rentDue: acc.rentDue + r.rentDue,
    eTransfer: acc.eTransfer + r.eTransfer,
    cash: acc.cash + r.cash,
    totalPaid: acc.totalPaid + r.totalPaid,
    outstanding: acc.outstanding + r.outstanding,
  }), { rentDue: 0, eTransfer: 0, cash: 0, totalPaid: 0, outstanding: 0 }), [rows]);

  const totalExpenses = EXPENSE_FIELDS.reduce((s, f) => s + Number(expenses[f.key] || 0), 0);
  const profit = totals.totalPaid - totalExpenses;

  const updateTenantRent = async (tenantId: string, value: number) => {
    const { error } = await supabase.from("tenants").update({ monthly_rent: value }).eq("id", tenantId);
    if (error) { toast.error(error.message); return; }
    setTenants(prev => prev.map(t => t.id === tenantId ? { ...t, monthly_rent: value } : t));
  };

  const saveExpenses = async (next: Expenses) => {
    setExpenses(next);
    const payload = {
      property_id: propertyId, year_month: ym,
      electricity: next.electricity, insurance: next.insurance, gas: next.gas, internet: next.internet,
      cleaning: next.cleaning, labor_fees: next.labor_fees, maintenance: next.maintenance, rent_mortgage: next.rent_mortgage,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("monthly_expenses").upsert(payload, { onConflict: "property_id,year_month" });
    if (error) toast.error(error.message);
  };

  const exportCsv = () => {
    const prop = properties.find(p => p.id === propertyId);
    const header = ["Room", "Bed", "Monthly Rent", "Days", "Rent Due", "E-Transfer", "Cash", "Total Paid", "Outstanding", "Resident", "Phone"];
    const lines = [header.join(",")];
    for (const r of rows) {
      const name = r.tenant ? `${r.tenant.first_name || ""} ${r.tenant.surname || ""}`.trim() : "";
      lines.push([
        r.room.room_number ?? "",
        r.room.bed_type ?? "",
        r.monthlyRent.toFixed(2),
        r.days,
        r.rentDue.toFixed(2),
        r.eTransfer.toFixed(2),
        r.cash.toFixed(2),
        r.totalPaid.toFixed(2),
        r.outstanding.toFixed(2),
        `"${name.replace(/"/g, '""')}"`,
        `"${(r.tenant?.telephone || "").replace(/"/g, '""')}"`,
      ].join(","));
    }
    lines.push(["TOTALS", "", "", "", totals.rentDue.toFixed(2), totals.eTransfer.toFixed(2), totals.cash.toFixed(2), totals.totalPaid.toFixed(2), totals.outstanding.toFixed(2), "", ""].join(","));
    lines.push("");
    lines.push("EXPENSES,Amount");
    for (const f of EXPENSE_FIELDS) lines.push(`${f.label},${Number(expenses[f.key] || 0).toFixed(2)}`);
    lines.push(`Total Expenses,${totalExpenses.toFixed(2)}`);
    lines.push(`Profit (Paid - Expenses),${profit.toFixed(2)}`);
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ledger-${(prop?.short_name || "property").toLowerCase().replace(/\s+/g, "-")}-${ym}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold">Ledger</h1>
          <p className="text-sm text-muted-foreground">Monthly income & expenses per property.</p>
        </div>
        <div className="sm:ml-auto flex flex-wrap gap-2">
          <label className="text-xs text-muted-foreground">Property
            <select value={propertyId} onChange={e => setPropertyId(e.target.value)}
              className="block mt-1 px-3 py-2 rounded-xl border border-input bg-background text-sm min-w-[160px]">
              {properties.map(p => <option key={p.id} value={p.id}>{p.short_name || p.address}</option>)}
            </select>
          </label>
          <label className="text-xs text-muted-foreground">Month
            <input type="month" value={ym} onChange={e => setYm(e.target.value)}
              className="block mt-1 px-3 py-2 rounded-xl border border-input bg-background text-sm" />
          </label>
          <button onClick={exportCsv} className="touch-min btn-pill btn-brand flex items-center gap-1.5 px-4 self-end">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {loading ? <div className="text-muted-foreground py-6">Loading…</div> : (
        <>
          <div className="bg-card rounded-2xl border border-border overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead className="bg-secondary text-xs uppercase">
                <tr>
                  <th className="text-start p-2">Room</th>
                  <th className="text-start p-2">Bed</th>
                  <th className="text-end p-2">Rent</th>
                  <th className="text-end p-2">Days</th>
                  <th className="text-end p-2">Due</th>
                  <th className="text-end p-2">E-Transfer</th>
                  <th className="text-end p-2">Cash</th>
                  <th className="text-end p-2">Paid</th>
                  <th className="text-end p-2">Outstanding</th>
                  <th className="text-start p-2">Resident</th>
                  <th className="text-start p-2">Phone</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.room.id} className="border-t border-border">
                    <td className="p-2 font-semibold">{r.room.room_number || "—"}</td>
                    <td className="p-2 text-muted-foreground">{r.room.bed_type || "—"}</td>
                    <td className="p-2 text-end">
                      {r.tenant ? (
                        <input type="number" defaultValue={r.monthlyRent} step="0.01"
                          onBlur={e => {
                            const v = Number(e.target.value);
                            if (!Number.isNaN(v) && v !== r.monthlyRent) updateTenantRent(r.tenant!.id, v);
                          }}
                          className="w-24 px-2 py-1 rounded border border-input bg-background text-end" />
                      ) : `$${r.monthlyRent.toFixed(0)}`}
                    </td>
                    <td className="p-2 text-end">{r.days}</td>
                    <td className="p-2 text-end">${r.rentDue.toFixed(2)}</td>
                    <td className="p-2 text-end">${r.eTransfer.toFixed(2)}</td>
                    <td className="p-2 text-end">${r.cash.toFixed(2)}</td>
                    <td className="p-2 text-end font-semibold">${r.totalPaid.toFixed(2)}</td>
                    <td className={`p-2 text-end font-semibold ${r.outstanding > 0 ? "text-destructive" : "text-success"}`}>${r.outstanding.toFixed(2)}</td>
                    <td className="p-2">{r.tenant ? `${r.tenant.first_name || ""} ${r.tenant.surname || ""}` : <span className="text-muted-foreground">Vacant</span>}</td>
                    <td className="p-2 text-muted-foreground">{r.tenant?.telephone || "—"}</td>
                    <td className="p-2">
                      {r.tenant && (
                        <div className="flex gap-1">
                          <button onClick={() => setPayModal({ tenant: r.tenant!, method: "e_transfer" })}
                            className="px-2 py-1 rounded-md text-xs font-semibold bg-brand/10 text-brand hover:bg-brand/20">+ E-T</button>
                          <button onClick={() => setPayModal({ tenant: r.tenant!, method: "cash" })}
                            className="px-2 py-1 rounded-md text-xs font-semibold bg-success/10 text-success hover:bg-success/20">+ Cash</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td colSpan={12} className="p-6 text-center text-muted-foreground">No rooms in this property.</td></tr>
                )}
              </tbody>
              <tfoot className="bg-cream/60 font-bold">
                <tr className="border-t-2 border-border">
                  <td className="p-2" colSpan={4}>TOTALS</td>
                  <td className="p-2 text-end">${totals.rentDue.toFixed(2)}</td>
                  <td className="p-2 text-end">${totals.eTransfer.toFixed(2)}</td>
                  <td className="p-2 text-end">${totals.cash.toFixed(2)}</td>
                  <td className="p-2 text-end">${totals.totalPaid.toFixed(2)}</td>
                  <td className={`p-2 text-end ${totals.outstanding > 0 ? "text-destructive" : "text-success"}`}>${totals.outstanding.toFixed(2)}</td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <section className="bg-card rounded-2xl border border-border p-4">
              <h2 className="font-bold text-sm uppercase tracking-wider text-ink/60 mb-3">Expenses</h2>
              <div className="space-y-2">
                {EXPENSE_FIELDS.map(f => (
                  <label key={f.key} className="flex items-center justify-between gap-3 text-sm">
                    <span>{f.label}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">$</span>
                      <input type="number" step="0.01" defaultValue={Number(expenses[f.key] || 0)}
                        onBlur={e => {
                          const v = Number(e.target.value) || 0;
                          if (v !== Number(expenses[f.key])) saveExpenses({ ...expenses, [f.key]: v });
                        }}
                        className="w-28 px-2 py-1 rounded border border-input bg-background text-end" />
                    </div>
                  </label>
                ))}
                <div className="border-t border-border pt-2 flex items-center justify-between font-bold">
                  <span>Total Expenses</span>
                  <span>${totalExpenses.toFixed(2)}</span>
                </div>
              </div>
            </section>

            <section className="bg-card rounded-2xl border border-border p-4 space-y-3">
              <h2 className="font-bold text-sm uppercase tracking-wider text-ink/60">Summary</h2>
              <Row label="Total Paid" value={totals.totalPaid} tone="good" />
              <Row label="Total Expenses" value={totalExpenses} tone="bad" />
              <div className="border-t border-border pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-sm">Profit</span>
                  <span className={`text-2xl font-bold ${profit >= 0 ? "text-success" : "text-destructive"}`}>
                    ${profit.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Paid − Expenses for the selected month.</p>
              </div>
            </section>
          </div>
        </>
      )}

      {payModal && (
        <PaymentModal
          tenant={payModal.tenant}
          method={payModal.method}
          ym={ym}
          onClose={() => setPayModal(null)}
          onSaved={() => { setPayModal(null); load(); }}
        />
      )}
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: number; tone?: "good" | "bad" }) {
  const color = tone === "good" ? "text-success" : tone === "bad" ? "text-destructive" : "text-ink";
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-bold ${color}`}>${value.toFixed(2)}</span>
    </div>
  );
}

function PaymentModal({ tenant, method, ym, onClose, onSaved }:
  { tenant: Tenant; method: "e_transfer" | "cash"; ym: string; onClose: () => void; onSaved: () => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const defaultDate = today.startsWith(ym) ? today : `${ym}-01`;
  const [amount, setAmount] = useState<string>(String(tenant.monthly_rent ?? ""));
  const [paidOn, setPaidOn] = useState<string>(defaultDate);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!amt || amt <= 0) { toast.error("Enter an amount"); return; }
    setSaving(true);
    const { error } = await supabase.from("payment_ledger").insert({
      tenant_id: tenant.id, amount: amt, method, paid_on: paidOn, notes: notes || null,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Payment recorded");
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4" onClick={onClose}>
      <form onClick={e => e.stopPropagation()} onSubmit={submit}
        className="bg-card rounded-2xl border border-border p-5 w-full max-w-sm space-y-3">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Plus className="w-4 h-4" /> Record {method === "e_transfer" ? "E-Transfer" : "Cash"}
        </h2>
        <p className="text-sm text-muted-foreground">{tenant.first_name} {tenant.surname}</p>
        <label className="block text-xs text-muted-foreground">Amount
          <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)}
            className="mt-1 w-full px-3 py-2 rounded-xl border border-input bg-background text-sm" autoFocus />
        </label>
        <label className="block text-xs text-muted-foreground">Date
          <input type="date" value={paidOn} onChange={e => setPaidOn(e.target.value)}
            className="mt-1 w-full px-3 py-2 rounded-xl border border-input bg-background text-sm" />
        </label>
        <label className="block text-xs text-muted-foreground">Notes (optional)
          <input value={notes} onChange={e => setNotes(e.target.value)}
            className="mt-1 w-full px-3 py-2 rounded-xl border border-input bg-background text-sm" />
        </label>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="touch-min flex-1 btn-pill border border-border">Cancel</button>
          <button disabled={saving} className="touch-min flex-1 btn-pill btn-brand">{saving ? "Saving…" : "Save"}</button>
        </div>
      </form>
    </div>
  );
}
