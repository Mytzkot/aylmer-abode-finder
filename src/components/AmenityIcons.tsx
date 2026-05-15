import {
  Wifi,
  BedDouble,
  Utensils,
  WashingMachine,
  Tv,
  Snowflake,
  ParkingCircle,
  ShowerHead,
  Coffee,
  Lock,
  Bus,
  Sparkles,
} from "lucide-react";

const AMENITIES = [
  { icon: Wifi, label: "Wi-Fi" },
  { icon: BedDouble, label: "Furnished bed" },
  { icon: Utensils, label: "Shared kitchen" },
  { icon: WashingMachine, label: "Laundry" },
  { icon: ShowerHead, label: "Hot shower" },
  { icon: Tv, label: "Smart TV" },
  { icon: Snowflake, label: "Heat / AC" },
  { icon: Coffee, label: "Coffee" },
  { icon: ParkingCircle, label: "Parking" },
  { icon: Lock, label: "Private lock" },
  { icon: Bus, label: "STO transit" },
  { icon: Sparkles, label: "Cleaned weekly" },
];

export function AmenityIcons({ title = "What's included" }: { title?: string }) {
  return (
    <section className="bg-card border border-border rounded-2xl p-5">
      <h2 className="font-display text-2xl text-ink mb-4">{title}</h2>
      <ul className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {AMENITIES.map(({ icon: Icon, label }) => (
          <li
            key={label}
            className="flex flex-col items-center text-center gap-2 p-3 rounded-xl bg-cream"
          >
            <span className="inline-flex w-11 h-11 rounded-full bg-card items-center justify-center text-ink shadow-sm">
              <Icon className="w-5 h-5" strokeWidth={2.25} />
            </span>
            <span className="text-xs font-semibold text-ink leading-tight">
              {label}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
