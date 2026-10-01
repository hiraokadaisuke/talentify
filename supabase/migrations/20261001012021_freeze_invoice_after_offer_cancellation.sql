-- Freeze invoice/estimate records after the related offer is canceled.
-- The approved contract snapshot and invoice remain readable as immutable history.

create or replace function public.prevent_canceled_offer_invoice_mutation()
returns trigger
language plpgsql
set search_path to 'public', 'pg_temp'
as $function$
begin
  if exists (
    select 1
    from public.offers o
    where o.id = new.offer_id
      and o.status::text = 'canceled'
  ) then
    raise exception 'Invoice cannot be changed after offer cancellation'
      using errcode = '23514';
  end if;

  return new;
end
$function$;

drop trigger if exists trg_prevent_canceled_offer_invoice_mutation on public.invoices;

create trigger trg_prevent_canceled_offer_invoice_mutation
before update on public.invoices
for each row
execute function public.prevent_canceled_offer_invoice_mutation();
