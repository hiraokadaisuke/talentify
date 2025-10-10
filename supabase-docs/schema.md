## テーブル構成（スキーマ）

最新の Supabase インスタンスで確認できるテーブルをスキーマごとに整理しています。各テーブルの詳細なカラムや制約は今後追記します。

### auth スキーマ
- audit_log_entries
- flow_state
- identities
- instances
- mfa_amr_claims
- mfa_challenges
- mfa_factors
- oauth_clients
- one_time_tokens
- refresh_tokens
- saml_providers
- saml_relay_states
- schema_migrations
- sessions
- sso_domains
- sso_providers
- users

### public スキーマ
- companies
- invoices
- message_read_receipts
- message_threads
- messages
- messages_old
- notifications
- offer_messages
- offer_read_receipts
- offers
- payments
- reviews
- schedules
- stores
- talent_availability_dates
- talent_availability_settings
- talents
- visits

### realtime スキーマ
- messages
- messages_2025_10_07
- messages_2025_10_08
- messages_2025_10_09
- messages_2025_10_10
- messages_2025_10_11
- messages_2025_10_12
- messages_2025_10_13
- schema_migrations
- subscription

### storage スキーマ
- buckets
- buckets_analytics
- migrations
- objects
- prefixes
- s3_multipart_uploads
- s3_multipart_uploads_parts

### supabase_migrations スキーマ
- schema_migrations
- seed_files

### vault スキーマ
- secrets
