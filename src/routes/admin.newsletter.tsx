import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Mail, Copy, Check, Send, Eye, AlertTriangle } from "lucide-react";
import {
  listNewsletterSubscribers,
  buildAvailabilityNewsletter,
  sendAvailabilityNewsletter,
} from "@/lib/newsletter.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/newsletter")({ component: NewsletterPage });

interface Sub { id: string; email: string; created_at: string; unsubscribed_at: string | null }
interface Preview { ok: boolean; subject_en: string; subject_fr: string; html: string; text: string; roomCount: number; recipientCount: number }

function NewsletterPage() {
  const fetchSubs = useServerFn(listNewsletterSubscribers);
  const buildPreview = useServerFn(buildAvailabilityNewsletter);
  const sendNow = useServerFn(sendAvailabilityNewsletter);

  const [subs, setSubs] = useState<Sub[] | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [emailNotConfigured, setEmailNotConfigured] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    fetchSubs().then(r => setSubs((r.subscribers ?? []) as Sub[])).catch(() => setSubs([]));
    buildPreview().then(r => setPreview(r as Preview)).catch(() => {});
  }, [fetchSubs, buildPreview]);

  const active = useMemo(() => (subs ?? []).filter(s => !s.unsubscribed_at), [subs]);
  const unsub = useMemo(() => (subs ?? []).filter(s => !!s.unsubscribed_at), [subs]);

  const copyAll = async () => {
    await navigator.clipboard.writeText(active.map(s => s.email).join(", "));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSend = async () => {
    if (!confirm(`Send the availability newsletter to ${preview?.recipientCount ?? 0} subscribers now?`)) return;
    setSending(true);
    try {
      const res = await sendNow();
      if ((res as any).needsEmailSetup) {
        setEmailNotConfigured(true);
        toast.warning("Email sender not configured yet — see banner above.");
      } else if (res.ok) {
        toast.success(`Sent to ${res.sent} of ${res.recipientCount} subscribers.`);
      } else {
        toast.error(res.error || "Send failed.");
      }
    } catch {
      toast.error("Send failed.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink flex items-center gap-2">
          <Mail className="w-6 h-6" /> Newsletter
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Send room-availability updates to your mailing list.
        </p>
      </div>

      {/* Email-not-configured banner */}
      {emailNotConfigured && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900">
            <p className="font-semibold mb-1">Email sender not configured yet.</p>
            <p className="mb-1">
              All subscribers are safely stored in the database and the preview below shows exactly what they will
              receive. To start sending, set up a verified email sender domain (e.g. <code>notify.zorbaco.com</code>).
              Once configured, the "Send availability update now" button works for everyone on the list.
            </p>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Active subscribers" value={active.length} />
        <StatCard label="Unsubscribed" value={unsub.length} />
        <StatCard label="Rooms available now" value={preview?.roomCount ?? "—"} />
        <StatCard label="Will be sent to" value={preview?.recipientCount ?? "—"} />
      </div>

      {/* Preview + Send */}
      <section className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <Eye className="w-5 h-5" /> Email preview
            </h2>
            <p className="text-xs text-muted-foreground">
              Auto-built from rooms currently marked Available. Conrad prices are hidden ("coming soon").
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowPreview(p => !p)} className="btn-pill bg-cream text-ink text-sm">
              {showPreview ? "Hide" : "Show"} preview
            </button>
            <button
              onClick={handleSend}
              disabled={sending || (preview?.recipientCount ?? 0) === 0}
              className="btn-pill btn-coral text-sm disabled:opacity-50"
              title={(preview?.recipientCount ?? 0) === 0 ? "No active subscribers yet" : ""}
            >
              <Send className="w-4 h-4" />
              {sending ? "Sending…" : `Send to ${preview?.recipientCount ?? 0}`}
            </button>
          </div>
        </div>

        {preview && (
          <div className="text-xs text-muted-foreground space-y-0.5">
            <div><span className="font-semibold">Subject (EN):</span> {preview.subject_en}</div>
            <div><span className="font-semibold">Subject (FR):</span> {preview.subject_fr}</div>
          </div>
        )}

        {showPreview && preview && (
          <div className="rounded-xl border border-border bg-white overflow-hidden">
            <iframe
              title="Newsletter preview"
              srcDoc={preview.html.replace(/{{unsubscribeUrl}}/g, "#preview-no-link")}
              className="w-full"
              style={{ height: 520, border: 0 }}
            />
          </div>
        )}
      </section>

      {/* Subscribers list */}
      <section className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-3 flex items-center justify-between gap-3 flex-wrap border-b border-border bg-cream">
          <h2 className="text-base font-bold text-ink">Subscribers</h2>
          {active.length > 0 && (
            <button onClick={copyAll} className="btn-pill btn-ink text-xs">
              {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy active emails</>}
            </button>
          )}
        </div>

        {subs === null ? (
          <div className="p-6 text-sm text-muted-foreground">Loading…</div>
        ) : subs.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No signups yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-cream/60 text-ink/70 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-2.5">Email</th>
                <th className="text-left px-4 py-2.5 w-48">Signed up</th>
                <th className="text-left px-4 py-2.5 w-32">Status</th>
              </tr>
            </thead>
            <tbody>
              {subs.map(s => (
                <tr key={s.id} className="border-t border-border">
                  <td className="px-4 py-2.5 font-medium text-ink">{s.email}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{new Date(s.created_at).toLocaleString()}</td>
                  <td className="px-4 py-2.5">
                    {s.unsubscribed_at ? (
                      <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Unsubscribed</span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-success/15 px-2 py-0.5 text-xs text-success font-semibold">Active</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <p className="text-xs text-muted-foreground">
        Every signup is stored in the database immediately, so nothing is lost. Subscribers can unsubscribe via the
        link in each newsletter email.
      </p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="text-[11px] font-bold uppercase tracking-wider text-ink/60">{label}</div>
      <div className="text-2xl font-bold text-ink mt-1">{value}</div>
    </div>
  );
}
