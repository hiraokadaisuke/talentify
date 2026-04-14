alter table if exists public.notifications
  add column if not exists priority text not null default 'medium',
  add column if not exists action_url text,
  add column if not exists action_label text,
  add column if not exists entity_type text,
  add column if not exists entity_id text,
  add column if not exists actor_name text,
  add column if not exists expires_at timestamptz,
  add column if not exists group_key text;

alter table if exists public.notifications
  drop constraint if exists notifications_priority_check;

alter table if exists public.notifications
  add constraint notifications_priority_check
  check (priority in ('low', 'medium', 'high'));

create index if not exists idx_notifications_user_read_created
  on public.notifications (user_id, is_read, created_at desc);

create index if not exists idx_notifications_user_priority_created
  on public.notifications (user_id, priority, created_at desc);
