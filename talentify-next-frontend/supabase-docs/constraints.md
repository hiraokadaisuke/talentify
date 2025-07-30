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
