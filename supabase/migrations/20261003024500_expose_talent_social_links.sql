drop view if exists public.public_talent_profiles;
create view public.public_talent_profiles
with (security_invoker = true)
as
select
  id,
  display_name,
  stage_name,
  genre,
  area,
  avatar_url,
  rating,
  rate,
  bio,
  twitter_url,
  instagram_url,
  youtube_url,
  social_tiktok
from public.talents
where is_profile_complete = true;

revoke all on table public.public_talent_profiles from public, anon, authenticated;
grant select on table public.public_talent_profiles to authenticated, service_role, prisma;
