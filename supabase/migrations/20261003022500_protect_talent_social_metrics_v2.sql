create or replace function public.protect_talent_social_metrics()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if coalesce((select auth.role()), '') <> 'service_role' then
    if tg_op = 'INSERT' then
      new.twitter_followers := null;
      new.twitter_followers_updated_at := null;
      new.instagram_followers := null;
      new.instagram_followers_updated_at := null;
      new.youtube_followers := null;
      new.youtube_followers_updated_at := null;
      new.tiktok_followers := null;
      new.tiktok_followers_updated_at := null;
    else
      if new.twitter_url is distinct from old.twitter_url then
        new.twitter_followers := null;
        new.twitter_followers_updated_at := null;
      else
        new.twitter_followers := old.twitter_followers;
        new.twitter_followers_updated_at := old.twitter_followers_updated_at;
      end if;

      if new.instagram_url is distinct from old.instagram_url then
        new.instagram_followers := null;
        new.instagram_followers_updated_at := null;
      else
        new.instagram_followers := old.instagram_followers;
        new.instagram_followers_updated_at := old.instagram_followers_updated_at;
      end if;

      if new.youtube_url is distinct from old.youtube_url then
        new.youtube_followers := null;
        new.youtube_followers_updated_at := null;
      else
        new.youtube_followers := old.youtube_followers;
        new.youtube_followers_updated_at := old.youtube_followers_updated_at;
      end if;

      if new.social_tiktok is distinct from old.social_tiktok then
        new.tiktok_followers := null;
        new.tiktok_followers_updated_at := null;
      else
        new.tiktok_followers := old.tiktok_followers;
        new.tiktok_followers_updated_at := old.tiktok_followers_updated_at;
      end if;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_talent_social_metrics on public.talents;
create trigger protect_talent_social_metrics
before insert or update on public.talents
for each row
execute function public.protect_talent_social_metrics();
