# Invoices status and payment

- 目的: invoice の提出/支払い状態の追跡
- カラム/型:
  - `invoices.status` … enum `status_type` (`draft`, `submitted`, `approved`, `rejected`, …)
    - `submitted` は enum に残るが現在のフローでは使用せず、提出時に自動的に `approved` へ遷移する。
  - `invoices.payment_status` … enum `payment_status` (`pending`, `processing`, `paid`, `failed`)
  - `invoices.paid_at` … `timestamptz`
- ユニーク制約: `invoices(offer_id)`（1オファー=1請求）
- DDL（実行済みSQL）:
```sql
-- enum 追加
do $$ begin
  if not exists (select 1 from pg_enum where enumtypid='status_type'::regtype and enumlabel='submitted') then
    alter type status_type add value 'submitted';
  end if;
end $$;

-- payment_status 列など
do $$ begin
  if not exists (select 1 from pg_type where typname='payment_status') then
    create type payment_status as enum ('pending','processing','paid','failed');
  end if;
end $$;

alter table public.invoices
  add column if not exists payment_status payment_status not null default 'pending',
  add column if not exists paid_at timestamptz null;

-- ユニーク制約
do $$ begin
  if not exists (
    select 1 from pg_constraint c join pg_class t on t.oid=c.conrelid
    where t.relname='invoices' and c.conname='invoices_offer_id_key'
  ) then
    alter table public.invoices add constraint invoices_offer_id_key unique (offer_id);
  end if;
end $$;
```
- 支払い時更新: `/api/invoices/[id]/pay` で `payment_status='paid'`, `paid_at=now()` にする運用。
