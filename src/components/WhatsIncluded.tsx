import { Link } from "@tanstack/react-router";
import {
  Wifi, Tv, BedDouble, Briefcase, Coffee, Bath, Car, KeyRound,
  ChefHat, Sparkles, ShieldCheck, Award,
} from "lucide-react";
import { T } from "@/i18n/LanguageProvider";
import { PROPERTIES } from "@/data/properties";

const INCLUDED = [
  { Icon: Wifi, label: "Utilities & fast Wi-Fi" },
  { Icon: Tv, label: "32\" Roku Smart TV in every room" },
  { Icon: BedDouble, label: "Queen bed + linens & duvet" },
  { Icon: Briefcase, label: "Desk, chair & wardrobe" },
  { Icon: Coffee, label: "Mini-fridge, kettle & coffee maker in room" },
  { Icon: Bath, label: "Towels, bedding & toiletries" },
  { Icon: Car, label: "Free parking & free laundry" },
  { Icon: KeyRound, label: "Keypad locks on all doors, self check-in" },
  { Icon: ChefHat, label: "Full kitchen (stove, microwave, air fryer, fridge/freezer, dishes)" },
  { Icon: Sparkles, label: "Bi-weekly housekeeping of common areas" },
  { Icon: ShieldCheck, label: "Quiet & professionally managed — students & working professionals" },
];

interface Props {
  variant?: "full" | "condensed";
}

export function WhatsIncluded({ variant = "condensed" }: Props) {
  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <h2 className="font-display text-3xl md:text-5xl text-ink text-center">
          <T>Monthly Furnished Rooms in 3 Guest Houses</T>
        </h2>
        <p className="mt-5 text-center text-ink/75 text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
          <T>Month-to-month furnished rooms in Aylmer-Gatineau — only 8km to downtown Hull/Ottawa. Only first month's rent to move in, no credit score needed. Perfect for students — one bus ride to UQO (10 min). Monthly rates $750–$1600 depending on room size and availability. Great for students, newcomers, and working professionals.</T>
        </p>

        <div className="mt-10">
          <p className="text-center text-xs font-bold uppercase tracking-[0.18em] text-brand mb-6">
            <T>All Included</T>
          </p>
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {INCLUDED.map(({ Icon, label }) => (
              <div
                key={label}
                className="flex items-start gap-3 rounded-2xl bg-card border border-border/50 p-4 shadow-sm"
              >
                <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" strokeWidth={2.25} />
                </div>
                <p className="text-sm md:text-[15px] text-ink/85 leading-snug pt-1.5">
                  <T>{label}</T>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Credibility badge */}
        <div className="mt-10 mx-auto max-w-3xl">
          <div className="flex items-start gap-4 rounded-3xl bg-surface-dark text-white p-5 md:p-6 shadow-lg">
            <div className="w-12 h-12 rounded-full bg-coral text-surface-dark flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <p className="text-sm md:text-base leading-relaxed font-medium">
              <T>Professionally managed & secure. We've hosted 4,000+ guests on Airbnb, Expedia and Booking.com with 4+ star ratings.</T>
            </p>
          </div>
        </div>

        {variant === "full" && (
          <div className="mt-12 mx-auto max-w-3xl">
            <h3 className="font-display text-2xl md:text-3xl text-ink text-center mb-6">
              <T>The 3 Guest Houses</T>
            </h3>
            <ul className="space-y-3">
              {PROPERTIES.map((p, i) => {
                const fullAddress = [
                  "102 Chemin d'Amour, Gatineau, J9H 5V4",
                  "58 Rue Conrad-Valéra, Gatineau, J9J 3L7",
                  "260 Avenue de la Colline, Gatineau, J9J 1M1",
                ][i];
                return (
                  <li key={p.id}>
                    <Link
                      to="/properties/$id"
                      params={{ id: p.id }}
                      className="block rounded-2xl bg-card border border-border/50 p-4 hover:border-brand hover:shadow-md transition"
                    >
                      <span className="font-display text-lg text-ink">{fullAddress}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
