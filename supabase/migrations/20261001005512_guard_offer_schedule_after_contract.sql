-- Prevent schedule edits once an offer leaves the pre-contract pending state.
-- This protects contracted/completed/canceled offers even from future server-side bugs.

create or replace function public.prevent_locked_offer_schedule_change()
returns trigger
language plpgsql
set search_path to 'public', 'pg_temp'
as $function$
begin
  if (
    new.date is distinct from old.date
    or new.start_time is distinct from old.start_time
    or new.end_time is distinct from old.end_time
    or new.time_range is distinct from old.time_range
  ) and (
    old.status::text <> 'pending'
    or new.status::text <> 'pending'
  ) then
    raise exception 'Offer schedule cannot be changed after contract flow has advanced'
      using errcode = '23514';
  end if;

  return new;
end
$function$;

drop trigger if exists trg_prevent_locked_offer_schedule_change on public.offers;

create trigger trg_prevent_locked_offer_schedule_change
before update of date, start_time, end_time, time_range, status
on public.offers
for each row
execute function public.prevent_locked_offer_schedule_change();
