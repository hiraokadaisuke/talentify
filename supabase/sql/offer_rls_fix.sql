-- Allow talents to update their own offers
-- This policy permits a talent to modify offers where they are the talent.
-- It should be executed on the Supabase project.

-- Ensure enum offer_status includes 'accepted'
-- (if not already present)
--   ALTER TYPE offer_status ADD VALUE IF NOT EXISTS 'accepted';

-- Allow talents to update offers
create policy "Talents can update their offers"
  on public.offers for update
  using ( auth.uid() = talent_id )
  with check ( auth.uid() = talent_id );

-- Optionally ensure stores retain update rights
create policy if not exists "Stores can update their offers"
  on public.offers for update
  using ( auth.uid() = store_id )
  with check ( auth.uid() = store_id );
