CREATE TABLE public.tenant_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text,
  email text NOT NULL,
  location text NOT NULL,
  room_number text,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tenant_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit tenant messages"
  ON public.tenant_messages
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins manage tenant messages"
  ON public.tenant_messages
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));