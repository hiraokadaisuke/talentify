-- Remove the earlier trial cancellation fields in favour of the canonical
-- cancellation_reason / cancellation_stage / canceled_by_user_id audit fields.

drop trigger if exists trg_validate_offer_cancellation_transition on public.offers;
drop function if exists public.validate_offer_cancellation_transition();

alter table public.offers
  drop constraint if exists offers_cancel_reason_length_check,
  drop constraint if exists offers_canceled_record_check,
  drop constraint if exists offers_cancellation_phase_check;

alter table public.offers
  drop column if exists cancel_reason,
  drop column if exists cancellation_phase;
