
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS program_of_study TEXT,
  ADD COLUMN IF NOT EXISTS study_start_date DATE,
  ADD COLUMN IF NOT EXISTS country_of_origin TEXT,
  ADD COLUMN IF NOT EXISTS student_document_path TEXT;
