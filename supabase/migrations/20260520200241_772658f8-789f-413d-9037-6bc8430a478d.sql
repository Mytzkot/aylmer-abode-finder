CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_name text NOT NULL,
  rating numeric NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text NOT NULL,
  source text NOT NULL DEFAULT 'Airbnb',
  review_date date NOT NULL DEFAULT CURRENT_DATE,
  verified boolean NOT NULL DEFAULT true,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active reviews"
ON public.reviews FOR SELECT
USING (active = true);

CREATE POLICY "Admins manage reviews"
ON public.reviews FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.reviews (reviewer_name, rating, review_text, source, review_date, sort_order) VALUES
('Marie L.', 5, 'Super clean room, easy check-in, and the bus to downtown Ottawa was right there. Highly recommend for newcomers!', 'Airbnb', '2025-11-12', 1),
('James O.', 5, 'Affordable and exactly as described. Host was responsive and the place felt safe and welcoming.', 'Booking.com', '2025-10-28', 2),
('Aisha K.', 5, 'Perfect for my first month in Canada — no credit check made everything so easy. Quiet neighborhood.', 'Airbnb', '2025-09-15', 3),
('David T.', 4.5, 'Great value for monthly rent. Wi-Fi is fast and the kitchen is well-equipped. Would stay again.', 'Expedia', '2025-08-30', 4),
('Sophie M.', 5, 'Le propriétaire parle français — un vrai plus. Chambre meublée, propre, et bien située.', 'Airbnb', '2025-07-22', 5),
('Carlos R.', 5, 'Smooth move-in process. 15 min bus to downtown is true. Felt like home from day one.', 'Booking.com', '2025-06-10', 6);