-- Properly restrict square_location_id by removing broad table-level SELECT
-- and re-granting only safe columns to anon and authenticated.
REVOKE ALL ON public.properties FROM anon, authenticated;

GRANT SELECT (
  id, address, city, description, created_at, slug, short_name,
  google_maps_url, youtube_url, airbnb_url, image_urls
) ON public.properties TO anon, authenticated;

GRANT INSERT, UPDATE, DELETE ON public.properties TO authenticated;
GRANT ALL ON public.properties TO service_role;