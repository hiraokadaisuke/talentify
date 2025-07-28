ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS notes text;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='offers' AND column_name='remarks'
  ) THEN
    UPDATE public.offers SET notes = remarks WHERE notes IS NULL;
    ALTER TABLE public.offers DROP COLUMN remarks;
  END IF;
END;
$$;
