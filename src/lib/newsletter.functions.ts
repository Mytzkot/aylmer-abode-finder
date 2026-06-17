import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ email: z.string().trim().email().max(255) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .insert({ email: data.email.toLowerCase() });
    if (error && !error.message.toLowerCase().includes("duplicate")) {
      console.error("subscribeNewsletter failed:", error);
      return { ok: false as const, error: "Could not subscribe. Please try again." };
    }
    return { ok: true as const };
  });

export const listNewsletterSubscribers = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("id, email, created_at")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("listNewsletterSubscribers failed:", error);
      return { ok: false as const, subscribers: [] as Array<{ id: string; email: string; created_at: string }> };
    }
    return { ok: true as const, subscribers: data ?? [] };
  });
