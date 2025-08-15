-- Allow talents to read related store names via offers
create policy "talent_can_select_related_store_via_offers" on public.stores
for select to authenticated
using (
  exists (
    select 1
    from public.talents t
    join public.offers o on o.talent_id = t.id
    where t.user_id = auth.uid()
      and o.store_id = stores.id
  )
);

-- Allow talents to read related store names via reviews
create policy "talent_can_select_related_store_via_reviews" on public.stores
for select to authenticated
using (
  exists (
    select 1
    from public.talents t
    join public.reviews r on r.talent_id = t.id
    where t.user_id = auth.uid()
      and r.store_id = stores.id
  )
);
