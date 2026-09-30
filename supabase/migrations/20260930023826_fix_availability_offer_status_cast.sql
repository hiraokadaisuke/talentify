create or replace function public.resolve_talent_availability(_talent_id uuid, _date date)
returns public.availability_status
language plpgsql
stable
set search_path = public, pg_temp
as $function$
declare
  _user_id uuid;
  _default_mode public.availability_default_mode := 'default_ok';
  _base public.availability_status := 'ok';
  _override public.availability_status;
  _blocked boolean := false;
begin
  select t.user_id into _user_id
  from public.talents t
  where t.id = _talent_id;

  if _user_id is null then
    return 'ng'::public.availability_status;
  end if;

  select s.default_mode into _default_mode
  from public.talent_availability_settings s
  where s.user_id = _user_id;

  _base := case
    when coalesce(_default_mode, 'default_ok'::public.availability_default_mode) = 'default_ng'::public.availability_default_mode
      then 'ng'::public.availability_status
    else 'ok'::public.availability_status
  end;

  select d.status into _override
  from public.talent_availability_dates d
  where d.user_id = _user_id
    and d.the_date = _date;

  if _override is not null then
    _base := _override;
  end if;

  select exists (
    select 1
    from public.offers o
    where o.talent_id = _talent_id
      and o.date = _date
      and public.is_offer_blocking(o.status::text)
  ) into _blocked;

  if _blocked then
    return 'ng'::public.availability_status;
  end if;

  return _base;
end
$function$;
