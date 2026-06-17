
CREATE POLICY "Public can upload application docs"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'application-docs');

CREATE POLICY "Admins can read application docs"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'application-docs' AND public.has_role(auth.uid(), 'admin'));
