## 制約（主キー・外部キー・ユニーク）

- companies.id: PRIMARY KEY
- invoices.offer_id: FOREIGN KEY → offers.id
- invoices.store_id: FOREIGN KEY → stores.id
- invoices.talent_id: FOREIGN KEY → talents.id
- stores.user_id: UNIQUE
- talents.company_id: FOREIGN KEY → companies.id