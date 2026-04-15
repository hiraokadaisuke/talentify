DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'user_status' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.user_status AS ENUM (
      'pending_email_verification',
      'onboarding',
      'active',
      'suspended'
    );
  END IF;
END
$$;

ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS auth_user_id uuid,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS role text,
  ADD COLUMN IF NOT EXISTS status public.user_status NOT NULL DEFAULT 'pending_email_verification',
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'users' AND n.nspname = 'public') THEN
    BEGIN
      ALTER TABLE public.users ADD CONSTRAINT users_auth_user_id_key UNIQUE (auth_user_id);
    EXCEPTION
      WHEN duplicate_table THEN
        NULL;
      WHEN duplicate_object THEN
        NULL;
    END;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users (role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users (status);
