ALTER TABLE public.talents
ADD COLUMN IF NOT EXISTS instagram text,
ADD COLUMN IF NOT EXISTS x text,
ADD COLUMN IF NOT EXISTS youtube text;
