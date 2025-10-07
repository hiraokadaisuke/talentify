-- notify_talent_on_offer_created
CREATE OR REPLACE FUNCTION public.notify_talent_on_offer_created()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  _user_id uuid;
begin
  select t.user_id into _user_id
  from public.talents t
  where t.id = NEW.talent_id;

  if _user_id is not null then
    insert into public.notifications (
      id, user_id, type, data, is_read, created_at
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
begin
  if to_jsonb(NEW) ? 'updated_at' then
    NEW.updated_at = now();
  end if;
  return NEW;
end;
$function$;

-- handle_review_insert
CREATE OR REPLACE FUNCTION public.handle_review_insert()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- レビューに紐づくオファーの status を 'completed' に更新し、updated_at も更新
  UPDATE public.offers
  SET status = 'completed',
      updated_at = now()
  WHERE id = NEW.offer_id;
  RETURN NEW;
END;
$function$;

-- notify_review_received
CREATE OR REPLACE FUNCTION public.notify_review_received()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_talent_user_id uuid;
begin
  -- 対象オファーのタレント user_id を取得
  select t.user_id
    into v_talent_user_id
  from public.offers o
  join public.talents t on t.id = o.talent_id
  where o.id = NEW.offer_id;

  if v_talent_user_id is null then
    return null; -- 念のため
  end if;

  -- 通知を挿入（notifications は service_role しか許可していないが、
  -- security definer なのでこの関数経由なら作成できる）
  insert into public.notifications (user_id, type, data)
  values (
    v_talent_user_id,
    'review_received',
    jsonb_build_object(
      'review_id', NEW.id,
      'offer_id', NEW.offer_id,
      'store_id', NEW.store_id,
      'talent_id', NEW.talent_id,
      'rating', NEW.rating,
      'is_public', NEW.is_public
    )
  );

  return null; -- AFTERトリガーなので戻り値は未使用
end;
$function$;

-- notify_talent_on_review_created
CREATE OR REPLACE FUNCTION public.notify_talent_on_review_created()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  INSERT INTO public.notifications (
    id,
    user_id,
    type,
    data,
    is_read,
    created_at
  )
  VALUES (
    gen_random_uuid(),
    NEW.talent_id,      -- 通知対象はレビューされたタレント
    'review_received',  -- enums.md に定義済み:contentReference[oaicite:0]{index=0}
    jsonb_build_object(
      'review_id', NEW.id,
      'offer_id', NEW.offer_id,
      'store_id', NEW.store_id,
      'rating', NEW.rating,
      'comment', NEW.comment
    ),
    false,
    now()
  );
  RETURN NEW;
END;
$function$;

-- reviews_fill_and_validate
CREATE OR REPLACE FUNCTION public.reviews_fill_and_validate()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
declare
  o record;
begin
  -- オファー取得
  select id, store_id, talent_id into o
  from public.offers
  where id = new.offer_id;

  if o.id is null then
    raise exception 'Invalid offer_id: %', new.offer_id using errcode = '23503';
  end if;

  -- store_id / talent_id が無い or 不一致なら上書き
  if new.store_id is null or new.store_id <> o.store_id then
    new.store_id := o.store_id;
  end if;
  if new.talent_id is null or new.talent_id <> o.talent_id then
    new.talent_id := o.talent_id;
  end if;

  -- rating の簡易チェック（NULLは許容のまま）
  if new.rating is not null and (new.rating < 1 or new.rating > 5) then
    raise exception 'rating must be between 1 and 5 (got %)', new.rating using errcode = '22023';
  end if;

  -- category_ratings 未指定なら {}
  if new.category_ratings is null then
    new.category_ratings := '{}'::jsonb;
  end if;

  return new;
end;
$function$;

-- create_payment_on_offer_confirmed
CREATE OR REPLACE FUNCTION public.create_payment_on_offer_confirmed()
RETURNS trigger
LANGUAGE plpgsql
AS $$
begin
  if exists (select 1 from public.payments p where p.offer_id = new.id) then
    return new;
  end if;

  if new.status = 'confirmed' then
    insert into public.payments (offer_id, amount, status, created_at, updated_at)
    values (new.id, new.invoice_amount, 'pending', now(), now());
  end if;

  return new;
end;
$$;

-- set_review_store_id
CREATE OR REPLACE FUNCTION public.set_review_store_id()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  if new.store_id is null then
    select o.store_id into new.store_id
    from public.offers o
    where o.id = new.offer_id;
  end if;
  return new;
end;
$function$;

-- talent_accept_offer
CREATE OR REPLACE FUNCTION public.talent_accept_offer(p_offer_id uuid)
 RETURNS offers
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select public.talent_update_offer_status(p_offer_id, 'confirmed', null);
$function$;

-- talent_reject_offer
CREATE OR REPLACE FUNCTION public.talent_reject_offer(p_offer_id uuid, p_message text DEFAULT NULL::text)
 RETURNS offers
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select public.talent_update_offer_status(p_offer_id, 'rejected', p_message);
$function$;

-- talent_update_offer_status
CREATE OR REPLACE FUNCTION public.talent_update_offer_status(p_offer_id uuid, p_next_status text, p_message text DEFAULT NULL::text)
 RETURNS offers
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_offer public.offers;
  v_talent_user_id uuid;
begin
  -- 対象オファー取得
  select * into v_offer from public.offers where id = p_offer_id;
  if not found then
    raise exception 'offer not found';
  end if;

  -- このオファーのタレントの user_id を取得
  select t.user_id into v_talent_user_id
  from public.talents t
  where t.id = v_offer.talent_id;

  -- 呼び出しユーザーが当該タレント本人か検証
  if v_talent_user_id is null or v_talent_user_id <> auth.uid() then
    raise exception 'forbidden';
  end if;

  -- 許可する遷移のみ
  if p_next_status not in ('confirmed','rejected') then
    raise exception 'invalid status %', p_next_status;
  end if;

  -- 許可カラムのみ更新
  update public.offers
  set
    status      = p_next_status,
    message     = coalesce(p_message, message),
    accepted_at = case when p_next_status = 'confirmed' then now() else accepted_at end,
    updated_at  = now()
  where id = p_offer_id
  returning * into v_offer;

  return v_offer;
end;
$function$;
