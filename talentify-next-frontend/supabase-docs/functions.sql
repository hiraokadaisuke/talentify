-- update_updated_at_column
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;

-- notify_talent_on_offer_created
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
      'date', NEW.date
    ),
    false,
    now()
  );
  RETURN NEW;
END;

-- notify_talent_on_payment_created
DECLARE
  _talent_id UUID;
BEGIN
  SELECT talent_id INTO _talent_id
  FROM offers
  WHERE offers.id = NEW.offer_id;

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