
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Properties
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Gatineau',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view properties" ON public.properties FOR SELECT USING (true);
CREATE POLICY "Admins manage properties" ON public.properties FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Rooms
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  name TEXT,
  current_status TEXT NOT NULL DEFAULT 'Available',
  base_rate NUMERIC(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Admins manage rooms" ON public.rooms FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Applications
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending',
  stay_type TEXT,
  surname TEXT,
  first_name TEXT,
  telephone TEXT,
  email TEXT,
  date_of_birth DATE,
  present_address TEXT,
  reason_for_moving TEXT,
  current_landlord_name TEXT,
  current_landlord_phone TEXT,
  employer_name TEXT,
  employer_phone TEXT,
  monthly_income NUMERIC(10,2),
  is_student BOOLEAN DEFAULT false,
  school_name TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  reference_name TEXT,
  reference_phone TEXT,
  additional_occupants JSONB DEFAULT '[]'::jsonb,
  additional_information TEXT,
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit applications" ON public.applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view applications" ON public.applications FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update applications" ON public.applications FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Tenants
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  first_name TEXT,
  surname TEXT,
  email TEXT,
  telephone TEXT,
  lease_start DATE,
  lease_end DATE,
  monthly_rent NUMERIC(10,2),
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage tenants" ON public.tenants FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Payment ledger
CREATE TABLE public.payment_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  paid_on DATE NOT NULL DEFAULT CURRENT_DATE,
  method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.payment_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage payments" ON public.payment_ledger FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Approve application RPC
CREATE OR REPLACE FUNCTION public.approve_application(
  application_id UUID,
  room_id UUID,
  lease_term_months INT DEFAULT 12
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  app RECORD;
  rm  RECORD;
  new_tenant_id UUID;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can approve applications';
  END IF;

  SELECT * INTO app FROM public.applications WHERE id = application_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Application not found'; END IF;

  SELECT * INTO rm FROM public.rooms WHERE id = room_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Room not found'; END IF;

  INSERT INTO public.tenants (
    application_id, room_id, first_name, surname, email, telephone,
    lease_start, lease_end, monthly_rent, payment_status
  ) VALUES (
    app.id, rm.id, app.first_name, app.surname, app.email, app.telephone,
    CURRENT_DATE, CURRENT_DATE + (lease_term_months || ' months')::interval, rm.base_rate, 'unpaid'
  ) RETURNING id INTO new_tenant_id;

  UPDATE public.rooms SET current_status = 'Rented' WHERE id = room_id;
  UPDATE public.applications SET status = 'approved', room_id = room_id WHERE id = application_id;

  RETURN new_tenant_id;
END;
$$;
