-- Enforce allowed cancellation transitions at the database layer.
-- Pre-contract cancellation is store-only from pending.
-- Post-contract cancellation is allowed for either party from confirmed,
-- only while unpaid and before visit completion, and requires an approved contract invoice.

create or replace function public.prevent_cancellation_audit_change()
returns trigger
language plpgsql
set search_path to 'public', 'pg_temp'
as $function$
begin
  if old.status::text = 'canceled' then
    if new.status is distinct from old.status
       or new.canceled_at is distinct from old.canceled_at
       or new.canceled_by_role is distinct from old.canceled_by_role
       or new.canceled_by_user_id is distinct from old.canceled_by_user_id
       or new.cancellation_stage is distinct from old.cancellation_stage
       or new.cancellation_reason is distinct from old.cancellation_reason then
      raise exception 'Cancellation audit fields are immutable'
        using errcode = '23514';
    end if;
    return new;
  end if;

  if new.status::text = 'canceled' and old.status::text <> 'canceled' then
    if old.status::text not in ('pending', 'confirmed') then
      raise exception 'Offer cannot be canceled from status %', old.status
        using errcode = '23514';
    end if;

    if coalesce(old.paid, false) or old.visit_completed_at is not null then
      raise exception 'Completed or paid offer cannot be canceled'
        using errcode = '23514';
    end if;

    if old.status::text = 'pending' then
      if new.canceled_by_role <> 'store'
         or new.cancellation_stage <> 'pre_contract' then
        raise exception 'Pending offer cancellation must be pre-contract by store'
          using errcode = '23514';
      end if;
    else
      if new.canceled_by_role not in ('store', 'talent')
         or new.cancellation_stage <> 'post_contract' then
        raise exception 'Confirmed offer cancellation must be post-contract'
          using errcode = '23514';
      end if;

      if not exists (
        select 1
        from public.invoices i
        where i.offer_id = old.id
          and i.status::text = 'approved'
      ) then
        raise exception 'Confirmed offer has no approved contract invoice'
          using errcode = '23514';
      end if;
    end if;
  end if;

  return new;
end
$function$;
