alter table public.invoices
  add column if not exists contract_snapshot jsonb;
