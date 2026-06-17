import { createFileRoute } from "@tanstack/react-router";
import { Send, CreditCard, Copy, Check } from "lucide-react";
import { useState } from "react";
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

  const cardRequestSubject = encodeURIComponent("Card payment link request");
  const cardRequestBody = encodeURIComponent(
    "Hi, I'd like to pay my rent by credit/debit card. Please send me a secure payment link.\n\n" +
      "Bonjour, j'aimerais payer mon loyer par carte de crédit/débit. Veuillez m'envoyer un lien de paiement sécurisé.\n\n" +
      "Name / Nom:\nAddress / Adresse:\nAmount / Montant:"
  );
  const cardEmail = `mailto:zorbagraphic@yahoo.com?subject=${cardRequestSubject}&body=${cardRequestBody}`;
  const cardWhatsApp = `${CONTACT.whatsapp}?text=${encodeURIComponent(
    "Hi, I'd like a card payment link for my rent. / Bonjour, j'aimerais un lien de paiement par carte pour mon loyer."
  )}`;

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
          Message us and we'll send you a secure payment link for your card.
        </p>
        <p className="text-sm text-ink/60 italic">
          Écrivez-nous et nous vous enverrons un lien de paiement sécurisé pour votre carte.
        </p>

        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <a
            href={cardWhatsApp}
            target="_blank"
            rel="noreferrer"
            className="touch-min flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] text-white px-5 py-3 font-bold hover:opacity-90"
          >
            Request via WhatsApp
          </a>
          <a
            href={cardEmail}
            className="touch-min flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-ink text-white px-5 py-3 font-bold hover:opacity-90"
          >
            Request via Email
          </a>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          A dedicated card payment service for rent is coming soon. ·
          <span className="italic"> Un service de paiement par carte dédié au loyer sera bientôt disponible.</span>
        </p>
      </section>
    </main>
  );
}
