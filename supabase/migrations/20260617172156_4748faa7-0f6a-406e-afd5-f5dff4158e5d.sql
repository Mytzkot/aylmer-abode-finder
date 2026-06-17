
REVOKE SELECT (square_location_id) ON public.properties FROM anon, authenticated;

REVOKE SELECT (square_item_id, square_variation_id) ON public.rooms FROM anon, authenticated;

DROP POLICY IF EXISTS "Public can upload application docs" ON storage.objects;
CREATE POLICY "Scoped upload to applications folder"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (
  bucket_id = 'application-docs'
  AND name ~ '^applications/[0-9a-f-]{36}\.(pdf|jpg|jpeg|png|webp|heic)$'
);

DROP POLICY IF EXISTS "Authenticated users can read public rooms channel" ON realtime.messages;
CREATE POLICY "Public rooms availability channel"
ON realtime.messages FOR SELECT TO anon, authenticated
USING (
  realtime.topic() = 'rooms-availability'
  AND extension = ANY (ARRAY['postgres_changes','presence','broadcast'])
);
