-- Prevent a no-show record from being created as a brand-new offer.
-- No-show must always be an audited transition from an existing confirmed offer.

create or replace function public.prevent_direct_no_show_insert()
returns trigger
language plpgsql
set search_path to 'public', 'pg_temp'
as $function$
begin
  if new.status::text = 'no_show' then
    raise exception 'No-show must be recorded as a transition from a confirmed offer'
      using errcode = '23514';
  end if;
  return new;
end
$function$;

drop trigger if exists trg_prevent_direct_no_show_insert on public.offers;

create trigger trg_prevent_direct_no_show_insert
before insert on public.offers
for each row
execute function public.prevent_direct_no_show_insert();
