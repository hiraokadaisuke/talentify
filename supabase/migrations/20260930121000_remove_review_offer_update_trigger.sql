-- Review submission no longer changes offer status.
-- Payment completion is the canonical transition that marks an offer completed.
-- The old AFTER INSERT trigger attempted to UPDATE offers as the authenticated
-- browser user, which is intentionally forbidden by our server-only mutation model.

drop trigger if exists trigger_set_offer_completed_on_review on public.reviews;
drop function if exists public.handle_review_insert();
