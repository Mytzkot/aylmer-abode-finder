-- PROPERTIES: add new fields
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS slug text UNIQUE,
  ADD COLUMN IF NOT EXISTS short_name text,
  ADD COLUMN IF NOT EXISTS google_maps_url text,
  ADD COLUMN IF NOT EXISTS youtube_url text,
  ADD COLUMN IF NOT EXISTS airbnb_url text,
  ADD COLUMN IF NOT EXISTS image_urls text[] DEFAULT '{}'::text[];

-- ROOMS: add new fields
ALTER TABLE public.rooms
  ADD COLUMN IF NOT EXISTS room_number text,
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS image_urls text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS rate_monthly numeric,
  ADD COLUMN IF NOT EXISTS rate_weekly numeric,
  ADD COLUMN IF NOT EXISTS rate_nightly numeric,
  ADD COLUMN IF NOT EXISTS youtube_video_url text,
  ADD COLUMN IF NOT EXISTS airbnb_listing_url text,
  ADD COLUMN IF NOT EXISTS booked_until date,
  ADD COLUMN IF NOT EXISTS description_en text,
  ADD COLUMN IF NOT EXISTS description_fr text;

CREATE UNIQUE INDEX IF NOT EXISTS rooms_property_slug_uidx
  ON public.rooms (property_id, slug);

-- Seed properties (idempotent on slug)
INSERT INTO public.properties (slug, short_name, address, city, google_maps_url, youtube_url)
VALUES
  ('102-amour', 'Amour', '102 Chemin d''Amour', 'Gatineau',
   'https://www.google.com/maps/search/?api=1&query=102+Chemin+d''Amour+Gatineau+QC',
   'https://www.youtube.com/@shakeshake-m7t'),
  ('58-conrad', 'Conrad', '58 Rue Conrad Valéra', 'Gatineau',
   'https://www.google.com/maps/search/?api=1&query=58+Rue+Conrad+Valéra+Gatineau+QC',
   'https://www.youtube.com/@shakeshake-m7t'),
  ('260-colline', 'Colline', '260 Av. de la Colline', 'Gatineau',
   'https://www.google.com/maps/search/?api=1&query=260+Avenue+de+la+Colline+Gatineau+QC',
   'https://www.youtube.com/@shakeshake-m7t')
ON CONFLICT (slug) DO NOTHING;

-- Seed two starter rooms per property
DO $$
DECLARE p RECORD; i int;
BEGIN
  FOR p IN SELECT id, short_name FROM public.properties WHERE slug IN ('102-amour','58-conrad','260-colline') LOOP
    FOR i IN 1..2 LOOP
      INSERT INTO public.rooms (property_id, name, room_number, slug, current_status, base_rate, rate_monthly, rate_weekly, rate_nightly)
      SELECT p.id,
             p.short_name || ' - Room ' || i || ' / Chambre ' || i,
             i::text,
             'room-' || i,
             'Available',
             750, 750, 400, 80
      WHERE NOT EXISTS (
        SELECT 1 FROM public.rooms r WHERE r.property_id = p.id AND r.slug = 'room-' || i
      );
    END LOOP;
  END LOOP;
END $$;