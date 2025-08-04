-- notify_talent_on_offer_created
CREATE OR REPLACE FUNCTION public.notify_talent_on_offer_created()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  INSERT INTO notifications (
    id,
    user_id,
    type,
    data,
    is_read,
    created_at
  )
  VALUES (
    gen_random_uuid(),
    NEW.talent_id,
    'offer_created',
    jsonb_build_object(
      'offer_id', NEW.id,
      'store_id', NEW.store_id,
      'event_name', NEW.event_name,
      'visit_date', NEW.visit_date
    ),
    false,
    now()
  );

  RETURN NEW;
END;
$function$;

-- notify_talent_on_payment_created
CREATE OR REPLACE FUNCTION public.notify_talent_on_payment_created()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  _talent_id UUID;
BEGIN
  -- オファー経由でタレントIDを取得
  SELECT talent_id INTO _talent_id
  FROM offers
  WHERE offers.id = NEW.offer_id;

  -- 通知を挿入
  INSERT INTO notifications (
    user_id,
    type,
    data
  )
  VALUES (
    _talent_id,
    'payment_created',
    jsonb_build_object(
      'payment_id', NEW.id,
      'amount', NEW.amount,
      'status', NEW.status,
      'offer_id', NEW.offer_id
    )
  );
  RETURN NEW;
END;
$function$;

-- update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;
