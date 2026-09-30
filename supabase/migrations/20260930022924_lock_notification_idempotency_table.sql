alter table public.notification_idempotency_keys enable row level security;
revoke all on table public.notification_idempotency_keys from anon, authenticated;
