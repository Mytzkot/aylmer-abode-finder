DROP POLICY IF EXISTS "Anyone can unsubscribe with token" ON public.newsletter_subscribers;
REVOKE UPDATE (unsubscribed_at) ON public.newsletter_subscribers FROM anon, authenticated;