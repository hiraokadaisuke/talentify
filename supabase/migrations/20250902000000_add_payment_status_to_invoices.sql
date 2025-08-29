-- Add payment_status and paid_at to invoices
ALTER TABLE public.invoices
  ADD COLUMN payment_status public.payment_status NOT NULL DEFAULT 'pending',
  ADD COLUMN paid_at timestamptz;

-- Set default payment_status for existing rows
UPDATE public.invoices SET payment_status = 'pending' WHERE payment_status IS NULL;

-- Update RLS policies for invoices
DROP POLICY IF EXISTS "talent_or_store_update_invoices" ON public.invoices;
DROP POLICY IF EXISTS "stores_update_invoices" ON public.invoices;

-- Talents can update draft invoices
CREATE POLICY "talents_update_draft_invoices"
ON public.invoices FOR UPDATE
USING (auth.uid() = talent_id AND status = 'draft')
WITH CHECK (auth.uid() = talent_id AND status = 'draft');

-- Stores can update submitted or later invoices
CREATE POLICY "stores_update_submitted_invoices"
ON public.invoices FOR UPDATE
USING (auth.uid() = store_id AND status <> 'draft')
WITH CHECK (auth.uid() = store_id AND status <> 'draft');
