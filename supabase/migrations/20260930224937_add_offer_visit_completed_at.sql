alter table public.offers
  add column if not exists visit_completed_at timestamptz;
