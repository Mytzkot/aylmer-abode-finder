import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Mail, Copy, Check } from "lucide-react";
import { listNewsletterSubscribers } from "@/lib/newsletter.functions";

export const Route = createFileRoute("/admin/subscribers")({ component: SubscribersPage });

interface Sub { id: string; email: string; created_at: string }

function SubscribersPage() {
  const fetchSubs = useServerFn(listNewsletterSubscribers);
  const [subs, setSubs] = useState<Sub[] | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchSubs().then(r => setSubs(r.subscribers as Sub[])).catch(() => setSubs([]));
  }, [fetchSubs]);

  const copyAll = async () => {
    if (!subs) return;
    await navigator.clipboard.writeText(subs.map(s => s.email).join(", "));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-ink flex items-center gap-2">
            <Mail className="w-6 h-6" /> Mailing list
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            People who signed up via the “Get Notified About Available Rooms” form.
          </p>
        </div>
        {subs && subs.length > 0 && (
          <button onClick={copyAll} className="btn-pill btn-ink text-sm">
            {copied ? <><Check className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy all emails</>}
          </button>
        )}
      </div>

      {subs === null ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : subs.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          No signups yet.
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-cream text-ink/70 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-2.5">Email</th>
                <th className="text-left px-4 py-2.5 w-48">Signed up</th>
              </tr>
            </thead>
            <tbody>
              {subs.map(s => (
                <tr key={s.id} className="border-t border-border">
                  <td className="px-4 py-2.5 font-medium text-ink">{s.email}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {new Date(s.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-4">
        {subs?.length ?? 0} subscriber{(subs?.length ?? 0) === 1 ? "" : "s"} total.
      </p>
    </div>
  );
}
