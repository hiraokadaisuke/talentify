-- Client applications may read their own message rows for inbox/thread rendering and Realtime.
-- All message mutations are intentionally server-only:
--   POST /api/messages/send -> service_role INSERT after authorizeMessageTarget()
--   POST /api/messages/read -> service_role UPDATE after receiver ownership checks.
-- Removing Data API write privileges prevents authenticated clients from bypassing those APIs.

revoke insert, update, delete on table public.offer_messages from authenticated;
revoke all on table public.offer_messages from anon;
grant select on table public.offer_messages to authenticated;

drop policy if exists offer_messages_insert on public.offer_messages;
