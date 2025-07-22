CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_id uuid REFERENCES public.offers(id) NOT NULL UNIQUE,
  store_id uuid REFERENCES public.stores(id) NOT NULL,
  talent_id uuid REFERENCES public.talents(id) NOT NULL,
  rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  category_ratings jsonb,
  comment text,
  is_public boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);
