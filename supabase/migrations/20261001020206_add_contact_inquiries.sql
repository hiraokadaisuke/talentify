-- Store public contact inquiries server-side only.
-- Browser roles have no direct Data API access; the application API uses service_role.

create table if not exists public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  category text not null,
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  status text not null default 'new',
  source_hash text
);

alter table public.contact_inquiries enable row level security;

alter table public.contact_inquiries
  drop constraint if exists contact_inquiries_category_check,
  drop constraint if exists contact_inquiries_status_check,
  drop constraint if exists contact_inquiries_name_length_check,
  drop constraint if exists contact_inquiries_email_length_check,
  drop constraint if exists contact_inquiries_phone_length_check,
  drop constraint if exists contact_inquiries_subject_length_check,
  drop constraint if exists contact_inquiries_message_length_check;

alter table public.contact_inquiries
  add constraint contact_inquiries_category_check
  check (category in ('service','bug','feedback','other')),
  add constraint contact_inquiries_status_check
  check (status in ('new','in_progress','resolved','spam')),
  add constraint contact_inquiries_name_length_check
  check (char_length(btrim(name)) between 1 and 100),
  add constraint contact_inquiries_email_length_check
  check (char_length(btrim(email)) between 3 and 254),
  add constraint contact_inquiries_phone_length_check
  check (phone is null or char_length(btrim(phone)) between 1 and 30),
  add constraint contact_inquiries_subject_length_check
  check (char_length(btrim(subject)) between 1 and 200),
  add constraint contact_inquiries_message_length_check
  check (char_length(btrim(message)) between 1 and 5000);

create index if not exists idx_contact_inquiries_created_at
  on public.contact_inquiries (created_at desc);

create index if not exists idx_contact_inquiries_source_hash_created_at
  on public.contact_inquiries (source_hash, created_at desc)
  where source_hash is not null;

revoke all on table public.contact_inquiries from anon, authenticated, service_role;
grant select, insert, update on table public.contact_inquiries to service_role;
