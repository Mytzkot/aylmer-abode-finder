CREATE TABLE IF NOT EXISTS public.monthly_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  year_month text NOT NULL,
  electricity numeric(10,2) NOT NULL DEFAULT 0,
  insurance numeric(10,2) NOT NULL DEFAULT 0,
  gas numeric(10,2) NOT NULL DEFAULT 0,
  internet numeric(10,2) NOT NULL DEFAULT 0,
  cleaning numeric(10,2) NOT NULL DEFAULT 0,
  labor_fees numeric(10,2) NOT NULL DEFAULT 0,
  maintenance numeric(10,2) NOT NULL DEFAULT 0,
  rent_mortgage numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (property_id, year_month)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.monthly_expenses TO authenticated;
GRANT ALL ON public.monthly_expenses TO service_role;

ALTER TABLE public.monthly_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage monthly expenses" ON public.monthly_expenses
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));