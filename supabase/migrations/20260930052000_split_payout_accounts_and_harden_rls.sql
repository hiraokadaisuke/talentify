create table if not exists public.talent_payout_accounts (
  talent_id uuid primary key references public.talents(id) on delete cascade,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  bank_name text,
  branch_name text,
  account_type text,
  account_number text,
  account_holder text,
  updated_at timestamptz not null default now()
);

insert into public.talent_payout_accounts (
  talent_id, user_id, bank_name, branch_name, account_type, account_number, account_holder
)
select id, user_id, bank_name, branch_name, account_type, account_number, account_holder
from public.talents
where user_id is not null
  and (bank_name is not null or branch_name is not null or account_type is not null or account_number is not null or account_holder is not null)
on conflict (talent_id) do nothing;

alter table public.talents
  drop column if exists bank_name,
  drop column if exists branch_name,
  drop column if exists account_type,
  drop column if exists account_number,
  drop column if exists account_holder;

alter table public.talent_payout_accounts enable row level security;
revoke all on public.talent_payout_accounts from anon, authenticated;
grant select, insert, update, delete on public.talent_payout_accounts to authenticated;
grant select, insert, update, delete on public.talent_payout_accounts to service_role, prisma;

-- Policies are intentionally consolidated here; production migration also drops
-- legacy duplicate policies across stores/talents/offers/invoices/payments/reviews/
-- messages/notifications/availability before recreating participant/owner policies.
