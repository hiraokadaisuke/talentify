alter table public.users
  add column if not exists phone text;

alter table public.talents
  add column if not exists preferred_contact_method text not null default 'chat',
  add column if not exists phone_contact_allowed boolean not null default false,
  add column if not exists phone_available_hours text;
