CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_id uuid NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  talent_id uuid NOT NULL REFERENCES public.talents(id),
  store_id uuid NOT NULL REFERENCES public.stores(id),
  amount numeric NOT NULL,
  transportation_cost numeric DEFAULT 0,
  memo text,
  bank_account text,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE OR REPLACE FUNCTION update_invoice_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_invoices_updated_at
BEFORE UPDATE ON public.invoices
FOR EACH ROW EXECUTE FUNCTION update_invoice_updated_at();
