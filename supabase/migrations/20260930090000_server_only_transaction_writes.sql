-- Keep transaction state mutations behind authenticated server routes.
-- Browser clients retain SELECT access; reviews retain INSERT for the existing review flow.

revoke insert, update, delete on table public.offers from authenticated;
revoke insert, update, delete on table public.invoices from authenticated;
revoke insert, update, delete on table public.payments from authenticated;
revoke update, delete on table public.reviews from authenticated;

drop policy if exists offers_store_insert on public.offers;
drop policy if exists offers_participants_update on public.offers;
drop policy if exists offers_store_delete on public.offers;

drop policy if exists invoices_talent_insert on public.invoices;
drop policy if exists invoices_participants_update on public.invoices;

drop policy if exists payments_store_update on public.payments;
