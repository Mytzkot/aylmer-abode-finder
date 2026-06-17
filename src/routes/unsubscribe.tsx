import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, XCircle, MailX } from "lucide-react";
import { unsubscribeByToken } from "@/lib/newsletter.functions";

export const Route = createFileRoute("/unsubscribe")({
  validateSearch: (s: Record<string, unknown>) => ({
    token: typeof s.token === "string" ? s.token : "",
  }),
  component: UnsubscribePage,
  head: () => ({
    meta: [
      { title: "Unsubscribe — Zorba Rentals" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

type State =
  | { kind: "loading" }
  | { kind: "ready"; email: string; already: boolean }
  | { kind: "done"; email: string }
  | { kind: "error"; message: string };

function UnsubscribePage() {
  const { token } = useSearch({ from: "/unsubscribe" });
  const run = useServerFn(unsubscribeByToken);
  const [state, setState] = useState<State>({ kind: "loading" });
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (!token) {
      setState({ kind: "error", message: "Missing unsubscribe token." });
      return;
    }
    run({ data: { token, confirm: false } })
      .then((res) => {
        if (res.ok) setState({ kind: "ready", email: res.email, already: !!res.alreadyUnsubscribed });
        else setState({ kind: "error", message: res.error });
      })
      .catch(() => setState({ kind: "error", message: "Something went wrong." }));
  }, [token, run]);

  async function confirm() {
    if (!token) return;
    setWorking(true);
    try {
      const res = await run({ data: { token, confirm: true } });
      if (res.ok) setState({ kind: "done", email: res.email });
      else setState({ kind: "error", message: res.error });
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <main className="flex-1 mx-auto max-w-md w-full px-4 py-16 text-center">
        {state.kind === "loading" && <p className="text-sm text-ink/60">Loading…</p>}

        {state.kind === "error" && (
          <>
            <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Unsubscribe link invalid</h1>
            <p className="text-sm text-ink/70 mb-2" lang="en">{state.message}</p>
            <p className="text-sm text-ink/70" lang="fr">Lien de désabonnement invalide.</p>
          </>
        )}

        {state.kind === "ready" && !state.already && (
          <>
            <MailX className="w-16 h-16 text-ink/70 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Unsubscribe</h1>
            <p className="text-sm text-ink/70 mb-1" lang="en">
              Unsubscribe <strong>{state.email}</strong> from Zorba Rentals room-availability updates?
            </p>
            <p className="text-sm text-ink/70 mb-6" lang="fr">
              Désabonner <strong>{state.email}</strong> des mises à jour de disponibilité ?
            </p>
            <button
              onClick={confirm}
              disabled={working}
              className="touch-min inline-flex rounded-xl bg-destructive text-white px-5 py-3 font-semibold disabled:opacity-60"
            >
              {working ? "…" : "Unsubscribe / Se désabonner"}
            </button>
          </>
        )}

        {state.kind === "ready" && state.already && (
          <>
            <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Already unsubscribed</h1>
            <p className="text-sm text-ink/70" lang="en"><strong>{state.email}</strong> is no longer subscribed.</p>
            <p className="text-sm text-ink/70" lang="fr"><strong>{state.email}</strong> n'est plus abonné.</p>
          </>
        )}

        {state.kind === "done" && (
          <>
            <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">You're unsubscribed</h1>
            <p className="text-sm text-ink/70 mb-1" lang="en">
              <strong>{state.email}</strong> will no longer receive availability updates.
            </p>
            <p className="text-sm text-ink/70" lang="fr">
              <strong>{state.email}</strong> ne recevra plus de mises à jour.
            </p>
          </>
        )}

        <div className="mt-8">
          <Link to="/" className="text-sm text-brand hover:underline">← Back to Zorba Rentals</Link>
        </div>
      </main>
    </div>
  );
}
