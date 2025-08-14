## テーブル構成（スキーマ）

### companies
- id: uuid, NOT NULL, DEFAULT gen_random_uuid()
- user_id: uuid
- company_name: text
- address: text
- tel: text
- description: text
- created_at: timestamp with time zone, DEFAULT now()
- updated_at: timestamp with time zone, DEFAULT now()
- avatar_url: text
- is_setup_complete: boolean, DEFAULT false
- display_name: text

### invoices
- id: uuid, NOT NULL, DEFAULT gen_random_uuid()
- offer_id: uuid
- store_id: uuid
- talent_id: uuid
- amount: integer, NOT NULL
- invoice_url: text
- created_at: timestamp without time zone, DEFAULT now()
- updated_at: timestamp without time zone, DEFAULT now()
- status: USER-DEFINED, DEFAULT 'pending'
- due_date: date
- invoice_number: text

### messages
- created_at: timestamp with time zone
- is_read: boolean
- private: boolean
- id: uuid, NOT NULL
- inserted_at: timestamp without time zone
- updated_at: timestamp without time zone
- event: text
- payload: jsonb
- extension: text
- topic: text
- content: text
- receiver_id: uuid
- sender_id: uuid

### messages_old
- id: uuid, NOT NULL, DEFAULT gen_random_uuid()
- sender_id: uuid, NOT NULL
- receiver_id: uuid, NOT NULL
- content: text, NOT NULL
- created_at: timestamp with time zone, DEFAULT now()
- is_read: boolean, DEFAULT false
- updated_at: timestamp with time zone, DEFAULT now()

### notifications
- id: uuid, NOT NULL, DEFAULT gen_random_uuid()
- user_id: uuid, NOT NULL
- type: USER-DEFINED, NOT NULL
- data: jsonb
- is_read: boolean, DEFAULT false
- created_at: timestamp without time zone, DEFAULT now()
- read_at: timestamp without time zone
- updated_at: timestamp with time zone, NOT NULL, DEFAULT now()

### offers
- id: uuid, NOT NULL, DEFAULT gen_random_uuid()
- talent_id: uuid
- user_id: uuid
- date: timestamp with time zone
- message: text
- created_at: timestamp with time zone, DEFAULT timezone('utc'::text, now())
- status: USER-DEFINED, DEFAULT 'pending'
- respond_deadline: timestamp with time zone
- is_read_by_talent: boolean, DEFAULT false
- updated_at: timestamp with time zone, DEFAULT now()
- event_name: text
- start_time: timestamp without time zone
- end_time: timestamp without time zone
- reward: integer
- question_allowed: boolean, DEFAULT false
- notes: text
- store_id: uuid
- agreed: boolean
- paid: boolean, DEFAULT false
- paid_at: timestamp with time zone
- invoice_date: date
- invoice_amount: integer
- bank_name: text
- bank_branch: text
- bank_account_number: text
- bank_account_holder: text
- invoice_submitted: boolean, DEFAULT false
- contract_url: text
- time_range: text
- invoice_url: text
- accepted_at: timestamp with time zone

`date` は `timestamp with time zone` 型で、`YYYY-MM-DD` もしくは ISO 8601 形式で送信する必要があります。`status` では `draft` / `pending` / `approved` / `rejected` / `completed` / `offer_created` / `confirmed` の値を使用でき、オファー作成時のデフォルトは `pending` です。

**RLSポリシー** (relrowsecurity = true)
- offers_insert_by_store: auth.uid() = user_id または stores.user_id = auth.uid() の自店舗 `store_id` で挿入可
- offers_update_by_store: 自店舗の `store_id` のみ更新可
 - talent_update_own_offer_status: タレントは自分宛のオファーに対して `status` を `pending` / `accepted` / `rejected` / `confirmed` に更新可
- offers_delete_by_store: 自店舗の `store_id` のみ削除可
旧ポリシー (auth.uid() = store_id などの誤った比較) は削除済み。

### payments
- id: uuid, NOT NULL, DEFAULT gen_random_uuid()
- offer_id: uuid
- amount: integer, NOT NULL
- status: USER-DEFINED, NOT NULL
- created_at: timestamp with time zone, DEFAULT now()
- updated_at: timestamp with time zone, DEFAULT now()
- paid_at: timestamp with time zone
- invoice_url: text

status が 'completed' の場合に支払い完了とみなし、その日時を `paid_at` に保存する。

### public_talent_profiles
- id: uuid (talents.id)
- display_name: text
- stage_name: text
- genre: text
- area: text
- avatar_url: text
- rating: numeric
- rate: numeric
- phone: text
- bio: text
- is_profile_complete = true のタレントのみを公開。talents.id を id として含む。

### reviews
- id: uuid, NOT NULL, DEFAULT gen_random_uuid()
- offer_id: uuid
- store_id: uuid
- talent_id: uuid
- rating: integer
- comment: text
- created_at: timestamp without time zone, DEFAULT now()
- category_ratings: jsonb, DEFAULT '{}'::jsonb (カテゴリごとの評価。未指定時は空オブジェクト)
- is_public: boolean, DEFAULT true (レビュー公開設定。デフォルトは公開（true）)

### schedules
- id: uuid, NOT NULL, DEFAULT gen_random_uuid()
- user_id: uuid, NOT NULL
- date: timestamp with time zone, NOT NULL
- description: text, DEFAULT ''::text
- created_at: timestamp with time zone, DEFAULT now()
- updated_at: timestamp with time zone, DEFAULT now()
- start_time: timestamp with time zone
- end_time: timestamp with time zone
- related_offer_id: uuid
- role: text

### stores
- id: uuid, NOT NULL, DEFAULT gen_random_uuid()
- user_id: uuid
- store_name: text
- contact_name: text
- contact_phone: text
- store_prefect: text
- bio: text
- created_at: timestamp with time zone, DEFAULT now()
- updated_at: timestamp with time zone, DEFAULT now()
- avatar_url: text
- is_setup_complete: boolean, DEFAULT false
- contact_email: text
- store_address: text
- is_profile_complete: boolean, DEFAULT false

### talents
- id: uuid, NOT NULL, DEFAULT gen_random_uuid()
- name: text, NOT NULL
- skills: ARRAY, DEFAULT '{}'::text[]
- experience_years: integer, DEFAULT 0
- avatar_url: text, DEFAULT ''::text
- social_links: ARRAY, DEFAULT '{}'::text[]
- bio: text, DEFAULT ''::text
- location: text, DEFAULT ''::text
- rate: numeric, DEFAULT 0
- availability: text, DEFAULT ''::text
- created_at: timestamp with time zone, DEFAULT now()
- profile: text
- area: text
- video_url: text
- rating: numeric
- user_id: uuid
- company_id: uuid
- stage_name: text
- display_name: text
- phone: text
- is_setup_complete: boolean, DEFAULT false
- twitter_url: text
- instagram_url: text
- youtube_url: text
- media_appearance: text
- is_profile_complete: boolean, DEFAULT false
- achievements: text
- genre: text
- instagram: text
- twitter: text
- youtube: text
- residence: text
- notes: text
- photos: ARRAY
- transportation: text
- min_hours: text
- updated_at: timestamp with time zone, DEFAULT now()
- bio_hobby: text
- bio_certifications: text
- birthdate: date
- birthplace: text
- height_cm: integer
- agency_name: text
- social_tiktok: text
- gender: USER-DEFINED, DEFAULT 'other'
- bio_others: text

### visits
- id: uuid, NOT NULL, DEFAULT gen_random_uuid()
- offer_id: uuid
- talent_id: uuid
- store_id: uuid
- visited_at: timestamp without time zone
- created_at: timestamp without time zone, DEFAULT now()
- updated_at: timestamp without time zone, DEFAULT now()
- status: USER-DEFINED

### pg_stat_statements (extensions schema)
- userid: oid
- dbid: oid
- toplevel: boolean
- queryid: bigint
- query: text
- plans: bigint
- total_plan_time: double precision
- min_plan_time: double precision
- max_plan_time: double precision
- mean_plan_time: double precision
- stddev_plan_time: double precision
- calls: bigint
- total_exec_time: double precision
- min_exec_time: double precision
- max_exec_time: double precision
- mean_exec_time: double precision
- stddev_exec_time: double precision
- rows: bigint
- shared_blks_hit: bigint
- shared_blks_read: bigint
- shared_blks_dirtied: bigint
- shared_blks_written: bigint
- local_blks_hit: bigint
- local_blks_read: bigint
- local_blks_dirtied: bigint
- local_blks_written: bigint
- temp_blks_read: bigint
- temp_blks_written: bigint
- shared_blk_read_time: double precision
- shared_blk_write_time: double precision
- local_blk_read_time: double precision
- local_blk_write_time: double precision
- temp_blk_read_time: double precision
- temp_blk_write_time: double precision
- wal_records: bigint
- wal_fpi: bigint
- wal_bytes: numeric
- jit_functions: bigint
- jit_generation_time: double precision
- jit_inlining_count: bigint
- jit_inlining_time: double precision
- jit_optimization_count: bigint
- jit_optimization_time: double precision
- jit_emission_count: bigint
- jit_emission_time: double precision
- jit_deform_count: bigint
- jit_deform_time: double precision
- stats_since: timestamp with time zone
- minmax_stats_since: timestamp with time zone

### pg_stat_statements_info (extensions schema)
- dealloc: bigint
- stats_reset: timestamp with time zone

### decrypted_secrets (vault schema)
- id: uuid
- name: text
- description: text
- secret: text
- decrypted_secret: text
- key_id: uuid
- nonce: bytea
- created_at: timestamp with time zone
- updated_at: timestamp with time zone
