# Invoices RLS and policies

- RLS 有効化
```sql
alter table public.invoices enable row level security;
alter table public.offers   enable row level security;
```

- GRANT（RLS前提の最小権限）
```sql
grant usage on schema public to authenticated;
grant select, insert, update on table public.invoices to authenticated;
grant select, update        on table public.offers   to authenticated;
```

- ポリシー
```sql
-- タレントが自分宛てオファーに請求 INSERT
create policy if not exists talent_insert_own_offer_invoice
on public.invoices for insert to authenticated
with check (
  exists (
    select 1 from public.offers o
    join public.talents t on t.id = o.talent_id
    where o.id = invoices.offer_id and t.user_id = auth.uid()
  )
);

-- タレントが自分の請求を SELECT
create policy if not exists talent_select_own_invoices
on public.invoices for select to authenticated
using (
  exists (select 1 from public.talents t where t.id = invoices.talent_id and t.user_id = auth.uid())
);

-- 店舗が自店舗の請求を SELECT
create policy if not exists store_select_own_invoices
on public.invoices for select to authenticated
using (
  exists (select 1 from public.stores s where s.id = invoices.store_id and s.user_id = auth.uid())
);

-- 店舗が自オファーの paid/paid_at を UPDATE（/pay 用）
create policy if not exists store_update_offers_paid_flag
on public.offers for update to authenticated
using (
  exists (select 1 from public.stores s where s.id = offers.store_id and s.user_id = auth.uid())
)
with check (
  exists (select 1 from public.stores s where s.id = offers.store_id and s.user_id = auth.uid())
);
```

- 検証SQL（擬似ログイン）例
```sql
select set_config('request.jwt.claim.sub', '<USER_UUID>', true);
-- ここで SELECT/INSERT/UPDATE を実行してポリシーを検証
```
