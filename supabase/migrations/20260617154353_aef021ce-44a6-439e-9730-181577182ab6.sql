
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS desired_move_in_date date,
  ADD COLUMN IF NOT EXISTS first_time_renter boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS source_of_income text,
  ADD COLUMN IF NOT EXISTS present_occupation text,
  ADD COLUMN IF NOT EXISTS employment_duration text,
  ADD COLUMN IF NOT EXISTS employer_address text,
  ADD COLUMN IF NOT EXISTS reference_1_name text,
  ADD COLUMN IF NOT EXISTS reference_1_phone text,
  ADD COLUMN IF NOT EXISTS reference_2_name text,
  ADD COLUMN IF NOT EXISTS reference_2_phone text;
