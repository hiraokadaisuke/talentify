-- Repair app auth state and profile integrity.
do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid=t.typnamespace
    where n.nspname='public' and t.typname='user_status'
  ) then
    create type public.user_status as enum (
      'pending_email_verification','onboarding','active','suspended'
    );
  end if;
end $$;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null,
  role text,
  status public.user_status not null default 'pending_email_verification',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_role_check check (role is null or role in ('store','talent','company'))
);

create index if not exists idx_users_email on public.users(email);
create index if not exists idx_users_role on public.users(role);
create index if not exists idx_users_status on public.users(status);
alter table public.users enable row level security;
revoke all on table public.users from public, anon, authenticated;
grant select on table public.users to authenticated;
grant select, insert, update, delete on table public.users to service_role, prisma;

drop policy if exists "users: read own app state" on public.users;
create policy "users: read own app state" on public.users
for select to authenticated using (auth_user_id=(select auth.uid()));

delete from public.stores s
where s.id='f864dbbd-156a-4ccf-ba17-a2e8c20e526b'::uuid
and coalesce(s.is_setup_complete,false)=false
and not exists(select 1 from public.offers o where o.store_id=s.id)
and not exists(select 1 from public.invoices i where i.store_id=s.id)
and not exists(select 1 from public.reviews r where r.store_id=s.id);

do $$
begin
  if not exists(select 1 from pg_constraint where conname='talents_user_id_unique') then
    alter table public.talents add constraint talents_user_id_unique unique(user_id);
  end if;
  if not exists(select 1 from pg_constraint where conname='companies_user_id_unique') then
    alter table public.companies add constraint companies_user_id_unique unique(user_id);
  end if;
end $$;

insert into public.users(auth_user_id,email,role,status)
select au.id, coalesce(au.email,''),
  case
    when exists(select 1 from public.talents t where t.user_id=au.id and coalesce(t.is_setup_complete,false)) then 'talent'
    when exists(select 1 from public.stores s where s.user_id=au.id and coalesce(s.is_setup_complete,false)) then 'store'
    when exists(select 1 from public.companies c where c.user_id=au.id and coalesce(c.is_setup_complete,false)) then 'company'
    when exists(select 1 from public.talents t where t.user_id=au.id) then 'talent'
    when exists(select 1 from public.stores s where s.user_id=au.id) then 'store'
    when exists(select 1 from public.companies c where c.user_id=au.id) then 'company'
    when au.raw_user_meta_data->>'role' in ('store','talent','company') then au.raw_user_meta_data->>'role'
    else null
  end,
  case
    when exists(select 1 from public.talents t where t.user_id=au.id and coalesce(t.is_setup_complete,false))
      or exists(select 1 from public.stores s where s.user_id=au.id and coalesce(s.is_setup_complete,false))
      or exists(select 1 from public.companies c where c.user_id=au.id and coalesce(c.is_setup_complete,false))
      then 'active'::public.user_status
    when au.email_confirmed_at is null then 'pending_email_verification'::public.user_status
    else 'onboarding'::public.user_status
  end
from auth.users au
on conflict(auth_user_id) do update set
  email=excluded.email,
  role=coalesce(public.users.role,excluded.role),
  status=case when public.users.status='suspended' then public.users.status else excluded.status end,
  updated_at=now();

create or replace function public.sync_app_user_from_profile()
returns trigger language plpgsql security definer
set search_path=public,pg_temp
as $$
declare v_role text;
begin
  v_role:=case TG_TABLE_NAME when 'stores' then 'store' when 'talents' then 'talent' when 'companies' then 'company' else null end;
  if new.user_id is null or v_role is null then return new; end if;
  update public.users
  set role=coalesce(role,v_role),
      status=case when status='suspended' then status when coalesce(new.is_setup_complete,false) then 'active'::public.user_status else 'onboarding'::public.user_status end,
      updated_at=now()
  where auth_user_id=new.user_id and (role is null or role=v_role);
  return new;
end $$;
revoke all on function public.sync_app_user_from_profile() from public,anon,authenticated;
grant execute on function public.sync_app_user_from_profile() to service_role,prisma;

drop trigger if exists sync_app_user_from_store on public.stores;
create trigger sync_app_user_from_store after insert or update of user_id,is_setup_complete on public.stores for each row execute function public.sync_app_user_from_profile();
drop trigger if exists sync_app_user_from_talent on public.talents;
create trigger sync_app_user_from_talent after insert or update of user_id,is_setup_complete on public.talents for each row execute function public.sync_app_user_from_profile();
drop trigger if exists sync_app_user_from_company on public.companies;
create trigger sync_app_user_from_company after insert or update of user_id,is_setup_complete on public.companies for each row execute function public.sync_app_user_from_profile();

create index if not exists idx_invoices_store_id on public.invoices(store_id);
create index if not exists idx_invoices_talent_id on public.invoices(talent_id);
create index if not exists idx_offers_user_id on public.offers(user_id);
create index if not exists idx_reviews_store_id on public.reviews(store_id);
create index if not exists idx_talents_company_id on public.talents(company_id);
