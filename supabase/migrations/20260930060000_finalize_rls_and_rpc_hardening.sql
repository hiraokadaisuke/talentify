-- Final RLS/RPC normalization after the two-role and payout-account cleanup.

drop policy if exists "store_owner_select_own" on public.stores;
drop policy if exists "talent_can_read_offer_stores" on public.stores;
drop policy if exists "stores_authorized_select" on public.stores;
create policy "stores_authorized_select"
on public.stores for select to authenticated
using (
  user_id = (select auth.uid())
  or public.can_talent_read_store(id)
);

drop policy if exists "talent can read self" on public.talents;
drop policy if exists "store can view completed public talents" on public.talents;
drop policy if exists "talents_authorized_select" on public.talents;
create policy "talents_authorized_select"
on public.talents for select to authenticated
using (
  user_id = (select auth.uid())
  or (
    is_profile_complete = true
    and exists (
      select 1 from public.stores s
      where s.user_id = (select auth.uid())
    )
  )
);

drop policy if exists "payout owner select" on public.talent_payout_accounts;
drop policy if exists "payout related store select" on public.talent_payout_accounts;
drop policy if exists "payout_authorized_select" on public.talent_payout_accounts;
create policy "payout_authorized_select"
on public.talent_payout_accounts for select to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1
    from public.invoices i
    join public.stores s on s.id = i.store_id
    where i.talent_id = talent_payout_accounts.talent_id
      and s.user_id = (select auth.uid())
  )
);

revoke all on table public.notification_idempotency_keys from anon, authenticated;
grant select, insert, update, delete on table public.notification_idempotency_keys to service_role, prisma;

create or replace function public.get_available_talents(_date date)
returns table(talent_id uuid, availability public.availability_status)
language sql
stable
security definer
set search_path = public, pg_temp
as $function$
  select t.id, public.resolve_talent_availability(t.id, _date)
  from public.talents t
  where exists (
      select 1 from public.stores s
      where s.user_id = auth.uid()
    )
    and t.is_profile_complete = true
    and public.resolve_talent_availability(t.id, _date) = 'ok'::public.availability_status;
$function$;

revoke execute on function public.get_available_talents(date) from public, anon;
grant execute on function public.get_available_talents(date) to authenticated, service_role;

create or replace function public.get_offer_store_names(_offer_ids uuid[])
returns table(offer_id uuid, store_id uuid, store_display_name text)
language sql
security invoker
set search_path = public, pg_temp
as $function$
  with ids as (select unnest(_offer_ids) as id)
  select o.id, s.id, s.store_name
  from ids
  join public.offers o on o.id = ids.id
  join public.stores s on s.id = o.store_id
  where exists (
      select 1 from public.talents t
      where t.id = o.talent_id and t.user_id = auth.uid()
    )
    or exists (
      select 1 from public.stores st
      where st.id = o.store_id and st.user_id = auth.uid()
    );
$function$;

create or replace function public.get_reviews_for_current_talent()
returns table(
  review_id uuid,
  created_at timestamptz,
  rating integer,
  comment text,
  store_id uuid,
  store_name text
)
language sql
security invoker
set search_path = public, pg_temp
as $function$
  select r.id, r.created_at, r.rating, r.comment, s.id, s.store_name
  from public.reviews r
  join public.offers o on o.id = r.offer_id
  join public.stores s on s.id = r.store_id
  join public.talents t on t.id = r.talent_id
  where t.user_id = auth.uid()
  order by r.created_at desc;
$function$;
