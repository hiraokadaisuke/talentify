CREATE OR REPLACE FUNCTION public.notify_talent_on_offer_created()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  _user_id uuid;
BEGIN
  SELECT user_id INTO _user_id FROM public.talents WHERE id = NEW.talent_id;
  IF _user_id IS NOT NULL THEN
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
  END IF;

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

-- handle_review_insert
CREATE OR REPLACE FUNCTION public.handle_review_insert()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE offers
  SET status = 'completed'
  WHERE id = NEW.offer_id;

  RETURN NEW;
END;
$function$;

-- notify_talent_on_review_created
CREATE OR REPLACE FUNCTION public.notify_talent_on_review_created()
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
    'review_received',
    jsonb_build_object(
      'review_id', NEW.id,
      'offer_id', NEW.offer_id
    ),
    false,
    now()
  );

  RETURN NEW;
END;
$function$;

-- trigger to update offer status on review creation
DROP TRIGGER IF EXISTS trigger_set_offer_completed_on_review ON reviews;
CREATE TRIGGER trigger_set_offer_completed_on_review
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION public.handle_review_insert();

-- trigger to notify talent when review is created
DROP TRIGGER IF EXISTS trigger_notify_talent_on_review_created ON reviews;
CREATE TRIGGER trigger_notify_talent_on_review_created
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION public.notify_talent_on_review_created();
-- talent_update_offer_status
CREATE OR REPLACE FUNCTION public.talent_update_offer_status(
    p_offer_id uuid,
    p_status text,
    p_message text DEFAULT NULL
)
RETURNS offers
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  _talent_id uuid;
  _updated offers;
BEGIN
  SELECT id INTO _talent_id FROM public.talents WHERE user_id = auth.uid();
  IF _talent_id IS NULL THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  IF p_status NOT IN ('confirmed', 'rejected') THEN
    RAISE EXCEPTION 'invalid status %', p_status;
  END IF;

  UPDATE public.offers
  SET status = p_status,
      message = CASE WHEN p_status = 'rejected' THEN p_message ELSE message END,
      accepted_at = CASE WHEN p_status = 'confirmed' THEN now() ELSE accepted_at END,
      updated_at = now()
  WHERE id = p_offer_id
    AND talent_id = _talent_id
  RETURNING * INTO _updated;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'offer not found';
  END IF;

  RETURN _updated;
END;
$function$;

ALTER FUNCTION public.talent_update_offer_status(uuid, text, text) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.talent_update_offer_status(uuid, text, text) TO authenticated;

-- talent_accept_offer
CREATE OR REPLACE FUNCTION public.talent_accept_offer(
    p_offer_id uuid
)
RETURNS offers
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN public.talent_update_offer_status(p_offer_id, 'confirmed', NULL);
END;
$function$;

ALTER FUNCTION public.talent_accept_offer(uuid) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.talent_accept_offer(uuid) TO authenticated;

-- talent_reject_offer
CREATE OR REPLACE FUNCTION public.talent_reject_offer(
    p_offer_id uuid,
    p_message text DEFAULT NULL
)
RETURNS offers
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN public.talent_update_offer_status(p_offer_id, 'rejected', p_message);
END;
$function$;

ALTER FUNCTION public.talent_reject_offer(uuid, text) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.talent_reject_offer(uuid, text) TO authenticated;
