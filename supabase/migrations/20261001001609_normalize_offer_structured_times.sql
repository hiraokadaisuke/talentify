-- Make structured start/end timestamps the canonical offer time fields.
-- time_range remains as a normalized display/legacy field and is derived from
-- start_time/end_time by the trigger below.

create or replace function public.normalize_offer_times()
returns trigger
language plpgsql
set search_path to 'public', 'pg_temp'
as $function$
declare
  m text[];
  start_hour integer;
  start_minute integer;
  end_hour integer;
  end_minute integer;
  offer_day date;
begin
  offer_day := (new.date at time zone 'Asia/Tokyo')::date;

  if new.start_time is null or new.end_time is null then
    m := regexp_match(
      coalesce(new.time_range, ''),
      '^\s*([0-9]{1,2}):([0-9]{2})\s*[〜～~–—-]\s*([0-9]{1,2}):([0-9]{2})\s*$'
    );

    if m is null then
      raise exception 'A valid offer time range is required'
        using errcode = '23514';
    end if;

    start_hour := m[1]::integer;
    start_minute := m[2]::integer;
    end_hour := m[3]::integer;
    end_minute := m[4]::integer;

    if start_hour not between 0 and 23
       or end_hour not between 0 and 23
       or start_minute not between 0 and 59
       or end_minute not between 0 and 59 then
      raise exception 'Offer time is out of range'
        using errcode = '23514';
    end if;

    new.start_time := offer_day + make_time(start_hour, start_minute, 0);
    new.end_time := offer_day + make_time(end_hour, end_minute, 0);
  else
    new.start_time := offer_day + new.start_time::time;
    new.end_time := offer_day + new.end_time::time;
  end if;

  if new.end_time <= new.start_time then
    raise exception 'Offer end time must be after start time'
      using errcode = '23514';
  end if;

  new.time_range :=
    to_char(new.start_time, 'HH24:MI')
    || '〜'
    || to_char(new.end_time, 'HH24:MI');

  return new;
end
$function$;

drop trigger if exists trg_normalize_offer_times on public.offers;
create trigger trg_normalize_offer_times
before insert or update of date, start_time, end_time, time_range
on public.offers
for each row
execute function public.normalize_offer_times();

-- Backfill valid legacy time_range values through the same normalization logic.
update public.offers
set time_range = time_range;

alter table public.offers
  alter column start_time set not null,
  alter column end_time set not null,
  alter column time_range set not null;

alter table public.offers
  drop constraint if exists offers_time_order_check;

alter table public.offers
  add constraint offers_time_order_check
  check (end_time > start_time);
