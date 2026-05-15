import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const SQUARE_API = "https://connect.squareup.com/v2";

interface SquareMoney { amount?: number; currency?: string }
interface SquareVariation {
  type: string;
  id: string;
  item_variation_data?: {
    item_id?: string;
    name?: string;
    price_money?: SquareMoney;
    pricing_type?: string;
  };
}
interface SquareItem {
  type: string;
  id: string;
  item_data?: {
    name?: string;
    description?: string;
    image_ids?: string[];
    variations?: SquareVariation[];
    present_at_location_ids?: string[];
  };
}
interface SquareImage {
  type: string;
  id: string;
  image_data?: { url?: string };
}

async function squareFetch(path: string, body: unknown, token: string) {
  const res = await fetch(`${SQUARE_API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Square-Version": "2024-10-17",
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Square ${path} ${res.status}: ${text}`);
  return JSON.parse(text);
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export const syncSquareCatalog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    // admin gate
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    if (!roles?.some((r) => r.role === "admin")) {
      throw new Error("Admin only");
    }

    const token = process.env.SQUARE_ACCESS_TOKEN;
    if (!token) throw new Error("SQUARE_ACCESS_TOKEN not configured");

    // Load properties + their square location ids
    const { data: properties, error: propErr } = await supabaseAdmin
      .from("properties")
      .select("id, slug, short_name, address, square_location_id")
      .not("square_location_id", "is", null);
    if (propErr) throw propErr;
    if (!properties?.length) throw new Error("No properties have square_location_id set");

    const propByLocation = new Map(properties.map((p) => [p.square_location_id!, p]));

    // Build name-prefix map: "amour" -> property, "conrad" -> property, "colline" -> property
    const propByNameKey = new Map<string, typeof properties[number]>();
    for (const p of properties) {
      const keys = [p.short_name, p.slug, p.address]
        .filter(Boolean)
        .map((s) => s!.toLowerCase());
      for (const k of keys) {
        // index by first word (e.g. "102 Chemin d'Amour" -> also index "amour")
        propByNameKey.set(k, p);
        const words = k.split(/[\s\-_]+/);
        for (const w of words) if (w.length >= 4) propByNameKey.set(w, p);
      }
    }

    function matchPropertyByName(itemName: string) {
      const lower = itemName.toLowerCase();
      for (const [key, prop] of propByNameKey) {
        if (lower.includes(key)) return prop;
      }
      return null;
    }

    // Pull all ITEM objects with images (no location filter — items are at "Main")
    const search = await squareFetch(
      "/catalog/search",
      {
        object_types: ["ITEM"],
        include_related_objects: true,
      },
      token,
    );

    const items: SquareItem[] = search.objects || [];
    const related: (SquareImage | SquareItem)[] = search.related_objects || [];
    const imageById = new Map<string, string>();
    for (const obj of related) {
      if (obj.type === "IMAGE") {
        const url = (obj as SquareImage).image_data?.url;
        if (url) imageById.set(obj.id, url);
      }
    }

    let upserted = 0;
    const errors: string[] = [];

    for (const item of items) {
      const itemName = item.item_data?.name || "Room";
      const description = item.item_data?.description || null;
      const imageUrls = (item.item_data?.image_ids || [])
        .map((id) => imageById.get(id))
        .filter((u): u is string => !!u);
      const presentAt = item.item_data?.present_at_location_ids || [];

      // Pick first matching property location
      const locId = presentAt.find((l) => propByLocation.has(l));
      if (!locId) continue;
      const property = propByLocation.get(locId)!;

      const variations = item.item_data?.variations || [];
      const variationsToUse = variations.length ? variations : [{ type: "ITEM_VARIATION", id: item.id, item_variation_data: { name: "" } } as SquareVariation];

      for (const v of variationsToUse) {
        const vName = v.item_variation_data?.name?.trim();
        const fullName = vName && vName.toLowerCase() !== "regular" ? `${itemName} — ${vName}` : itemName;
        const priceCents = v.item_variation_data?.price_money?.amount;
        const rate = priceCents != null ? priceCents / 100 : null;
        const slug = slugify(`${property.slug}-${fullName}`);

        const row = {
          square_variation_id: v.id,
          square_item_id: item.id,
          property_id: property.id,
          name: fullName,
          slug,
          description_en: description,
          rate_monthly: rate,
          base_rate: rate,
          image_urls: imageUrls,
        };

        const { error } = await supabaseAdmin
          .from("rooms")
          .upsert(row, { onConflict: "square_variation_id" });
        if (error) errors.push(`${fullName}: ${error.message}`);
        else upserted++;
      }
    }

    return { ok: true, upserted, items: items.length, errors };
  });
