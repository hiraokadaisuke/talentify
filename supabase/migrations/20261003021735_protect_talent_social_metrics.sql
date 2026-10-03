create or replace function public.protect_talent_social_metrics()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if coalesce((select auth.role()), '') <> 'service_role' then
    new.twitter_followers := old.twitter_followers;
    new.twitter_followers_updated_at := old.twitter_followers_updated_at;
    new.instagram_followers := old.instagram_followers;
    new.instagram_followers_updated_at := old.instagram_followers_updated_at;
    new.youtube_followers := old.youtube_followers;
    new.youtube_followers_updated_at := old.youtube_followers_updated_at;
    new.tiktok_followers := old.tiktok_followers;
    new.tiktok_followers_updated_at := old.tiktok_followers_updated_at;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_talent_social_metrics on public.talents;
create trigger protect_talent_social_metrics
before update on public.talents
for each row
execute function public.protect_talent_social_metrics();
