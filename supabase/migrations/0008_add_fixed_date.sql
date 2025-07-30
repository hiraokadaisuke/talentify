ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS fixed_date date;
ALTER TYPE public.offer_status ADD VALUE IF NOT EXISTS 'confirmed';
