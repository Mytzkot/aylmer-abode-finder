import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { supabase } from "@/lib/supabase";
import { PROPERTIES } from "@/data/properties";

// TODO: replace with your project URL once a custom domain is set.
const BASE_URL = "";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const staticPaths = [
          { path: "/", priority: "1.0", changefreq: "monthly" as const },
          { path: "/properties", priority: "0.9", changefreq: "monthly" as const },
          { path: "/rooms", priority: "0.9", changefreq: "monthly" as const },
          { path: "/apply", priority: "0.8", changefreq: "monthly" as const },
          { path: "/book", priority: "0.8", changefreq: "monthly" as const },
          { path: "/about", priority: "0.6", changefreq: "monthly" as const },
          { path: "/faq", priority: "0.6", changefreq: "monthly" as const },
          { path: "/transit", priority: "0.5", changefreq: "monthly" as const },
          { path: "/newcomer", priority: "0.5", changefreq: "monthly" as const },
        ];

        const propertyPaths = PROPERTIES.map((p) => ({
          path: `/properties/${p.id}`,
          priority: "0.8",
          changefreq: "monthly" as const,
        }));

        let roomPaths: { path: string; priority: string; changefreq: "monthly" }[] = [];
        try {
          const { data: rooms } = await supabase
            .from("rooms")
            .select("slug, property_id, properties(slug)")
            .not("property_id", "is", null);
          if (rooms) {
            roomPaths = (rooms as Array<{ slug: string | null; properties: { slug: string } | null }>)
              .filter((r) => r.slug && r.properties?.slug)
              .map((r) => ({
                path: `/properties/${r.properties!.slug}/${r.slug}`,
                priority: "0.7",
                changefreq: "monthly" as const,
              }));
          }
        } catch {
          // If the DB is briefly unavailable, still emit the static sitemap.
        }

        const entries = [...staticPaths, ...propertyPaths, ...roomPaths];
        const urls = entries.map(
          (e) =>
            `  <url>\n    <loc>${BASE_URL}${e.path}</loc>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`,
        );

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
