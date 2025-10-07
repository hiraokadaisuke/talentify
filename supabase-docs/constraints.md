## 制約（外部キー）

- talents.company_id: FOREIGN KEY → companies.id
- offers.store_id: FOREIGN KEY → stores.id
- offers.talent_id: FOREIGN KEY → talents.id
- payments.offer_id: FOREIGN KEY → offers.id
- invoices.offer_id: FOREIGN KEY → offers.id
- invoices.store_id: FOREIGN KEY → stores.id
- invoices.talent_id: FOREIGN KEY → talents.id
- reviews.offer_id: FOREIGN KEY → offers.id
- reviews.store_id: FOREIGN KEY → stores.id
- reviews.talent_id: FOREIGN KEY → talents.id
- visits.offer_id: FOREIGN KEY → offers.id
- visits.store_id: FOREIGN KEY → stores.id
- visits.talent_id: FOREIGN KEY → talents.id

## 制約（ユニーク）

- stores.user_id: UNIQUE
- payments.offer_id: UNIQUE

```sql
create unique index if not exists payments_offer_id_key
on public.payments (offer_id);
```

## 制約（チェック）

- reviews.rating: 1から5の範囲
- reviews.category_ratings: JSONBオブジェクトであること
- schedules.role: 'store' または 'talent'
- talents.experience_years: 0以上
- talents.rate: 0以上
- talents.user_id または company_id のいずれかが必須
