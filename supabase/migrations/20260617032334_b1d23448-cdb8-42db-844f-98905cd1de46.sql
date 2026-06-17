
ALTER TABLE public.rooms
  ADD COLUMN IF NOT EXISTS externally_managed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS manual_available boolean NOT NULL DEFAULT false;

UPDATE public.rooms
SET externally_managed = true, manual_available = false
WHERE property_id = (SELECT id FROM public.properties WHERE slug = '102-amour');
