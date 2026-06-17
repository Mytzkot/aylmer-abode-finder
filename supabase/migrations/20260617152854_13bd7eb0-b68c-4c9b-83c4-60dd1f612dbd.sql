
-- Card payment link requests submitted from /pay
CREATE TABLE public.card_payment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_email text,
  contact_phone text,
  address_or_room text,
  amount numeric,
  message text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.card_payment_requests TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.card_payment_requests TO authenticated;
GRANT ALL ON public.card_payment_requests TO service_role;
ALTER TABLE public.card_payment_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a card payment link request
CREATE POLICY "Anyone can submit a card payment request"
  ON public.card_payment_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins can read / manage
CREATE POLICY "Admins can read card payment requests"
  ON public.card_payment_requests FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update card payment requests"
  ON public.card_payment_requests FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete card payment requests"
  ON public.card_payment_requests FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Log of rent reminders sent (one row per send, manual or automated)
CREATE TABLE public.rent_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  month_start date NOT NULL,
  channel text NOT NULL,
  contact text,
  amount_due numeric,
  sent_at timestamptz NOT NULL DEFAULT now(),
  sent_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  notes text
);
GRANT SELECT, INSERT, DELETE ON public.rent_reminders TO authenticated;
GRANT ALL ON public.rent_reminders TO service_role;
ALTER TABLE public.rent_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read rent reminders"
  ON public.rent_reminders FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can log rent reminders"
  ON public.rent_reminders FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete rent reminders"
  ON public.rent_reminders FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX rent_reminders_tenant_month_idx ON public.rent_reminders (tenant_id, month_start DESC);
