
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS available_from DATE;

-- Reset everything to not available
UPDATE public.rooms SET current_status = 'Occupied', manual_available = false, available_from = NULL;

-- Colline available rooms
UPDATE public.rooms SET current_status='Available', manual_available=true, available_from=NULL,
  base_rate=900, rate_monthly=900, youtube_video_url='https://youtube.com/shorts/n1vDCtbXrgM'
  WHERE id='5696ad4b-da29-463c-b0a7-f4f868e45ad0';
UPDATE public.rooms SET current_status='Available', manual_available=true, available_from=NULL,
  base_rate=900, rate_monthly=900, youtube_video_url='https://www.youtube.com/shorts/SuC_ZrG6pJo'
  WHERE id='0b5a821f-935b-4aab-9c08-91920bfbe7f7';
UPDATE public.rooms SET current_status='Available', manual_available=true, available_from=NULL,
  base_rate=750, rate_monthly=750, youtube_video_url='https://www.youtube.com/shorts/3jDUkQVanB0'
  WHERE id='5e18d2b9-40e3-41c4-b30c-b249487eb1c6';
UPDATE public.rooms SET current_status='Available', manual_available=true, available_from=NULL,
  base_rate=750, rate_monthly=750, youtube_video_url='https://www.youtube.com/shorts/mzsNaB5mkZ4'
  WHERE id='9290baac-ab76-4db6-8904-9496fca40579';

-- Conrad available rooms
UPDATE public.rooms SET current_status='Available', manual_available=true, available_from=NULL,
  base_rate=800, rate_monthly=800, youtube_video_url='https://youtube.com/shorts/zZc8imHtHDc'
  WHERE id='9da9e341-84f1-4c6e-a8c4-9532bfe55a0e';
UPDATE public.rooms SET current_status='Available', manual_available=true, available_from='2026-07-01',
  base_rate=1000, rate_monthly=1000, youtube_video_url='https://www.youtube.com/shorts/SuC_ZrG6pJo'
  WHERE id='783ab48e-482d-4bfb-8edd-9343409aa07c';
UPDATE public.rooms SET current_status='Available', manual_available=true, available_from='2026-07-01',
  base_rate=1350, rate_monthly=1350, youtube_video_url='https://www.youtube.com/shorts/LljmkvxF59U',
  features=ARRAY['Private bathroom']
  WHERE id='337b6be8-4609-43be-a8ff-697f547891c4';
