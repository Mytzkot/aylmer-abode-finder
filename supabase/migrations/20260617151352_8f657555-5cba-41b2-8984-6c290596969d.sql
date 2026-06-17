ALTER TABLE public.newsletter_subscribers
  ADD COLUMN IF NOT EXISTS unsubscribed_at timestamptz,
  ADD COLUMN IF NOT EXISTS unsubscribe_token uuid NOT NULL DEFAULT gen_random_uuid();

CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscribers_unsubscribe_token_idx
  ON public.newsletter_subscribers(unsubscribe_token);

-- Allow anonymous visitors to update their own row via a valid token (used by the unsubscribe page).
DROP POLICY IF EXISTS "Anyone can unsubscribe with token" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can unsubscribe with token"
  ON public.newsletter_subscribers
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

GRANT UPDATE (unsubscribed_at) ON public.newsletter_subscribers TO anon, authenticated;