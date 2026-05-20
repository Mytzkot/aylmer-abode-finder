import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MessageCircle, Package } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/i18n/LanguageProvider";
import { CONTACT } from "@/data/properties";

export const Route = createFileRoute("/extras")({
  component: ExtrasPage,
  head: () => ({
    meta: [
      { title: "Extras & Add-ons — Zorba Rentals" },
      { name: "description", content: "Optional extras and add-ons available to Zorba tenants — storage, housekeeping, parking and more." },
      { property: "og:title", content: "Extras & Add-ons — Zorba Rentals" },
      { property: "og:description", content: "Optional extras and add-ons available to Zorba tenants." },
      { property: "og:url", content: "/extras" },
    ],
    links: [{ rel: "canonical", href: "/extras" }],
  }),
});

interface Addon {
  id: string;
  name: string;
  name_fr: string | null;
  description: string | null;
  description_fr: string | null;
  price: number | null;
  price_unit: string;
  image_url: string | null;
  active: boolean;
  sort_order: number;
}

function formatPrice(price: number | null, unit: string, lang: string): string {
  if (price == null) {
    return lang === "fr" ? "Sur demande" : "Contact for price";
  }
  const amount = `$${Number(price).toFixed(price % 1 === 0 ? 0 : 2)}`;
  const u = unit.toLowerCase();
  const map_en: Record<string, string> = {
    month: "/ month", monthly: "/ month",
    week: "/ week", weekly: "/ week",
    each: "each", one_time: "one-time", onetime: "one-time",
    hour: "/ hour", visit: "/ visit",
  };
  const map_fr: Record<string, string> = {
    month: "/ mois", monthly: "/ mois",
    week: "/ semaine", weekly: "/ semaine",
    each: "chacun", one_time: "unique", onetime: "unique",
    hour: "/ heure", visit: "/ visite",
  };
  const suffix = (lang === "fr" ? map_fr[u] : map_en[u]) || (lang === "fr" ? `/ ${unit}` : `/ ${unit}`);
  return `${amount} ${suffix}`;
}

function ExtrasPage() {
  const { lang } = useLang();
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("addons")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      setAddons((data as Addon[]) || []);
      setLoading(false);
    })();
  }, []);

  const heading_en = "Extras & Add-ons";
  const heading_fr = "Suppléments";
  const intro =
    lang === "fr"
      ? "Suppléments optionnels disponibles pour nos locataires. Demandez celui qui vous intéresse — nous vous répondrons rapidement."
      : lang === "ar"
        ? "إضافات اختيارية متاحة للمستأجرين. اطلب ما يهمك وسنعاود التواصل معك بسرعة."
        : "Optional add-ons available to our tenants. Request the one you'd like — we'll get back to you quickly.";
  const requestLabel =
    lang === "fr" ? "Demander ceci" : lang === "ar" ? "اطلب هذا" : "Request This";

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-8 md:py-12">
        <header className="mb-8 md:mb-10">
          <h1 className="font-display text-3xl md:text-5xl text-ink leading-tight">
            {heading_en} <span className="text-ink/40">/</span>{" "}
            <span className="text-brand">{heading_fr}</span>
          </h1>
          <p className="text-sm md:text-base text-ink/70 mt-3 max-w-2xl">{intro}</p>
        </header>

        {loading ? (
          <p className="text-ink">Loading…</p>
        ) : addons.length === 0 ? (
          <div className="bg-card border border-border/60 rounded-2xl p-8 text-center text-ink/70">
            <Package className="w-10 h-10 mx-auto mb-3 text-ink/40" />
            <p>
              {lang === "fr"
                ? "Aucun supplément disponible pour le moment."
                : "No extras available right now. Check back soon!"}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {addons.map((a) => {
              const name = lang === "fr" && a.name_fr ? a.name_fr : a.name;
              const desc = lang === "fr" && a.description_fr ? a.description_fr : a.description;
              const priceLabel = formatPrice(a.price, a.price_unit, lang);
              const waMessage = encodeURIComponent(
                lang === "fr"
                  ? `Bonjour ! Je suis intéressé(e) par : ${a.name} (${priceLabel}).`
                  : `Hi! I'm interested in: ${a.name} (${priceLabel}).`
              );
              const waLink = `${CONTACT.whatsapp}?text=${waMessage}`;
              return (
                <article
                  key={a.id}
                  className="bg-card rounded-3xl overflow-hidden shadow-sm border border-border/40 hover:shadow-xl hover:-translate-y-0.5 transition flex flex-col"
                >
                  <div className="aspect-[4/3] bg-cream-deep overflow-hidden flex items-center justify-center">
                    {a.image_url ? (
                      <img
                        src={a.image_url}
                        alt={name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-16 h-16 text-ink/20" strokeWidth={1.5} />
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1 gap-3">
                    <div>
                      <h3 className="font-display text-xl text-ink leading-tight">{name}</h3>
                      {a.name_fr && a.name_fr !== a.name && lang !== "fr" && (
                        <p className="text-xs text-ink/50 mt-0.5">{a.name_fr}</p>
                      )}
                    </div>
                    {desc && <p className="text-sm text-ink/70 leading-relaxed flex-1">{desc}</p>}
                    <p className="text-lg font-bold text-brand">{priceLabel}</p>
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-pill bg-[#25D366] text-white hover:brightness-110 text-sm px-4 py-2.5 font-bold justify-center"
                    >
                      <MessageCircle className="w-4 h-4" /> {requestLabel}
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
