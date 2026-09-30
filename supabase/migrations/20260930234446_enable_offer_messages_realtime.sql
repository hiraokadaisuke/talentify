-- Enable the existing client-side Postgres Changes subscriptions for messages.
-- RLS and SELECT grants on public.offer_messages continue to control which rows
-- authenticated users may receive.

alter publication supabase_realtime
  add table public.offer_messages;
