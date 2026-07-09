-- Add body_json column for block-based email editor
ALTER TABLE campaign_templates ADD COLUMN IF NOT EXISTS body_json jsonb;

-- Recreate the stats view so it picks up the new column (ct.* is snapshotted at view creation)
DROP VIEW IF EXISTS email_template_stats;
CREATE VIEW email_template_stats AS
SELECT
  ct.*,
  COALESCE(SUM(c.total_recipients), 0)::int AS total_sends,
  COALESCE(SUM(c.delivered_count), 0)::int AS total_delivered,
  COALESCE(SUM(c.opened_count), 0)::int AS total_opened,
  COALESCE(SUM(c.clicked_count), 0)::int AS total_clicked,
  COALESCE(SUM(c.bounced_count), 0)::int AS total_bounced,
  MAX(c.completed_at) AS last_sent_at,
  COUNT(c.id) FILTER (WHERE c.status IN ('sent', 'sending'))::int AS send_count
FROM campaign_templates ct
LEFT JOIN campaigns c ON c.template_id = ct.id
GROUP BY ct.id;
