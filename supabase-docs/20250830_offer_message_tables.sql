-- Schema: offer_messages and offer_read_receipts

-- offer_messages stores chat messages per offer
create table if not exists public.offer_messages (
  id            uuid primary key default gen_random_uuid(),
  offer_id      uuid not null references public.offers(id) on delete cascade,
  sender_user   uuid not null,
  sender_role   text not null check (sender_role in ('store','talent','admin')),
  body          text,
  attachments   jsonb default '[]',
  created_at    timestamptz not null default now()
);

create index on public.offer_messages(offer_id, created_at desc);
create index on public.offer_messages(sender_user, created_at desc);

-- offer_read_receipts keeps lightweight read state per user
create table if not exists public.offer_read_receipts (
  offer_id   uuid not null references public.offers(id) on delete cascade,
  user_id    uuid not null,
  read_at    timestamptz not null default now(),
  primary key (offer_id, user_id)
);

-- Enable RLS
alter table public.offer_messages enable row level security;
alter table public.offer_read_receipts enable row level security;

-- Policies
create policy offer_msg_select on public.offer_messages
for select using (
  exists (
    select 1 from public.offers o
    where o.id = offer_messages.offer_id
      and (
        o.user_id = auth.uid()
        or exists (select 1 from public.stores s  where s.id = o.store_id  and s.user_id = auth.uid())
        or exists (select 1 from public.talents t where t.id = o.talent_id and t.user_id = auth.uid())
      )
  )
);

create policy offer_msg_insert on public.offer_messages
for insert with check (
  exists (
    select 1 from public.offers o
    where o.id = offer_messages.offer_id
      and (
        o.user_id = auth.uid()
        or exists (select 1 from public.stores s  where s.id = o.store_id  and s.user_id = auth.uid())
        or exists (select 1 from public.talents t where t.id = o.talent_id and t.user_id = auth.uid())
      )
  )
);

create policy offer_receipt_select on public.offer_read_receipts
for select using (
  exists (
    select 1 from public.offers o
    where o.id = offer_read_receipts.offer_id
      and (
        o.user_id = auth.uid()
        or exists (select 1 from public.stores s  where s.id = o.store_id  and s.user_id = auth.uid())
        or exists (select 1 from public.talents t where t.id = o.talent_id and t.user_id = auth.uid())
      )
  )
);

create policy offer_receipt_upsert on public.offer_read_receipts
for all using (true) with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.offers o
    where o.id = offer_read_receipts.offer_id
      and (
        o.user_id = auth.uid()
        or exists (select 1 from public.stores s  where s.id = o.store_id  and s.user_id = auth.uid())
        or exists (select 1 from public.talents t where t.id = o.talent_id and t.user_id = auth.uid())
      )
  )
);

