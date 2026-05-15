
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS square_location_id text UNIQUE;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS square_item_id text;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS square_variation_id text UNIQUE;

INSERT INTO public.properties (slug, short_name, address, city)
VALUES ('162-eddy', 'Eddy', '162 1/2 Eddy Street', 'Gatineau')
ON CONFLICT DO NOTHING;

UPDATE public.properties SET square_location_id = 'L06M71KPWNMHR' WHERE slug = '58-conrad';
UPDATE public.properties SET square_location_id = 'L5M8EQ1GTZ64M' WHERE slug = '102-amour';
UPDATE public.properties SET square_location_id = 'L3J7EMXKF5M5X' WHERE slug = '260-colline';
UPDATE public.properties SET square_location_id = 'LXZHHCPEKBM0S' WHERE slug = '162-eddy';
