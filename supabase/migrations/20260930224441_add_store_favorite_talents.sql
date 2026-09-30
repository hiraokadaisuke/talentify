create table if not exists public.store_favorite_talents (
  store_id uuid not null references public.stores(id) on delete cascade,
  talent_id uuid not null references public.talents(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (store_id, talent_id)
);

alter table public.store_favorite_talents enable row level security;

revoke all on table public.store_favorite_talents from anon;
grant select, insert, delete on table public.store_favorite_talents to authenticated;

drop policy if exists "store favorites owner select" on public.store_favorite_talents;
create policy "store favorites owner select"
  on public.store_favorite_talents
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.stores s
      where s.id = store_id
        and s.user_id = (select auth.uid())
    )
  );

drop policy if exists "store favorites owner insert" on public.store_favorite_talents;
create policy "store favorites owner insert"
  on public.store_favorite_talents
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.stores s
      where s.id = store_id
        and s.user_id = (select auth.uid())
    )
  );

drop policy if exists "store favorites owner delete" on public.store_favorite_talents;
create policy "store favorites owner delete"
  on public.store_favorite_talents
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.stores s
      where s.id = store_id
        and s.user_id = (select auth.uid())
    )
  );
