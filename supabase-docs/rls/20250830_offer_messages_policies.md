# RLS: public.offer_messages (2025-08-30)

## Enable RLS

```sql
ALTER TABLE public.offer_messages ENABLE ROW LEVEL SECURITY;
```

## Policies

```sql
-- Users can view messages they sent or received
CREATE POLICY offer_messages_select ON public.offer_messages
FOR SELECT USING (
  auth.uid() = sender_user OR auth.uid() = receiver_user
);

-- Only the sender may insert their own messages
CREATE POLICY offer_messages_insert ON public.offer_messages
FOR INSERT WITH CHECK (
  auth.uid() = sender_user
);
```

## Notes

- `offer_id` is optional for associating messages with offers.
- Only `sender_user` may insert; both sender and receiver can read.
