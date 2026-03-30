-- Update pipeline stages for insurance-specific workflow
-- This adds stages commonly used in insurance sales tracking

-- First, check if we're dealing with the default org (for seeding purposes)
DO $$
DECLARE
  org_id UUID := '11111111-1111-1111-1111-111111111111';
  existing_count INTEGER;
BEGIN
  -- Count existing stages for the org
  SELECT COUNT(*) INTO existing_count FROM pipeline_stages WHERE organization_id = org_id;

  -- Only proceed if we have the default 6 stages
  IF existing_count = 6 THEN
    -- Delete existing stages for clean slate
    DELETE FROM pipeline_stages WHERE organization_id = org_id;

    -- Insert insurance-specific stages
    INSERT INTO pipeline_stages (organization_id, name, color, position, is_closed, is_won) VALUES
      (org_id, 'New Lead', '#3B82F6', 1, false, false),
      (org_id, 'Approached', '#8B5CF6', 2, false, false),
      (org_id, 'Presentation', '#6366F1', 3, false, false),
      (org_id, 'Proposal Sent', '#EAB308', 4, false, false),
      (org_id, 'Follow-up', '#06B6D4', 5, false, false),
      (org_id, 'Pre-App Submitted', '#F97316', 6, false, false),
      (org_id, 'Outstanding Requirements', '#F59E0B', 7, false, false),
      (org_id, 'For Closing', '#14B8A6', 8, false, false),
      (org_id, 'Issued - Won', '#22C55E', 9, true, true),
      (org_id, 'Closed - Lost', '#EF4444', 10, true, false);

    -- Reassign leads from deleted stages to 'New Lead'
    UPDATE leads
    SET stage_id = (SELECT id FROM pipeline_stages WHERE organization_id = org_id AND position = 1)
    WHERE organization_id = org_id
      AND stage_id NOT IN (SELECT id FROM pipeline_stages WHERE organization_id = org_id);
  END IF;
END $$;
