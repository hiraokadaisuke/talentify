drop trigger if exists sync_app_user_from_company on public.companies;
drop trigger if exists set_updated_at_companies on public.companies;

alter table public.talents
  drop constraint if exists talents_company_id_fkey,
  drop constraint if exists talents_user_or_company_not_null;

drop index if exists public.idx_talents_company_id;

alter table public.talents
  drop column if exists company_id;

drop table if exists public.companies cascade;

alter table public.users
  drop constraint if exists users_role_check;

alter table public.users
  add constraint users_role_check
  check (role is null or role in ('store','talent'));

create or replace function public.sync_app_user_from_profile()
returns trigger
language plpgsql
security definer
set search_path=public,pg_temp
as $$
declare
  v_role text;
begin
  v_role := case TG_TABLE_NAME
    when 'stores' then 'store'
    when 'talents' then 'talent'
    else null
  end;

  if new.user_id is null or v_role is null then
    return new;
  end if;

  update public.users
  set role = coalesce(role, v_role),
      status = case
        when status='suspended' then status
        when coalesce(new.is_setup_complete,false) then 'active'::public.user_status
        else 'onboarding'::public.user_status
      end,
      updated_at = now()
  where auth_user_id = new.user_id
    and (role is null or role = v_role);

  return new;
end
$$;

revoke all on function public.sync_app_user_from_profile() from public, anon, authenticated;
grant execute on function public.sync_app_user_from_profile() to service_role, prisma;
