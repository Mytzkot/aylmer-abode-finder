import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const incrementVisitorCount = createServerFn({ method: "POST" }).handler(
  async () => {
    const { data, error } = await supabaseAdmin.rpc("increment_site_visitors");
    if (error) {
      console.error("increment_site_visitors failed:", error);
      return { count: null as number | null };
    }
    return { count: Number(data ?? 0) };
  },
);

export const getVisitorCount = createServerFn({ method: "GET" }).handler(
  async () => {
    const { data, error } = await supabaseAdmin
      .from("site_stats")
      .select("visitor_count")
      .eq("id", "global")
      .maybeSingle();
    if (error || !data) return { count: 0 };
    return { count: Number(data.visitor_count ?? 0) };
  },
);
