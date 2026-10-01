-- Historical migration recovered from the remote migration history.
-- These legacy fields are removed by 20261001011319_normalize_offer_cancellation_schema.sql.

alter table public.offers
  add column if not exists cancel_reason text,
  add column if not exists cancellation_phase text;

alter table public.offers
  drop constraint if exists offers_cancel_reason_length_check,
  drop constraint if exists offers_cancellation_phase_check,
  drop constraint if exists offers_canceled_record_check;

alter table public.offers
  add constraint offers_cancel_reason_length_check
  check (
    cancel_reason is null
    or char_length(btrim(cancel_reason)) between 5 and 1000
  );

alter table public.offers
  add constraint offers_cancellation_phase_check
  check (
    cancellation_phase is null
    or cancellation_phase in ('pre_contract', 'post_contract')
  );

alter table public.offers
  add constraint offers_canceled_record_check
  check (
    status::text <> 'canceled'
    or (
      canceled_at is not null
      and canceled_by_role in ('store', 'talent')
      and cancel_reason is not null
      and char_length(btrim(cancel_reason)) between 5 and 1000
      and cancellation_phase in ('pre_contract', 'post_contract')
    )
  );
