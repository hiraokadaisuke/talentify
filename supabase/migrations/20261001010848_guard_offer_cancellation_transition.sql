-- Historical migration recovered from the remote migration history.
-- The legacy trigger is removed by 20261001011319_normalize_offer_cancellation_schema.sql.

create or replace function public.validate_offer_cancellation_transition()
returns trigger
language plpgsql
set search_path to 'public', 'pg_temp'
as $function$
begin
  if old.status::text = 'canceled' then
    if new.status is distinct from old.status
       or new.canceled_at is distinct from old.canceled_at
       or new.canceled_by_role is distinct from old.canceled_by_role
       or new.cancel_reason is distinct from old.cancel_reason
       or new.cancellation_phase is distinct from old.cancellation_phase then
      raise exception 'Canceled offer record is immutable'
        using errcode = '23514';
    end if;
    return new;
  end if;

  if new.status::text = 'canceled' and old.status::text <> 'canceled' then
    if old.status::text not in ('pending','confirmed') then
      raise exception 'Offer cannot be canceled from status %', old.status
        using errcode = '23514';
    end if;

    if coalesce(old.paid,false) or old.visit_completed_at is not null then
      raise exception 'Completed or paid offer cannot be canceled'
        using errcode = '23514';
    end if;

    if old.status::text = 'pending' then
      if new.canceled_by_role <> 'store' or new.cancellation_phase <> 'pre_contract' then
        raise exception 'Pending offer cancellation must be pre-contract by store'
          using errcode = '23514';
      end if;
    else
      if new.canceled_by_role not in ('store','talent')
         or new.cancellation_phase <> 'post_contract' then
        raise exception 'Confirmed offer cancellation must be post-contract'
          using errcode = '23514';
      end if;

      if not exists (
        select 1 from public.invoices i
        where i.offer_id = old.id and i.status::text = 'approved'
      ) then
        raise exception 'Confirmed offer has no approved contract invoice'
          using errcode = '23514';
      end if;
    end if;
  end if;

  return new;
end
$function$;

drop trigger if exists trg_validate_offer_cancellation_transition on public.offers;

create trigger trg_validate_offer_cancellation_transition
before update of status, canceled_at, canceled_by_role, cancel_reason, cancellation_phase
on public.offers
for each row
execute function public.validate_offer_cancellation_transition();
