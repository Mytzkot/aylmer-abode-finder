import { createFileRoute } from "@tanstack/react-router";
import { Send, CreditCard, Copy, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { CONTACT } from "@/data/properties";

export const Route = createFileRoute("/pay")({
  component: PayOnline,
  head: () => ({
    meta: [
      { title: "Pay Rent — Zorba Rentals" },
      { name: "description", content: "Pay your monthly rent by Interac e-Transfer (recommended) or request a secure card payment link." },
      { property: "og:title", content: "Pay Rent — Zorba Rentals" },
      { property: "og:url", content: "/pay" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/pay" }],
  }),
});

const ETRANSFER_EMAIL = "zorbagraphic@gmail.com";

function PayOnline() {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(ETRANSFER_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  // Card request now uses a database-backed form (CardLinkRequestForm below).

  return (
    <main className="flex-1 mx-auto max-w-3xl w-full px-4 py-12 md:py-16">
      <header className="text-center mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-coral">
          Monthly Tenants · Locataires mensuels
        </p>
        <h1 className="font-display text-4xl md:text-5xl text-ink mt-2">
          Pay Your Rent
          <span className="block text-2xl md:text-3xl text-ink/70 mt-1 font-normal">
            Payez votre loyer
          </span>
        </h1>
        <p className="text-ink/70 mt-4 text-sm md:text-base">
          Rent is due on the 1st of each month.
          <span className="block italic text-ink/60">
            Le loyer est dû le 1er de chaque mois.
          </span>
        </p>
      </header>

      {/* PRIMARY — Interac e-Transfer */}
      <section className="rounded-3xl border-2 border-success bg-success/5 p-6 md:p-8 mb-6 relative">
        <span className="absolute -top-3 left-6 bg-success text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          Recommended · Recommandé
        </span>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 shrink-0 rounded-xl bg-success text-white flex items-center justify-center">
            <Send className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-2xl md:text-3xl text-ink">
              Pay by Interac e-Transfer
            </h2>
            <p className="text-ink/70 italic text-sm md:text-base">
              Payez par virement Interac
            </p>
            <p className="mt-1 text-sm font-semibold text-success">
              No fees · Aucun frais
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-card border border-border p-4 md:p-5">
          <div className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
            Send to · Envoyer à
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <code className="text-xl md:text-2xl font-bold text-ink break-all">
              {ETRANSFER_EMAIL}
            </code>
            <button
              onClick={copyEmail}
              className="touch-min inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-ink text-white text-sm font-semibold hover:opacity-90"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-sm md:text-base text-ink/80">
          <p>
            <strong>Auto-deposit is on</strong> — no security question is needed.
          </p>
          <p className="italic text-ink/60">
            Le dépôt automatique est activé — aucune question de sécurité requise.
          </p>
          <p className="pt-2">
            Please add your <strong>name and address</strong> in the message so we know who the payment is from.
          </p>
          <p className="italic text-ink/60">
            Veuillez inscrire votre <strong>nom et adresse</strong> dans le message pour identifier le paiement.
          </p>
        </div>
      </section>

      {/* SECONDARY — Card */}
      <section className="rounded-3xl border border-border bg-card p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 shrink-0 rounded-xl bg-surface-dark text-white flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-xl md:text-2xl text-ink">
              Pay by Credit / Debit Card
            </h2>
            <p className="text-ink/70 italic text-sm">
              Payez par carte de crédit / débit
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm md:text-base text-ink/80">
          Fill in the form below and we'll send you a secure payment link.
        </p>
        <p className="text-sm text-ink/60 italic">
          Remplissez le formulaire et nous vous enverrons un lien de paiement sécurisé.
        </p>

        <CardLinkRequestForm />

        <p className="mt-4 text-xs text-muted-foreground">
          A dedicated card payment service for rent is coming soon. ·
          <span className="italic"> Un service de paiement par carte dédié au loyer sera bientôt disponible.</span>
        </p>
      </section>
    </main>
  );
}

function CardLinkRequestForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [addr, setAddr] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Please enter your name"); return; }
    if (!email.trim() && !phone.trim()) { toast.error("Please enter an email or phone"); return; }
    setBusy(true);
    const { error } = await supabase.from("card_payment_requests").insert({
      name: name.trim(),
      contact_email: email.trim() || null,
      contact_phone: phone.trim() || null,
      address_or_room: addr.trim() || null,
      amount: amount ? Number(amount) : null,
      message: message.trim() || null,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="mt-5 rounded-2xl bg-success/10 border border-success/30 p-5 text-sm">
        <p className="font-semibold text-success">
          Thanks! We received your request and will email or text you a secure payment link shortly.
        </p>
        <p className="italic text-ink/70 mt-1">
          Merci ! Nous avons reçu votre demande et nous vous enverrons un lien de paiement sécurisé sous peu.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
      <label className="text-xs text-muted-foreground block sm:col-span-2">
        Full name · Nom complet *
        <input value={name} onChange={e => setName(e.target.value)} required
          className="mt-1 w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm" />
      </label>
      <label className="text-xs text-muted-foreground block">
        Email
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
          className="mt-1 w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm" />
      </label>
      <label className="text-xs text-muted-foreground block">
        Phone · Téléphone
        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
          className="mt-1 w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm" />
      </label>
      <label className="text-xs text-muted-foreground block sm:col-span-2">
        Address or room · Adresse ou chambre
        <input value={addr} onChange={e => setAddr(e.target.value)}
          placeholder="e.g. 102 Chemin d'Amour, Room 3"
          className="mt-1 w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm" />
      </label>
      <label className="text-xs text-muted-foreground block">
        Amount (CAD) · Montant
        <input type="number" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)}
          className="mt-1 w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm" />
      </label>
      <label className="text-xs text-muted-foreground block">
        Note (optional)
        <input value={message} onChange={e => setMessage(e.target.value)}
          className="mt-1 w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm" />
      </label>
      <p className="sm:col-span-2 text-[11px] text-muted-foreground">
        We'll only use this to send you a payment link. We never store card details.
      </p>
      <button type="submit" disabled={busy}
        className="touch-min sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-ink text-white px-5 py-3 font-bold hover:opacity-90 disabled:opacity-50">
        {busy && <Loader2 className="w-4 h-4 animate-spin" />}
        {busy ? "Sending…" : "Request payment link · Demander un lien"}
      </button>
    </form>
  );
}
