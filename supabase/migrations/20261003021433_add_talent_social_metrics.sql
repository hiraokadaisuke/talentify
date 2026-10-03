alter table public.talents
  add column if not exists twitter_followers bigint check (twitter_followers is null or twitter_followers >= 0),
  add column if not exists twitter_followers_updated_at timestamptz,
  add column if not exists instagram_followers bigint check (instagram_followers is null or instagram_followers >= 0),
  add column if not exists instagram_followers_updated_at timestamptz,
  add column if not exists youtube_followers bigint check (youtube_followers is null or youtube_followers >= 0),
  add column if not exists youtube_followers_updated_at timestamptz,
  add column if not exists tiktok_followers bigint check (tiktok_followers is null or tiktok_followers >= 0),
  add column if not exists tiktok_followers_updated_at timestamptz;

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
  twitter_followers,
  twitter_followers_updated_at,
  instagram_followers,
  instagram_followers_updated_at,
  youtube_followers,
  youtube_followers_updated_at,
  tiktok_followers,
  tiktok_followers_updated_at
from public.talents
where is_profile_complete = true;

revoke all on table public.public_talent_profiles from public, anon, authenticated;
grant select on table public.public_talent_profiles to authenticated, service_role, prisma;
