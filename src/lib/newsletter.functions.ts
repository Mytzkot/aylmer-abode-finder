import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ----- Public: subscribe -----------------------------------------------------
export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ email: z.string().trim().email().max(255) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = data.email.toLowerCase();

    const { error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .insert({ email });

    const isDuplicate = error && error.message.toLowerCase().includes("duplicate");
    if (error && !isDuplicate) {
      console.error("subscribeNewsletter failed:", error);
      return { ok: false as const, error: "Could not subscribe. Please try again." };
    }

    // Fire-and-forget admin notification — never fail the user signup if this fails.
    try {
      await maybeNotifyAdminOfSignup(email);
    } catch (e) {
      console.error("admin signup notification failed:", e);
    }
    return { ok: true as const };
  });

async function maybeNotifyAdminOfSignup(_email: string) {
  // Sending requires a verified Lovable email sender domain. Until that's set
  // up, signups still land safely in `newsletter_subscribers` and are visible
  // in /admin/newsletter — no signup is ever silently lost.
  return;
}

async function trySendNewsletterEmail(_args: {
  recipientEmail: string;
  unsubscribeToken: string;
  idempotencyKey: string;
}): Promise<{ ok: true } | { ok: false; reason: "no-email-infra" | "send-failed"; message?: string }> {
  // Same as above — short-circuit until an email sender is configured.
  return { ok: false, reason: "no-email-infra" };
}

// ----- Public: validate + perform unsubscribe by token -----------------------
export const unsubscribeByToken = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      token: z.string().uuid(),
      confirm: z.boolean().optional(),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("id, email, unsubscribed_at")
      .eq("unsubscribe_token", data.token)
      .maybeSingle();
    if (error || !row) {
      return { ok: false as const, error: "Invalid or expired link." };
    }
    if (!data.confirm) {
      return {
        ok: true as const,
        email: row.email,
        alreadyUnsubscribed: !!row.unsubscribed_at,
      };
    }
    if (!row.unsubscribed_at) {
      const { error: upErr } = await supabaseAdmin
        .from("newsletter_subscribers")
        .update({ unsubscribed_at: new Date().toISOString() })
        .eq("id", row.id);
      if (upErr) {
        console.error("unsubscribe failed:", upErr);
        return { ok: false as const, error: "Could not unsubscribe. Please try again." };
      }
    }
    return { ok: true as const, email: row.email, alreadyUnsubscribed: true };
  });

// ----- Admin: list subscribers -----------------------------------------------
export const listNewsletterSubscribers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const isAdmin = await assertAdmin(context);
    if (!isAdmin) return { ok: false as const, subscribers: [], activeCount: 0 };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("id, email, created_at, unsubscribed_at")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("listNewsletterSubscribers failed:", error);
      return { ok: false as const, subscribers: [], activeCount: 0 };
    }
    const rows = (data ?? []) as Array<{
      id: string; email: string; created_at: string; unsubscribed_at: string | null;
    }>;
    return {
      ok: true as const,
      subscribers: rows,
      activeCount: rows.filter(r => !r.unsubscribed_at).length,
    };
  });

// ----- Admin: build email body (preview / send) ------------------------------
export const buildAvailabilityNewsletter = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const isAdmin = await assertAdmin(context);
    if (!isAdmin) {
      return { ok: false as const, subject_en: "", subject_fr: "", html: "", text: "", roomCount: 0, recipientCount: 0 };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [{ data: rooms }, { data: props }, { data: subs }] = await Promise.all([
      supabaseAdmin.from("rooms").select("id, name, current_status, base_rate, rate_monthly, property_id, externally_managed, manual_available"),
      supabaseAdmin.from("properties").select("id, short_name, address"),
      supabaseAdmin.from("newsletter_subscribers").select("id").is("unsubscribed_at", null),
    ]);

    const propsById: Record<string, { short_name: string; address: string }> = {};
    for (const p of (props ?? []) as Array<{ id: string; short_name: string; address: string }>) {
      propsById[p.id] = { short_name: p.short_name, address: p.address };
    }

    const isAvail = (r: any) => r.externally_managed
      ? !!r.manual_available
      : (r.current_status || "").toLowerCase() === "available";

    // Conrad prices are currently marked "coming soon" → skip price for Conrad.
    const conradId = Object.keys(propsById).find(id => propsById[id].short_name === "Conrad");

    const avail = (rooms ?? []).filter(isAvail);
    const items = avail.map((r: any) => {
      const prop = r.property_id ? propsById[r.property_id] : undefined;
      const price = r.rate_monthly ?? r.base_rate;
      const showPrice = !!price && r.property_id !== conradId;
      return {
        name: r.name || "Room",
        property: prop?.address || "",
        price: showPrice ? `$${Number(price).toFixed(0)}/mo` : null,
      };
    });

    const recipientCount = (subs ?? []).length;
    const html = renderNewsletterHtml(items);
    const text = renderNewsletterText(items);

    return {
      ok: true as const,
      subject_en: `Available rooms — Zorba Rentals (${items.length})`,
      subject_fr: `Chambres disponibles — Zorba Rentals (${items.length})`,
      html,
      text,
      roomCount: items.length,
      recipientCount,
    };
  });

// ----- Admin: send the newsletter --------------------------------------------
export const sendAvailabilityNewsletter = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const isAdmin = await assertAdmin(context);
    if (!isAdmin) return { ok: false as const, error: "Forbidden", sent: 0, recipientCount: 0 };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: subs, error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("id, email, unsubscribe_token")
      .is("unsubscribed_at", null);
    if (error) {
      console.error("sendAvailabilityNewsletter list failed:", error);
      return { ok: false as const, error: "Could not load subscribers.", sent: 0, recipientCount: 0 };
    }
    const recipients = (subs ?? []) as Array<{ id: string; email: string; unsubscribe_token: string }>;

    // Check if email infra is available
    let send: ((args: any) => Promise<any>) | null = null;
    try {
      const mod = await import("@/lib/email/send");
      send = mod.sendTransactionalEmail;
    } catch {
      return {
        ok: false as const,
        error: "Email sender is not yet configured. Set up a verified email domain to enable sending.",
        sent: 0,
        recipientCount: recipients.length,
        needsEmailSetup: true,
      };
    }

    let sent = 0;
    const failures: string[] = [];
    for (const r of recipients) {
      try {
        await send!({
          templateName: "availability-newsletter",
          recipientEmail: r.email,
          idempotencyKey: `availability-${r.id}-${new Date().toISOString().slice(0, 10)}`,
          templateData: { unsubscribeToken: r.unsubscribe_token },
        });
        sent++;
      } catch (e: any) {
        failures.push(`${r.email}: ${e?.message ?? "send failed"}`);
      }
    }
    if (failures.length) console.error("newsletter send failures:", failures);
    return { ok: true as const, sent, recipientCount: recipients.length, failures: failures.slice(0, 10) };
  });

// ----- helpers ---------------------------------------------------------------
async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase
    .rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (error) return false;
  return !!data;
}

function renderNewsletterText(items: Array<{ name: string; property: string; price: string | null }>) {
  const lines = items.length === 0
    ? ["No rooms currently available — we'll let you know when one opens up."]
    : items.map(i => `• ${i.name} — ${i.property}${i.price ? ` — ${i.price}` : ""}`);
  return [
    "Zorba Rentals — Available rooms / Chambres disponibles",
    "",
    "EN: Here are the rooms currently available:",
    ...lines,
    "",
    "See all rooms: https://aylmer-rooms-hub.lovable.app/rooms",
    "",
    "FR: Voici les chambres actuellement disponibles :",
    ...lines,
    "",
    "Toutes les chambres : https://aylmer-rooms-hub.lovable.app/rooms",
  ].join("\n");
}

function renderNewsletterHtml(items: Array<{ name: string; property: string; price: string | null }>) {
  const list = items.length === 0
    ? `<p style="margin:8px 0;color:#666">No rooms currently available — we'll let you know when one opens up.<br/><em>Aucune chambre disponible pour le moment — nous vous écrirons dès qu'une chambre se libère.</em></p>`
    : `<ul style="padding-left:20px;margin:8px 0">${items.map(i =>
        `<li style="margin:4px 0"><strong>${escapeHtml(i.name)}</strong> — ${escapeHtml(i.property)}${i.price ? ` — <strong>${escapeHtml(i.price)}</strong>` : ""}</li>`
      ).join("")}</ul>`;
  return `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#222">
  <h2 style="margin:0 0 8px 0">Available Rooms</h2>
  <p style="margin:0 0 4px 0;color:#555">Here's what's currently available at Zorba Rentals:</p>
  ${list}
  <p><a href="https://aylmer-rooms-hub.lovable.app/rooms" style="color:#E94E1B;font-weight:bold">See all rooms →</a></p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
  <h2 style="margin:0 0 8px 0" lang="fr">Chambres disponibles</h2>
  <p style="margin:0 0 4px 0;color:#555" lang="fr">Voici les chambres actuellement disponibles chez Zorba Rentals :</p>
  ${list}
  <p><a href="https://aylmer-rooms-hub.lovable.app/rooms" style="color:#E94E1B;font-weight:bold" lang="fr">Voir toutes les chambres →</a></p>
  <p style="margin-top:32px;color:#999;font-size:12px">
    You're receiving this because you signed up for room-availability updates.
    <a href="{{unsubscribeUrl}}" style="color:#999">Unsubscribe</a> ·
    <span lang="fr">Vous recevez cet e-mail parce que vous êtes inscrit aux mises à jour. <a href="{{unsubscribeUrl}}" style="color:#999">Se désabonner</a></span>
  </p>
</div>`;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
