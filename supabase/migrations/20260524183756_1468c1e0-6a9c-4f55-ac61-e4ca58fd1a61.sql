
-- 1) Remove tenants from realtime publication (prevents PII broadcast)
ALTER PUBLICATION supabase_realtime DROP TABLE public.tenants;

-- 2) Restrict Square payment IDs on rooms: revoke column SELECT from anon/authenticated.
-- Grant SELECT on remaining columns explicitly.
REVOKE SELECT ON public.rooms FROM anon, authenticated;
GRANT SELECT (
  id, property_id, name, current_status, base_rate, notes, created_at,
  room_number, slug, image_urls, rate_monthly, rate_weekly, rate_nightly,
  youtube_video_url, booked_until, description_en, description_fr,
  features, airbnb_listing_url
) ON public.rooms TO anon, authenticated;
-- Service role retains full access by default.

-- 3) Lock down SECURITY DEFINER helper functions
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_site_visitors() FROM PUBLIC, anon, authenticated;
