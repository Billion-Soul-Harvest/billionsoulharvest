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
    -- Insert insurance-specific stages first (with temporary positions to avoid conflicts)
    INSERT INTO pipeline_stages (organization_id, name, color, position, is_closed, is_won) VALUES
      (org_id, 'New Lead', '#3B82F6', 11, false, false),
      (org_id, 'Approached', '#8B5CF6', 12, false, false),
      (org_id, 'Presentation', '#6366F1', 13, false, false),
      (org_id, 'Proposal Sent', '#EAB308', 14, false, false),
      (org_id, 'Follow-up', '#06B6D4', 15, false, false),
      (org_id, 'Pre-App Submitted', '#F97316', 16, false, false),
      (org_id, 'Outstanding Requirements', '#F59E0B', 17, false, false),
      (org_id, 'For Closing', '#14B8A6', 18, false, false),
      (org_id, 'Issued - Won', '#22C55E', 19, true, true),
      (org_id, 'Closed - Lost', '#EF4444', 20, true, false);

    -- Reassign leads from old stages to new 'New Lead' stage
    UPDATE leads
    SET stage_id = (SELECT id FROM pipeline_stages WHERE organization_id = org_id AND position = 11)
    WHERE organization_id = org_id
      AND stage_id IN (SELECT id FROM pipeline_stages WHERE organization_id = org_id AND position <= 6);

    -- Now safe to delete old stages
    DELETE FROM pipeline_stages WHERE organization_id = org_id AND position <= 6;

    -- Update positions to correct values
    UPDATE pipeline_stages SET position = 1 WHERE organization_id = org_id AND position = 11;
    UPDATE pipeline_stages SET position = 2 WHERE organization_id = org_id AND position = 12;
    UPDATE pipeline_stages SET position = 3 WHERE organization_id = org_id AND position = 13;
    UPDATE pipeline_stages SET position = 4 WHERE organization_id = org_id AND position = 14;
    UPDATE pipeline_stages SET position = 5 WHERE organization_id = org_id AND position = 15;
    UPDATE pipeline_stages SET position = 6 WHERE organization_id = org_id AND position = 16;
    UPDATE pipeline_stages SET position = 7 WHERE organization_id = org_id AND position = 17;
    UPDATE pipeline_stages SET position = 8 WHERE organization_id = org_id AND position = 18;
    UPDATE pipeline_stages SET position = 9 WHERE organization_id = org_id AND position = 19;
    UPDATE pipeline_stages SET position = 10 WHERE organization_id = org_id AND position = 20;
  END IF;
END $$;
