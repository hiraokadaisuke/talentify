-- Add note column to visits for storing completion memos
alter table public.visits
  add column if not exists note text;
