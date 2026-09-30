alter table public.offer_messages
  add column if not exists read_at timestamptz;

create index if not exists offer_messages_receiver_unread_idx
  on public.offer_messages (receiver_user, created_at desc)
  where read_at is null;
