-- Track creation of RPC for fetching store display names by offer ids
create or replace function public.get_offer_store_names(_offer_ids uuid[])
returns table (
  offer_id uuid,
  store_id uuid,
  store_display_name text
)
language sql
security definer
set search_path = public
as $$
  select o.id as offer_id, s.id as store_id, s.store_display_name
  from offers o
  join stores s on s.id = o.store_id
  where o.id = any(_offer_ids)
    and (
      exists (
        select 1 from talents t where t.id = o.talent_id and auth.uid() = t.user_id
      )
      or exists (
        select 1 from stores st where st.id = o.store_id and auth.uid() = st.user_id
      )
    );
$$;

grant execute on function public.get_offer_store_names(uuid[]) to authenticated;
