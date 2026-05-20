import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ email: z.string().trim().email().max(255) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .insert({ email: data.email.toLowerCase() });
    if (error && !error.message.toLowerCase().includes("duplicate")) {
      console.error("subscribeNewsletter failed:", error);
      return { ok: false as const, error: "Could not subscribe. Please try again." };
    }
    return { ok: true as const };
  });
