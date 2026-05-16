import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, CreditCard, Mail, MessageCircle } from "lucide-react";
import { T } from "@/i18n/LanguageProvider";

export const Route = createFileRoute("/portal")({ component: PortalPlaceholder });

function PortalPlaceholder() {
  return (
    <main className="flex-1 mx-auto max-w-3xl w-full px-4 py-12 md:py-16">
      <div className="rounded-3xl bg-card border border-border/60 p-8 md:p-12 text-center shadow-lg">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-surface-dark text-white flex items-center justify-center mb-5">
          <Lock className="w-7 h-7" />
        </div>
        <h1 className="font-display text-4xl md:text-5xl text-ink">
          <T>Tenant Portal</T>
        </h1>
        <p className="text-ink/70 mt-3 max-w-xl mx-auto">
          <T>
            Coming soon — current tenants will be able to sign in, pay rent online,
            view receipts, and message the landlord.
          </T>
        </p>

        <div className="mt-8 grid sm:grid-cols-3 gap-3 text-left">
          <div className="rounded-2xl bg-cream/60 p-4">
            <CreditCard className="w-5 h-5 text-coral" />
            <p className="mt-2 font-bold text-ink"><T>Pay Online</T></p>
            <p className="text-sm text-ink/60"><T>Card, PayPal, e-Transfer</T></p>
          </div>
          <div className="rounded-2xl bg-cream/60 p-4">
            <Mail className="w-5 h-5 text-coral" />
            <p className="mt-2 font-bold text-ink"><T>Receipts</T></p>
            <p className="text-sm text-ink/60"><T>Emailed automatically</T></p>
          </div>
          <div className="rounded-2xl bg-cream/60 p-4">
            <MessageCircle className="w-5 h-5 text-coral" />
            <p className="mt-2 font-bold text-ink"><T>Message landlord</T></p>
            <p className="text-sm text-ink/60"><T>Direct support inbox</T></p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/pay" className="btn-pill btn-coral px-6 py-3">
            <T>Pay Online Now</T>
          </Link>
          <Link to="/#contact" className="btn-pill btn-outline-ink px-6 py-3">
            <T>Contact Landlord</T>
          </Link>
        </div>
      </div>
    </main>
  );
}
