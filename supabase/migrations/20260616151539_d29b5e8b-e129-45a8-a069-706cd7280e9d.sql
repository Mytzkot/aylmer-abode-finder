-- 1) Restrict square_location_id column on properties from public roles
REVOKE SELECT (square_location_id) ON public.properties FROM anon;
REVOKE SELECT (square_location_id) ON public.properties FROM authenticated;
GRANT SELECT (square_location_id) ON public.properties TO service_role;

-- 2) Allow public read access to room-images storage bucket so images render
DROP POLICY IF EXISTS "Public can read room images" ON storage.objects;
CREATE POLICY "Public can read room images"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'room-images');