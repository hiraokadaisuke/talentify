## テーブル構成（スキーマ）

### companies
- id: uuid, PRIMARY KEY, NOT NULL
- user_id: uuid, FOREIGN KEY → users.id, NOT NULL
- company_name: text, NOT NULL
- address: text
- tel: text
- description: text
- avatar_url: text
- display_name: text
- is_setup_complete: boolean
- created_at: timestamp with time zone
- updated_at: timestamp with time zone

### invoices
- id: uuid, PRIMARY KEY
- offer_id: uuid, FOREIGN KEY → offers.id
- store_id: uuid, FOREIGN KEY → stores.id
- talent_id: uuid, FOREIGN KEY → talents.id
- amount: integer
- invoice_url: text
- created_at: timestamp
- updated_at: timestamp
- status: enum(invoice_status)
- due_date: date
- invoice_number: text

### messages
- id: uuid, PRIMARY KEY
- sender_id: uuid
- content: text
- payload: jsonb
- topic: text
- event: text
- private: boolean
- extension: text
- created_at: timestamp
- updated_at: timestamp