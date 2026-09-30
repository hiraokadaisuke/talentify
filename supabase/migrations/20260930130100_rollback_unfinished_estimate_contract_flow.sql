-- Restore the last known-good invoice schema after the estimate-flow experiment.
update public.invoices
set invoice_number = public.next_invoice_number()
where invoice_number is null or btrim(invoice_number) = '';

alter table public.invoices
  alter column invoice_number set default public.next_invoice_number(),
  alter column invoice_number set not null;

drop index if exists public.invoices_estimate_number_key;

alter table public.invoices
  drop column if exists contracted_at,
  drop column if exists estimate_number;

drop function if exists public.next_estimate_number();
drop sequence if exists public.estimate_number_seq;
