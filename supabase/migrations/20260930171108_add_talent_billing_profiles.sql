create table if not exists public.talent_billing_profiles (
  talent_id uuid primary key references public.talents(id) on delete cascade,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  billing_name text,
  billing_address text,
  invoice_registration_number text,
  updated_at timestamptz not null default now()
);

alter table public.talent_billing_profiles enable row level security;

revoke all on table public.talent_billing_profiles from anon;
grant select, insert, update on table public.talent_billing_profiles to authenticated;

drop policy if exists "talent billing owner select" on public.talent_billing_profiles;
create policy "talent billing owner select"
  on public.talent_billing_profiles
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "talent billing owner insert" on public.talent_billing_profiles;
create policy "talent billing owner insert"
  on public.talent_billing_profiles
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.talents t
      where t.id = talent_id
        and t.user_id = (select auth.uid())
    )
  );

drop policy if exists "talent billing owner update" on public.talent_billing_profiles;
create policy "talent billing owner update"
  on public.talent_billing_profiles
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.talents t
      where t.id = talent_id
        and t.user_id = (select auth.uid())
    )
  );
