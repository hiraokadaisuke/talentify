## テーブル構成（スキーマ）

### companies
- id: uuid, NOT NULL, DEFAULT gen_random_uuid()
- user_id: uuid, NOT NULL
- company_name: text, NOT NULL
- phone_number: text
- address: text
- created_at: timestamp with time zone, DEFAULT now()
- updated_at: timestamp with time zone, DEFAULT now()

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
- payment_status: USER-DEFINED, DEFAULT 'pending'
- paid_at: timestamp with time zone

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
- title: text
- body: text
- data: jsonb
- is_read: boolean, DEFAULT false
- created_at: timestamp without time zone, DEFAULT now()
- read_at: timestamp without time zone
- updated_at: timestamp with time zone, NOT NULL, DEFAULT now()

### offers
- id: uuid, NOT NULL, DEFAULT gen_random_uuid()
- store_id: uuid, NOT NULL
- talent_id: uuid, NOT NULL
- date: date, NOT NULL
- status: text, NOT NULL, DEFAULT 'pending'
- created_at: timestamp with time zone, DEFAULT now()
- updated_at: timestamp with time zone, DEFAULT now()
- message: text

### payments
- id: uuid, NOT NULL, DEFAULT gen_random_uuid()
- offer_id: uuid
- amount: integer, NOT NULL
 - status: payment_status, NOT NULL
- created_at: timestamp with time zone, DEFAULT now()
- updated_at: timestamp with time zone, DEFAULT now()
- paid_at: timestamp with time zone, NULL
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

_View definition_
```sql
SELECT id,
       display_name,
       stage_name,
       genre,
       area,
       avatar_url,
       rating,
       rate,
       phone,
       bio
  FROM talents
 WHERE is_profile_complete = true;
```

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
- user_id: uuid, NOT NULL
- store_name: text, NOT NULL
- prefecture: text
- city: text
- address: text
- phone_number: text
- line_id: text
- description: text
- created_at: timestamp with time zone, DEFAULT now()
- updated_at: timestamp with time zone, DEFAULT now()

### talents
- id: uuid, NOT NULL, DEFAULT gen_random_uuid()
- user_id: uuid, NOT NULL
- name: text, NOT NULL
- nickname: text
- birth_date: date
- gender: text
- prefecture: text
- activity_area: text
- instagram: text
- twitter: text
- youtube: text
- residence: text
- experience_years: integer
- description: text
- created_at: timestamp with time zone, DEFAULT now()
- updated_at: timestamp with time zone, DEFAULT now()

### visits
- id: uuid, NOT NULL, DEFAULT gen_random_uuid()
- offer_id: uuid
- talent_id: uuid
- store_id: uuid
- visited_at: timestamp without time zone
- created_at: timestamp without time zone, DEFAULT now()
- updated_at: timestamp without time zone, DEFAULT now()
- status: USER-DEFINED
- note: text

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

_View definition_
```sql
SELECT userid,
       dbid,
       toplevel,
       queryid,
       query,
       plans,
       total_plan_time,
       min_plan_time,
       max_plan_time,
       mean_plan_time,
       stddev_plan_time,
       calls,
       total_exec_time,
       min_exec_time,
       max_exec_time,
       mean_exec_time,
       stddev_exec_time,
       rows,
       shared_blks_hit,
       shared_blks_read,
       shared_blks_dirtied,
       shared_blks_written,
       local_blks_hit,
       local_blks_read,
       local_blks_dirtied,
       local_blks_written,
       temp_blks_read,
       temp_blks_written,
       shared_blk_read_time,
       shared_blk_write_time,
       local_blk_read_time,
       local_blk_write_time,
       temp_blk_read_time,
       temp_blk_write_time,
       wal_records,
       wal_fpi,
       wal_bytes,
       jit_functions,
       jit_generation_time,
       jit_inlining_count,
       jit_inlining_time,
       jit_optimization_count,
       jit_optimization_time,
       jit_emission_count,
       jit_emission_time,
       jit_deform_count,
       jit_deform_time,
       stats_since,
       minmax_stats_since
  FROM pg_stat_statements(true);
```

### pg_stat_statements_info (extensions schema)
- dealloc: bigint
- stats_reset: timestamp with time zone

_View definition_
```sql
SELECT dealloc,
       stats_reset
  FROM pg_stat_statements_info();
```

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
### auth.users
- id: uuid, NOT NULL, DEFAULT gen_random_uuid()
- instance_id: uuid
- aud: text
- role: text
- email: text
- encrypted_password: text
- email_confirmed_at: timestamp with time zone
- invited_at: timestamp with time zone
- confirmation_token: text
- confirmation_sent_at: timestamp with time zone
- recovery_token: text
- recovery_sent_at: timestamp with time zone
- email_change_token_new: text
- email_change: text
- email_change_sent_at: timestamp with time zone
- last_sign_in_at: timestamp with time zone
- raw_app_meta_data: jsonb
- raw_user_meta_data: jsonb
- is_super_admin: boolean, DEFAULT false
- created_at: timestamp with time zone, DEFAULT now()
- updated_at: timestamp with time zone, DEFAULT now()

### auth.identities
- id: text, NOT NULL
- user_id: uuid, NOT NULL
- identity_data: jsonb
- provider: text, NOT NULL
- last_sign_in_at: timestamp with time zone
- created_at: timestamp with time zone, DEFAULT now()
- updated_at: timestamp with time zone, DEFAULT now()

