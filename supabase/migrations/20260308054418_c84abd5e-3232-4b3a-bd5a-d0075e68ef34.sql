CREATE TABLE public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL UNIQUE,
  appointments boolean NOT NULL DEFAULT true,
  blood_emergencies boolean NOT NULL DEFAULT true,
  messages boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read notification preferences"
  ON public.notification_preferences FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert notification preferences"
  ON public.notification_preferences FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update notification preferences"
  ON public.notification_preferences FOR UPDATE
  USING (true);