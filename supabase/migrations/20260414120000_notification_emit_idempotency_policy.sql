-- Centralize notification emission in API/application code and introduce API idempotency-key storage.

-- 1) API idempotency key table for notification endpoints.
create table if not exists public.notification_idempotency_keys (
  key text not null,
  user_id uuid not null,
  endpoint text not null,
  response_snapshot jsonb not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  primary key (key, user_id, endpoint)
);

create index if not exists idx_notification_idempo_user_expires
  on public.notification_idempotency_keys (user_id, expires_at);

-- 2) Do not emit offer_created from DB trigger. Emission is centralized in app/lib/notifications/emit.ts.
do $$
declare
  trigger_name text;
begin
  for trigger_name in
    select t.tgname
    from pg_trigger t
    join pg_proc p on p.oid = t.tgfoid
    join pg_class c on c.oid = t.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'offers'
      and p.proname = 'notify_talent_on_offer_created'
      and not t.tgisinternal
  loop
    execute format('drop trigger if exists %I on public.offers', trigger_name);
  end loop;
end
$$;

drop function if exists public.notify_talent_on_offer_created();
