-- Add estimated_value field to leads table for pipeline value tracking
ALTER TABLE leads ADD COLUMN estimated_value NUMERIC DEFAULT 0;

-- Add last_contact_at field for tracking contact history
ALTER TABLE leads ADD COLUMN last_contact_at TIMESTAMPTZ;

-- Create index for filtering by estimated_value
CREATE INDEX idx_leads_estimated_value ON leads(estimated_value);

-- Update last_contact_at from most recent activity
UPDATE leads l
SET last_contact_at = (
  SELECT MAX(occurred_at)
  FROM lead_activities la
  WHERE la.lead_id = l.id
  AND la.activity_type IN ('call', 'email', 'meeting')
);
