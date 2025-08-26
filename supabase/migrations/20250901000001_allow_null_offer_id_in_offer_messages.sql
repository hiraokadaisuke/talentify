-- Allow direct messages without an offer by making offer_id nullable
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'offer_messages'
      AND column_name = 'offer_id'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.offer_messages
      ALTER COLUMN offer_id DROP NOT NULL;
  END IF;
END$$;
