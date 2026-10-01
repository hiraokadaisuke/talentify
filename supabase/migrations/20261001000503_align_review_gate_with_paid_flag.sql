-- Align the review gate with the application's canonical payment flag.
-- The payment endpoint sets offers.paid=true only after visit completion, so
-- completed + paid is the business invariant used by both UI and database.

create or replace function public.reviews_fill_and_validate()
returns trigger
language plpgsql
set search_path to 'public', 'pg_temp'
as $function$
declare
  o record;
begin
  select id, store_id, talent_id, status, paid
    into o
  from public.offers
  where id = new.offer_id;

  if o.id is null then
    raise exception 'Invalid offer_id: %', new.offer_id using errcode = '23503';
  end if;

  if o.status::text <> 'completed'
     or coalesce(o.paid, false) is not true then
    raise exception 'Review is available only after visit and payment completion'
      using errcode = '23514';
  end if;

  if new.store_id is null or new.store_id <> o.store_id then
    new.store_id := o.store_id;
  end if;
  if new.talent_id is null or new.talent_id <> o.talent_id then
    new.talent_id := o.talent_id;
  end if;

  if new.rating is not null and (new.rating < 1 or new.rating > 5) then
    raise exception 'rating must be between 1 and 5 (got %)', new.rating using errcode = '22023';
  end if;

  if new.category_ratings is null then
    new.category_ratings := '{}'::jsonb;
  end if;

  return new;
end
$function$;

drop policy if exists reviews_store_insert on public.reviews;

create policy reviews_store_insert
on public.reviews
for insert
to authenticated
with check (
  exists (
    select 1
    from public.offers o
    join public.stores s on s.id = o.store_id
    where o.id = reviews.offer_id
      and s.user_id = (select auth.uid())
      and o.store_id = reviews.store_id
      and o.talent_id = reviews.talent_id
      and o.status::text = 'completed'
      and o.paid is true
  )
);
