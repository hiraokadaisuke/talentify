create table if not exists public.admin_users (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
revoke all on table public.admin_users from anon, authenticated;
grant select, insert, update, delete on table public.admin_users to service_role;

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_auth_user_id uuid not null references auth.users(id) on delete restrict,
  action text not null,
  target_type text,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.admin_audit_log enable row level security;
revoke all on table public.admin_audit_log from anon, authenticated;
grant select, insert on table public.admin_audit_log to service_role;

create index if not exists admin_audit_log_created_at_idx
  on public.admin_audit_log (created_at desc);

comment on table public.admin_users is 'Server-only allowlist for Talentify administrators.';
comment on table public.admin_audit_log is 'Server-only immutable log of administrator actions.';
