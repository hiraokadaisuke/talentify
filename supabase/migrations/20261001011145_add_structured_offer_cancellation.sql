-- Canonical cancellation audit fields used by the application.

alter table public.offers
  add column if not exists cancellation_reason text,
  add column if not exists cancellation_stage text,
  add column if not exists canceled_by_user_id uuid;

alter table public.offers
  drop constraint if exists offers_cancellation_stage_check,
  drop constraint if exists offers_cancellation_reason_length_check,
  drop constraint if exists offers_cancellation_metadata_check;

alter table public.offers
  add constraint offers_cancellation_stage_check
  check (
    cancellation_stage is null
    or cancellation_stage in ('pre_contract', 'post_contract')
  );

alter table public.offers
  add constraint offers_cancellation_reason_length_check
  check (
    cancellation_reason is null
    or char_length(btrim(cancellation_reason)) between 5 and 500
  );

alter table public.offers
  add constraint offers_cancellation_metadata_check
  check (
    status::text <> 'canceled'
    or (
      canceled_at is not null
      and canceled_by_role in ('store', 'talent')
      and canceled_by_user_id is not null
      and cancellation_stage in ('pre_contract', 'post_contract')
      and cancellation_reason is not null
      and char_length(btrim(cancellation_reason)) between 5 and 500
    )
  );

create or replace function public.prevent_cancellation_audit_change()
returns trigger
language plpgsql
set search_path to 'public', 'pg_temp'
as $function$
begin
  if old.status::text = 'canceled' and (
    new.status is distinct from old.status
    or new.canceled_at is distinct from old.canceled_at
    or new.canceled_by_role is distinct from old.canceled_by_role
    or new.canceled_by_user_id is distinct from old.canceled_by_user_id
    or new.cancellation_stage is distinct from old.cancellation_stage
    or new.cancellation_reason is distinct from old.cancellation_reason
  ) then
    raise exception 'Cancellation audit fields are immutable'
      using errcode = '23514';
  end if;

  return new;
end
$function$;

drop trigger if exists trg_prevent_cancellation_audit_change on public.offers;

create trigger trg_prevent_cancellation_audit_change
before update of
  status,
  canceled_at,
  canceled_by_role,
  canceled_by_user_id,
  cancellation_stage,
  cancellation_reason
on public.offers
for each row
execute function public.prevent_cancellation_audit_change();
