CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id uuid REFERENCES auth.users (id) NOT NULL,
  receiver_id uuid REFERENCES auth.users (id) NOT NULL,
  text text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);
