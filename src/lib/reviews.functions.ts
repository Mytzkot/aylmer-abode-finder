import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getActiveReviews = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("reviews")
    .select("id, reviewer_name, rating, review_text, source, review_date, verified")
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("review_date", { ascending: false })
    .limit(12);
  if (error) throw new Error(error.message);
  return { reviews: data ?? [] };
});
