import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  DoorOpen, Users, ClipboardList, BookOpen, CalendarDays,
  ArrowRight, Home, DollarSign, Banknote, AlertCircle, TrendingUp, Building,
  ChevronRight,
} from "lucide-react";

interface Property { id: string; short_name?: string | null; address?: string }
interface Room { id: string; property_id?: string | null; current_status?: string | null; base_rate?: number | null; rate_monthly?: number | null }
interface Tenant { id: string; room_id?: string | null; first_name?: string | null; surname?: string | null; monthly_rent?: number | null; move_in_date?: string | null; lease_start?: string | null; lease_end?: string | null; status?: string | null; deposit_amount?: number | null; deposit_returned?: boolean | null }
interface Payment { id: string; tenant_id: string; amount: number; paid_on: string }
interface Expense {
  property_id?: string; year_month?: string;
  electricity: number; insurance: number; gas: number; internet: number;
  cleaning: number; labor_fees: number; maintenance: number; rent_mortgage: number;
}

function currentYearMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

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

export const Route = createFileRoute("/admin/")({ component: DashboardPage });

function DashboardPage() {
  const [ym, setYm] = useState(currentYearMonth());
  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newApplications, setNewApplications] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [ym]);

  const load = async () => {
    setLoading(true);
    const { start, end } = monthRange(ym);
    const startIso = start.toISOString().slice(0, 10);
    const endIso = end.toISOString().slice(0, 10);

    const [
      { data: props },
      { data: rms },
      { data: ts },
      { data: pays },
      { data: exps },
      { count: appCount },
    ] = await Promise.all([
      supabase.from("properties").select("id, short_name, address").order("short_name"),
      supabase.from("rooms").select("id, property_id, current_status, base_rate, rate_monthly"),
      supabase.from("tenants").select("id, room_id, first_name, surname, monthly_rent, move_in_date, lease_start, lease_end, status, deposit_amount, deposit_returned"),
      supabase.from("payment_ledger").select("id, tenant_id, amount, paid_on").gte("paid_on", startIso).lt("paid_on", endIso),
      supabase.from("monthly_expenses").select("*").eq("year_month", ym),
      supabase.from("applications").select("*", { count: "exact", head: true }).eq("status", "new"),
    ]);

    setProperties((props as Property[]) || []);
    setRooms((rms as Room[]) || []);
    setTenants((ts as Tenant[]) || []);
    setPayments((pays as Payment[]) || []);
    setExpenses((exps as Expense[]) || []);
    setNewApplications(appCount || 0);
    setLoading(false);
  };

  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.current_status === "Rented").length;
  const availableRooms = totalRooms - occupiedRooms;

  const { daysInMonth } = monthRange(ym);
  const rentDue = useMemo(() => {
    let total = 0;
    for (const tenant of tenants) {
      if (!tenant.room_id) continue;
      const room = rooms.find(r => r.id === tenant.room_id);
      const monthlyRent = tenant.monthly_rent ?? room?.base_rate ?? room?.rate_monthly ?? 0;
      const days = occupiedDays(tenant, ym);
      if (days > 0) {
        total += monthlyRent * (days / daysInMonth);
      }
    }
    return total;
  }, [tenants, rooms, ym, daysInMonth]);

  const totalCollected = useMemo(() => payments.reduce((s, p) => s + Number(p.amount), 0), [payments]);
  const totalOutstanding = useMemo(() => Math.max(0, rentDue - totalCollected), [rentDue, totalCollected]);

  const depositsHeld = useMemo(() => tenants.reduce((s, t) => {
    if (t.deposit_amount && t.deposit_returned !== true) {
      return s + Number(t.deposit_amount);
    }
    return s;
  }, 0), [tenants]);

  const perHouseProfit = useMemo(() => {
    const paidMap: Record<string, number> = {};
    for (const p of properties) paidMap[p.id] = 0;

    for (const pay of payments) {
      const tenant = tenants.find(t => t.id === pay.tenant_id);
      if (!tenant?.room_id) continue;
      const room = rooms.find(r => r.id === tenant.room_id);
      if (!room?.property_id) continue;
      paidMap[room.property_id] = (paidMap[room.property_id] || 0) + Number(pay.amount);
    }

    for (const ex of expenses) {
      if (ex.property_id) {
        const expTotal = ex.electricity + ex.insurance + ex.gas + ex.internet + ex.cleaning + ex.labor_fees + ex.maintenance + ex.rent_mortgage;
        paidMap[ex.property_id] = (paidMap[ex.property_id] || 0) - expTotal;
      }
    }

    return properties.map(p => ({ property: p, profit: paidMap[p.id] || 0 }));
  }, [properties, payments, tenants, rooms, expenses]);

  const quickLinks = [
    { to: "/admin/rooms", label: "Rooms", icon: DoorOpen, color: "bg-brand/10 text-brand" },
    { to: "/admin/tenants", label: "Tenants", icon: Users, color: "bg-success/10 text-success" },
    { to: "/admin/applications", label: "Applications", icon: ClipboardList, color: "bg-coral/10 text-coral" },
    { to: "/admin/ledger", label: "Ledger", icon: BookOpen, color: "bg-secondary text-ink" },
    { to: "/admin/calendar", label: "Calendar", icon: CalendarDays, color: "bg-brand-aqua/10 text-brand-deep" },
  ];

  if (loading) {
    return (
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="text-muted-foreground py-12">Loading dashboard…</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview for {ym}</p>
        </div>
        <div className="sm:ml-auto">
          <input
            type="month"
            value={ym}
            onChange={e => setYm(e.target.value)}
            className="px-3 py-2 rounded-xl border border-input bg-background text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Rooms" value={totalRooms} icon={Building} />
        <StatCard label="Occupied" value={occupiedRooms} icon={DoorOpen} tone="good" />
        <StatCard label="Available" value={availableRooms} icon={Home} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Rent Due" value={`$${rentDue.toFixed(0)}`} icon={DollarSign} />
        <StatCard label="Collected" value={`$${totalCollected.toFixed(0)}`} icon={Banknote} tone="good" />
        <StatCard label="Outstanding" value={`$${totalOutstanding.toFixed(0)}`} icon={AlertCircle} tone={totalOutstanding > 0 ? "bad" : "good"} />
        <StatCard label="Deposits Held" value={`$${depositsHeld.toFixed(0)}`} icon={TrendingUp} />
      </div>

      <section className="bg-card rounded-2xl border border-border p-4">
        <h2 className="font-bold text-sm uppercase tracking-wider text-ink/60 mb-3">Per-House Profit</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {perHouseProfit.map(({ property, profit }) => (
            <div key={property.id} className="rounded-xl border border-border p-3 bg-cream/40">
              <div className="text-xs text-muted-foreground mb-1">{property.short_name || property.address}</div>
              <div className={`text-xl font-bold ${profit >= 0 ? "text-success" : "text-destructive"}`}>
                {profit >= 0 ? "+" : ""}${profit.toFixed(0)}
              </div>
            </div>
          ))}
          {perHouseProfit.length === 0 && (
            <p className="text-sm text-muted-foreground col-span-full">No properties yet.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="font-bold text-sm uppercase tracking-wider text-ink/60 mb-3">Quick Links</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="group bg-card rounded-2xl border border-border p-4 flex items-center gap-3 hover:border-brand/40 transition"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${link.color}`}>
                <link.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{link.label}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-ink transition shrink-0" />
            </Link>
          ))}
        </div>
      </section>

      {newApplications > 0 && (
        <section className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-sm uppercase tracking-wider text-ink/60 mb-1">New Applications</h2>
              <p className="text-2xl font-bold">{newApplications}</p>
            </div>
            <Link to="/admin/applications" className="btn-pill btn-brand text-sm">
              Review <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, tone }: {
  label: string;
  value: string | number;
  icon: any;
  tone?: "good" | "bad" | "neutral";
}) {
  const color = tone === "good" ? "text-success" : tone === "bad" ? "text-destructive" : "text-ink";
  return (
    <div className="bg-card rounded-2xl border border-border p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-ink">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
      </div>
    </div>
  );
}
