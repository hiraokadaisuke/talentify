## 制約（外部キー）

- invoices.offer_id: FOREIGN KEY → offers.id
- invoices.talent_id: FOREIGN KEY → talents.id
- invoices.store_id: FOREIGN KEY → stores.id
- offers.talent_id: FOREIGN KEY → talents.id
- offers.store_id: FOREIGN KEY → stores.id
- payments.offer_id: FOREIGN KEY → offers.id
- reviews.store_id: FOREIGN KEY → stores.id
- reviews.talent_id: FOREIGN KEY → talents.id
- reviews.offer_id: FOREIGN KEY → offers.id
- talents.company_id: FOREIGN KEY → companies.id
- visits.offer_id: FOREIGN KEY → offers.id
- visits.store_id: FOREIGN KEY → stores.id
- visits.talent_id: FOREIGN KEY → talents.id
