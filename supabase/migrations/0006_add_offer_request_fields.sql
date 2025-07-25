ALTER TABLE public.offers
  ADD COLUMN IF NOT EXISTS second_date date,
  ADD COLUMN IF NOT EXISTS third_date date,
  ADD COLUMN IF NOT EXISTS time_range text,
  ADD COLUMN IF NOT EXISTS remarks text,
  ADD COLUMN IF NOT EXISTS agreed boolean;
