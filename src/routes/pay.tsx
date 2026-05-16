import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, Send, Banknote, Wallet, Smartphone } from "lucide-react";
import { T } from "@/i18n/LanguageProvider";
import { CONTACT } from "@/data/properties";

export const Route = createFileRoute("/pay")({ component: PayOnline });

const METHODS = [
  { name: "Credit / Debit Card", desc: "Visa, Mastercard, Amex via Stripe", icon: CreditCard, badge: "Stripe" },
  { name: "PayPal", desc: "Pay from your PayPal balance or linked card", icon: Wallet, badge: "PayPal" },
  { name: "Interac e-Transfer", desc: "Send to zorbagraphic@gmail.com (no fees)", icon: Send, badge: "e-Transfer" },
  { name: "Apple Pay / Google Pay", desc: "One-tap mobile checkout", icon: Smartphone, badge: "Mobile" },
  { name: "Bank Transfer", desc: "Ask us for direct deposit details", icon: Banknote, badge: "EFT" },
];

function PayOnline() {
  return (
    <main className="flex-1 mx-auto max-w-4xl w-full px-4 py-12 md:py-16">
      <header className="text-center mb-10">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-coral"><T>Monthly Tenants</T></p>
        <h1 className="font-display text-4xl md:text-5xl text-ink mt-2"><T>Pay Your Rent Online</T></h1>
        <p className="text-ink/70 mt-3 max-w-xl mx-auto">
          <T>Choose any payment method below. Online checkout is coming soon — for now, contact us and we'll send you a secure payment link.</T>
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {METHODS.map((m) => (
          <div key={m.name} className="rounded-2xl bg-card border border-border/60 p-5 hover:border-coral hover:shadow-lg transition">
            <div className="flex items-start justify-between gap-3">
              <div className="w-12 h-12 rounded-xl bg-surface-dark text-white flex items-center justify-center">
                <m.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded-md bg-cream text-ink">{m.badge}</span>
            </div>
            <h3 className="mt-4 font-display text-xl text-ink"><T>{m.name}</T></h3>
            <p className="text-sm text-ink/60 mt-1"><T>{m.desc}</T></p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-3xl bg-surface-dark text-white p-6 md:p-8 text-center">
        <h2 className="font-display text-2xl md:text-3xl"><T>Ready to pay?</T></h2>
        <p className="text-white/80 mt-2"><T>Message us and we'll send the right payment link for your method.</T></p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <a href={CONTACT.whatsapp} target="_blank" rel="noreferrer" className="btn-pill bg-[#25D366] text-white px-6 py-3 font-bold">WhatsApp</a>
          <a href={CONTACT.messenger} target="_blank" rel="noreferrer" className="btn-pill bg-[#0084FF] text-white px-6 py-3 font-bold">Messenger</a>
          <a href={CONTACT.email} className="btn-pill bg-white text-surface-dark px-6 py-3 font-bold">Email</a>
        </div>
      </div>
    </main>
  );
}
