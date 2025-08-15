-- Grant store owners access to their own stores and related profiles
create policy if not exists "store owners can read own stores"
  on public.stores for select using (auth.uid() = user_id);

create policy if not exists "store owners can maintain own store profiles"
  on public.store_profiles for select using (
    exists (
      select 1 from public.stores s
      where s.id = store_profiles.store_id
        and s.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.stores s
      where s.id = store_profiles.store_id
        and s.user_id = auth.uid()
    )
  );
