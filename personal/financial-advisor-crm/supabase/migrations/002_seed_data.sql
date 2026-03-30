-- Seed Data for Testing
-- This migration adds sample leads, tasks, and activity logs

DO $$
DECLARE
  org_id UUID := '11111111-1111-1111-1111-111111111111';
  user_id UUID := '22222222-2222-2222-2222-222222222222';
  stage_new UUID;
  stage_contacted UUID;
  stage_meeting UUID;
  stage_proposal UUID;
  stage_won UUID;
  stage_lost UUID;
  lead1_id UUID;
  lead2_id UUID;
  lead3_id UUID;
  lead4_id UUID;
  lead5_id UUID;
  lead6_id UUID;
  lead7_id UUID;
  lead8_id UUID;
BEGIN
  -- Create test organization (if not exists)
  INSERT INTO organizations (id, name, slug, settings, created_at)
  VALUES (org_id, 'Test Organization', 'test-org', '{}', now())
  ON CONFLICT (id) DO NOTHING;

  -- Create test auth user (if not exists)
  INSERT INTO auth.users (
    id, instance_id, aud, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
    is_super_admin, role,
    confirmation_token, recovery_token, email_change_token_new, email_change,
    phone_change, phone_change_token, email_change_token_current, reauthentication_token,
    email_change_confirm_status, is_sso_user, is_anonymous
  )
  VALUES (
    user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'test@example.com',
    '$2a$10$7GYuv7zPeOi8hI02OAvq.ucejYVD8yFuCaWhA4BX1ijKRmKFJqiKe', -- password: password123
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    false,
    'authenticated',
    '', '', '', '',
    '', '', '', '',
    0, false, false
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create auth identity for email provider (required for Supabase auth)
  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (
    user_id,
    user_id,
    jsonb_build_object('sub', user_id::text, 'email', 'test@example.com', 'email_verified', true, 'phone_verified', false),
    'email',
    'test@example.com',
    now(),
    now(),
    now()
  )
  ON CONFLICT (provider, provider_id) DO NOTHING;

  -- Create test user profile (if not exists)
  INSERT INTO users (id, organization_id, email, full_name, role, created_at)
  VALUES (user_id, org_id, 'test@example.com', 'Test User', 'admin', now())
  ON CONFLICT (id) DO NOTHING;
  -- Get stage IDs (handle both old and new stage configurations)
  SELECT id INTO stage_new FROM pipeline_stages WHERE organization_id = org_id AND position = 1;
  SELECT id INTO stage_contacted FROM pipeline_stages WHERE organization_id = org_id AND position = 2;
  SELECT id INTO stage_meeting FROM pipeline_stages WHERE organization_id = org_id AND position = 3;
  SELECT id INTO stage_proposal FROM pipeline_stages WHERE organization_id = org_id AND position = 4;

  -- For won/lost, look for stages marked as closed
  SELECT id INTO stage_won FROM pipeline_stages WHERE organization_id = org_id AND is_closed = true AND is_won = true ORDER BY position LIMIT 1;
  SELECT id INTO stage_lost FROM pipeline_stages WHERE organization_id = org_id AND is_closed = true AND is_won = false ORDER BY position LIMIT 1;

  -- Fallback to default first stage if any stage is NULL
  IF stage_new IS NULL OR stage_contacted IS NULL OR stage_meeting IS NULL OR stage_proposal IS NULL OR stage_won IS NULL OR stage_lost IS NULL THEN
    SELECT id INTO stage_new FROM pipeline_stages WHERE organization_id = org_id ORDER BY position LIMIT 1;
    stage_contacted := stage_new;
    stage_meeting := stage_new;
    stage_proposal := stage_new;
    stage_won := stage_new;
    stage_lost := stage_new;
  END IF;

  -- Generate lead IDs
  lead1_id := gen_random_uuid();
  lead2_id := gen_random_uuid();
  lead3_id := gen_random_uuid();
  lead4_id := gen_random_uuid();
  lead5_id := gen_random_uuid();
  lead6_id := gen_random_uuid();
  lead7_id := gen_random_uuid();
  lead8_id := gen_random_uuid();

  -- Insert sample leads
  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, email, phone, date_of_birth, source, financial_goals, notes, created_at, updated_at)
  VALUES
    (lead1_id, org_id, user_id, stage_new, 'John', 'Smith', 'john.smith@email.com', '(555) 123-4567', '1985-03-15', 'Website', 'Retirement planning, college fund for kids', 'Interested in 401k rollover from previous employer', now() - interval '2 days', now() - interval '2 days'),
    (lead2_id, org_id, user_id, stage_new, 'Sarah', 'Johnson', 'sarah.j@email.com', '(555) 234-5678', '1990-07-22', 'Referral', 'First-time investor, building emergency fund', 'Referred by Michael Chen', now() - interval '1 day', now() - interval '1 day'),
    (lead3_id, org_id, user_id, stage_contacted, 'Michael', 'Williams', 'mwilliams@email.com', '(555) 345-6789', '1978-11-08', 'LinkedIn', 'Estate planning, life insurance review', 'Business owner, needs comprehensive review', now() - interval '5 days', now() - interval '3 days'),
    (lead4_id, org_id, user_id, stage_contacted, 'Emily', 'Brown', 'emily.brown@email.com', '(555) 456-7890', '1982-01-30', 'Seminar', 'Tax optimization, investment diversification', 'Met at retirement planning seminar', now() - interval '4 days', now() - interval '2 days'),
    (lead5_id, org_id, user_id, stage_meeting, 'David', 'Garcia', 'dgarcia@email.com', '(555) 567-8901', '1975-09-12', 'Referral', 'Wealth preservation, charitable giving', 'High net worth individual, referred by attorney', now() - interval '7 days', now() - interval '1 day'),
    (lead6_id, org_id, user_id, stage_proposal, 'Jennifer', 'Martinez', 'jmartinez@email.com', '(555) 678-9012', '1988-04-25', 'Website', 'Home purchase, debt consolidation', 'Pre-approved for mortgage, needs investment advice', now() - interval '10 days', now() - interval '2 days'),
    (lead7_id, org_id, user_id, stage_won, 'Robert', 'Anderson', 'randerson@email.com', '(555) 789-0123', '1970-12-03', 'Cold Call', 'Retirement income strategy', 'Signed up for managed portfolio', now() - interval '14 days', now() - interval '3 days'),
    (lead8_id, org_id, user_id, stage_lost, 'Lisa', 'Thompson', 'lthompson@email.com', '(555) 890-1234', '1992-06-18', 'Website', 'Student loan payoff, starting investments', 'Decided to wait until loans paid off', now() - interval '12 days', now() - interval '5 days');

  -- Insert sample tasks
  -- Overdue tasks
  INSERT INTO tasks (organization_id, lead_id, assigned_to, title, description, due_date, priority, status)
  VALUES
    (org_id, lead3_id, user_id, 'Follow up on insurance quote', 'Send life insurance quote comparison', now() - interval '2 days', 'high', 'pending'),
    (org_id, lead4_id, user_id, 'Send tax documents checklist', 'Email list of required documents for tax review', now() - interval '1 day', 'medium', 'pending');

  -- Today's tasks
  INSERT INTO tasks (organization_id, lead_id, assigned_to, title, description, due_date, priority, status)
  VALUES
    (org_id, lead1_id, user_id, 'Initial consultation call', 'Schedule 30-min intro call to discuss goals', now() + interval '2 hours', 'high', 'pending'),
    (org_id, lead5_id, user_id, 'Prepare meeting agenda', 'Create agenda for wealth planning meeting', now() + interval '4 hours', 'medium', 'pending'),
    (org_id, lead6_id, user_id, 'Review proposal draft', 'Final review of investment proposal before sending', now() + interval '6 hours', 'high', 'pending');

  -- Upcoming tasks
  INSERT INTO tasks (organization_id, lead_id, assigned_to, title, description, due_date, priority, status)
  VALUES
    (org_id, lead2_id, user_id, 'Send welcome packet', 'Email new client welcome materials', now() + interval '1 day', 'low', 'pending'),
    (org_id, lead5_id, user_id, 'In-person meeting', 'Wealth planning consultation at office', now() + interval '2 days', 'high', 'pending'),
    (org_id, lead6_id, user_id, 'Follow up on proposal', 'Call to discuss proposal and answer questions', now() + interval '3 days', 'medium', 'pending'),
    (org_id, NULL, user_id, 'Quarterly review prep', 'Prepare client portfolio reviews for Q1', now() + interval '5 days', 'medium', 'pending'),
    (org_id, NULL, user_id, 'Team training session', 'New compliance requirements training', now() + interval '7 days', 'low', 'pending');

  -- Completed tasks
  INSERT INTO tasks (organization_id, lead_id, assigned_to, title, description, due_date, priority, status)
  VALUES
    (org_id, lead7_id, user_id, 'Contract signed', 'Received signed advisory agreement', now() - interval '3 days', 'high', 'done'),
    (org_id, lead3_id, user_id, 'Initial outreach', 'Made first contact via LinkedIn', now() - interval '4 days', 'medium', 'done'),
    (org_id, lead4_id, user_id, 'Seminar follow-up', 'Called to thank for attending seminar', now() - interval '3 days', 'medium', 'done');

  -- Insert activity logs
  INSERT INTO activity_logs (organization_id, lead_id, user_id, action_type, description, created_at)
  VALUES
    (org_id, lead1_id, user_id, 'lead_created', 'Created lead John Smith', now() - interval '2 days'),
    (org_id, lead2_id, user_id, 'lead_created', 'Created lead Sarah Johnson', now() - interval '1 day'),
    (org_id, lead3_id, user_id, 'lead_created', 'Created lead Michael Williams', now() - interval '5 days'),
    (org_id, lead3_id, user_id, 'stage_changed', 'Moved lead to Contacted', now() - interval '3 days'),
    (org_id, lead4_id, user_id, 'lead_created', 'Created lead Emily Brown', now() - interval '4 days'),
    (org_id, lead4_id, user_id, 'stage_changed', 'Moved lead to Contacted', now() - interval '2 days'),
    (org_id, lead5_id, user_id, 'lead_created', 'Created lead David Garcia', now() - interval '7 days'),
    (org_id, lead5_id, user_id, 'stage_changed', 'Moved lead to Meeting Scheduled', now() - interval '1 day'),
    (org_id, lead5_id, user_id, 'task_created', 'Created task: In-person meeting', now() - interval '1 day'),
    (org_id, lead6_id, user_id, 'lead_created', 'Created lead Jennifer Martinez', now() - interval '10 days'),
    (org_id, lead6_id, user_id, 'stage_changed', 'Moved lead to Proposal Sent', now() - interval '2 days'),
    (org_id, lead7_id, user_id, 'lead_created', 'Created lead Robert Anderson', now() - interval '14 days'),
    (org_id, lead7_id, user_id, 'stage_changed', 'Moved lead to Closed - Won', now() - interval '3 days'),
    (org_id, lead7_id, user_id, 'task_completed', 'Completed task: Contract signed', now() - interval '3 days'),
    (org_id, lead8_id, user_id, 'lead_created', 'Created lead Lisa Thompson', now() - interval '12 days'),
    (org_id, lead8_id, user_id, 'stage_changed', 'Moved lead to Closed - Lost', now() - interval '5 days'),
    (org_id, lead8_id, user_id, 'note_added', 'Client decided to wait until student loans are paid off', now() - interval '5 days');

END $$;
