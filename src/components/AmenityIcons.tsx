import {
  Wifi, BedDouble, Utensils, WashingMachine, ShowerHead, Tv, Snowflake,
  Coffee, ParkingCircle, Lock, Bus, Sparkles, KeyRound, Camera, Armchair,
  CookingPot, Refrigerator, Shirt,
} from "lucide-react";

const AMENITIES = [
  { icon: Wifi, label: "Wi-Fi" },
  { icon: BedDouble, label: "Beds + linens" },
  { icon: CookingPot, label: "Full kitchen" },
  { icon: WashingMachine, label: "Free laundry" },
  { icon: ShowerHead, label: "Hot shower" },
  { icon: Tv, label: "Smart TV" },
  { icon: Snowflake, label: "Heat / AC" },
  { icon: Coffee, label: "Coffee/tea" },
  { icon: ParkingCircle, label: "Free parking" },
  { icon: KeyRound, label: "Keyless entry" },
  { icon: Lock, label: "Keypad lock" },
  { icon: Camera, label: "Security camera" },
  { icon: Armchair, label: "Workspace" },
  { icon: Refrigerator, label: "Mini-fridge" },
  { icon: Shirt, label: "Closet" },
  { icon: Sparkles, label: "Bi-weekly housekeeping" },
  { icon: Bus, label: "STO transit" },
  { icon: Utensils, label: "Cookware" },
];

export function AmenityIcons({ title = "What's included" }: { title?: string }) {
  return (
    <section className="bg-card border border-border rounded-2xl p-5">
      <h2 className="font-display text-2xl text-ink mb-4">{title}</h2>
      <ul className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {AMENITIES.map(({ icon: Icon, label }) => (
          <li
            key={label}
            className="group flex flex-col items-center text-center gap-2 p-3 rounded-xl"
          >
            <span className="inline-flex w-12 h-12 rounded-full bg-cream items-center justify-center text-ink border border-border group-hover:border-brand group-hover:text-brand transition">
              <Icon className="w-5 h-5" strokeWidth={2} />
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
