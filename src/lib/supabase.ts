import { createClient } from "@supabase/supabase-js";

// User will paste their existing Supabase project's URL and anon key.
// Keys can be replaced here directly OR provided via VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.
const SUPABASE_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL || "https://YOUR-PROJECT.supabase.co";
const SUPABASE_ANON_KEY =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "YOUR-ANON-KEY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});

export const isSupabaseConfigured = !SUPABASE_URL.includes("YOUR-PROJECT");
