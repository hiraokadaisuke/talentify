-- Talentify baseline hardening and GitHub/Supabase integration baseline.
-- Existing business/test rows are preserved.

drop table if exists public.messages_old;

alter table public.talent_availability_overrides enable row level security;

drop policy if exists "talent overrides: owner read" on public.talent_availability_overrides;
drop policy if exists "talent overrides: owner insert" on public.talent_availability_overrides;
drop policy if exists "talent overrides: owner update" on public.talent_availability_overrides;
drop policy if exists "talent overrides: owner delete" on public.talent_availability_overrides;

create policy "talent overrides: owner read"
on public.talent_availability_overrides
for select
to authenticated
using (
  exists (
    select 1
    from public.talents t
    where t.id = talent_availability_overrides.talent_id
      and t.user_id = (select auth.uid())
  )
);

create policy "talent overrides: owner insert"
on public.talent_availability_overrides
for insert
to authenticated
with check (
  exists (
    select 1
    from public.talents t
    where t.id = talent_availability_overrides.talent_id
      and t.user_id = (select auth.uid())
  )
);

create policy "talent overrides: owner update"
on public.talent_availability_overrides
for update
to authenticated
using (
  exists (
    select 1
    from public.talents t
    where t.id = talent_availability_overrides.talent_id
      and t.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.talents t
    where t.id = talent_availability_overrides.talent_id
      and t.user_id = (select auth.uid())
  )
);

create policy "talent overrides: owner delete"
on public.talent_availability_overrides
for delete
to authenticated
using (
  exists (
    select 1
    from public.talents t
    where t.id = talent_availability_overrides.talent_id
      and t.user_id = (select auth.uid())
  )
);

drop view if exists public.public_talent_profiles;
create view public.public_talent_profiles
with (security_invoker = true)
as
select
  id,
  display_name,
  stage_name,
  genre,
  area,
  avatar_url,
  rating,
  rate,
  bio
from public.talents
where is_profile_complete = true;

revoke all on table public.public_talent_profiles from public, anon, authenticated;
grant select on table public.public_talent_profiles to authenticated, service_role, prisma;

drop policy if exists offer_receipt_upsert on public.offer_read_receipts;
drop policy if exists offer_receipt_select on public.offer_read_receipts;

create policy offer_receipt_select
on public.offer_read_receipts
for select
to authenticated
using (
  exists (
    select 1
    from public.offers o
    where o.id = offer_read_receipts.offer_id
      and (
        o.user_id = (select auth.uid())
        or exists (
          select 1 from public.stores s
          where s.id = o.store_id and s.user_id = (select auth.uid())
        )
        or exists (
          select 1 from public.talents t
          where t.id = o.talent_id and t.user_id = (select auth.uid())
        )
      )
  )
);

create policy offer_receipt_insert
on public.offer_read_receipts
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.offers o
    where o.id = offer_read_receipts.offer_id
      and (
        o.user_id = (select auth.uid())
        or exists (
          select 1 from public.stores s
          where s.id = o.store_id and s.user_id = (select auth.uid())
        )
        or exists (
          select 1 from public.talents t
          where t.id = o.talent_id and t.user_id = (select auth.uid())
        )
      )
  )
);

create policy offer_receipt_update
on public.offer_read_receipts
for update
to authenticated
using (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.offers o
    where o.id = offer_read_receipts.offer_id
      and (
        o.user_id = (select auth.uid())
        or exists (
          select 1 from public.stores s
          where s.id = o.store_id and s.user_id = (select auth.uid())
        )
        or exists (
          select 1 from public.talents t
          where t.id = o.talent_id and t.user_id = (select auth.uid())
        )
      )
  )
)
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.offers o
    where o.id = offer_read_receipts.offer_id
      and (
        o.user_id = (select auth.uid())
        or exists (
          select 1 from public.stores s
          where s.id = o.store_id and s.user_id = (select auth.uid())
        )
        or exists (
          select 1 from public.talents t
          where t.id = o.talent_id and t.user_id = (select auth.uid())
        )
      )
  )
);

drop function if exists public.talent_accept_offer(uuid);
drop function if exists public.talent_reject_offer(uuid, text);
drop function if exists public.talent_update_offer_status(uuid, text, text);

revoke all on function public.can_talent_read_store(uuid) from public, anon, authenticated;
grant execute on function public.can_talent_read_store(uuid) to authenticated;

revoke all on function public.get_available_talents(date) from public, anon, authenticated;
grant execute on function public.get_available_talents(date) to authenticated;

revoke all on function public.get_offer_store_names(uuid[]) from public, anon, authenticated;
grant execute on function public.get_offer_store_names(uuid[]) to authenticated;

revoke all on function public.get_reviews_for_current_talent() from public, anon, authenticated;
grant execute on function public.get_reviews_for_current_talent() to authenticated;

revoke all on function public.create_payment_on_offer_confirmed() from public, anon, authenticated;
revoke all on function public.handle_review_insert() from public, anon, authenticated;
revoke all on function public.normalize_participants_key() from public, anon, authenticated;
revoke all on function public.notify_review_received() from public, anon, authenticated;
revoke all on function public.notify_talent_on_offer_created() from public, anon, authenticated;
revoke all on function public.notify_talent_on_payment_created() from public, anon, authenticated;
revoke all on function public.notify_talent_on_review_created() from public, anon, authenticated;
revoke all on function public.reviews_fill_and_validate() from public, anon, authenticated;
revoke all on function public.set_review_store_id() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.update_updated_at_column() from public, anon, authenticated;

alter function public.handle_review_insert() set search_path = public, pg_temp;
alter function public.notify_talent_on_review_created() set search_path = public, pg_temp;
alter function public.is_self_talent(uuid) set search_path = public, pg_temp;
alter function public.normalize_participants_key() set search_path = public, pg_temp;
alter function public.reviews_fill_and_validate() set search_path = public, pg_temp;
alter function public.can_talent_read_store(uuid) set search_path = public, pg_temp;
alter function public.set_updated_at() set search_path = public, pg_temp;
alter function public.set_review_store_id() set search_path = public, pg_temp;
alter function public.is_offer_blocking(text) set search_path = public, pg_temp;
alter function public.resolve_talent_availability(uuid, date) set search_path = public, pg_temp;
alter function public.update_updated_at_column() set search_path = public, pg_temp;

drop index if exists public.invoices_offer_unique_idx;
drop index if exists public.offer_messages_offer_id_created_idx;
drop index if exists public.payments_offer_id_unique;
drop index if exists public.payments_offer_unique_idx;
