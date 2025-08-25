# RLS: public.offer_messages & public.offer_read_receipts (2025-08-30)

## Tables

- `public.offer_messages`
- `public.offer_read_receipts`

## Enable RLS

```sql
ALTER TABLE public.offer_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_read_receipts ENABLE ROW LEVEL SECURITY;
```

## Policies

```sql
-- Read messages related to offers the user can access
CREATE POLICY offer_msg_select ON public.offer_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.offers o
    WHERE o.id = offer_messages.offer_id
      AND (
        o.user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.stores s  WHERE s.id = o.store_id  AND s.user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.talents t WHERE t.id = o.talent_id AND t.user_id = auth.uid())
      )
  )
);

-- Write messages when the user has access to the offer
CREATE POLICY offer_msg_insert ON public.offer_messages
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.offers o
    WHERE o.id = offer_messages.offer_id
      AND (
        o.user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.stores s  WHERE s.id = o.store_id  AND s.user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.talents t WHERE t.id = o.talent_id AND t.user_id = auth.uid())
      )
  )
);

-- Read receipts for accessible offers
CREATE POLICY offer_receipt_select ON public.offer_read_receipts
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.offers o
    WHERE o.id = offer_read_receipts.offer_id
      AND (
        o.user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.stores s  WHERE s.id = o.store_id  AND s.user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.talents t WHERE t.id = o.talent_id AND t.user_id = auth.uid())
      )
  )
);

-- Upsert receipts for the current user only
CREATE POLICY offer_receipt_upsert ON public.offer_read_receipts
FOR ALL USING (true) WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.offers o
    WHERE o.id = offer_read_receipts.offer_id
      AND (
        o.user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.stores s  WHERE s.id = o.store_id  AND s.user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.talents t WHERE t.id = o.talent_id AND t.user_id = auth.uid())
      )
  )
);
```

## Notes

- Policies ensure only store owners, talent, or offer creator can read/write messages and receipts tied to the offer.
- `sender_user` is expected to be `auth.uid()` and `sender_role` determined on the client.
