## 主キー

### auth スキーマ
- audit_log_entries: PRIMARY KEY → id
- flow_state: PRIMARY KEY → id
- identities: PRIMARY KEY → id
- instances: PRIMARY KEY → id
- mfa_amr_claims: PRIMARY KEY → id
- mfa_challenges: PRIMARY KEY → id
- mfa_factors: PRIMARY KEY → id
- oauth_clients: PRIMARY KEY → id
- one_time_tokens: PRIMARY KEY → id
- refresh_tokens: PRIMARY KEY → id
- saml_providers: PRIMARY KEY → id
- saml_relay_states: PRIMARY KEY → id
- sessions: PRIMARY KEY → id
- sso_domains: PRIMARY KEY → id
- sso_providers: PRIMARY KEY → id
- users: PRIMARY KEY → id

### public スキーマ
- companies: PRIMARY KEY → id
- invoices: PRIMARY KEY → id
- message_read_receipts: PRIMARY KEY → (message_id, user_id)
- message_threads: PRIMARY KEY → id
- messages: PRIMARY KEY → id
- messages_old: PRIMARY KEY → id
- notifications: PRIMARY KEY → id
- offer_messages: PRIMARY KEY → id
- offer_read_receipts: PRIMARY KEY → id
- offers: PRIMARY KEY → id
- payments: PRIMARY KEY → id
- reviews: PRIMARY KEY → id
- schedules: PRIMARY KEY → id
- stores: PRIMARY KEY → id
- talent_availability_dates: PRIMARY KEY → id
- talent_availability_settings: PRIMARY KEY → user_id
- talents: PRIMARY KEY → id
- visits: PRIMARY KEY → id

### realtime / storage / その他
- realtime.messages: PRIMARY KEY → (id, inserted_at)
- realtime.messages_YYYY_MM_DD: PRIMARY KEY → (id, inserted_at)
- realtime.subscription: PRIMARY KEY → id
- realtime.schema_migrations: PRIMARY KEY → version
- storage.buckets: PRIMARY KEY → id
- storage.buckets_analytics: PRIMARY KEY → id
- storage.objects: PRIMARY KEY → id
- storage.prefixes: PRIMARY KEY → (bucket_id, level, name)
- storage.s3_multipart_uploads: PRIMARY KEY → id
- storage.s3_multipart_uploads_parts: PRIMARY KEY → id
- supabase_migrations.schema_migrations: PRIMARY KEY → version
- supabase_migrations.seed_files: PRIMARY KEY → path
- vault.secrets: PRIMARY KEY → id

## 外部キー

### public スキーマ
- invoices.offer_id → offers.id (ON DELETE RESTRICT)
- invoices.store_id → stores.id (ON DELETE RESTRICT)
- invoices.talent_id → talents.id (ON DELETE RESTRICT)
- message_read_receipts.message_id → messages.id (ON DELETE CASCADE)
- message_threads.offer_id → offers.id (ON DELETE SET NULL)
- messages.thread_id → message_threads.id (ON DELETE CASCADE)
- offer_messages.offer_id → offers.id (ON DELETE CASCADE)
- offer_read_receipts.offer_id → offers.id (ON DELETE CASCADE)
- offers.store_id → stores.id (ON DELETE SET NULL)
- offers.talent_id → talents.id (ON DELETE RESTRICT)
- payments.offer_id → offers.id (ON DELETE RESTRICT)
- reviews.offer_id → offers.id (ON DELETE SET NULL)
- reviews.store_id → stores.id (ON DELETE RESTRICT)
- reviews.talent_id → talents.id (ON DELETE RESTRICT)
- visits.offer_id → offers.id (ON DELETE RESTRICT)
- visits.store_id → stores.id (ON DELETE RESTRICT)
- visits.talent_id → talents.id (ON DELETE RESTRICT)
- talents.company_id → companies.id (ON DELETE SET NULL)

## ユニーク制約

### auth スキーマ
- identities(provider_id, provider)
- mfa_amr_claims(session_id, authentication_method)
- mfa_factors(last_challenged_at)
- oauth_clients(client_id)
- refresh_tokens(token)
- saml_providers(entity_id)
- users(phone)

### public スキーマ
- invoices(offer_id)
- offer_read_receipts(offer_id, user_id)
- stores(user_id)
- talent_availability_dates(user_id, the_date)

## チェック制約

### public スキーマ
- message_threads.type: `type = ANY('{"direct","offer"}')`
- offer_messages.sender_role: `sender_role = ANY('{"store","talent","admin"}')`
- schedules.role: `role = ANY('{"store","talent"}')`
- reviews.rating: `rating BETWEEN 1 AND 5`
- reviews.category_ratings: `category_ratings IS NULL OR jsonb_typeof(category_ratings) = 'object'`
- talents.experience_years: `experience_years >= 0`
- talents.rate: `rate >= 0`
- talents.user_id / company_id: `user_id IS NOT NULL OR company_id IS NOT NULL`
- offers.canceled_by_role: `canceled_by_role = ANY('{"store","talent","admin"}')`

> NOTE: 各テーブルの `NOT NULL` 制約は PostgreSQL のシステムカタログ上では `CHECK (column IS NOT NULL)` として表現されますが、上表では意味的なチェック制約のみを列挙しています。
