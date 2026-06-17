import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { CreditCard, BellRing, CheckCircle2, Trash2, Mail, Phone, MessageCircle, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/rent")({ component: RentPage });

type Tab = "requests" | "reminders";

function RentPage() {
  const [tab, setTab] = useState<Tab>("requests");
  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Rent</h1>

      <div className="flex gap-2 mb-5 border-b border-border">
        <TabBtn active={tab === "requests"} onClick={() => setTab("requests")} icon={<CreditCard className="w-4 h-4" />}>
          Card link requests
        </TabBtn>
        <TabBtn active={tab === "reminders"} onClick={() => setTab("reminders")} icon={<BellRing className="w-4 h-4" />}>
          Monthly reminders
        </TabBtn>
      </div>

      {tab === "requests" ? <CardRequests /> : <Reminders />}
    </div>
  );
}

function TabBtn({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold -mb-px border-b-2 transition ${
        active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-ink"
      }`}>
      {icon} {children}
    </button>
  );
}

/* ============================ Card requests ============================ */

interface CardRequest {
  id: string;
  name: string;
  contact_email: string | null;
  contact_phone: string | null;
  address_or_room: string | null;
  amount: number | null;
  message: string | null;
  status: string;
  created_at: string;
}

const STATUSES = ["new", "sent", "paid", "closed"] as const;
type ReqStatus = typeof STATUSES[number];

const statusTone = (s: string) => {
  const v = s.toLowerCase();
  if (v === "new") return "bg-amber-100 text-amber-800";
  if (v === "sent") return "bg-brand/15 text-brand";
  if (v === "paid") return "bg-success/15 text-success";
  return "bg-muted text-muted-foreground";
};

function CardRequests() {
  const [rows, setRows] = useState<CardRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("card_payment_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data as CardRequest[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: ReqStatus) => {
    const { error } = await supabase.from("card_payment_requests").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setRows(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this request?")) return;
    const { error } = await supabase.from("card_payment_requests").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setRows(prev => prev.filter(r => r.id !== id));
  };

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (rows.length === 0) return <p className="text-sm text-muted-foreground">No card payment link requests yet.</p>;

  return (
    <div className="space-y-3">
      {rows.map(r => (
        <div key={r.id} className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="font-bold">{r.name}{r.amount ? ` — $${Number(r.amount).toFixed(2)} CAD` : ""}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(r.created_at).toLocaleString()}
                {r.address_or_room ? ` · ${r.address_or_room}` : ""}
              </div>
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${statusTone(r.status)}`}>{r.status}</span>
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            {r.contact_email && (
              <a href={`mailto:${r.contact_email}`} className="inline-flex items-center gap-1 text-brand hover:underline">
                <Mail className="w-3.5 h-3.5" /> {r.contact_email}
              </a>
            )}
            {r.contact_phone && (
              <a href={`tel:${r.contact_phone}`} className="inline-flex items-center gap-1 text-brand hover:underline">
                <Phone className="w-3.5 h-3.5" /> {r.contact_phone}
              </a>
            )}
          </div>

          {r.message && (
            <p className="text-sm text-ink/80 whitespace-pre-wrap border-l-2 border-border pl-3">{r.message}</p>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            {STATUSES.map(s => (
              <button key={s} onClick={() => setStatus(r.id, s)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border capitalize ${
                  r.status === s ? statusTone(s) + " border-transparent" : "border-border bg-background hover:border-primary/50"
                }`}>
                Mark {s}
              </button>
            ))}
            <button onClick={() => remove(r.id)} className="text-xs text-destructive hover:underline inline-flex items-center gap-1 ml-auto">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================ Monthly reminders ============================ */

interface TenantLite {
  id: string;
  first_name: string | null;
  surname: string | null;
  email: string | null;
  telephone: string | null;
  monthly_rent: number | null;
  status: string | null;
}
interface PayLite { tenant_id: string; amount: number; paid_on: string }
interface ReminderLog { id: string; tenant_id: string; month_start: string; channel: string; sent_at: string }

const ETRANSFER_EMAIL = "zorbagraphic@gmail.com";

function Reminders() {
  const [tenants, setTenants] = useState<TenantLite[]>([]);
  const [paidByTenant, setPaidByTenant] = useState<Record<string, number>>({});
  const [sentThisMonth, setSentThisMonth] = useState<Record<string, ReminderLog[]>>({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const monthStart = useMemo(() => {
    const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const monthStartIso = monthStart.toISOString().slice(0, 10);
  const monthLabel = monthStart.toLocaleString(undefined, { month: "long", year: "numeric" });

  const load = async () => {
    setLoading(true);
    const [{ data: t, error: te }, { data: pays }, { data: logs }] = await Promise.all([
      supabase.from("tenants").select("id, first_name, surname, email, telephone, monthly_rent, status").eq("status", "current"),
      supabase.from("payment_ledger").select("tenant_id, amount, paid_on").gte("paid_on", monthStartIso),
      supabase.from("rent_reminders").select("id, tenant_id, month_start, channel, sent_at").eq("month_start", monthStartIso),
    ]);
    if (te) toast.error(te.message);
    setTenants((t as TenantLite[]) || []);
    const sums: Record<string, number> = {};
    (pays as PayLite[] | null)?.forEach(p => { sums[p.tenant_id] = (sums[p.tenant_id] || 0) + Number(p.amount || 0); });
    setPaidByTenant(sums);
    const byT: Record<string, ReminderLog[]> = {};
    (logs as ReminderLog[] | null)?.forEach(l => { (byT[l.tenant_id] = byT[l.tenant_id] || []).push(l); });
    setSentThisMonth(byT);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const owesList = useMemo(() => {
    return tenants
      .map(t => {
        const rent = Number(t.monthly_rent || 0);
        const paid = paidByTenant[t.id] || 0;
        return { t, rent, paid, owes: Math.max(0, rent - paid) };
      })
      .filter(x => x.rent > 0)
      .sort((a, b) => b.owes - a.owes);
  }, [tenants, paidByTenant]);

  const owesCount = owesList.filter(x => x.owes > 0).length;

  const buildMessage = (t: TenantLite, owes: number) => {
    const name = (t.first_name || "").trim() || "there";
    return (
      `Hi ${name}, friendly reminder that ${monthLabel} rent ($${owes.toFixed(2)} CAD) is now due. ` +
      `Easiest way to pay is Interac e-Transfer to ${ETRANSFER_EMAIL} (auto-deposit on, no security question). ` +
      `Prefer card? Request a secure link at /pay. Thanks! — Zorba Rentals\n\n` +
      `Bonjour ${name}, petit rappel : le loyer de ${monthLabel} (${owes.toFixed(2)} $ CAD) est maintenant dû. ` +
      `Le plus simple est un virement Interac à ${ETRANSFER_EMAIL} (dépôt automatique, aucune question de sécurité). ` +
      `Pour payer par carte, demandez un lien sécurisé sur /pay. Merci ! — Zorba Rentals`
    );
  };

  const logReminder = async (tenantId: string, channel: string, contact: string | null, amount: number) => {
    const { error } = await supabase.from("rent_reminders").insert({
      tenant_id: tenantId,
      month_start: monthStartIso,
      channel,
      contact,
      amount_due: amount,
    });
    if (error) toast.error(error.message);
    else toast.success("Reminder logged");
    load();
  };

  const sendEmail = async (t: TenantLite, owes: number) => {
    if (!t.email) { toast.error("No email on file"); return; }
    setBusyId(t.id);
    const subject = encodeURIComponent(`Rent reminder — ${monthLabel} / Rappel de loyer`);
    const body = encodeURIComponent(buildMessage(t, owes));
    window.open(`mailto:${t.email}?subject=${subject}&body=${body}`, "_blank");
    await logReminder(t.id, "email", t.email, owes);
    setBusyId(null);
  };

  const sendSms = async (t: TenantLite, owes: number) => {
    if (!t.telephone) { toast.error("No phone on file"); return; }
    setBusyId(t.id);
    const body = encodeURIComponent(buildMessage(t, owes));
    // sms: with body works on iOS/Android; desktop opens default handler.
    window.open(`sms:${t.telephone}?body=${body}`, "_blank");
    await logReminder(t.id, "sms", t.telephone, owes);
    setBusyId(null);
  };

  const sendWhatsApp = async (t: TenantLite, owes: number) => {
    if (!t.telephone) { toast.error("No phone on file"); return; }
    setBusyId(t.id);
    const phone = t.telephone.replace(/[^\d]/g, "");
    const body = encodeURIComponent(buildMessage(t, owes));
    window.open(`https://wa.me/${phone}?text=${body}`, "_blank");
    await logReminder(t.id, "whatsapp", t.telephone, owes);
    setBusyId(null);
  };

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-card border border-border p-4">
        <div className="text-xs uppercase font-bold tracking-wider text-muted-foreground">This month</div>
        <div className="mt-1 text-lg font-bold">{monthLabel}</div>
        <div className="mt-2 text-sm text-ink/80">
          <span className="font-semibold text-destructive">{owesCount}</span> tenant{owesCount === 1 ? "" : "s"} still owe rent this month.
        </div>
        <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
          Reminders open your email, SMS, or WhatsApp app pre-filled in English &amp; French — click <em>Send</em> to dispatch. Each send is logged below so nothing gets sent twice.
          Fully automated email/SMS delivery will switch on once the sender domain &amp; SMS service are connected.
        </p>
      </div>

      {owesList.length === 0 && (
        <p className="text-sm text-muted-foreground">No current tenants with rent on file.</p>
      )}

      {owesList.map(({ t, rent, paid, owes }) => {
        const sent = sentThisMonth[t.id] || [];
        const fullName = `${t.first_name || ""} ${t.surname || ""}`.trim() || "Unnamed tenant";
        const isPaid = owes <= 0;
        return (
          <div key={t.id} className={`bg-card border rounded-2xl p-4 space-y-3 ${isPaid ? "border-success/40" : "border-border"}`}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="font-bold">{fullName}</div>
                <div className="text-xs text-muted-foreground space-x-2">
                  {t.email && <span>{t.email}</span>}
                  {t.telephone && <span>· {t.telephone}</span>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Rent ${rent.toFixed(2)} · Paid ${paid.toFixed(2)}</div>
                <div className={`text-lg font-bold ${isPaid ? "text-success" : "text-destructive"}`}>
                  {isPaid ? "Paid in full" : `Owes $${owes.toFixed(2)}`}
                </div>
              </div>
            </div>

            {!isPaid && (
              <div className="flex flex-wrap gap-2">
                <button
                  disabled={!t.email || busyId === t.id}
                  onClick={() => sendEmail(t, owes)}
                  className="touch-min inline-flex items-center gap-1.5 rounded-lg bg-ink text-white text-sm font-semibold px-3 py-2 disabled:opacity-40">
                  {busyId === t.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />} Email
                </button>
                <button
                  disabled={!t.telephone || busyId === t.id}
                  onClick={() => sendSms(t, owes)}
                  className="touch-min inline-flex items-center gap-1.5 rounded-lg bg-ink text-white text-sm font-semibold px-3 py-2 disabled:opacity-40">
                  <Phone className="w-3.5 h-3.5" /> SMS
                </button>
                <button
                  disabled={!t.telephone || busyId === t.id}
                  onClick={() => sendWhatsApp(t, owes)}
                  className="touch-min inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] text-white text-sm font-semibold px-3 py-2 disabled:opacity-40">
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                </button>
              </div>
            )}

            {sent.length > 0 && (
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                Reminder sent this month via {sent.map(s => s.channel).join(", ")}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
