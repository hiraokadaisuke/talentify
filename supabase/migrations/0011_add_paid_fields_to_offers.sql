ALTER TABLE public.offers
  ADD COLUMN IF NOT EXISTS paid boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS paid_at timestamp with time zone;
