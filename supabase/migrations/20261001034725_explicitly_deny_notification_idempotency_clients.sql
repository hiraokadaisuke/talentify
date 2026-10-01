-- Keep notification idempotency storage server-only while making the RLS intent explicit.
-- anon/authenticated already have table privileges revoked; this deny policy is defense in depth
-- and prevents the RLS linter from treating the policy-free table as an accidental omission.

drop policy if exists "notification_idempotency_clients_denied"
on public.notification_idempotency_keys;

create policy "notification_idempotency_clients_denied"
on public.notification_idempotency_keys
for all
to anon, authenticated
using (false)
with check (false);

revoke all on table public.notification_idempotency_keys from anon, authenticated;
