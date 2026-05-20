
CREATE TABLE IF NOT EXISTS public.site_stats (
  id text PRIMARY KEY,
  visitor_count bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.site_stats (id, visitor_count)
VALUES ('global', 0)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.site_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view site stats"
ON public.site_stats FOR SELECT
TO public USING (true);

CREATE POLICY "Admins manage site stats"
ON public.site_stats FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.increment_site_visitors()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count bigint;
BEGIN
  INSERT INTO public.site_stats (id, visitor_count, updated_at)
  VALUES ('global', 1, now())
  ON CONFLICT (id) DO UPDATE
    SET visitor_count = public.site_stats.visitor_count + 1,
        updated_at = now()
  RETURNING visitor_count INTO new_count;
  RETURN new_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_site_visitors() TO anon, authenticated;
