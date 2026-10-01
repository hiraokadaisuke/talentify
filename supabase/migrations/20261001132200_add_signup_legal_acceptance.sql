alter table public.users
  add column if not exists terms_version text,
  add column if not exists privacy_version text,
  add column if not exists legal_accepted_at timestamptz;

comment on column public.users.terms_version is 'Terms of service version accepted at signup.';
comment on column public.users.privacy_version is 'Privacy policy version accepted at signup.';
comment on column public.users.legal_accepted_at is 'Timestamp when the user accepted the current legal documents.';
