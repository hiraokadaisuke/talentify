-- Reframe the existing invoice record as an estimate that becomes a
-- contract+invoice when the hall approves it.

create sequence if not exists public.estimate_number_seq;

create or replace function public.next_estimate_number()
returns text
language sql
volatile
set search_path = ''
as $$
  select
    'EST-' ||
    to_char(timezone('Asia/Tokyo', now()), 'YYYYMMDD') ||
    '-' ||
    lpad(nextval('public.estimate_number_seq')::text, 6, '0')
$$;

revoke all on function public.next_estimate_number() from public, anon, authenticated;
grant execute on function public.next_estimate_number() to service_role, prisma;
revoke all on sequence public.estimate_number_seq from public, anon, authenticated;
grant usage, select on sequence public.estimate_number_seq to service_role, prisma;

alter table public.invoices
  add column if not exists estimate_number text,
  add column if not exists contracted_at timestamptz;

update public.invoices
set estimate_number = public.next_estimate_number()
where estimate_number is null or btrim(estimate_number) = '';

alter table public.invoices
  alter column estimate_number set default public.next_estimate_number(),
  alter column estimate_number set not null,
  alter column invoice_number drop not null,
  alter column invoice_number drop default;

create unique index if not exists invoices_estimate_number_key
  on public.invoices (estimate_number);
