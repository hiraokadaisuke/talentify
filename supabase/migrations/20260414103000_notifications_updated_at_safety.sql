-- Ensure notifications.updated_at exists and is maintained for sorting/reconciliation.
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

UPDATE public.notifications
SET updated_at = COALESCE(updated_at, created_at, now())
WHERE updated_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_user_updated_at_desc
  ON public.notifications (user_id, updated_at DESC, created_at DESC);
