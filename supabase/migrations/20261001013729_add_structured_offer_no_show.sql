-- Record a store-reported no-show only after the contracted visit window ends.
-- No-show records are immutable audit history, block payment/review progression,
-- and keep the approved contract invoice readable but no longer editable.

alter table public.offers
  add column if not exists no_show_at timestamptz,
  add column if not exists no_show_reason text,
  add column if not exists no_show_reported_by_user_id uuid;

alter table public.offers
  drop constraint if exists offers_no_show_reason_length_check,
  drop constraint if exists offers_no_show_metadata_check;

alter table public.offers
  add constraint offers_no_show_reason_length_check
  check (no_show_reason is null or char_length(btrim(no_show_reason)) between 5 and 500);

alter table public.offers
  add constraint offers_no_show_metadata_check
  check (
    (
      status::text = 'no_show'
      and no_show_at is not null
      and no_show_reason is not null
      and char_length(btrim(no_show_reason)) between 5 and 500
      and no_show_reported_by_user_id is not null
      and coalesce(paid, false) is false
      and visit_completed_at is null
    )
    or
    (
      status::text <> 'no_show'
      and no_show_at is null
      and no_show_reason is null
      and no_show_reported_by_user_id is null
    )
  );

create or replace function public.prevent_no_show_audit_change()
returns trigger
language plpgsql
set search_path to 'public', 'pg_temp'
as $function$
begin
  if old.status::text = 'no_show' then
    if new.status is distinct from old.status
       or new.no_show_at is distinct from old.no_show_at
       or new.no_show_reason is distinct from old.no_show_reason
       or new.no_show_reported_by_user_id is distinct from old.no_show_reported_by_user_id then
      raise exception 'No-show audit fields are immutable' using errcode = '23514';
    end if;
    return new;
  end if;

  if new.status::text = 'no_show' and old.status::text <> 'no_show' then
    if old.status::text <> 'confirmed' then
      raise exception 'No-show can only be recorded for confirmed offers' using errcode = '23514';
    end if;
    if coalesce(old.paid, false) or old.visit_completed_at is not null then
      raise exception 'Completed or paid offer cannot be marked no-show' using errcode = '23514';
    end if;
    if now() < (old.end_time at time zone 'Asia/Tokyo') then
      raise exception 'No-show cannot be recorded before the scheduled end time' using errcode = '23514';
    end if;
    if not exists (
      select 1 from public.invoices i
      where i.offer_id = old.id and i.status::text = 'approved' and i.contract_snapshot is not null
    ) then
      raise exception 'Confirmed offer has no immutable contract snapshot' using errcode = '23514';
    end if;
    if not exists (
      select 1 from public.stores s
      where s.id = old.store_id and s.user_id = new.no_show_reported_by_user_id
    ) then
      raise exception 'No-show must be reported by the owning store user' using errcode = '23514';
    end if;
    if new.no_show_at is null
       or new.no_show_reason is null
       or char_length(btrim(new.no_show_reason)) not between 5 and 500 then
      raise exception 'A valid no-show reason is required' using errcode = '23514';
    end if;
  end if;
  return new;
end
$function$;

drop trigger if exists trg_prevent_no_show_audit_change on public.offers;
create trigger trg_prevent_no_show_audit_change
before update of status, no_show_at, no_show_reason, no_show_reported_by_user_id
on public.offers
for each row
execute function public.prevent_no_show_audit_change();

create or replace function public.prevent_canceled_offer_invoice_mutation()
returns trigger
language plpgsql
set search_path to 'public', 'pg_temp'
as $function$
begin
  if exists (
    select 1 from public.offers o
    where o.id = new.offer_id and o.status::text in ('canceled', 'no_show')
  ) then
    raise exception 'Invoice cannot be changed after offer closure' using errcode = '23514';
  end if;
  return new;
end
$function$;
