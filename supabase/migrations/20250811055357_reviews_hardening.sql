alter table public.reviews
  alter column category_ratings set data type jsonb using category_ratings::jsonb,
  alter column category_ratings set default '{}'::jsonb,
  alter column is_public set default true;

update public.reviews
set category_ratings = '{}'::jsonb
where category_ratings is null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'reviews_category_ratings_is_object') then
    alter table public.reviews
      add constraint reviews_category_ratings_is_object
      check (category_ratings is null or jsonb_typeof(category_ratings) = 'object');
  end if;
end$$;

do $$
begin
  if not exists (select 1 from pg_indexes where schemaname='public' and indexname='uniq_offer_store_review') then
    create unique index uniq_offer_store_review on public.reviews(offer_id, store_id);
  end if;
end$$;

alter table public.reviews enable row level security;

drop policy if exists reviews_insert_by_store on public.reviews;
drop policy if exists reviews_select_related_users on public.reviews;
drop policy if exists public_can_read_public_reviews on public.reviews;

create policy reviews_insert_by_store
  on public.reviews
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.offers o
      join public.stores s on s.id = o.store_id
      where o.id = reviews.offer_id
        and s.user_id = auth.uid()
    )
  );

create policy reviews_select_related_users
  on public.reviews
  for select
  to authenticated
  using (
    is_public = true
    or exists (
      select 1
      from public.offers o
      join public.stores st on st.id = o.store_id
      where o.id = reviews.offer_id
        and st.user_id = auth.uid()
    )
    or exists (
      select 1
      from public.offers o
      join public.talents t on t.id = o.talent_id
      where o.id = reviews.offer_id
        and t.user_id = auth.uid()
    )
  );

create policy public_can_read_public_reviews
  on public.reviews
  for select
  to anon
  using (is_public = true);
