create table if not exists public.talent_social_connections (
  talent_id uuid not null references public.talents(id) on delete cascade,
  provider text not null,
  external_user_id text,
  provider_username text,
  access_token text,
  refresh_token text,
  access_token_expires_at timestamptz,
  refresh_token_expires_at timestamptz,
  scopes text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (talent_id, provider),
  constraint talent_social_connections_provider_check
    check (provider in ('tiktok'))
);

alter table public.talent_social_connections enable row level security;

revoke all on table public.talent_social_connections from public, anon, authenticated;
grant select, insert, update, delete on table public.talent_social_connections to service_role;

create or replace function public.set_talent_social_connection_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists set_talent_social_connection_updated_at on public.talent_social_connections;
create trigger set_talent_social_connection_updated_at
before update on public.talent_social_connections
for each row
execute function public.set_talent_social_connection_updated_at();
