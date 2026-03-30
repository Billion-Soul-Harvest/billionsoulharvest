-- Lead Activities table for comprehensive activity tracking
CREATE TABLE lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('call', 'email', 'meeting', 'note', 'stage_change', 'task_completed')),
  subject TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  occurred_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add scoring columns to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS score_factors JSONB DEFAULT '{}';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_scored_at TIMESTAMPTZ;

-- Indexes for lead_activities
CREATE INDEX idx_lead_activities_lead ON lead_activities(lead_id);
CREATE INDEX idx_lead_activities_organization ON lead_activities(organization_id);
CREATE INDEX idx_lead_activities_type ON lead_activities(activity_type);
CREATE INDEX idx_lead_activities_occurred ON lead_activities(occurred_at DESC);

-- Index for lead scoring
CREATE INDEX idx_leads_score ON leads(lead_score DESC);

-- Enable RLS on lead_activities
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lead_activities
CREATE POLICY "org_isolation_select" ON lead_activities
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "org_members_can_insert_activities" ON lead_activities
  FOR INSERT WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "org_members_can_update_activities" ON lead_activities
  FOR UPDATE USING (organization_id = get_user_organization_id());

CREATE POLICY "org_members_can_delete_activities" ON lead_activities
  FOR DELETE USING (organization_id = get_user_organization_id());

-- Function to calculate lead score
CREATE OR REPLACE FUNCTION calculate_lead_score(lead_row leads)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  demographic_score INTEGER := 0;
  engagement_score INTEGER := 0;
  source_score INTEGER := 0;
  days_in_pipeline INTEGER;
  completed_tasks INTEGER;
  stage_position INTEGER;
BEGIN
  -- Demographic factors (40% weight, max 40 points)
  IF lead_row.email IS NOT NULL AND lead_row.email != '' THEN
    demographic_score := demographic_score + 10;
  END IF;
  IF lead_row.phone IS NOT NULL AND lead_row.phone != '' THEN
    demographic_score := demographic_score + 10;
  END IF;
  IF lead_row.date_of_birth IS NOT NULL THEN
    demographic_score := demographic_score + 5;
  END IF;
  IF lead_row.financial_goals IS NOT NULL AND lead_row.financial_goals != '' THEN
    demographic_score := demographic_score + 15;
  END IF;

  -- Engagement factors (40% weight, max 40 points)
  -- Get completed tasks count
  SELECT COUNT(*) INTO completed_tasks
  FROM tasks
  WHERE lead_id = lead_row.id AND status = 'done';

  engagement_score := engagement_score + LEAST(completed_tasks * 5, 15);

  -- Days in pipeline penalty (after 14 days, -2 per week, max -10)
  days_in_pipeline := EXTRACT(DAY FROM (now() - lead_row.created_at));
  IF days_in_pipeline > 14 THEN
    engagement_score := engagement_score - LEAST(((days_in_pipeline - 14) / 7) * 2, 10);
  END IF;

  -- Stage progression bonus
  SELECT position INTO stage_position
  FROM pipeline_stages
  WHERE id = lead_row.stage_id;

  IF stage_position IS NOT NULL THEN
    engagement_score := engagement_score + LEAST((stage_position - 1) * 10, 25);
  END IF;

  -- Source factors (20% weight, max 20 points)
  CASE LOWER(COALESCE(lead_row.source, ''))
    WHEN 'referral' THEN source_score := 20;
    WHEN 'website' THEN source_score := 10;
    WHEN 'cold call' THEN source_score := 5;
    WHEN 'social media' THEN source_score := 8;
    WHEN 'event' THEN source_score := 12;
    ELSE source_score := 3;
  END CASE;

  score := GREATEST(demographic_score + engagement_score + source_score, 0);
  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql STABLE;

-- Trigger to auto-update lead score on lead changes
CREATE OR REPLACE FUNCTION update_lead_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.lead_score := calculate_lead_score(NEW);
  NEW.last_scored_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_lead_score
  BEFORE INSERT OR UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_lead_score();

-- Update existing leads with scores
UPDATE leads SET lead_score = calculate_lead_score(leads), last_scored_at = now();
