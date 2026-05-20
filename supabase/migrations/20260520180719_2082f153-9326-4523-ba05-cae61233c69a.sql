-- Add features column to rooms for short feature highlights
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS features text[] DEFAULT '{}'::text[];

-- Addons table for the Extras page
CREATE TABLE IF NOT EXISTS public.addons (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  name_fr text,
  description text,
  description_fr text,
  price numeric(10,2),
  price_unit text NOT NULL DEFAULT 'each',
  image_url text,
  active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.addons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active addons"
  ON public.addons FOR SELECT
  USING (active = true);

CREATE POLICY "Admins manage addons"
  ON public.addons FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Requests table for "Request This" submissions on the Extras page
CREATE TABLE IF NOT EXISTS public.addon_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  addon_id uuid REFERENCES public.addons(id) ON DELETE SET NULL,
  addon_name text,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  quantity int NOT NULL DEFAULT 1,
  message text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.addon_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit addon requests"
  ON public.addon_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins view addon requests"
  ON public.addon_requests FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));