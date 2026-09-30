-- Generate immutable, human-readable invoice numbers at insert time.
-- Format example: INV-20260930-000001

create sequence if not exists public.invoice_number_seq;

create or replace function public.next_invoice_number()
returns text
language sql
volatile
set search_path = ''
as $$
  select
    'INV-' ||
    to_char(timezone('Asia/Tokyo', now()), 'YYYYMMDD') ||
    '-' ||
    lpad(nextval('public.invoice_number_seq')::text, 6, '0')
$$;

revoke all on function public.next_invoice_number() from public, anon, authenticated;
grant execute on function public.next_invoice_number() to service_role, prisma;

revoke all on sequence public.invoice_number_seq from public, anon, authenticated;
grant usage, select on sequence public.invoice_number_seq to service_role, prisma;

alter table public.invoices
  alter column invoice_number set default public.next_invoice_number();

update public.invoices
set invoice_number = public.next_invoice_number()
where invoice_number is null or btrim(invoice_number) = '';

alter table public.invoices
  alter column invoice_number set not null;

create unique index if not exists invoices_invoice_number_key
  on public.invoices (invoice_number);

comment on column public.invoices.invoice_number is
  'System-generated invoice number. Format: INV-YYYYMMDD-NNNNNN.';
