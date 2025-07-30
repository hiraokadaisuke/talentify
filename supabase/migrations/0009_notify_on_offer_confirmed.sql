-- Notify talent and create schedule when offer status becomes confirmed

-- Ensure columns exist
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS fixed_date date;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS time_range text;

-- Function to handle status change
CREATE OR REPLACE FUNCTION public.handle_offer_confirmed()
RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'confirmed' AND NEW.fixed_date IS NOT NULL THEN
    -- Insert schedule entry for the talent
    INSERT INTO public.schedules (user_id, date, description, related_offer_id, role)
    VALUES (
      NEW.talent_id,
      NEW.fixed_date,
      (SELECT store_name FROM public.stores WHERE id = NEW.store_id),
      NEW.id,
      'offer_confirmed'
    );

    -- Insert notification
    INSERT INTO public.notifications (user_id, type, data)
    VALUES (
      NEW.talent_id,
      'offer_updated',
      jsonb_build_object('offer_id', NEW.id, 'fixed_date', NEW.fixed_date)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_offer_confirmed ON public.offers;
CREATE TRIGGER trigger_offer_confirmed
AFTER UPDATE OF status ON public.offers
FOR EACH ROW
WHEN (NEW.status = 'confirmed' AND (OLD.status IS DISTINCT FROM NEW.status))
EXECUTE FUNCTION public.handle_offer_confirmed();
