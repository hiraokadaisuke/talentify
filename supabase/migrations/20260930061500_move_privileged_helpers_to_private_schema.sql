create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated, service_role, prisma;

create or replace function private.can_talent_read_store(store_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, private, pg_temp
as $function$
  select exists (
    select 1
    from public.offers o
    join public.talents t on t.id = o.talent_id
    where o.store_id = store_id
      and t.user_id = auth.uid()
  );
$function$;

revoke all on function private.can_talent_read_store(uuid) from public, anon;
grant execute on function private.can_talent_read_store(uuid) to authenticated, service_role, prisma;

drop policy if exists "stores_authorized_select" on public.stores;
create policy "stores_authorized_select"
on public.stores
for select to authenticated
using (
  user_id = (select auth.uid())
  or private.can_talent_read_store(id)
);

drop function if exists public.can_talent_read_store(uuid);

create or replace function private.get_available_talents(_date date)
returns table(talent_id uuid, availability public.availability_status)
language sql
stable
security definer
set search_path = public, private, pg_temp
as $function$
  select t.id, public.resolve_talent_availability(t.id, _date)
  from public.talents t
  where exists (
      select 1
      from public.stores s
      where s.user_id = auth.uid()
    )
    and t.is_profile_complete = true
    and public.resolve_talent_availability(t.id, _date) = 'ok'::public.availability_status;
$function$;

revoke all on function private.get_available_talents(date) from public, anon;
grant execute on function private.get_available_talents(date) to authenticated, service_role, prisma;

create or replace function public.get_available_talents(_date date)
returns table(talent_id uuid, availability public.availability_status)
language sql
stable
security invoker
set search_path = public, private, pg_temp
as $function$
  select * from private.get_available_talents(_date);
$function$;

revoke all on function public.get_available_talents(date) from public, anon;
grant execute on function public.get_available_talents(date) to authenticated, service_role;
