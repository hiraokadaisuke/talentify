-- Schema: offer_messages table for user messaging
create table if not exists public.offer_messages (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid references public.offers(id),
  sender_user uuid not null references auth.users(id),
  receiver_user uuid not null references auth.users(id),
  sender_role text not null check (sender_role in ('store','talent','admin')),
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists offer_messages_offer_id_created_idx on public.offer_messages(offer_id, created_at desc);
create index if not exists offer_messages_receiver_created_idx on public.offer_messages(receiver_user, created_at desc);

alter table public.offer_messages enable row level security;

create policy offer_messages_select on public.offer_messages
  for select using (
    auth.uid() = sender_user or auth.uid() = receiver_user
  );

create policy offer_messages_insert on public.offer_messages
  for insert with check (
    auth.uid() = sender_user
  );
