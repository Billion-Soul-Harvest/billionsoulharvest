-- Note: Database webhooks are configured via Supabase Dashboard or CLI
-- This file documents the webhook configuration for reference

/*
Webhook Configuration:
- Name: booking_status_notification
- Table: bookings
- Events: UPDATE
- URL: ${SUPABASE_URL}/functions/v1/send-notification
- Headers:
  - Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}
  - Content-Type: application/json

The webhook payload format:
{
  "type": "UPDATE",
  "table": "bookings",
  "record": { ... new row ... },
  "old_record": { ... old row ... }
}

To configure via Supabase CLI:
supabase secrets set WEBHOOK_SECRET=your_secret

Or configure manually in Supabase Dashboard:
Database > Webhooks > Create Webhook
*/

-- Enable realtime for bookings table (for mobile app subscriptions)
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;

COMMENT ON TABLE bookings IS 'Realtime enabled for mobile app status updates';
