-- RPC to get unread messages count for current user
create or replace function public.unread_messages_count()
returns bigint
language sql
security definer
set search_path = public
as $$
  select count(*)::bigint
  from messages m
  join conversation_participants p on p.conversation_id = m.conversation_id
  where p.user_id = auth.uid()
    and m.sender_user_id <> auth.uid()
    and m.created_at > coalesce(p.last_read_at, 'epoch');
$$;

grant execute on function public.unread_messages_count() to authenticated;

-- Helpful indexes for performance
create index if not exists messages_conversation_created_idx on public.messages(conversation_id, created_at);
create index if not exists conversation_participants_user_idx on public.conversation_participants(user_id);
