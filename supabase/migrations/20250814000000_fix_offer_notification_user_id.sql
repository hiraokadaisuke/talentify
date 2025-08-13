create or replace function public.notify_talent_on_offer_created()
returns trigger
language plpgsql
as $$
declare
  _user_id uuid;
begin
  select user_id into _user_id from public.talents where id = NEW.talent_id;
  if _user_id is not null then
    insert into public.notifications (
      id,
      user_id,
      type,
      data,
      is_read,
      created_at
    )
    values (
      gen_random_uuid(),
      _user_id,
      'offer_created',
      jsonb_build_object(
        'offer_id', NEW.id,
        'store_id', NEW.store_id,
        'event_name', NEW.event_name,
        'date', NEW.date
      ),
      false,
      now()
    );
  end if;
  return NEW;
end;
$$;

