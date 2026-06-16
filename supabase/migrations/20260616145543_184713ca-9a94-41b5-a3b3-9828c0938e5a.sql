-- Enable RLS on realtime.messages and restrict channel subscriptions to authenticated users.
-- Only the 'public:rooms' topic is intentionally broadcast (non-PII room availability).
-- Any other topic is denied by default.
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read public rooms channel" ON realtime.messages;
CREATE POLICY "Authenticated users can read public rooms channel"
  ON realtime.messages
  FOR SELECT
  TO authenticated
  USING (
    (realtime.topic() = 'public:rooms')
    AND (realtime.messages.extension IN ('postgres_changes', 'presence', 'broadcast'))
  );