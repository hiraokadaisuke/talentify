-- The invoices table and offers.paid/paid_at are the canonical payment state.
-- Remove the unused legacy payments table and obsolete bank fields from offers.

drop table if exists public.payments;

alter table public.offers
  drop column if exists bank_name,
  drop column if exists bank_branch,
  drop column if exists bank_account_number,
  drop column if exists bank_account_holder;
