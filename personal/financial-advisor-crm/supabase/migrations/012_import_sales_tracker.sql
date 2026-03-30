-- Seed Data from Sales Tracker.xlsx
-- Generated on 2026-03-30T11:50:55.337Z
-- Imports 244 existing clients as leads with policies

DO $$
DECLARE
  org_id UUID := '11111111-1111-1111-1111-111111111111';
  user_id UUID := '22222222-2222-2222-2222-222222222222';
  stage_won UUID;
  lead_id UUID;
BEGIN
  -- Get the "Issued - Won" stage (is_closed=true, is_won=true)
  SELECT id INTO stage_won FROM pipeline_stages
  WHERE organization_id = org_id AND is_closed = true AND is_won = true
  ORDER BY position LIMIT 1;

  -- If no won stage found, try to get by name
  IF stage_won IS NULL THEN
    SELECT id INTO stage_won FROM pipeline_stages
    WHERE organization_id = org_id AND name ILIKE '%won%'
    ORDER BY position LIMIT 1;
  END IF;

  -- Fallback to first stage
  IF stage_won IS NULL THEN
    SELECT id INTO stage_won FROM pipeline_stages
    WHERE organization_id = org_id ORDER BY position LIMIT 1;
  END IF;


  -- Client 1: Elena P. Yecyec
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Elena P.',
    'Yecyec',
    '09758345071',
    'MARKET VENDOR',
    NULL,
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Low',
    '07911856',
    'Pru Life UK',
    3750,
    'quarterly',
    '2017-09-19',
    370000,
    13412.57,
    '2024-03-01',
    '{"ccb":{"enabled":true,"amount":280000},"tpd":{"enabled":true,"amount":200000},"core_add":{"enabled":true,"amount":200000}}'::jsonb,
    'active',
    now()
  );

  -- Client 2: Lorenze B. Yecyec
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Lorenze B.',
    'Yecyec',
    '09458696700',
    'ENGINEER',
    'Wants to have a motorcycle',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '07911211',
    'Pru Life UK',
    2550,
    'monthly',
    '2017-09-19',
    503460,
    44039.71,
    '2024-03-01',
    '{"ccb":{"enabled":true,"amount":300000},"tpd":{"enabled":true,"amount":250000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"pa_add":{"enabled":true,"amount":251730},"pa_atpd":{"enabled":true,"amount":251730},"ma":{"enabled":true,"amount":125865},"amr":{"enabled":true,"amount":25173}}'::jsonb,
    'active',
    now()
  );

  -- Client 3: Jaleel Elhav B. Paler
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Jaleel Elhav B.',
    'Paler',
    '09171464573',
    'GOVERNMENT EMPLOYEE',
    'Biking, DJ,',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Low',
    '08376539',
    'Pru Life UK',
    5100,
    'quarterly',
    '2018-01-27',
    1500000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":1000000},"tpd":{"enabled":true,"amount":500000},"core_add":{"enabled":true,"amount":1000000}}'::jsonb,
    'active',
    now()
  );

  -- Client 4: Francis M. Callo
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Francis M.',
    'Callo',
    '09638100394',
    'GOVERNMENT EMPLOYEE',
    'Invest in properties, lots, gadgets, shoes',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Low',
    '08487249',
    'Pru Life UK',
    3750,
    'quarterly',
    '2018-02-26',
    1000000,
    28171.29,
    '2024-03-01',
    '{"ccb":{"enabled":true,"amount":700000},"tpd":{"enabled":true,"amount":500000},"core_add":{"enabled":true,"amount":60000}}'::jsonb,
    'active',
    now()
  );

  -- Client 5: Lex Anacleto O. Inosa
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Lex Anacleto O.',
    'Inosa',
    NULL,
    'OFW',
    'graphic designing, travel',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '08551309',
    'Pru Life UK',
    3250,
    'monthly',
    '2018-03-20',
    1000000,
    85841.28,
    '2024-03-01',
    '{"ccb":{"enabled":true,"amount":700000},"tpd":{"enabled":true,"amount":700000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"pa_add":{"enabled":true,"amount":500000},"pa_atpd":{"enabled":true,"amount":500000},"ma":{"enabled":true,"amount":250000},"amr":{"enabled":true,"amount":50000}}'::jsonb,
    'active',
    now()
  );

  -- Client 6: Pearl Therese S. Aton
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Pearl Therese S.',
    'Aton',
    '09569750013',
    'OFW',
    'film shots, travel, thai food',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '08486574',
    'Pru Life UK',
    2500,
    'monthly',
    '2018-03-29',
    536560,
    78885.94,
    '2024-03-01',
    '{"ccb":{"enabled":true,"amount":300000},"tpd":{"enabled":true,"amount":300000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true}}'::jsonb,
    'active',
    now()
  );

  -- Client 7: Christian Gil T. Lagat
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Christian Gil T.',
    'Lagat',
    '09359006243',
    'FREELANCER',
    'motorcycle, travel, food, rides, cats',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '08715987',
    'Pru Life UK',
    2300,
    'monthly',
    now(),
    2000000,
    50534.89,
    '2024-03-01',
    '{"ccb":{"enabled":true,"amount":250000},"tpd":{"enabled":true,"amount":200000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"pa_add":{"enabled":true,"amount":250200},"pa_atpd":{"enabled":true,"amount":250200},"ma":{"enabled":true,"amount":125100},"amr":{"enabled":true,"amount":25020}}'::jsonb,
    'active',
    now()
  );

  -- Client 8: Jo Marie Claire B. Balase
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Jo Marie Claire B.',
    'Balase',
    NULL,
    'OFW',
    'kids, teaching, cute stuff, in Thailand currently teaching',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PA Standard',
    '08857181',
    'Pru Life UK',
    510.83,
    'annual',
    now(),
    100000,
    NULL,
    NULL,
    '{"dhi":{"enabled":true,"daily_rate":500},"pa_atpd":{"enabled":true,"amount":100000},"ma":{"enabled":true,"amount":50000},"amr":{"enabled":true,"amount":10000},"bb":{"enabled":true,"amount":5000}}'::jsonb,
    'active',
    now()
  );

  -- Client 9: Alleah June C. Abao
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Alleah June C.',
    'Abao',
    '09363363082',
    'OFW',
    'kids, teaching, art',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PA Standard',
    '09272502',
    'Pru Life UK',
    510.83,
    'annual',
    '2018-09-26',
    100000,
    NULL,
    NULL,
    '{"dhi":{"enabled":true,"daily_rate":500},"pa_atpd":{"enabled":true,"amount":100000},"ma":{"enabled":true,"amount":50000},"amr":{"enabled":true,"amount":10000},"bb":{"enabled":true,"amount":5000}}'::jsonb,
    'active',
    now()
  );

  -- Client 10: Frances Clare L. Alamban
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Frances Clare L.',
    'Alamban',
    '09066353459',
    'ENGINEER',
    'dress, handcrafts, torquoise color, shoes',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '09304486',
    'Pru Life UK',
    7500,
    'quarterly',
    '2018-10-23',
    2500000,
    50127.18,
    '2024-03-01',
    '{"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":500000},"wptpd":{"enabled":true}}'::jsonb,
    'active',
    now()
  );

  -- Client 11: Roem Ann E. Yap
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Roem Ann E.',
    'Yap',
    '09672182235',
    'FREELANCER',
    'kids, investment',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '09523904',
    'Pru Life UK',
    2760.75,
    'monthly',
    '2018-12-13',
    500000,
    38012.77,
    '2024-03-01',
    '{"ccb":{"enabled":true,"amount":60000},"tpd":{"enabled":true,"amount":60000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true}}'::jsonb,
    'active',
    now()
  );

  -- Client 12: Deanne Antoniette B. Yecyec
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Deanne Antoniette B.',
    'Yecyec',
    NULL,
    'FINANCIAL ADVISOR',
    'k pop, travel, korean food and other foods',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '09770258',
    'Pru Life UK',
    3794,
    'monthly',
    '2019-01-22',
    3500000,
    55731.18,
    '2024-03-01',
    '{"ccb":{"enabled":true,"amount":2300000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true}}'::jsonb,
    'active',
    now()
  );

  -- Client 13: Mae Ann V. Akut
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Mae Ann V.',
    'Akut',
    NULL,
    'GOVERNMENT EMPLOYEE',
    'agriculture, outing with friends, wants to transfer in a private company with friend',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '09892402',
    'Pru Life UK',
    2000,
    'monthly',
    '2019-02-07',
    2000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":600000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":100000},"pa_atpd":{"enabled":true,"amount":100000},"ma":{"enabled":true,"amount":50000},"amr":{"enabled":true,"amount":10000}}'::jsonb,
    'active',
    now()
  );

  -- Client 14: Francismer R. Gascon Jr.
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Francismer R. Gascon',
    'Jr.',
    NULL,
    'LAW STUDENT',
    'politics, NGO, gadgets, foodtrip, Currently studying Law',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '09982209',
    'Pru Life UK',
    3000,
    'monthly',
    '2019-02-28',
    2000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":500000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"pa_add":{"enabled":true,"amount":1000000},"pa_atpd":{"enabled":true,"amount":1000000},"ma":{"enabled":true,"amount":500000},"amr":{"enabled":true,"amount":100000}}'::jsonb,
    'active',
    now()
  );

  -- Client 15: Shaira Pilar M. Antillon
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Shaira Pilar M.',
    'Antillon',
    '09267048002',
    'GOVERNMENT EMPLOYEE',
    'travel, foodtrip',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '10135751',
    'Pru Life UK',
    3500,
    'monthly',
    '2019-03-22',
    2800000,
    31630.05,
    '2024-03-01',
    '{"ccb":{"enabled":true,"amount":1000000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"pa_add":{"enabled":true,"amount":1400000},"pa_atpd":{"enabled":true,"amount":1400000},"ma":{"enabled":true,"amount":700000},"amr":{"enabled":true,"amount":140000}}'::jsonb,
    'active',
    now()
  );

  -- Client 16: Marlon R. Boro
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Marlon R.',
    'Boro',
    '09153268439',
    'TEACHER',
    'travel, hiking, marathon, investing, drawing (dli na kayo)',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '10277983',
    'Pru Life UK',
    3582,
    'monthly',
    '2019-04-17',
    2500000,
    34805.71,
    '2024-03-01',
    '{"ccb":{"enabled":true,"amount":1000000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"pa_add":{"enabled":true,"amount":1250000},"pa_atpd":{"enabled":true,"amount":1250000},"ma":{"enabled":true,"amount":625000},"amr":{"enabled":true,"amount":125000}}'::jsonb,
    'active',
    now()
  );

  -- Client 17: Kristian Rey M. Jalagat
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Kristian Rey M.',
    'Jalagat',
    '09177186326',
    'NURSE',
    'motorcycle, travel with girlfriend and friends',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'Paa Low',
    '10315639',
    'Pru Life UK',
    1250,
    'monthly',
    '2019-04-26',
    1200000,
    9489.72,
    '2024-03-01',
    '{"ccb":{"enabled":true,"amount":400000},"tpd":{"enabled":true,"amount":600000},"core_add":{"enabled":true,"amount":1200000}}'::jsonb,
    'active',
    now()
  );

  -- Client 18: Lilith C. Ladera
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Lilith C.',
    'Ladera',
    '09950935908',
    'NURSE',
    'Has a kid, OFW husband',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'Paa Low',
    '10316411',
    'Pru Life UK',
    1500,
    'monthly',
    '2019-04-26',
    1700000,
    14484.99,
    '2024-03-01',
    '{"ccb":{"enabled":true,"amount":500000},"tpd":{"enabled":true,"amount":500000},"core_add":{"enabled":true,"amount":500000}}'::jsonb,
    'active',
    now()
  );

  -- Client 19: Cris L. Virtucio
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Cris L.',
    'Virtucio',
    NULL,
    'NA',
    'Rider of Sniper Club Valencia Chapter',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PA Standard',
    '10372207',
    'Pru Life UK',
    510.83,
    'annual',
    '2019-05-08',
    100000,
    NULL,
    NULL,
    '{"dhi":{"enabled":true,"daily_rate":500},"pa_atpd":{"enabled":true,"amount":100000},"ma":{"enabled":true,"amount":50000},"amr":{"enabled":true,"amount":10000},"bb":{"enabled":true,"amount":5000}}'::jsonb,
    'active',
    now()
  );

  -- Client 20: Jayson R. Galope
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Jayson R.',
    'Galope',
    NULL,
    'NA',
    'Rider of Sniper Club Malaybalay Chapter',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PA Standard',
    '10438934',
    'Pru Life UK',
    510.83,
    'annual',
    '2019-05-20',
    100000,
    NULL,
    NULL,
    '{"dhi":{"enabled":true,"daily_rate":500},"pa_atpd":{"enabled":true,"amount":100000},"ma":{"enabled":true,"amount":50000},"amr":{"enabled":true,"amount":10000},"bb":{"enabled":true,"amount":5000}}'::jsonb,
    'active',
    now()
  );

  -- Client 21: Claire A. Balcueva
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Claire A.',
    'Balcueva',
    '09773612430',
    'TEACHER',
    'Teacher, loves food, take MA class',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '10445409',
    'Pru Life UK',
    2500,
    'monthly',
    '2019-05-23',
    2500000,
    34939.92,
    '2024-03-01',
    '{"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":500000},"wptpd":{"enabled":true}}'::jsonb,
    'active',
    now()
  );

  -- Client 22: Jannah Jezelle T. Yamit
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Jannah Jezelle T.',
    'Yamit',
    '09751539510',
    'GOVERNMENT EMPLOYEE',
    'Likes K-POP/Drama, Food!, Laag, Aggies, Isla is life hehe, Anime, Bucket hat black, Wants future café business mag capital lahi ipa manage.',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '10452584',
    'Pru Life UK',
    9000,
    'quarterly',
    '2019-06-11',
    21000000,
    21370.79,
    '2024-03-01',
    '{"ccb":{"enabled":true,"amount":1000000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":800000},"pa_atpd":{"enabled":true,"amount":800000},"ma":{"enabled":true,"amount":400000},"amr":{"enabled":true,"amount":80000}}'::jsonb,
    'active',
    now()
  );

  -- Client 23: Timmy Angelina L. Alamban
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Timmy Angelina L.',
    'Alamban',
    '09062587176',
    'QUALITY ASSURANCE SPECIALIST',
    'Loves to Travel, Make Crafts, Has condo with sister as investment',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '10701526',
    'Pru Life UK',
    12000,
    'quarterly',
    '2019-06-26',
    4000000,
    48926.26,
    '2024-03-01',
    '{"ccb":{"enabled":true,"amount":1300000},"tpd":{"enabled":true,"amount":2000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":100000},"pa_atpd":{"enabled":true,"amount":100000},"ma":{"enabled":true,"amount":50000},"amr":{"enabled":true,"amount":10000}}'::jsonb,
    'active',
    now()
  );

  -- Client 24: Christine M. Tampus
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Christine M.',
    'Tampus',
    NULL,
    'GOVERNMENT EMPLOYEE',
    'Loves Korea, K-drama, Milk tea, mobile game ML',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '10852782',
    'Pru Life UK',
    1500,
    'monthly',
    '2019-07-20',
    2000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":250000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"pa_add":{"enabled":true,"amount":99500},"pa_atpd":{"enabled":true,"amount":99500},"ma":{"enabled":true,"amount":49750},"amr":{"enabled":true,"amount":9950}}'::jsonb,
    'active',
    now()
  );

  -- Client 25: Ivana Alech N. Pailagao
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Ivana Alech N.',
    'Pailagao',
    '09758829498',
    'SALES ADMINISTRATOR',
    'Loves sweets, swimming, photography, fitness and healthy foods',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Low',
    '10932209',
    'Pru Life UK',
    2000,
    'monthly',
    '2019-08-02',
    2100000,
    10913.91,
    '2024-03-01',
    '{"ccb":{"enabled":true,"amount":320000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":200000},"pa_atpd":{"enabled":true,"amount":200000},"ma":{"enabled":true,"amount":100000},"amr":{"enabled":true,"amount":20000}}'::jsonb,
    'active',
    now()
  );

  -- Client 26: Lyla Ybañez Padla
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Lyla Ybañez',
    'Padla',
    '09153918151',
    NULL,
    'Food, Sweets, Former Panagatan Manager',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PIA-CFF',
    '11057754',
    'Pru Life UK',
    100000,
    'annual',
    '2019-08-28',
    125000,
    79649.85,
    '2024-03-01',
    '{}'::jsonb,
    'active',
    now()
  );

  -- Client 27: Princess Shane A. Baylosis
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Princess Shane A.',
    'Baylosis',
    '09665449870',
    'MANAGER',
    'Boyfie is Sir RJ training seaman, Davao place of birth, store manager 7/11 ketkai,',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '11076305',
    'Pru Life UK',
    1500,
    'monthly',
    '2019-08-29',
    2000000,
    9115.95,
    '2024-03-01',
    '{"ccb":{"enabled":true,"amount":250000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"pa_add":{"enabled":true,"amount":100000},"pa_atpd":{"enabled":true,"amount":100000},"ma":{"enabled":true,"amount":50000},"amr":{"enabled":true,"amount":10000}}'::jsonb,
    'active',
    now()
  );

  -- Client 28: Michell Joy B. Acut
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Michell Joy B.',
    'Acut',
    '09452143782',
    'TEACHER',
    'Teacher, loves travelling, parents have manokan raw and sell, papa cook in carenderya',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '11172996',
    'Pru Life UK',
    1675,
    'monthly',
    '2019-09-18',
    2000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":500000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"pa_add":{"enabled":true,"amount":60000},"pa_atpd":{"enabled":true,"amount":60000},"ma":{"enabled":true,"amount":30000},"amr":{"enabled":true,"amount":6000}}'::jsonb,
    'active',
    now()
  );

  -- Client 29: Janine C. Castro
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Janine C.',
    'Castro',
    '09914350059',
    'AUDITOR',
    'Auditor in Bounty, loves travelling, cat lover, GF of Sir Dennis, loves travelling, Food Quality Auditor',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '11250779',
    'Pru Life UK',
    1500,
    'monthly',
    '2019-09-27',
    1800000,
    12671.13,
    '2024-03-01',
    '{"ccb":{"enabled":true,"amount":230000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"pa_add":{"enabled":true,"amount":80000},"pa_atpd":{"enabled":true,"amount":80000},"ma":{"enabled":true,"amount":40000},"amr":{"enabled":true,"amount":8000}}'::jsonb,
    'active',
    now()
  );

  -- Client 30: Dennis P. Quitoriano
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Dennis P.',
    'Quitoriano',
    '09486140950',
    'ENGINEER',
    'BF of Ms Janine, loves travelling, works in Power plant electrical engineer',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '11275499',
    'Pru Life UK',
    1500,
    'monthly',
    '2019-09-30',
    2000000,
    11680.08,
    '2024-03-01',
    '{"ccb":{"enabled":true,"amount":240000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"pa_add":{"enabled":true,"amount":80000},"pa_atpd":{"enabled":true,"amount":80000},"ma":{"enabled":true,"amount":40000},"amr":{"enabled":true,"amount":8000}}'::jsonb,
    'active',
    now()
  );

  -- Client 31: Krista Mae B. Villamor
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Krista Mae B.',
    'Villamor',
    '09205159941',
    'RESOURCE OFFICER',
    'Barkada, loves dancing, food trip, travelling, BF si Hanz',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '11277607',
    'Pru Life UK',
    1500,
    'monthly',
    '2019-09-30',
    2200000,
    10129.41,
    '2024-03-01',
    '{"ccb":{"enabled":true,"amount":300000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":200000},"pa_atpd":{"enabled":true,"amount":200000},"ma":{"enabled":true,"amount":100000},"amr":{"enabled":true,"amount":20000}}'::jsonb,
    'active',
    now()
  );

  -- Client 32: Mary Yvonne C. Alamban
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Mary Yvonne C.',
    'Alamban',
    '09365353192',
    'ENGINEER',
    'Freelance painter/artist, engineer, motion cabin.employer, wants bee hive farm, lot payment residential with sister mhuman na 1year, boracay travel',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '11108823',
    'Pru Life UK',
    3000,
    'monthly',
    '2019-10-04',
    2000000,
    28444.22,
    '2024-03-01',
    '{"ccb":{"enabled":true,"amount":1000000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"pa_add":{"enabled":true,"amount":100000},"pa_atpd":{"enabled":true,"amount":100000},"ma":{"enabled":true,"amount":50000},"amr":{"enabled":true,"amount":10000},"fs":{"enabled":true,"amount":1000000}}'::jsonb,
    'active',
    now()
  );

  -- Client 33: Leah M. Braganza
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Leah M.',
    'Braganza',
    '09058353306',
    NULL,
    'Has Sugar Cane in Ilo-ilo, Market business owners in Malaybalay, has 2 daughters and one loves pageants, both in high school',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PIA-CFF',
    '11368698',
    'Pru Life UK',
    100000,
    'annual',
    '2019-10-17',
    125000,
    80667.89,
    '2024-03-01',
    '{}'::jsonb,
    'active',
    now()
  );

  -- Client 34: Rey P. Vallejos
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Rey P.',
    'Vallejos',
    NULL,
    NULL,
    'Breadwinner, high blood sugar but exercises regularly, breadwinner, funny man',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PA Standard',
    '11371131',
    'Pru Life UK',
    2016.86,
    'annual',
    '2019-10-17',
    450000,
    NULL,
    NULL,
    '{"dhi":{"enabled":true,"daily_rate":1000},"pa_atpd":{"enabled":true,"amount":450000},"ma":{"enabled":true,"amount":225000},"amr":{"enabled":true,"amount":45000},"bb":{"enabled":true,"amount":5000}}'::jsonb,
    'active',
    now()
  );

  -- Client 35: Ruth Esther Q. Bermundo
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Ruth Esther Q.',
    'Bermundo',
    '09064701262',
    'GOVERNMENT EMPLOYEE',
    'Handcrafts, travel',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '09493882',
    'Pru Life UK',
    2500,
    'monthly',
    '2018-11-14',
    2000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":800000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"pa_add":{"enabled":true,"amount":100000},"pa_atpd":{"enabled":true,"amount":100000},"ma":{"enabled":true,"amount":50000},"amr":{"enabled":true,"amount":10000}}'::jsonb,
    'active',
    now()
  );

  -- Client 36: Kathryn O. Macaya
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Kathryn O.',
    'Macaya',
    NULL,
    NULL,
    'Shoes, Food',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Low',
    '09906051',
    'Pru Life UK',
    1000,
    'monthly',
    '2018-02-08',
    1040000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":350000},"tpd":{"enabled":true,"amount":350000},"core_add":{"enabled":true,"amount":340000}}'::jsonb,
    'active',
    now()
  );

  -- Client 37: Rose Cherry V. Ruiz
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Rose Cherry V.',
    'Ruiz',
    '09276512640',
    'WRITER',
    'Savings, Food, Travel',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '11502282',
    'Pru Life UK',
    2000,
    'monthly',
    '2019-11-26',
    2100000,
    6651.26,
    '2024-03-01',
    '{"ccb":{"enabled":true,"amount":480000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":100000},"pa_atpd":{"enabled":true,"amount":100000},"ma":{"enabled":true,"amount":50000},"amr":{"enabled":true,"amount":10000}}'::jsonb,
    'active',
    now()
  );

  -- Client 38: Julia Robyn B. Valdez
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Julia Robyn B.',
    'Valdez',
    '09354467928',
    'NURSE',
    'Travel, Nurse, Sweets',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '11646749',
    'Pru Life UK',
    2300,
    'monthly',
    '2019-11-29',
    2500000,
    2743.77,
    '2024-03-01',
    '{"ccb":{"enabled":true,"amount":550000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":150000},"pa_atpd":{"enabled":true,"amount":150000},"ma":{"enabled":true,"amount":75000},"amr":{"enabled":true,"amount":15000}}'::jsonb,
    'active',
    now()
  );

  -- Client 39: Armando P. Yecyec
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Armando P.',
    'Yecyec',
    NULL,
    NULL,
    'Travel, food, investments',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '11699124',
    'Pru Life UK',
    3000,
    'monthly',
    '2019-12-16',
    513000,
    5172.58,
    '2024-03-01',
    '{"tpd":{"enabled":true,"amount":60000},"core_add":{"enabled":true,"amount":60000}}'::jsonb,
    'active',
    now()
  );

  -- Client 40: Grace Y. Enterina
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Grace Y.',
    'Enterina',
    NULL,
    'OFW',
    'Books, food, travel, games, gadgets',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'Elite 5',
    '11733662',
    'Pru Life UK',
    17000,
    'monthly',
    '2019-12-17',
    3960300,
    537710.27,
    '2024-03-01',
    '{"ccb":{"enabled":true,"amount":1500000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":1000000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000}}'::jsonb,
    'active',
    now()
  );

  -- Client 41: Alma Y. Enterina
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Alma Y.',
    'Enterina',
    NULL,
    NULL,
    'Food, perfume, levis',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'Elite 5',
    '11740862',
    'Pru Life UK',
    17000,
    'monthly',
    '2019-12-30',
    1236000,
    442520.23,
    '2024-03-01',
    '{"ccb":{"enabled":true,"amount":800000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":1000000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000}}'::jsonb,
    'active',
    now()
  );

  -- Client 42: Christian Gil T. Lagat
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Christian Gil T.',
    'Lagat',
    '09359006243',
    'QUALITY ASSURANCE',
    'motorcycle, travel, food, rides, cats',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PA Standard',
    '11853458',
    'Pru Life UK',
    510.83,
    'annual',
    '2020-01-06',
    100000,
    NULL,
    NULL,
    '{"dhi":{"enabled":true,"daily_rate":500},"pa_atpd":{"enabled":true,"amount":100000},"ma":{"enabled":true,"amount":50000},"amr":{"enabled":true,"amount":10000},"bb":{"enabled":true,"amount":5000}}'::jsonb,
    'active',
    now()
  );

  -- Client 43: Raul C. Payapaya
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Raul C.',
    'Payapaya',
    NULL,
    NULL,
    'motorcycle, skate, food trip, cars',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '11836095',
    'Pru Life UK',
    3000,
    'monthly',
    '2020-01-14',
    2536000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":1000000},"tpd":{"enabled":true,"amount":60000},"core_add":{"enabled":true,"amount":60000},"dhi":{"enabled":true,"daily_rate":1000}}'::jsonb,
    'active',
    now()
  );

  -- Client 44: Iva Grenia C. Clarito
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Iva Grenia C.',
    'Clarito',
    '09177984802',
    NULL,
    'loves kdrama and cloy, skin care, travel, Japan!, engaged, has condominium, music lover, singer, talented :)',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '12127921',
    'Pru Life UK',
    2282.75,
    'monthly',
    '2020-02-19',
    1800000,
    9712.76,
    '2024-03-01',
    '{"ccb":{"enabled":true,"amount":900000},"tpd":{"enabled":true,"amount":700000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"pa_add":{"enabled":true,"amount":100000},"pa_atpd":{"enabled":true,"amount":100000},"ma":{"enabled":true,"amount":50000},"amr":{"enabled":true,"amount":10000}}'::jsonb,
    'active',
    now()
  );

  -- Client 45: Christrhea N. Udang
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Christrhea N.',
    'Udang',
    '09053120251',
    NULL,
    'loves kittens and puppies, korean food, music piano and guitar, loves Jonas ayiee, loves travel and food, loves color blue, mas inot kaysa ni Tena haha',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '12288429',
    'Pru Life UK',
    1500,
    'monthly',
    '2020-03-13',
    2000000,
    3312.63,
    '2024-03-01',
    '{"ccb":{"enabled":true,"amount":140000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000}}'::jsonb,
    'active',
    now()
  );

  -- Client 46: Petite Coleen Marie T. Tandog
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Petite Coleen Marie T.',
    'Tandog',
    '09353822836',
    'TEACHER',
    'online teachers, loves food, travel, anime',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '12244469',
    'Pru Life UK',
    2000,
    'monthly',
    '2020-03-20',
    1954361,
    6000.72,
    '2024-03-01',
    '{"ccb":{"enabled":true,"amount":500000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"pa_add":{"enabled":true,"amount":100000},"pa_atpd":{"enabled":true,"amount":100000},"ma":{"enabled":true,"amount":50000},"amr":{"enabled":true,"amount":10000}}'::jsonb,
    'active',
    now()
  );

  -- Client 47: Renz Louisse O. Domingo
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Renz Louisse O.',
    'Domingo',
    NULL,
    'OTHER OCCUPATION',
    'archery, food',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '12307211',
    'Pru Life UK',
    2000,
    'monthly',
    '2020-03-28',
    2124000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":800000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"pa_add":{"enabled":true,"amount":100000},"pa_atpd":{"enabled":true,"amount":100000},"ma":{"enabled":true,"amount":50000},"amr":{"enabled":true,"amount":10000}}'::jsonb,
    'active',
    now()
  );

  -- Client 48: Arianne Izah Visabella
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Arianne Izah',
    'Visabella',
    '09952230474',
    'DEALER',
    'nissan dream car, working at nissan, wants financial security, best friend Ms Che Ruiz',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '12465775',
    'Pru Life UK',
    2000,
    'monthly',
    '2020-06-08',
    2000000,
    593.8,
    '2024-03-01',
    '{"ccb":{"enabled":true,"amount":400000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":200000},"pa_atpd":{"enabled":true,"amount":200000},"ma":{"enabled":true,"amount":100000},"amr":{"enabled":true,"amount":20000}}'::jsonb,
    'active',
    now()
  );

  -- Client 49: Ezel R. Lambatan
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Ezel R.',
    'Lambatan',
    NULL,
    'ASSISTANT',
    'Fashion, advocacy, family oriented, pride community, hosting',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '12546216',
    'Pru Life UK',
    3000,
    'monthly',
    '2020-06-25',
    2158080,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":1000000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":200000},"pa_atpd":{"enabled":true,"amount":200000},"ma":{"enabled":true,"amount":100000},"amr":{"enabled":true,"amount":20000}}'::jsonb,
    'active',
    now()
  );

  -- Client 50: Krizia Nicole N. Pailagao
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Krizia Nicole N.',
    'Pailagao',
    '09771024184',
    'MANAGER',
    'fitness, healthy living, smoothies, fashion, dogs, cooking',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '12672724',
    'Pru Life UK',
    3088,
    'monthly',
    '2020-07-23',
    3000000,
    4342.22,
    '2024-03-01',
    '{"ccb":{"enabled":true,"amount":600000},"tpd":{"enabled":true,"amount":1600000},"core_add":{"enabled":true,"amount":1000000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"icu":{"enabled":true,"amount":2000}}'::jsonb,
    'active',
    now()
  );

  -- Client 51: Cherie Mie E. Estillore
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Cherie Mie E.',
    'Estillore',
    '09773069376',
    'BUSINESS WOMEN',
    'livestock, son, family oriented',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '12851142',
    'Pru Life UK',
    9000,
    'quarterly',
    '2020-08-21',
    2050000,
    3098.69,
    '2024-03-01',
    '{"ccb":{"enabled":true,"amount":1000000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":500000},"pa_atpd":{"enabled":true,"amount":500000},"ma":{"enabled":true,"amount":250000},"amr":{"enabled":true,"amount":50000}}'::jsonb,
    'active',
    now()
  );

  -- Client 52: Regina B. Flores
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Regina B.',
    'Flores',
    '09953563349',
    'NURSING',
    'K drama, house for family 3 bedrooms',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'Paa Plus',
    '12868159',
    'Pru Life UK',
    5000,
    'monthly',
    '2020-09-04',
    600000,
    22197.03,
    '2024-03-01',
    '{"tpd":{"enabled":true,"amount":300000},"core_add":{"enabled":true,"amount":60000}}'::jsonb,
    'active',
    now()
  );

  -- Client 53: Felmar A. Anggot
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Felmar A.',
    'Anggot',
    NULL,
    'GOVERNMENT EMPLOYEE',
    'Travel, food trip, wants own car and house soon',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '12953015',
    'Pru Life UK',
    3000,
    'monthly',
    '2020-09-08',
    2700000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":1000000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":500000},"pa_atpd":{"enabled":true,"amount":500000},"ma":{"enabled":true,"amount":250000},"amr":{"enabled":true,"amount":50000}}'::jsonb,
    'active',
    now()
  );

  -- Client 54: David M. Callo
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'David M.',
    'Callo',
    '09686841178',
    'CHECKERS/STAFF',
    'motorcycle, food, exercise loves jogging, simple lifestyle',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'Paa Low',
    '13051604',
    'Pru Life UK',
    1800,
    'monthly',
    now(),
    1000000,
    5276.74,
    '2024-03-01',
    '{"ccb":{"enabled":true,"amount":200000},"tpd":{"enabled":true,"amount":500000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"pa_add":{"enabled":true,"amount":300000},"pa_atpd":{"enabled":true,"amount":300000},"ma":{"enabled":true,"amount":150000},"amr":{"enabled":true,"amount":30000}}'::jsonb,
    'active',
    now()
  );

  -- Client 55: Bertwin T. Romero Jr.
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Bertwin T. Romero',
    'Jr.',
    '09265953171',
    'ENGINEER',
    'travel, food trip, bf ate Klimpol, married has Baby Ashy 1st baby girl daughter',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'Paa Plus',
    '13080114',
    'Pru Life UK',
    3454.9,
    'monthly',
    now(),
    2400000,
    1848.75,
    '2024-03-01',
    '{"ccb":{"enabled":true,"amount":1200000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":1000000},"pa_atpd":{"enabled":true,"amount":1000000},"ma":{"enabled":true,"amount":500000},"amr":{"enabled":true,"amount":100000}}'::jsonb,
    'active',
    now()
  );

  -- Client 56: Marineth C. Antid
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Marineth C.',
    'Antid',
    '09175862293',
    'SUPERVISOR',
    'k drama, art, healthy food',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '13357046',
    'Pru Life UK',
    3000,
    'monthly',
    now(),
    1200000,
    4867,
    '2024-03-01',
    '{"ccb":{"enabled":true,"amount":400000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":200000},"pa_atpd":{"enabled":true,"amount":200000},"ma":{"enabled":true,"amount":100000},"amr":{"enabled":true,"amount":20000}}'::jsonb,
    'active',
    now()
  );

  -- Client 57: Cheressa Mae S. Juarez
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Cheressa Mae S.',
    'Juarez',
    '09051311435',
    'TEACHER',
    'teacher, abas cebu, foodtrip',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '13444513',
    'Pru Life UK',
    2500,
    'monthly',
    now(),
    2000000,
    8000,
    '2024-03-01',
    '{"ccb":{"enabled":true,"amount":800000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":500000},"pa_atpd":{"enabled":true,"amount":500000},"ma":{"enabled":true,"amount":250000},"amr":{"enabled":true,"amount":50000}}'::jsonb,
    'active',
    now()
  );

  -- Client 58: Andre Lorenzo H. Hojas
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Andre Lorenzo H.',
    'Hojas',
    '09171086033',
    'CO-ORDINATOR',
    'savings, gov employee, foodtrip',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '13445396',
    'Pru Life UK',
    3000,
    'monthly',
    now(),
    2000000,
    10000,
    '2024-03-01',
    '{"ccb":{"enabled":true,"amount":1000000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":500000},"pa_atpd":{"enabled":true,"amount":500000},"ma":{"enabled":true,"amount":250000},"amr":{"enabled":true,"amount":50000}}'::jsonb,
    'active',
    now()
  );

  -- Client 59: Rizza O. Aling
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Rizza O.',
    'Aling',
    '09061454038',
    'TEACHER',
    'teacher, oro christian, foodtrip',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '13446525',
    'Pru Life UK',
    2500,
    'monthly',
    now(),
    2000000,
    8000,
    '2024-03-01',
    '{"ccb":{"enabled":true,"amount":800000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":500000},"pa_atpd":{"enabled":true,"amount":500000},"ma":{"enabled":true,"amount":250000},"amr":{"enabled":true,"amount":50000}}'::jsonb,
    'active',
    now()
  );

  -- Client 60: Daphne Kirstie B. Fabria
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Daphne Kirstie B.',
    'Fabria',
    '09063449616',
    'ADMINISTRATIVE',
    'lychee fav drink tokyo bubble, has a house and baby',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Low',
    '13378029',
    'Pru Life UK',
    1500,
    'monthly',
    now(),
    1800000,
    105.55,
    '2024-03-01',
    '{"tpd":{"enabled":true,"amount":1500000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"pa_add":{"enabled":true,"amount":300000},"pa_atpd":{"enabled":true,"amount":300000},"ma":{"enabled":true,"amount":150000},"amr":{"enabled":true,"amount":30000}}'::jsonb,
    'active',
    now()
  );

  -- Client 61: Elvie C. Garcero
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Elvie C.',
    'Garcero',
    '09667014694',
    'ONLINE WORK & BAKING',
    'baker, loves food and traveling',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '13824313',
    'Pru Life UK',
    9600,
    'quarterly',
    now(),
    3000000,
    10000,
    '2024-03-01',
    '{"ccb":{"enabled":true,"amount":1200000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":500000},"pa_atpd":{"enabled":true,"amount":500000},"ma":{"enabled":true,"amount":250000},"amr":{"enabled":true,"amount":50000}}'::jsonb,
    'active',
    now()
  );

  -- Client 62: Maricar Pausal
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Maricar',
    'Pausal',
    '09260893749',
    'ACCOUNTANT',
    'food, clothes online selling',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Low',
    '13903326',
    'Pru Life UK',
    1550,
    'monthly',
    now(),
    1800000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":100000},"tpd":{"enabled":true,"amount":500000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"pa_add":{"enabled":true,"amount":60000},"pa_atpd":{"enabled":true,"amount":60000},"ma":{"enabled":true,"amount":30000},"amr":{"enabled":true,"amount":6000}}'::jsonb,
    'active',
    now()
  );

  -- Client 63: Chelsea Dana A. Rapanot
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Chelsea Dana A.',
    'Rapanot',
    NULL,
    'RESOURCE OFFICER',
    'travel, food',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '13943292',
    'Pru Life UK',
    3167,
    'monthly',
    now(),
    2500000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":1000000},"tpd":{"enabled":true,"amount":1500000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":2000},"ser":{"enabled":true,"amount":30000},"icu":{"enabled":true,"amount":4000},"pa_add":{"enabled":true,"amount":60000},"pa_atpd":{"enabled":true,"amount":500000},"ma":{"enabled":true,"amount":250000},"amr":{"enabled":true,"amount":50000}}'::jsonb,
    'active',
    now()
  );

  -- Client 64: Xandrex George C. Bulang
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Xandrex George C.',
    'Bulang',
    NULL,
    NULL,
    'travel, food, photos',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '14078829',
    'Pru Life UK',
    18000,
    'semi_annual',
    now(),
    2500000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":1200000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":500000},"pa_atpd":{"enabled":true,"amount":500000},"ma":{"enabled":true,"amount":250000},"amr":{"enabled":true,"amount":50000},"fs":{"enabled":true,"amount":500}}'::jsonb,
    'active',
    now()
  );

  -- Client 65: Kirt Mufty S. Isnani
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Kirt Mufty S.',
    'Isnani',
    '09056711044',
    NULL,
    'engineer, cafe, biking',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'Paa Plus',
    '13917398',
    'Pru Life UK',
    4000,
    'monthly',
    now(),
    3360000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":1500000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000}}'::jsonb,
    'active',
    now()
  );

  -- Client 66: Gabrielle T. Ablanque
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Gabrielle T.',
    'Ablanque',
    '09059412949',
    NULL,
    'Tiktok, food, travels,',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Low',
    '14097103',
    'Pru Life UK',
    1500,
    'monthly',
    now(),
    1500000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":110000},"tpd":{"enabled":true,"amount":500000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"pa_add":{"enabled":true,"amount":80000},"pa_atpd":{"enabled":true,"amount":80000},"ma":{"enabled":true,"amount":40000},"amr":{"enabled":true,"amount":8000}}'::jsonb,
    'active',
    now()
  );

  -- Client 67: Nico Theo D. Soldevilla
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Nico Theo D.',
    'Soldevilla',
    '09772809799',
    'ENGINEER',
    'Farm and food business',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'Paa Plus',
    '14243016',
    'Pru Life UK',
    3000,
    'monthly',
    now(),
    2050000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":1000000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":200000},"pa_atpd":{"enabled":true,"amount":200000},"ma":{"enabled":true,"amount":100000},"amr":{"enabled":true,"amount":20000}}'::jsonb,
    'active',
    now()
  );

  -- Client 68: Chelly Mia F. Lluisma
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Chelly Mia F.',
    'Lluisma',
    '09185670172',
    'SALES ADMIN',
    'Travel, savings for emergency fund',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Low',
    '14270383',
    'Pru Life UK',
    2000,
    'monthly',
    now(),
    2000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":440000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"pa_add":{"enabled":true,"amount":200000},"pa_atpd":{"enabled":true,"amount":200000},"ma":{"enabled":true,"amount":100000},"amr":{"enabled":true,"amount":20000}}'::jsonb,
    'active',
    now()
  );

  -- Client 69: Ian Christian M. Tadlas
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Ian Christian M.',
    'Tadlas',
    NULL,
    'TECHNICIAN',
    'investing and trading in stocks, nay sunlife, has a car',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PYT',
    '14402673',
    'Pru Life UK',
    9190,
    'annual',
    now(),
    2620690,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":500000},"core_add":{"enabled":true,"amount":100000}}'::jsonb,
    'active',
    now()
  );

  -- Client 70: Shanelle May B. Seguerra
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Shanelle May B.',
    'Seguerra',
    '09154823936',
    'ENGINEER',
    'mag agent, close with Janine and Ian’s all girls cousins',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PYT',
    '14402806',
    'Pru Life UK',
    2619.15,
    'quarterly',
    now(),
    3486239,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":500000},"core_add":{"enabled":true,"amount":100000}}'::jsonb,
    'active',
    now()
  );

  -- Client 71: Princess Jia Andriza T. Artajo
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Princess Jia Andriza T.',
    'Artajo',
    '09061272081',
    'ADMINISTRATIVE',
    'food, travel, hike',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'Paa Plus',
    '14403571',
    'Pru Life UK',
    3000,
    'monthly',
    now(),
    2800000,
    NULL,
    NULL,
    '{"tpd":{"enabled":true,"amount":1500000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"pa_add":{"enabled":true,"amount":250000},"pa_atpd":{"enabled":true,"amount":250000},"ma":{"enabled":true,"amount":125000},"amr":{"enabled":true,"amount":25000}}'::jsonb,
    'active',
    now()
  );

  -- Client 72: Deanne Antoniette B. Yecyec
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Deanne Antoniette B.',
    'Yecyec',
    NULL,
    NULL,
    NULL,
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PHP',
    '14589343',
    'Pru Life UK',
    1450.34,
    'monthly',
    now(),
    500000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":500000},"dhi":{"enabled":true,"daily_rate":625},"icu":{"enabled":true,"amount":62531352}}'::jsonb,
    'active',
    now()
  );

  -- Client 73: Alexandrea M. Belen
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Alexandrea M.',
    'Belen',
    NULL,
    'BUSINESSMAN',
    'loves anime, learning animation, study animation, online teaching, has 3 dogs bear, matcha and',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'Elite 10',
    '14655111',
    'Pru Life UK',
    15000,
    'monthly',
    now(),
    4135786,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":1500000},"tpd":{"enabled":true,"amount":1900000},"core_add":{"enabled":true,"amount":180000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":300000},"pa_atpd":{"enabled":true,"amount":300000},"ma":{"enabled":true,"amount":150000},"amr":{"enabled":true,"amount":30000}}'::jsonb,
    'active',
    now()
  );

  -- Client 74: Alleah June C. Abao
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Alleah June C.',
    'Abao',
    NULL,
    'TEACHER',
    'teaching, kpop...',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Low',
    '14696333',
    'Pru Life UK',
    1780,
    'monthly',
    now(),
    2000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":200000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":200000},"pa_atpd":{"enabled":true,"amount":200000},"ma":{"enabled":true,"amount":100000},"amr":{"enabled":true,"amount":20000}}'::jsonb,
    'active',
    now()
  );

  -- Client 75: Stephanie B. Porres
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Stephanie B.',
    'Porres',
    '09061751984',
    'TEACHER',
    'teacher, mother of 4,selling lots in claveria, farming, k drama, herbalife',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '14899576',
    'Pru Life UK',
    9701,
    'quarterly',
    now(),
    2900000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":250000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"icu":{"enabled":true,"amount":2000},"pa_add":{"enabled":true,"amount":300000},"pa_atpd":{"enabled":true,"amount":300000},"ma":{"enabled":true,"amount":150000},"amr":{"enabled":true,"amount":30000}}'::jsonb,
    'active',
    now()
  );

  -- Client 76: Princess Mae L. Monteron
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Princess Mae L.',
    'Monteron',
    '09064998221',
    NULL,
    'loves art, coffee shops',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '7580347',
    'Pru Life UK',
    0,
    'annual',
    now(),
    2000000,
    33975,
    '2024-03-01',
    '{"ccb":{"enabled":true,"amount":200000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"pa_add":{"enabled":true,"amount":1000000},"pa_atpd":{"enabled":true,"amount":1000000},"ma":{"enabled":true,"amount":500000},"amr":{"enabled":true,"amount":100000}}'::jsonb,
    'active',
    now()
  );

  -- Client 77: Airah Janine D. Emata
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Airah Janine D.',
    'Emata',
    '09771139665',
    NULL,
    'devcom higher year, food, cafes',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Low',
    '11462013',
    'Pru Life UK',
    1883.92,
    'monthly',
    now(),
    2100000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":350000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":200000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"icu":{"enabled":true,"amount":2000}}'::jsonb,
    'active',
    now()
  );

  -- Client 78: Renee Jane G. Barrio
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Renee Jane G.',
    'Barrio',
    '09052155585',
    'TECHNICAL WRITER',
    'TRAVEL, MOUNTAIN AND SEA, FOOD',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'Paa Plus',
    '15009069',
    'Pru Life UK',
    3000,
    'monthly',
    now(),
    3000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":1000000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":200000},"pa_atpd":{"enabled":true,"amount":200000},"ma":{"enabled":true,"amount":100000},"amr":{"enabled":true,"amount":20000}}'::jsonb,
    'active',
    now()
  );

  -- Client 79: Cheryy Mae O. Bajarla
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Cheryy Mae O.',
    'Bajarla',
    '09356814916',
    NULL,
    'Has a daughter, likes food, likes watching netflix',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'Paa Plus',
    '15339205',
    'Pru Life UK',
    2500,
    'monthly',
    now(),
    2230000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":500000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":500000},"pa_atpd":{"enabled":true,"amount":500000},"ma":{"enabled":true,"amount":250000},"amr":{"enabled":true,"amount":50000}}'::jsonb,
    'active',
    now()
  );

  -- Client 80: Juan Roberto Y. Cosin
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Juan Roberto Y.',
    'Cosin',
    NULL,
    'MARKETING ASSISTANT',
    'FOOD, Jollibee',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'Paa Low',
    '15610209',
    'Pru Life UK',
    1500,
    'monthly',
    now(),
    500000,
    NULL,
    NULL,
    '{"tpd":{"enabled":true,"amount":100000},"core_add":{"enabled":true,"amount":60000}}'::jsonb,
    'active',
    now()
  );

  -- Client 81: Antonio Miguel Y. Cosin
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Antonio Miguel Y.',
    'Cosin',
    NULL,
    'N/A',
    'FOOD, Jollibee',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'Paa Low',
    '15609339',
    'Pru Life UK',
    1500,
    'monthly',
    now(),
    500000,
    NULL,
    NULL,
    '{"tpd":{"enabled":true,"amount":100000},"core_add":{"enabled":true,"amount":60000}}'::jsonb,
    'active',
    now()
  );

  -- Client 82: Georgette O. Divinagracia
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Georgette O.',
    'Divinagracia',
    '09306811148',
    'QA STAFF',
    'Shopee, lazada, reward self, having shared funds with fam for house renovation',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'Paa Plus',
    '15889583',
    'Pru Life UK',
    2500,
    'monthly',
    now(),
    2000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":700000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":300000},"pa_atpd":{"enabled":true,"amount":300000},"ma":{"enabled":true,"amount":150000},"amr":{"enabled":true,"amount":30000}}'::jsonb,
    'active',
    now()
  );

  -- Client 83: John Ed L. Molijon
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'John Ed L.',
    'Molijon',
    '09274917142',
    NULL,
    NULL,
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'Paa Plus',
    '15893425',
    'Pru Life UK',
    2500,
    'monthly',
    now(),
    2000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":700000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":300000},"pa_atpd":{"enabled":true,"amount":300000},"ma":{"enabled":true,"amount":150000},"amr":{"enabled":true,"amount":30000}}'::jsonb,
    'active',
    now()
  );

  -- Client 84: Elmer A. Garcero
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Elmer A.',
    'Garcero',
    NULL,
    'FARM OWNER',
    'Loving father to his daughters and son, cares a lot to his sister Ms Charity',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'Paa Low',
    '15912057',
    'Pru Life UK',
    2000,
    'monthly',
    now(),
    380000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":100000},"tpd":{"enabled":true,"amount":200000},"core_add":{"enabled":true,"amount":60000},"pa_add":{"enabled":true,"amount":120000},"pa_atpd":{"enabled":true,"amount":120000},"ma":{"enabled":true,"amount":60000},"amr":{"enabled":true,"amount":12000}}'::jsonb,
    'active',
    now()
  );

  -- Client 85: Charity A. Garcero
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Charity A.',
    'Garcero',
    NULL,
    'ASSISTANT BAKER',
    'Bing''s Tita, single, cannot read or write but assists Bing in baking <3',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'Paa Low',
    '15913652',
    'Pru Life UK',
    1800,
    'monthly',
    now(),
    500000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":82000},"tpd":{"enabled":true,"amount":300000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"pa_add":{"enabled":true,"amount":120000},"pa_atpd":{"enabled":true,"amount":120000},"ma":{"enabled":true,"amount":60000},"amr":{"enabled":true,"amount":12000}}'::jsonb,
    'active',
    now()
  );

  -- Client 86: Neliem Mae E. Paundog
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Neliem Mae E.',
    'Paundog',
    '09752621356',
    'MED. TECH.',
    'Loves to hang out with friends, Med Tech',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'Paa Plus-Rated',
    '16106594',
    'Pru Life UK',
    3000,
    'monthly',
    now(),
    1060000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":200000},"tpd":{"enabled":true,"amount":200000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":200000},"pa_atpd":{"enabled":true,"amount":200000},"ma":{"enabled":true,"amount":100000},"amr":{"enabled":true,"amount":20000}}'::jsonb,
    'active',
    now()
  );

  -- Client 87: Ian Keith O. Pranza
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Ian Keith O.',
    'Pranza',
    '09121308819',
    'ADMINISTRATIVE',
    'Loves dogs, religious, foodie',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'Paa Plus',
    '16165979',
    'Pru Life UK',
    2500,
    'monthly',
    now(),
    2300000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":700000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":300000},"pa_atpd":{"enabled":true,"amount":300000},"ma":{"enabled":true,"amount":150000},"amr":{"enabled":true,"amount":30000}}'::jsonb,
    'active',
    now()
  );

  -- Client 88: Gerill M. Maganaka
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Gerill M.',
    'Maganaka',
    '09061683007',
    'MANAGER',
    'Loves dogs, religious, foodie, very family oriented',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'Paa Plus',
    '16166797',
    'Pru Life UK',
    2500,
    'monthly',
    now(),
    2300000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":700000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":300000},"pa_atpd":{"enabled":true,"amount":300000},"ma":{"enabled":true,"amount":150000},"amr":{"enabled":true,"amount":30000}}'::jsonb,
    'active',
    now()
  );

  -- Client 89: Lorenze Yecyec
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Lorenze',
    'Yecyec',
    '09263881844',
    NULL,
    'GAMES, AXIE',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PHP',
    '16533577',
    'Pru Life UK',
    1682.59,
    'monthly',
    now(),
    50000025052,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":250000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":625},"ser":{"enabled":true,"amount":5552},"icu":{"enabled":true,"amount":62531352}}'::jsonb,
    'active',
    now()
  );

  -- Client 90: Meldy R. Sibonga
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Meldy R.',
    'Sibonga',
    '09916010401',
    NULL,
    NULL,
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '11599272',
    'Pru Life UK',
    2300,
    'monthly',
    now(),
    2000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":500000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":60000},"pa_atpd":{"enabled":true,"amount":60000},"ma":{"enabled":true,"amount":30000},"amr":{"enabled":true,"amount":6000}}'::jsonb,
    'active',
    now()
  );

  -- Client 91: Froberto P. Yecyec
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Froberto P.',
    'Yecyec',
    NULL,
    NULL,
    'FAMILY',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PA Standard',
    '16769279',
    'Pru Life UK',
    615.83,
    'annual',
    now(),
    100000,
    NULL,
    NULL,
    '{"dhi":{"enabled":true,"daily_rate":500},"pa_atpd":{"enabled":true,"amount":100000},"ma":{"enabled":true,"amount":50000},"amr":{"enabled":true,"amount":10000},"bb":{"enabled":true,"amount":5000}}'::jsonb,
    'active',
    now()
  );

  -- Client 92: Lorenzo P. Yecyec Jr
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Lorenzo P. Yecyec',
    'Jr',
    NULL,
    NULL,
    'FAMILY',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PA Standard',
    '16770801',
    'Pru Life UK',
    615.83,
    'annual',
    now(),
    100000,
    NULL,
    NULL,
    '{"dhi":{"enabled":true,"daily_rate":500},"pa_atpd":{"enabled":true,"amount":100000},"ma":{"enabled":true,"amount":50000},"amr":{"enabled":true,"amount":10000},"bb":{"enabled":true,"amount":5000}}'::jsonb,
    'active',
    now()
  );

  -- Client 93: Elena P. Yecyec
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Elena P.',
    'Yecyec',
    NULL,
    NULL,
    'FAMILY',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PA Standard',
    '16769396',
    'Pru Life UK',
    615.83,
    'annual',
    now(),
    100000,
    NULL,
    NULL,
    '{"dhi":{"enabled":true,"daily_rate":500},"pa_atpd":{"enabled":true,"amount":100000},"ma":{"enabled":true,"amount":50000},"amr":{"enabled":true,"amount":10000},"bb":{"enabled":true,"amount":5000}}'::jsonb,
    'active',
    now()
  );

  -- Client 94: Jovan Karl Bustamante
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Jovan Karl',
    'Bustamante',
    '09173157589',
    'ENGINEER',
    'anak, food trip',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '16911866',
    'Pru Life UK',
    3000,
    'monthly',
    now(),
    1500000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":300000},"tpd":{"enabled":true,"amount":800000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"pa_add":{"enabled":true,"amount":300000},"pa_atpd":{"enabled":true,"amount":300000},"ma":{"enabled":true,"amount":150000},"amr":{"enabled":true,"amount":30000}}'::jsonb,
    'active',
    now()
  );

  -- Client 95: Richelle Awitin
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Richelle',
    'Awitin',
    '09363030238',
    NULL,
    'anak riri',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Low',
    '16952827',
    'Pru Life UK',
    1674.84,
    'monthly',
    now(),
    1500000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":120000},"tpd":{"enabled":true,"amount":700000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"pa_add":{"enabled":true,"amount":75000},"pa_atpd":{"enabled":true,"amount":75000},"ma":{"enabled":true,"amount":37500},"amr":{"enabled":true,"amount":7500}}'::jsonb,
    'active',
    now()
  );

  -- Client 96: Iva Grenia C. Clarito
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Iva Grenia C.',
    'Clarito',
    '09177984802',
    NULL,
    NULL,
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PHP',
    '17036801',
    'Pru Life UK',
    1782.84,
    'monthly',
    now(),
    600000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":600000},"dhi":{"enabled":true,"daily_rate":750},"icu":{"enabled":true,"amount":75035752}}'::jsonb,
    'active',
    now()
  );

  -- Client 97: Elizah Celestine D. Salcedo
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Elizah Celestine D.',
    'Salcedo',
    '09177070900',
    NULL,
    NULL,
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PHP',
    '17171869',
    'Pru Life UK',
    1560.75,
    'monthly',
    now(),
    600000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":600000},"dhi":{"enabled":true,"daily_rate":750},"icu":{"enabled":true,"amount":75035752}}'::jsonb,
    'active',
    now()
  );

  -- Client 98: Elijah Jose Cristian L. Ong
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Elijah Jose Cristian L.',
    'Ong',
    '09750445693',
    NULL,
    NULL,
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PHP',
    '17309737',
    'Pru Life UK',
    1768.59,
    'monthly',
    now(),
    650000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":650000},"dhi":{"enabled":true,"daily_rate":813},"icu":{"enabled":true,"amount":813407525}}'::jsonb,
    'active',
    now()
  );

  -- Client 99: Roque L. Salvo
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Roque L.',
    'Salvo',
    '09166556725',
    'MANAGER',
    NULL,
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PHP',
    '17396751',
    'Pru Life UK',
    1682.58,
    'monthly',
    now(),
    500000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":500000},"dhi":{"enabled":true,"daily_rate":625},"icu":{"enabled":true,"amount":625313525}}'::jsonb,
    'active',
    now()
  );

  -- Client 100: John Jerald A. Ong
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'John Jerald A.',
    'Ong',
    NULL,
    'MEDICAL REPRESENTATIVE',
    NULL,
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA',
    '17407168',
    'Pru Life UK',
    18151.5,
    'semi_annual',
    now(),
    2200000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":1000000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":500000},"pa_atpd":{"enabled":true,"amount":500000},"ma":{"enabled":true,"amount":250000},"amr":{"enabled":true,"amount":50000}}'::jsonb,
    'active',
    now()
  );

  -- Client 101: John Jerald A. Ong
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'John Jerald A.',
    'Ong',
    '09063964324',
    NULL,
    NULL,
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PHP',
    '17407462',
    'Pru Life UK',
    18017.5,
    'semi_annual',
    now(),
    1000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":1},"dhi":{"enabled":true,"daily_rate":1250},"icu":{"enabled":true,"amount":1250625525}}'::jsonb,
    'active',
    now()
  );

  -- Client 102: Maria Cecille V. Nagac
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Maria Cecille V.',
    'Nagac',
    '09166696891',
    'COORDINATOR',
    NULL,
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Low',
    '16972528',
    'Pru Life UK',
    1500,
    'monthly',
    now(),
    1800000,
    NULL,
    NULL,
    '{"tpd":{"enabled":true,"amount":700000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"pa_add":{"enabled":true,"amount":200000},"pa_atpd":{"enabled":true,"amount":200000},"ma":{"enabled":true,"amount":100000},"amr":{"enabled":true,"amount":20000}}'::jsonb,
    'active',
    now()
  );

  -- Client 103: Klimpol C. Maganaka
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Klimpol C.',
    'Maganaka',
    '09954979533',
    'DOCTOR',
    'married has Baby Ashy 1st baby girl daughter',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '17216566',
    'Pru Life UK',
    10303,
    'quarterly',
    now(),
    2770000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":1200000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"pa_add":{"enabled":true,"amount":1000000},"pa_atpd":{"enabled":true,"amount":1000000},"ma":{"enabled":true,"amount":500000},"amr":{"enabled":true,"amount":100000}}'::jsonb,
    'active',
    now()
  );

  -- Client 104: Charls Warren E. D
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Charls Warren E.',
    'D',
    NULL,
    NULL,
    NULL,
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Low',
    '17443019',
    'Pru Life UK',
    1500,
    'monthly',
    now(),
    500000,
    NULL,
    NULL,
    '{"tpd":{"enabled":true,"amount":250000},"core_add":{"enabled":true,"amount":60000},"pa_add":{"enabled":true,"amount":200000},"pa_atpd":{"enabled":true,"amount":200000},"ma":{"enabled":true,"amount":100000},"amr":{"enabled":true,"amount":20000}}'::jsonb,
    'active',
    now()
  );

  -- Client 105: Christin Dianne E. Estillore
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Christin Dianne E.',
    'Estillore',
    NULL,
    'BUSINESSMAN',
    NULL,
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Low',
    '17443388',
    'Pru Life UK',
    1500,
    'monthly',
    now(),
    1000000,
    NULL,
    NULL,
    '{"tpd":{"enabled":true,"amount":500000},"core_add":{"enabled":true,"amount":60000},"pa_add":{"enabled":true,"amount":300000},"pa_atpd":{"enabled":true,"amount":300000},"ma":{"enabled":true,"amount":150000},"amr":{"enabled":true,"amount":30000}}'::jsonb,
    'active',
    now()
  );

  -- Client 106: Benessa Jeanne C. Catipay
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Benessa Jeanne C.',
    'Catipay',
    NULL,
    'BUSINESSMAN',
    NULL,
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Low',
    '17604778',
    'Pru Life UK',
    1717.59,
    'monthly',
    now(),
    1000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":100000},"tpd":{"enabled":true,"amount":500000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":200000},"pa_atpd":{"enabled":true,"amount":200000},"ma":{"enabled":true,"amount":100000},"amr":{"enabled":true,"amount":20000}}'::jsonb,
    'active',
    now()
  );

  -- Client 107: Aljon Rey L. Manto
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Aljon Rey L.',
    'Manto',
    '09168569672',
    'VIRTUAL ASSISTANT',
    NULL,
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '17637219',
    'Pru Life UK',
    2500,
    'monthly',
    now(),
    2500000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":600000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":300000},"pa_atpd":{"enabled":true,"amount":300000},"ma":{"enabled":true,"amount":150000},"amr":{"enabled":true,"amount":30000}}'::jsonb,
    'active',
    now()
  );

  -- Client 108: Myrelle Mae Eloise C. Dumalagan
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Myrelle Mae Eloise C.',
    'Dumalagan',
    NULL,
    NULL,
    NULL,
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '17848784',
    'Pru Life UK',
    2000,
    'monthly',
    now(),
    2200000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":300000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":300000},"pa_atpd":{"enabled":true,"amount":300000},"ma":{"enabled":true,"amount":150000},"amr":{"enabled":true,"amount":30000}}'::jsonb,
    'active',
    now()
  );

  -- Client 109: Francine Mae S. Benson
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Francine Mae S.',
    'Benson',
    '09171441466',
    'ENGINEER',
    NULL,
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Low',
    '17947961',
    'Pru Life UK',
    1700,
    'monthly',
    now(),
    1500000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":100000},"tpd":{"enabled":true,"amount":500000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":120000},"pa_atpd":{"enabled":true,"amount":120000},"ma":{"enabled":true,"amount":60000},"amr":{"enabled":true,"amount":12000}}'::jsonb,
    'active',
    now()
  );

  -- Client 110: Jessa Grace N. Labininay
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Jessa Grace N.',
    'Labininay',
    '09169874825',
    'MANAGER',
    NULL,
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA PLUS',
    '18064226',
    'Pru Life UK',
    2086.59,
    'monthly',
    now(),
    1200000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":500000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":200000},"pa_atpd":{"enabled":true,"amount":200000},"ma":{"enabled":true,"amount":100000},"amr":{"enabled":true,"amount":20000}}'::jsonb,
    'active',
    now()
  );

  -- Client 111: Xandelyn Racel R. Baena AND Diego Alexander Gonzalo R. Baena
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Xandelyn Racel R. Baena AND Diego Alexander Gonzalo R.',
    'Baena',
    '09669320610',
    'TEACHER',
    NULL,
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PHP',
    '18069943',
    'Pru Life UK',
    1574.84,
    'monthly',
    now(),
    580000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":580},"dhi":{"enabled":true,"daily_rate":725},"icu":{"enabled":true,"amount":725363525}}'::jsonb,
    'active',
    now()
  );

  -- Client 112: Jez Reel A. Castillo
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Jez Reel A.',
    'Castillo',
    '09531875279',
    'POLICEMAN',
    'PNP OFFICER',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA',
    '18066711',
    'Pru Life UK',
    2250,
    'monthly',
    now(),
    1000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":100000},"tpd":{"enabled":true,"amount":60000},"core_add":{"enabled":true,"amount":600003}}'::jsonb,
    'active',
    now()
  );

  -- Client 113: Mary Justimirj G. Go and Theo Mikhail Go
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Mary Justimirj G. Go and Theo Mikhail',
    'Go',
    '09159445428',
    'RECRUITMENT OFFICER',
    'Shopee ga work Ate Mirj',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PHP',
    '18453766',
    'Pru Life UK',
    1508.34,
    'monthly',
    now(),
    550000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":550},"dhi":{"enabled":true,"daily_rate":688},"icu":{"enabled":true,"amount":688344525}}'::jsonb,
    'active',
    now()
  );

  -- Client 114: Mercy Evelyn C. Masing I and PLI: Evelyn C. Masing
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Mercy Evelyn C. Masing I and PLI: Evelyn C.',
    'Masing',
    '09177113855',
    NULL,
    'parent of te Mercy',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PA Standard',
    '18476813',
    'Pru Life UK',
    4431.82,
    'annual',
    now(),
    1000000,
    NULL,
    NULL,
    '{"tpd":{"enabled":true,"amount":1000000},"dhi":{"enabled":true,"daily_rate":2000},"pa_atpd":{"enabled":true,"amount":1000000},"ma":{"enabled":true,"amount":500000},"amr":{"enabled":true,"amount":100000},"bb":{"enabled":true,"amount":10000}}'::jsonb,
    'active',
    now()
  );

  -- Client 115: Deither P. Quitoriano
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Deither P.',
    'Quitoriano',
    '09458143363',
    'ENGINEER',
    'Boyfie of MYRELLE and brother of Sir Dennis',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Low',
    '18481977',
    'Pru Life UK',
    1507.92,
    'monthly',
    now(),
    1000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":100000},"tpd":{"enabled":true,"amount":500000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"pa_add":{"enabled":true,"amount":150000},"pa_atpd":{"enabled":true,"amount":150000},"ma":{"enabled":true,"amount":75000},"amr":{"enabled":true,"amount":15000}}'::jsonb,
    'active',
    now()
  );

  -- Client 116: Shaira Laine D. Bugayong (Shang Romero fb)
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Shaira Laine D. Bugayong (Shang Romero',
    'fb)',
    '09777640147',
    NULL,
    'Client of Steph, batchmate accountant',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '12576045',
    'Pru Life UK',
    3000,
    'monthly',
    now(),
    2700000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":1000000},"tpd":{"enabled":true,"amount":1150000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":250000},"pa_atpd":{"enabled":true,"amount":250000},"ma":{"enabled":true,"amount":125000},"amr":{"enabled":true,"amount":25000}}'::jsonb,
    'active',
    now()
  );

  -- Client 117: Dweezil Zoe N. Ilano
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Dweezil Zoe N.',
    'Ilano',
    '09171220811',
    NULL,
    'Cousin of Timoy Ilano, government PRC employee',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '11955419',
    'Pru Life UK',
    1800,
    'monthly',
    now(),
    1800000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":500000},"tpd":{"enabled":true,"amount":500000},"core_add":{"enabled":true,"amount":60000},"dhi":{"enabled":true,"daily_rate":1000},"icu":{"enabled":true,"amount":2000},"pa_add":{"enabled":true,"amount":100000},"pa_atpd":{"enabled":true,"amount":100000},"ma":{"enabled":true,"amount":50000},"amr":{"enabled":true,"amount":10000}}'::jsonb,
    'active',
    now()
  );

  -- Client 118: Jonassaint C. Cabili
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Jonassaint C.',
    'Cabili',
    '09971608804',
    NULL,
    'BF Rhea Udang, likes food and traveling',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '11537237',
    'Pru Life UK',
    3000,
    'monthly',
    now(),
    1000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":500000},"tpd":{"enabled":true,"amount":500000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"pa_add":{"enabled":true,"amount":100000},"pa_atpd":{"enabled":true,"amount":100000},"ma":{"enabled":true,"amount":50000}}'::jsonb,
    'active',
    now()
  );

  -- Client 119: Christian Val M. Daquipil
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Christian Val M.',
    'Daquipil',
    '09171056807',
    'CLERICAL OFFICER',
    'NGO work',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '18624701',
    'Pru Life UK',
    3120,
    'monthly',
    now(),
    2990000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":1000000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":500000},"pa_atpd":{"enabled":true,"amount":500000},"ma":{"enabled":true,"amount":250000},"amr":{"enabled":true,"amount":50000}}'::jsonb,
    'active',
    now()
  );

  -- Client 120: John Ed L. Molijon
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'John Ed L.',
    'Molijon',
    'done',
    NULL,
    'Travel, economist, cafe',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PHP',
    '18671732',
    'Pru Life UK',
    1682.59,
    'monthly',
    now(),
    50000025052,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":250000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":625},"ser":{"enabled":true,"amount":5552},"icu":{"enabled":true,"amount":62531352}}'::jsonb,
    'active',
    now()
  );

  -- Client 121: Alyzza Mae B. Artazo
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Alyzza Mae B.',
    'Artazo',
    '09171042490',
    'TEACHER',
    'Baking, Taylor Swift, Barbie, XU teacher',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '19024807',
    'Pru Life UK',
    5000,
    'monthly',
    now(),
    2800000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":1000000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":500000},"pa_atpd":{"enabled":true,"amount":500000},"ma":{"enabled":true,"amount":250000},"amr":{"enabled":true,"amount":50000}}'::jsonb,
    'active',
    now()
  );

  -- Client 122: Christian Inno A. Porol
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Christian Inno A.',
    'Porol',
    '09177031667',
    NULL,
    'Student, son of Maam Coy Porol',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Low',
    '19138408',
    'Pru Life UK',
    9500,
    'semi_annual',
    now(),
    1500000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":300000},"tpd":{"enabled":true,"amount":500000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"pa_add":{"enabled":true,"amount":300000},"pa_atpd":{"enabled":true,"amount":300000},"ma":{"enabled":true,"amount":150000},"amr":{"enabled":true,"amount":30000}}'::jsonb,
    'active',
    now()
  );

  -- Client 123: Beatrice Marie E. Ubongen
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Beatrice Marie E.',
    'Ubongen',
    '09279577237',
    NULL,
    'Gf John Ed, food trip, teacher academy in uptown',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '19171567',
    'Pru Life UK',
    2300,
    'monthly',
    now(),
    2000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":600000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":300000},"pa_atpd":{"enabled":true,"amount":300000},"ma":{"enabled":true,"amount":150000},"amr":{"enabled":true,"amount":30000}}'::jsonb,
    'active',
    now()
  );

  -- Client 124: Dorothy Joy L. Yanez & Althea Cynde Yanez
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Dorothy Joy L. Yanez & Althea Cynde',
    'Yanez',
    '09976442880',
    NULL,
    'Barkada with Ate Cheryy & Elizabeth Osorio',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PHP',
    '19177181',
    'Pru Life UK',
    1560.75,
    'monthly',
    now(),
    50000025052,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":600000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":750},"ser":{"enabled":true,"amount":5552},"icu":{"enabled":true,"amount":75037552}}'::jsonb,
    'active',
    now()
  );

  -- Client 125: Elizabeth O. Padillo
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Elizabeth O.',
    'Padillo',
    '09274572119',
    NULL,
    'Barkada with Ate Cheryy & Te Dorothy, law student, loves japan hubby in japan',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '19187881',
    'Pru Life UK',
    2500,
    'monthly',
    now(),
    2100000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":600000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"icu":{"enabled":true,"amount":300000},"pa_add":{"enabled":true,"amount":300000},"pa_atpd":{"enabled":true,"amount":300000},"ma":{"enabled":true,"amount":150000},"amr":{"enabled":true,"amount":30000}}'::jsonb,
    'active',
    now()
  );

  -- Client 126: Erika Carmela B. Inovero
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Erika Carmela B.',
    'Inovero',
    '09057094676',
    'CLERICAL/ ADMINISTRATIVE',
    'My barkada, freediving, food trip, cafe hopping with Carie',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '19261096',
    'Pru Life UK',
    2500,
    'monthly',
    now(),
    2100000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":600000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"icu":{"enabled":true,"amount":300000},"pa_add":{"enabled":true,"amount":300000},"pa_atpd":{"enabled":true,"amount":300000},"ma":{"enabled":true,"amount":150000},"amr":{"enabled":true,"amount":30000}}'::jsonb,
    'active',
    now()
  );

  -- Client 127: Marie Therese D. Valentin
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Marie Therese D.',
    'Valentin',
    '09270215322',
    'RESEARCH ASSOCIATE',
    'Accenture work, VA',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '19464621',
    'Pru Life UK',
    4200,
    'monthly',
    now(),
    2900000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":1200000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"icu":{"enabled":true,"amount":2000},"pa_add":{"enabled":true,"amount":500000},"pa_atpd":{"enabled":true,"amount":500000},"ma":{"enabled":true,"amount":250000},"amr":{"enabled":true,"amount":50000}}'::jsonb,
    'active',
    now()
  );

  -- Client 128: Ramazali C. Mohamad
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Ramazali C.',
    'Mohamad',
    NULL,
    'ENGINEER',
    'Husband te Daphne',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '19677089',
    'Pru Life UK',
    6600,
    'quarterly',
    now(),
    1700000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":400000},"tpd":{"enabled":true,"amount":800000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"pa_add":{"enabled":true,"amount":250000},"pa_atpd":{"enabled":true,"amount":250000},"ma":{"enabled":true,"amount":125000},"amr":{"enabled":true,"amount":25000}}'::jsonb,
    'active',
    now()
  );

  -- Client 129: Queenie Quimotquimot
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Queenie',
    'Quimotquimot',
    NULL,
    NULL,
    'adopted from Ana Manere',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '14951785',
    'Pru Life UK',
    7500,
    'quarterly',
    now(),
    250000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":1000000},"tpd":{"enabled":true,"amount":500000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"pa_add":{"enabled":true,"amount":200000},"pa_atpd":{"enabled":true,"amount":200000},"ma":{"enabled":true,"amount":100000},"amr":{"enabled":true,"amount":20000}}'::jsonb,
    'active',
    now()
  );

  -- Client 130: Glerose Tadifa Millana
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Glerose Tadifa',
    'Millana',
    NULL,
    NULL,
    'adopted from Ana Manere',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '15195091',
    'Pru Life UK',
    3,
    'monthly',
    now(),
    2000000,
    NULL,
    NULL,
    '{"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"pa_add":{"enabled":true,"amount":500000},"pa_atpd":{"enabled":true,"amount":500000},"ma":{"enabled":true,"amount":250000},"amr":{"enabled":true,"amount":50000}}'::jsonb,
    'active',
    now()
  );

  -- Client 131: Juan Paulo Tadifa
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Juan Paulo',
    'Tadifa',
    '09761196405',
    NULL,
    'adopted from Ana Manere',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    NULL,
    'Pru Life UK',
    4000,
    'monthly',
    now(),
    2500000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":1500000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"icu":{"enabled":true,"amount":2000},"pa_add":{"enabled":true,"amount":500000},"pa_atpd":{"enabled":true,"amount":500000},"ma":{"enabled":true,"amount":250000},"amr":{"enabled":true,"amount":50000}}'::jsonb,
    'active',
    now()
  );

  -- Client 132: Billy Jeanne Glory
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Billy Jeanne',
    'Glory',
    '09810332083',
    NULL,
    'adopted from Ana Manere',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '15752029',
    'Pru Life UK',
    3000,
    'monthly',
    now(),
    1000000,
    NULL,
    NULL,
    '{"tpd":{"enabled":true,"amount":700000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"pa_add":{"enabled":true,"amount":116600},"pa_atpd":{"enabled":true,"amount":116600},"ma":{"enabled":true,"amount":58300},"amr":{"enabled":true,"amount":11660}}'::jsonb,
    'active',
    now()
  );

  -- Client 133: John Kennith C. Payapaya
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'John Kennith C.',
    'Payapaya',
    NULL,
    NULL,
    'adopted from Ana Manere',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'Elite 15',
    '18261881',
    'Pru Life UK',
    6335.67,
    'monthly',
    now(),
    4550000,
    11495.81,
    '2024-03-01',
    '{"ccb":{"enabled":true,"amount":800000},"tpd":{"enabled":true,"amount":2500000},"core_add":{"enabled":true,"amount":1200000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1500},"icu":{"enabled":true,"amount":3000}}'::jsonb,
    'active',
    now()
  );

  -- Client 134: Emmanuel Francis
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Emmanuel',
    'Francis',
    '09676880747',
    NULL,
    'adopted from Ate Jazzie',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '15752029',
    'Pru Life UK',
    1500,
    'monthly',
    now(),
    2000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":500000},"tpd":{"enabled":true,"amount":500000},"core_add":{"enabled":true,"amount":500000},"wptpd":{"enabled":true}}'::jsonb,
    'active',
    now()
  );

  -- Client 135: Bryan Jim Apisan Paano
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Bryan Jim Apisan',
    'Paano',
    '09162493072',
    NULL,
    'adopted from Ate Jazzie',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '10777588',
    'Pru Life UK',
    1503.92,
    'monthly',
    now(),
    1000000,
    NULL,
    NULL,
    '{"tpd":{"enabled":true,"amount":300000},"core_add":{"enabled":true,"amount":300000},"wptpd":{"enabled":true},"pa_atpd":{"enabled":true,"amount":300000}}'::jsonb,
    'active',
    now()
  );

  -- Client 136: Geoff Dalis Diaz
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Geoff Dalis',
    'Diaz',
    '09065041962',
    NULL,
    'adopted from Ate Jazzie',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '10777588',
    'Pru Life UK',
    1500,
    'monthly',
    now(),
    2000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":500000},"tpd":{"enabled":true,"amount":500000},"core_add":{"enabled":true,"amount":500000},"wptpd":{"enabled":true}}'::jsonb,
    'active',
    now()
  );

  -- Client 137: Fretch Loraine Giganto
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Fretch Loraine',
    'Giganto',
    '09162620757',
    NULL,
    'adopted from Ate Jazzie',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '13516569',
    'Pru Life UK',
    3000,
    'monthly',
    now(),
    2000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":2000000},"tpd":{"enabled":true,"amount":1500000},"core_add":{"enabled":true,"amount":2000000},"wptpd":{"enabled":true}}'::jsonb,
    'active',
    now()
  );

  -- Client 138: Katrina Paola Guarin
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Katrina Paola',
    'Guarin',
    '09177021520',
    'DOCTOR',
    'adopted from Ana Manere',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '11650153',
    'Pru Life UK',
    5000,
    'monthly',
    now(),
    3000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":2000000},"tpd":{"enabled":true,"amount":2000000},"core_add":{"enabled":true,"amount":100000}}'::jsonb,
    'active',
    now()
  );

  -- Client 139: Maria Lourdes V. Llacuna
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Maria Lourdes V.',
    'Llacuna',
    '09157271932',
    'ANALYST',
    NULL,
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '19890493',
    'Pru Life UK',
    2500,
    'monthly',
    now(),
    2160000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":600000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":300000},"pa_atpd":{"enabled":true,"amount":300000},"ma":{"enabled":true,"amount":150000},"amr":{"enabled":true,"amount":30000}}'::jsonb,
    'active',
    now()
  );

  -- Client 140: Mary Justimirj G. Go
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Mary Justimirj G.',
    'Go',
    'done',
    'RECRUITMENT OFFICER',
    NULL,
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '20019031',
    'Pru Life UK',
    2453,
    'monthly',
    now(),
    2000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":600000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"icu":{"enabled":true,"amount":2000},"pa_add":{"enabled":true,"amount":300000},"pa_atpd":{"enabled":true,"amount":300000},"ma":{"enabled":true,"amount":150000},"amr":{"enabled":true,"amount":30000}}'::jsonb,
    'active',
    now()
  );

  -- Client 141: Deejay S. Tadifa
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Deejay S.',
    'Tadifa',
    '09281566900',
    'ENGINEER',
    NULL,
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '20107345',
    'Pru Life UK',
    2500,
    'monthly',
    now(),
    2300000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":800000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":300000},"pa_atpd":{"enabled":true,"amount":300000},"ma":{"enabled":true,"amount":150000},"amr":{"enabled":true,"amount":30000}}'::jsonb,
    'active',
    now()
  );

  -- Client 142: Honey Dori Ann S. Peralta
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Honey Dori Ann S.',
    'Peralta',
    '09559771765',
    'HEALTH WORKER',
    NULL,
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '20125286',
    'Pru Life UK',
    4500,
    'annual',
    now(),
    1200000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":90000},"tpd":{"enabled":true,"amount":500000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"pa_add":{"enabled":true,"amount":100000},"pa_atpd":{"enabled":true,"amount":100000},"ma":{"enabled":true,"amount":50000},"amr":{"enabled":true,"amount":10000}}'::jsonb,
    'active',
    now()
  );

  -- Client 143: Abun Eva R. Umas-as
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Abun Eva R.',
    'Umas-as',
    '09978603008',
    'ENGINEER',
    NULL,
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '20254701',
    'Pru Life UK',
    1500,
    'monthly',
    now(),
    1300000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":100000},"tpd":{"enabled":true,"amount":500000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"pa_add":{"enabled":true,"amount":200000},"pa_atpd":{"enabled":true,"amount":200000},"ma":{"enabled":true,"amount":100000},"amr":{"enabled":true,"amount":20000}}'::jsonb,
    'active',
    now()
  );

  -- Client 144: Deljie B. Lomongo
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Deljie B.',
    'Lomongo',
    '09199042591',
    'QA STAFF',
    NULL,
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '20481695',
    'Pru Life UK',
    2240,
    'monthly',
    now(),
    1300000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":200000},"tpd":{"enabled":true,"amount":800000},"core_add":{"enabled":true,"amount":100000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":200000},"pa_atpd":{"enabled":true,"amount":200000},"ma":{"enabled":true,"amount":100000},"amr":{"enabled":true,"amount":20000}}'::jsonb,
    'active',
    now()
  );

  -- Client 145: Ranseil T. Sabroso
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Ranseil T.',
    'Sabroso',
    '09261462090',
    'ADMIN ASSISTANT',
    NULL,
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '20578253',
    'Pru Life UK',
    2250,
    'monthly',
    now(),
    2000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":200000},"tpd":{"enabled":true,"amount":600000},"core_add":{"enabled":true,"amount":100000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":200000},"pa_atpd":{"enabled":true,"amount":200000},"ma":{"enabled":true,"amount":100000},"amr":{"enabled":true,"amount":20000}}'::jsonb,
    'active',
    now()
  );

  -- Client 146: Joshua Christian Dael
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Joshua Christian',
    'Dael',
    '09178076173',
    'MARKETING',
    'Devcom, loves to travel and foodtrip',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'Pep 15',
    '14752083',
    'Pru Life UK',
    7851,
    'quarterly',
    now(),
    500000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":250000},"tpd":{"enabled":true,"amount":60000},"core_add":{"enabled":true,"amount":90000},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"icu":{"enabled":true,"amount":2000}}'::jsonb,
    'active',
    now()
  );

  -- Client 147: Karen Mae E. Linan
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Karen Mae E.',
    'Linan',
    '09179609607',
    'BUSINESSWOMAN',
    'Businesswoman naay ukayan sa Puerto, mag open coffee shop sa Puerto, businessman boyfriend naay Pru policy pod',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '21445799',
    'Pru Life UK',
    3000,
    'monthly',
    now(),
    2000000,
    NULL,
    NULL,
    '{"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":100000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":500000},"pa_atpd":{"enabled":true,"amount":500000},"ma":{"enabled":true,"amount":250000},"amr":{"enabled":true,"amount":50000}}'::jsonb,
    'active',
    now()
  );

  -- Client 148: Adopted clients from Janine
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Adopted clients from',
    'Janine',
    NULL,
    NULL,
    NULL,
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'Life Insurance',
    NULL,
    'Pru Life UK',
    0,
    'annual',
    now(),
    NULL,
    NULL,
    NULL,
    '{}'::jsonb,
    'active',
    now()
  );

  -- Client 149: Chloe D. Rozal
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Chloe D.',
    'Rozal',
    '09651974631',
    'Teacher',
    'Pursuing Masters graduating na',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '14686671',
    'Pru Life UK',
    1599.92,
    'monthly',
    now(),
    1500000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":400000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true}}'::jsonb,
    'active',
    now()
  );

  -- Client 150: Sheryll Mae L. Handugan
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Sheryll Mae L.',
    'Handugan',
    '09173633087',
    'Business & government',
    'gf of IJ',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '13271941',
    'Pru Life UK',
    2273,
    'monthly',
    now(),
    2250000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":525000},"tpd":{"enabled":true,"amount":800000},"core_add":{"enabled":true,"amount":100000},"wptpd":{"enabled":true}}'::jsonb,
    'active',
    now()
  );

  -- Client 151: Iarra Joie B. Dimayuga
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Iarra Joie B.',
    'Dimayuga',
    '09171102190',
    'Business',
    'gf of Sheryll Handugan',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '13285949',
    'Pru Life UK',
    2267.9,
    'monthly',
    now(),
    2250000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":525000},"tpd":{"enabled":true,"amount":800000},"core_add":{"enabled":true,"amount":100000},"wptpd":{"enabled":true}}'::jsonb,
    'active',
    now()
  );

  -- Client 152: Pearl Mercado
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Pearl',
    'Mercado',
    '09171844973',
    'OFW',
    'ofw',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '10222511',
    'Pru Life UK',
    3150,
    'monthly',
    now(),
    2000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":1000000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":100000},"wptpd":{"enabled":true}}'::jsonb,
    'active',
    now()
  );

  -- Client 153: Pearl Mercado
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Pearl',
    'Mercado',
    '09171844973',
    'OFW',
    'ofw',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '10752821',
    'Pru Life UK',
    1525,
    'monthly',
    now(),
    400000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":150000},"tpd":{"enabled":true,"amount":200000},"core_add":{"enabled":true,"amount":60000},"dhi":{"enabled":true,"daily_rate":1000}}'::jsonb,
    'active',
    now()
  );

  -- Client 154: PO: Pearl Mercado, PLI: Sophia Hilary P. Mercado
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'PO: Pearl Mercado, PLI: Sophia Hilary P.',
    'Mercado',
    '09171844973',
    'OFW',
    'DAUGHTER OF MS PEARL MERCADO',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '10494283',
    'Pru Life UK',
    2150,
    'monthly',
    now(),
    600000,
    NULL,
    NULL,
    '{"tpd":{"enabled":true,"amount":400000},"core_add":{"enabled":true,"amount":200000},"wptpd":{"enabled":true}}'::jsonb,
    'active',
    now()
  );

  -- Client 155: Menjie M. Alambatang
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Menjie M.',
    'Alambatang',
    '09094589275',
    'OFW',
    'OFW SAUDI',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '16779657',
    'Pru Life UK',
    2500,
    'monthly',
    now(),
    1500000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":800000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":100000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000}}'::jsonb,
    'active',
    now()
  );

  -- Client 156: Mary Loudette U. Entrampas
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Mary Loudette U.',
    'Entrampas',
    '09177702309',
    NULL,
    'agent in Manulife',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '09289036',
    'Pru Life UK',
    3008.34,
    'monthly',
    now(),
    1500000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":750000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"pa_add":{"enabled":true,"amount":750000},"pa_atpd":{"enabled":true,"amount":750000},"ma":{"enabled":true,"amount":375000},"amr":{"enabled":true,"amount":75000}}'::jsonb,
    'active',
    now()
  );

  -- Client 157: Keren Perodes
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Keren',
    'Perodes',
    '09178801043',
    'fiance Pastor Aron',
    'Business - Ahavah',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '10188261',
    'Pru Life UK',
    3100,
    'monthly',
    now(),
    2000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":1000000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":100000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000}}'::jsonb,
    'active',
    now()
  );

  -- Client 158: John Michael Mercado
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'John Michael',
    'Mercado',
    '09360463086',
    'OFW',
    'CAR RELATED FUTURE BUSINESS, husband of Ms Pearl Mercado',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '12721318',
    'Pru Life UK',
    6925,
    'quarterly',
    now(),
    1500000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":750000},"tpd":{"enabled":true,"amount":750000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"pa_add":{"enabled":true,"amount":100000},"pa_atpd":{"enabled":true,"amount":100000},"ma":{"enabled":true,"amount":50000},"amr":{"enabled":true,"amount":10000}}'::jsonb,
    'active',
    now()
  );

  -- Client 159: Deanne Antoniette B. Yecyec PLI: Annabelle Yecyec
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Deanne Antoniette B. Yecyec PLI: Annabelle',
    'Yecyec',
    'na',
    'teacher',
    'Mama',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '21896638',
    'Pru Life UK',
    3400,
    'monthly',
    now(),
    1000000,
    NULL,
    NULL,
    '{"tpd":{"enabled":true,"amount":600000},"core_add":{"enabled":true,"amount":100000},"wptpd":{"enabled":true},"pa_add":{"enabled":true,"amount":300000},"pa_atpd":{"enabled":true,"amount":300000},"ma":{"enabled":true,"amount":150000},"amr":{"enabled":true,"amount":30000}}'::jsonb,
    'active',
    now()
  );

  -- Client 160: Adopted clients from Janine
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Adopted clients from',
    'Janine',
    NULL,
    NULL,
    NULL,
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'Life Insurance',
    NULL,
    'Pru Life UK',
    0,
    'annual',
    now(),
    NULL,
    NULL,
    NULL,
    '{}'::jsonb,
    'active',
    now()
  );

  -- Client 161: Jessah Mae M. Gordo (IN Florida)
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Jessah Mae M. Gordo (IN',
    'Florida)',
    NULL,
    'OFW',
    'OFW',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '17942899',
    'Pru Life UK',
    3000,
    'monthly',
    now(),
    2000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":1000000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"pa_add":{"enabled":true,"amount":200000},"pa_atpd":{"enabled":true,"amount":200000},"ma":{"enabled":true,"amount":100000},"amr":{"enabled":true,"amount":20000}}'::jsonb,
    'active',
    now()
  );

  -- Client 162: Patria Rose J. Sualan (Bam Bam)
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Patria Rose J. Sualan (Bam',
    'Bam)',
    '09176502281',
    NULL,
    NULL,
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '09327972',
    'Pru Life UK',
    4500,
    'quarterly',
    now(),
    1000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":800000},"tpd":{"enabled":true,"amount":500000},"core_add":{"enabled":true,"amount":500000}}'::jsonb,
    'active',
    now()
  );

  -- Client 163: Jemima R. Perodes (sis Keren)
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Jemima R. Perodes (sis',
    'Keren)',
    '09178366704',
    'OFW',
    'Wife Sir Val Ticar',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '09069791',
    'Pru Life UK',
    2000,
    'monthly',
    now(),
    1000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":800000},"tpd":{"enabled":true,"amount":500000},"core_add":{"enabled":true,"amount":500000}}'::jsonb,
    'active',
    now()
  );

  -- Client 164: Jemima R. Perodes (sis Keren)
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Jemima R. Perodes (sis',
    'Keren)',
    NULL,
    'OFW',
    'Wife Sir Val Ticar',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '13015654',
    'Pru Life UK',
    3000,
    'monthly',
    now(),
    2000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":1000000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"pa_add":{"enabled":true,"amount":100000},"pa_atpd":{"enabled":true,"amount":100000},"ma":{"enabled":true,"amount":50000},"amr":{"enabled":true,"amount":10000}}'::jsonb,
    'active',
    now()
  );

  -- Client 165: Keziah R. Perodes (sis Keren)
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Keziah R. Perodes (sis',
    'Keren)',
    '09171205188',
    'Gov employee Bukidnon',
    NULL,
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '10508959',
    'Pru Life UK',
    3130,
    'monthly',
    now(),
    2000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":1000000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":500000},"dhi":{"enabled":true,"daily_rate":1000}}'::jsonb,
    'active',
    now()
  );

  -- Client 166: Anna Kathrina Y. Cornilla (fb: Anning Keroppi) abroad
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Anna Kathrina Y. Cornilla (fb: Anning Keroppi)',
    'abroad',
    NULL,
    'Gov employee, DSWD',
    NULL,
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '13097194',
    'Pru Life UK',
    4530,
    'quarterly',
    now(),
    1000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":300000},"tpd":{"enabled":true,"amount":800000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true}}'::jsonb,
    'active',
    now()
  );

  -- Client 167: Deborrah R. Batonghinog
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Deborrah R.',
    'Batonghinog',
    '09178184722',
    'VA',
    NULL,
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '14451699',
    'Pru Life UK',
    5000,
    'monthly',
    now(),
    3000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":1000000},"tpd":{"enabled":true,"amount":1500000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"icu":{"enabled":true,"amount":2000},"pa_add":{"enabled":true,"amount":300000},"pa_atpd":{"enabled":true,"amount":300000},"ma":{"enabled":true,"amount":150000},"amr":{"enabled":true,"amount":30000},"fs":{"enabled":true,"amount":646518.75}}'::jsonb,
    'active',
    now()
  );

  -- Client 168: Maria Irene S. Zaluaga - sent fb request (IG anak imie name)
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Maria Irene S. Zaluaga - sent fb request (IG anak imie',
    'name)',
    NULL,
    'OFW anak ga pay',
    'Mother',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PEP 10',
    '07805764',
    'Pru Life UK',
    9000,
    'quarterly',
    now(),
    216000,
    NULL,
    NULL,
    '{"tpd":{"enabled":true,"amount":60000},"core_add":{"enabled":true,"amount":180000}}'::jsonb,
    'active',
    now()
  );

  -- Client 169: Kinnara D. Gualdaquever (Shala)
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Kinnara D. Gualdaquever',
    '(Shala)',
    '09155182005',
    'gov employee cdo na',
    NULL,
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '14272985',
    'Pru Life UK',
    1550,
    'monthly',
    now(),
    1500000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":400000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000}}'::jsonb,
    'active',
    now()
  );

  -- Client 170: Gerralyn Arro (GE RA in cebu)
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Gerralyn Arro (GE RA in',
    'cebu)',
    NULL,
    'CEBU NAG WORK',
    'IN CEBU',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '17312959',
    'Pru Life UK',
    2000.09,
    'monthly',
    now(),
    1500000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":1000000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"pa_add":{"enabled":true,"amount":350000},"pa_atpd":{"enabled":true,"amount":350000},"ma":{"enabled":true,"amount":175000},"amr":{"enabled":true,"amount":35000},"fs":{"enabled":true,"amount":323259.38}}'::jsonb,
    'active',
    now()
  );

  -- Client 171: Jade Ann Faunillan (bethel work? planning mag abroad)
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Jade Ann Faunillan (bethel work? planning mag',
    'abroad)',
    NULL,
    'Nurse in Bethel hosp Malaybalay',
    'NURSE',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '12605303',
    'Pru Life UK',
    2000,
    'monthly',
    now(),
    2000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":450000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":200000},"wptpd":{"enabled":true}}'::jsonb,
    'active',
    now()
  );

  -- Client 172: Jaen Rose Gallogo (abroad)
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Jaen Rose Gallogo',
    '(abroad)',
    NULL,
    'OFW',
    'OFW',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '17942871',
    'Pru Life UK',
    3000,
    'monthly',
    now(),
    2000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":1000000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":200000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":2000}}'::jsonb,
    'active',
    now()
  );

  -- Client 173: Val Norwillem A. Ticar
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Val Norwillem A.',
    'Ticar',
    NULL,
    'Engineer Malaybalay, husband Ms Jemima',
    'Engineer',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '09074068',
    'Pru Life UK',
    2000,
    'monthly',
    now(),
    1000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":800000},"tpd":{"enabled":true,"amount":500000},"core_add":{"enabled":true,"amount":500000}}'::jsonb,
    'active',
    now()
  );

  -- Client 174: Val Norwillem A. Ticar
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Val Norwillem A.',
    'Ticar',
    '09491483212',
    'Engineer Malaybalay, husband Ms Jemima',
    'Engineer',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PHP',
    '22839739',
    'Pru Life UK',
    3000,
    'monthly',
    now(),
    1004500,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":1004500},"dhi":{"enabled":true,"daily_rate":1256},"ser":{"enabled":true,"amount":5552},"icu":{"enabled":true,"amount":125662852}}'::jsonb,
    'active',
    now()
  );

  -- Client 175: Analine Demata
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Analine',
    'Demata',
    NULL,
    '2 anak na',
    'Living in Philips Bukidnon',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '09835782',
    'Pru Life UK',
    2000,
    'monthly',
    now(),
    1500000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":1000000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":1000000}}'::jsonb,
    'active',
    now()
  );

  -- Client 176: Toni Rose J. Sualan
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Toni Rose J.',
    'Sualan',
    NULL,
    'Attorney',
    'Attorney na',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '09368521',
    'Pru Life UK',
    2500,
    'monthly',
    now(),
    1000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":470000},"tpd":{"enabled":true,"amount":500000},"core_add":{"enabled":true,"amount":500000}}'::jsonb,
    'active',
    now()
  );

  -- Client 177: Earl Belaca-ol adopted referred by Gellie
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Earl Belaca-ol adopted referred by',
    'Gellie',
    NULL,
    'Gov employee',
    'Gov employee',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '10105959',
    'Pru Life UK',
    4000,
    'monthly',
    now(),
    2000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":1000000},"tpd":{"enabled":true,"amount":900000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1500},"ser":{"enabled":true,"amount":22500},"pa_add":{"enabled":true,"amount":1450000},"pa_atpd":{"enabled":true,"amount":1450000},"ma":{"enabled":true,"amount":725000},"amr":{"enabled":true,"amount":145000}}'::jsonb,
    'active',
    now()
  );

  -- Client 178: Regina Racho adopted from Jopet (Reg Ina iya fb)
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Regina Racho adopted from Jopet (Reg Ina iya',
    'fb)',
    NULL,
    'OFW',
    'OFW',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '17415696',
    'Pru Life UK',
    2000,
    'monthly',
    now(),
    2000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":400000},"tpd":{"enabled":true,"amount":600000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000}}'::jsonb,
    'active',
    now()
  );

  -- Client 179: Krizia Nicole Pailagao PEP Policy
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Krizia Nicole Pailagao PEP',
    'Policy',
    NULL,
    'Freelance - businesswoman',
    'Freelance - businesswoman',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PEP 15',
    '10832661',
    'Pru Life UK',
    3000,
    'monthly',
    now(),
    1000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":600000},"tpd":{"enabled":true,"amount":400000},"core_add":{"enabled":true,"amount":90000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"pa_add":{"enabled":true,"amount":300000},"pa_atpd":{"enabled":true,"amount":300000},"ma":{"enabled":true,"amount":150000},"amr":{"enabled":true,"amount":30000}}'::jsonb,
    'active',
    now()
  );

  -- Client 180: Krizia Nicole Pailagao PAA Policy
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Krizia Nicole Pailagao PAA',
    'Policy',
    NULL,
    'Freelance - businesswoman',
    'Freelance - businesswoman',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '12672724',
    'Pru Life UK',
    3088,
    'monthly',
    now(),
    3000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":600000},"tpd":{"enabled":true,"amount":1600000},"core_add":{"enabled":true,"amount":1000000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"icu":{"enabled":true,"amount":2000}}'::jsonb,
    'active',
    now()
  );

  -- Client 181: Julian Francis Lagumbay
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Julian Francis',
    'Lagumbay',
    NULL,
    'VA',
    'VA',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '08098569',
    'Pru Life UK',
    2000,
    'monthly',
    now(),
    800000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":500000},"tpd":{"enabled":true,"amount":200000},"core_add":{"enabled":true,"amount":150000}}'::jsonb,
    'active',
    now()
  );

  -- Client 182: Julian Francis Lagumbay
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Julian Francis',
    'Lagumbay',
    NULL,
    'VA',
    'VA',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '23947128',
    'Pru Life UK',
    2320,
    'monthly',
    now(),
    400000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":200000},"tpd":{"enabled":true,"amount":250000},"core_add":{"enabled":true,"amount":100000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":300000},"pa_atpd":{"enabled":true,"amount":300000},"ma":{"enabled":true,"amount":150000},"amr":{"enabled":true,"amount":30000}}'::jsonb,
    'active',
    now()
  );

  -- Client 183: Michelle Kristi Pailagao
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Michelle Kristi',
    'Pailagao',
    NULL,
    'VA',
    'VA',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '10769372',
    'Pru Life UK',
    2100,
    'monthly',
    now(),
    1800000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":600000},"tpd":{"enabled":true,"amount":500000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"pa_add":{"enabled":true,"amount":300000},"pa_atpd":{"enabled":true,"amount":300000},"ma":{"enabled":true,"amount":150000},"amr":{"enabled":true,"amount":30000}}'::jsonb,
    'active',
    now()
  );

  -- Client 184: PLI: Joshuel Najmy MPO: Montecillo, Jonathan M . Montecillo
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'PLI: Joshuel Najmy MPO: Montecillo, Jonathan M .',
    'Montecillo',
    NULL,
    'Businessman',
    'Businessman',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'Elite 15',
    '12254809',
    'Pru Life UK',
    75000,
    'annual',
    now(),
    2000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":500000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":180000},"wptpd":{"enabled":true},"pa_add":{"enabled":true,"amount":1000000},"pa_atpd":{"enabled":true,"amount":1000000},"ma":{"enabled":true,"amount":500000},"amr":{"enabled":true,"amount":100000}}'::jsonb,
    'active',
    now()
  );

  -- Client 185: PO: Montecillo, Jonathan M PLI: Jules Michael M. Montecillo
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'PO: Montecillo, Jonathan M PLI: Jules Michael M.',
    'Montecillo',
    '09128357471',
    'Businessman',
    'Businessman',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'Elite 15',
    '12386771',
    'Pru Life UK',
    75000,
    'annual',
    now(),
    2988784,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":500000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":180000},"wptpd":{"enabled":true},"pa_add":{"enabled":true,"amount":1000000},"pa_atpd":{"enabled":true,"amount":1000000},"ma":{"enabled":true,"amount":500000},"amr":{"enabled":true,"amount":100000}}'::jsonb,
    'active',
    now()
  );

  -- Client 186: PO: Montecillo, Jonathan M PLI: Hazel M. Montecillo
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'PO: Montecillo, Jonathan M PLI: Hazel M.',
    'Montecillo',
    '09276132483',
    'Businessman',
    'Businessman',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'Elite 10',
    '12386996',
    'Pru Life UK',
    110000,
    'annual',
    now(),
    2000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":500000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":180000},"wptpd":{"enabled":true},"pa_add":{"enabled":true,"amount":1000000},"pa_atpd":{"enabled":true,"amount":1000000},"ma":{"enabled":true,"amount":500000},"amr":{"enabled":true,"amount":100000}}'::jsonb,
    'active',
    now()
  );

  -- Client 187: PO: Montecillo, Jonathan M PLI: Marien Jenessa M. Montecillo
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'PO: Montecillo, Jonathan M PLI: Marien Jenessa M.',
    'Montecillo',
    NULL,
    'Businessman',
    'Businessman',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'Elite 15',
    '12387105',
    'Pru Life UK',
    75000,
    'annual',
    now(),
    3000000,
    NULL,
    NULL,
    '{"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":180000},"wptpd":{"enabled":true},"pa_add":{"enabled":true,"amount":1000000},"pa_atpd":{"enabled":true,"amount":1000000},"ma":{"enabled":true,"amount":500000},"amr":{"enabled":true,"amount":100000}}'::jsonb,
    'active',
    now()
  );

  -- Client 188: PO: Montecillo, Jonathan M PLI: Mariel Jenisse M. Montecillo
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'PO: Montecillo, Jonathan M PLI: Mariel Jenisse M.',
    'Montecillo',
    NULL,
    'Businessman',
    'Businessman',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'Elite 15',
    '12387123',
    'Pru Life UK',
    75000,
    'annual',
    now(),
    3000000,
    NULL,
    NULL,
    '{"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":180000},"wptpd":{"enabled":true},"pa_add":{"enabled":true,"amount":1000000},"pa_atpd":{"enabled":true,"amount":1000000},"ma":{"enabled":true,"amount":500000},"amr":{"enabled":true,"amount":100000}}'::jsonb,
    'active',
    now()
  );

  -- Client 189: PO:PARRENO, JERMAINE ROM (Mae parrs iya fb) PLI: PARRENO, JASMINE FAITH ROM
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'PO:PARRENO, JERMAINE ROM (Mae parrs iya fb) PLI: PARRENO, JASMINE FAITH',
    'ROM',
    NULL,
    'Medtech',
    'Medtech',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '14985448',
    'Pru Life UK',
    1500,
    'monthly',
    now(),
    500000,
    NULL,
    NULL,
    '{"tpd":{"enabled":true,"amount":250000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"pa_add":{"enabled":true,"amount":100000},"pa_atpd":{"enabled":true,"amount":100000},"ma":{"enabled":true,"amount":50000},"amr":{"enabled":true,"amount":10000}}'::jsonb,
    'active',
    now()
  );

  -- Client 190: OBSIOMA, YAZMIN RUBY C.
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'OBSIOMA, YAZMIN RUBY',
    'C.',
    NULL,
    'VA',
    'VA',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '17893688',
    'Pru Life UK',
    3567.33,
    'monthly',
    now(),
    1500000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":750000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":500000},"pa_atpd":{"enabled":true,"amount":500000},"ma":{"enabled":true,"amount":250000},"amr":{"enabled":true,"amount":50000}}'::jsonb,
    'active',
    now()
  );

  -- Client 191: Adrian Hipayo
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Adrian',
    'Hipayo',
    NULL,
    'Teacher',
    'Teacher',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '16555431',
    'Pru Life UK',
    1800,
    'monthly',
    now(),
    2100000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":230000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":200000},"pa_atpd":{"enabled":true,"amount":200000},"ma":{"enabled":true,"amount":100000},"amr":{"enabled":true,"amount":20000}}'::jsonb,
    'active',
    now()
  );

  -- Client 192: Angelie Labang
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Angelie',
    'Labang',
    NULL,
    'OFW',
    'OFW US',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '16310651',
    'Pru Life UK',
    3000,
    'monthly',
    now(),
    2000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":1000000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":500000},"pa_atpd":{"enabled":true,"amount":500000},"ma":{"enabled":true,"amount":250000},"amr":{"enabled":true,"amount":50000}}'::jsonb,
    'active',
    now()
  );

  -- Client 193: Paula Colanse
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Paula',
    'Colanse',
    NULL,
    'OFW',
    'OFW',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '09728219',
    'Pru Life UK',
    3000,
    'monthly',
    now(),
    2000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":500000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"pa_add":{"enabled":true,"amount":1000000},"pa_atpd":{"enabled":true,"amount":1000000},"ma":{"enabled":true,"amount":500000},"amr":{"enabled":true,"amount":100000}}'::jsonb,
    'active',
    now()
  );

  -- Client 194: Kenny Colanse
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Kenny',
    'Colanse',
    NULL,
    'OFW',
    'OFW, husband maam paula',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '20409157',
    'Pru Life UK',
    3000,
    'monthly',
    now(),
    2000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":1000000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":500000},"pa_atpd":{"enabled":true,"amount":500000},"ma":{"enabled":true,"amount":250000},"amr":{"enabled":true,"amount":50000}}'::jsonb,
    'active',
    now()
  );

  -- Client 195: Jeanalyn Jordan
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Jeanalyn',
    'Jordan',
    NULL,
    'Businesswoman',
    'sari-sari store in Palawan',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '09895377',
    'Pru Life UK',
    1500,
    'monthly',
    now(),
    1700000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":600000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":500000}}'::jsonb,
    'active',
    now()
  );

  -- Client 196: Jennierose Lloren
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Jennierose',
    'Lloren',
    NULL,
    'Private employee',
    'private employee',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '17121516',
    'Pru Life UK',
    5400,
    'quarterly',
    now(),
    1000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":400000},"tpd":{"enabled":true,"amount":500000},"core_add":{"enabled":true,"amount":60000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"pa_add":{"enabled":true,"amount":100000},"pa_atpd":{"enabled":true,"amount":100000},"ma":{"enabled":true,"amount":50000}}'::jsonb,
    'active',
    now()
  );

  -- Client 197: PO: Jose P. Frivaldo Jr. PLI: Meteo Raine A. Frivaldo
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'PO: Jose P. Frivaldo Jr. PLI: Meteo Raine A.',
    'Frivaldo',
    NULL,
    'Student',
    'students',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '16210816',
    'Pru Life UK',
    1500,
    'monthly',
    now(),
    500000,
    NULL,
    NULL,
    '{"tpd":{"enabled":true,"amount":300000},"core_add":{"enabled":true,"amount":60000},"pa_add":{"enabled":true,"amount":100000},"pa_atpd":{"enabled":true,"amount":100000},"ma":{"enabled":true,"amount":100000},"amr":{"enabled":true,"amount":10000}}'::jsonb,
    'active',
    now()
  );

  -- Client 198: PO: June A. Frivaldo PLI: Iceia Ridge A. Frivaldo
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'PO: June A. Frivaldo PLI: Iceia Ridge A.',
    'Frivaldo',
    NULL,
    'Student',
    'students',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '16226601',
    'Pru Life UK',
    1500,
    'monthly',
    now(),
    500000,
    NULL,
    NULL,
    '{"tpd":{"enabled":true,"amount":300000},"core_add":{"enabled":true,"amount":60000},"pa_add":{"enabled":true,"amount":100000},"pa_atpd":{"enabled":true,"amount":100000},"ma":{"enabled":true,"amount":100000},"amr":{"enabled":true,"amount":10000}}'::jsonb,
    'active',
    now()
  );

  -- Client 199: Brilliane Ybanez
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Brilliane',
    'Ybanez',
    NULL,
    'Teacher',
    NULL,
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '10085679',
    'Pru Life UK',
    4500,
    'annual',
    now(),
    1000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":500000},"tpd":{"enabled":true,"amount":500000},"core_add":{"enabled":true,"amount":1000000}}'::jsonb,
    'active',
    now()
  );

  -- Client 200: 64 clients adopted
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    '64 clients',
    'adopted',
    NULL,
    NULL,
    NULL,
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'Life Insurance',
    NULL,
    'Pru Life UK',
    0,
    'annual',
    now(),
    NULL,
    NULL,
    NULL,
    '{}'::jsonb,
    'active',
    now()
  );

  -- Client 201: Shaira R. Banuag
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Shaira R.',
    'Banuag',
    '09978866468',
    'Pharmacy owner',
    'Anak Pharmacy owner',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '22268819',
    'Pru Life UK',
    3000,
    'monthly',
    now(),
    2200000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":1000000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":100000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":300000},"pa_atpd":{"enabled":true,"amount":300000},"ma":{"enabled":true,"amount":150000},"amr":{"enabled":true,"amount":30000}}'::jsonb,
    'active',
    now()
  );

  -- Client 202: Dr. Clint Quilab
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Dr. Clint',
    'Quilab',
    NULL,
    'Doctor',
    NULL,
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '22268775',
    'Pru Life UK',
    3000,
    'monthly',
    now(),
    2100000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":900000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":100000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":300000},"pa_atpd":{"enabled":true,"amount":300000},"ma":{"enabled":true,"amount":150000},"amr":{"enabled":true,"amount":30000}}'::jsonb,
    'active',
    now()
  );

  -- Client 203: Dee Labunog
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Dee',
    'Labunog',
    NULL,
    'Gov Employee',
    'Gov Employee, Teacher',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '22401121',
    'Pru Life UK',
    3000,
    'monthly',
    now(),
    2300000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":1000000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":100000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":500000},"pa_atpd":{"enabled":true,"amount":500000},"ma":{"enabled":true,"amount":250000},"amr":{"enabled":true,"amount":50000}}'::jsonb,
    'active',
    now()
  );

  -- Client 204: Lorena M. Pagara
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Lorena M.',
    'Pagara',
    NULL,
    'Businesswoman',
    'Businesswoman',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PIA',
    '22117994',
    'Pru Life UK',
    100000,
    'annual',
    now(),
    125000,
    NULL,
    NULL,
    '{"tpd":{"enabled":true,"amount":100000}}'::jsonb,
    'active',
    now()
  );

  -- Client 205: Michelle Ann M. Sarad
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Michelle Ann M.',
    'Sarad',
    NULL,
    'Businesswoman',
    'Businesswoman',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '22410842',
    'Pru Life UK',
    5000,
    'monthly',
    now(),
    3000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":1100000},"tpd":{"enabled":true,"amount":1200000},"core_add":{"enabled":true,"amount":100000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"icu":{"enabled":true,"amount":2000},"pa_add":{"enabled":true,"amount":1000000},"pa_atpd":{"enabled":true,"amount":1000000},"ma":{"enabled":true,"amount":500000},"amr":{"enabled":true,"amount":100000}}'::jsonb,
    'active',
    now()
  );

  -- Client 206: Erika Mutia
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Erika',
    'Mutia',
    NULL,
    'Gov employee, DPWH',
    'Gov employee, DPWH',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '22721534',
    'Pru Life UK',
    2700,
    'monthly',
    now(),
    500000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":100000},"tpd":{"enabled":true,"amount":250000},"core_add":{"enabled":true,"amount":100000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"pa_add":{"enabled":true,"amount":200000},"pa_atpd":{"enabled":true,"amount":200000},"ma":{"enabled":true,"amount":100000},"amr":{"enabled":true,"amount":20000}}'::jsonb,
    'active',
    now()
  );

  -- Client 207: PO: Ana Kathrina M. Arevalo PLI: Daniel Oliver M. Arevalo
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'PO: Ana Kathrina M. Arevalo PLI: Daniel Oliver M.',
    'Arevalo',
    NULL,
    'Teacher online',
    'Baby',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PHP',
    '22677657',
    'Pru Life UK',
    2500,
    'monthly',
    now(),
    1065680,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":1065680},"dhi":{"enabled":true,"daily_rate":1333},"ser":{"enabled":true,"amount":5552},"icu":{"enabled":true,"amount":133366752}}'::jsonb,
    'active',
    now()
  );

  -- Client 208: Ana Maria Kristina A. Cahoy
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Ana Maria Kristina A.',
    'Cahoy',
    NULL,
    'Fitness coach',
    'Fitness coach',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PYT',
    '23095129',
    'Pru Life UK',
    19700.5,
    'annual',
    now(),
    4000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":1000000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":500000},"pa_add":{"enabled":true,"amount":500000},"pa_atpd":{"enabled":true,"amount":500000},"ma":{"enabled":true,"amount":250000},"amr":{"enabled":true,"amount":50000}}'::jsonb,
    'active',
    now()
  );

  -- Client 209: Christena Udang
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Christena',
    'Udang',
    NULL,
    'OFW Teacher Thailand',
    'pink <3 , parrot',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '23615971',
    'Pru Life UK',
    2500,
    'monthly',
    now(),
    2200000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":500000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":100000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000}}'::jsonb,
    'active',
    now()
  );

  -- Client 210: Krizia Alambatang
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Krizia',
    'Alambatang',
    NULL,
    'San Miguel Foods Corp.',
    NULL,
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '23783409',
    'Pru Life UK',
    2600,
    'monthly',
    now(),
    2400000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":500000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":100000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":300000},"pa_atpd":{"enabled":true,"amount":300000},"ma":{"enabled":true,"amount":150000},"amr":{"enabled":true,"amount":30000}}'::jsonb,
    'active',
    now()
  );

  -- Client 211: Jay C. Centino
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Jay C.',
    'Centino',
    NULL,
    'UNAHCO employee',
    'bf of Judy',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '24196697',
    'Pru Life UK',
    2130.25,
    'monthly',
    now(),
    600000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":150000},"tpd":{"enabled":true,"amount":250000},"core_add":{"enabled":true,"amount":100000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"pa_add":{"enabled":true,"amount":200000},"pa_atpd":{"enabled":true,"amount":200000},"ma":{"enabled":true,"amount":100000},"amr":{"enabled":true,"amount":20000}}'::jsonb,
    'active',
    now()
  );

  -- Client 212: Judy Marl Elarmo
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Judy Marl',
    'Elarmo',
    NULL,
    'UNAHCO employee',
    'GF OF Jay',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '24196623',
    'Pru Life UK',
    3200,
    'monthly',
    now(),
    3000000,
    NULL,
    NULL,
    '{"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":100000},"wptpd":{"enabled":true},"pa_add":{"enabled":true,"amount":1000000},"pa_atpd":{"enabled":true,"amount":1000000},"ma":{"enabled":true,"amount":500000},"amr":{"enabled":true,"amount":100000}}'::jsonb,
    'active',
    now()
  );

  -- Client 213: Jaerah Mae Emano
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Jaerah Mae',
    'Emano',
    NULL,
    'GOV EMPLOYEE Manolo LGU',
    'Clothes, phone cases',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '24506003',
    'Pru Life UK',
    2124.25,
    'monthly',
    now(),
    2200000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":100000},"tpd":{"enabled":true,"amount":500000},"core_add":{"enabled":true,"amount":100000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":200000},"pa_atpd":{"enabled":true,"amount":200000},"ma":{"enabled":true,"amount":100000},"amr":{"enabled":true,"amount":20000}}'::jsonb,
    'active',
    now()
  );

  -- Client 214: Nikki Dumalag and Fam dengue
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Nikki Dumalag and Fam',
    'dengue',
    NULL,
    'Photographers',
    NULL,
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'Pru Dengue',
    '24323161 & etc.',
    'Pru Life UK',
    350,
    'annual',
    now(),
    10000012,
    NULL,
    NULL,
    '{"dhi":{"enabled":true,"daily_rate":10000}}'::jsonb,
    'active',
    now()
  );

  -- Client 215: Joshua Christian B. Dael
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Joshua Christian B.',
    'Dael',
    NULL,
    'Gcash Marketing Head',
    NULL,
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PEP 15',
    '14752083',
    'Pru Life UK',
    7851,
    'quarterly',
    now(),
    500000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":250000},"tpd":{"enabled":true,"amount":60000},"core_add":{"enabled":true,"amount":90000},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"icu":{"enabled":true,"amount":2000}}'::jsonb,
    'active',
    now()
  );

  -- Client 216: Joshua Christian B. Dael
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Joshua Christian B.',
    'Dael',
    NULL,
    'Gcash Marketing Head',
    'For educ fund of sister',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '24580132',
    'Pru Life UK',
    2100,
    'monthly',
    now(),
    504000,
    NULL,
    NULL,
    '{"tpd":{"enabled":true,"amount":100000},"core_add":{"enabled":true,"amount":100000}}'::jsonb,
    'active',
    now()
  );

  -- Client 217: PO: Marc Lester Lagat PLI: Marilyn Lagat
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'PO: Marc Lester Lagat PLI: Marilyn',
    'Lagat',
    NULL,
    'Del Monte',
    'Cat lover',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '24490793',
    'Pru Life UK',
    5000,
    'monthly',
    now(),
    597255,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":200000},"tpd":{"enabled":true,"amount":200000},"core_add":{"enabled":true,"amount":100000},"wptpd":{"enabled":true},"pa_add":{"enabled":true,"amount":1000000},"pa_atpd":{"enabled":true,"amount":1000000},"ma":{"enabled":true,"amount":500000},"amr":{"enabled":true,"amount":100000}}'::jsonb,
    'active',
    now()
  );

  -- Client 218: Jenny Mae V. Fuentes
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Jenny Mae V.',
    'Fuentes',
    NULL,
    'VA',
    'business',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '24609859',
    'Pru Life UK',
    5286,
    'monthly',
    now(),
    2800000,
    NULL,
    NULL,
    '{"tpd":{"enabled":true,"amount":100000},"core_add":{"enabled":true,"amount":100000},"pa_add":{"enabled":true,"amount":1000000},"pa_atpd":{"enabled":true,"amount":1000000},"ma":{"enabled":true,"amount":500000},"amr":{"enabled":true,"amount":100000}}'::jsonb,
    'active',
    now()
  );

  -- Client 219: PO: Marineth C. Antid PLI: Dwayne Marc Antid
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'PO: Marineth C. Antid PLI: Dwayne Marc',
    'Antid',
    NULL,
    'Student',
    'graduating student 2025',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '24929869',
    'Pru Life UK',
    2500,
    'monthly',
    now(),
    2000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":600000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":100000},"pa_add":{"enabled":true,"amount":500000},"pa_atpd":{"enabled":true,"amount":500000},"ma":{"enabled":true,"amount":250000},"amr":{"enabled":true,"amount":50000}}'::jsonb,
    'active',
    now()
  );

  -- Client 220: PO: Meldy Sibonga PLI: Zeus Ian Anggam
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'PO: Meldy Sibonga PLI: Zeus Ian',
    'Anggam',
    NULL,
    'Baby',
    'baby',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PHP',
    '24998174',
    'Pru Life UK',
    1361.25,
    'monthly',
    now(),
    50000025052,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":600000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":750},"ser":{"enabled":true,"amount":5552},"icu":{"enabled":true,"amount":75037552}}'::jsonb,
    'active',
    now()
  );

  -- Client 221: Sylvan Borong
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Sylvan',
    'Borong',
    NULL,
    'Businessman',
    'RUNNING',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '25263275',
    'Pru Life UK',
    5000,
    'monthly',
    now(),
    3000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":600000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":100000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1500},"ser":{"enabled":true,"amount":22500},"pa_add":{"enabled":true,"amount":500000},"pa_atpd":{"enabled":true,"amount":500000},"ma":{"enabled":true,"amount":250000},"amr":{"enabled":true,"amount":50000}}'::jsonb,
    'active',
    now()
  );

  -- Client 222: Laiza Gabot
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Laiza',
    'Gabot',
    NULL,
    'Businesswoman',
    'RUNNING, BAKING',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '25263266',
    'Pru Life UK',
    5000,
    'monthly',
    now(),
    3000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":600000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":100000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1500},"ser":{"enabled":true,"amount":22500},"pa_add":{"enabled":true,"amount":500000},"pa_atpd":{"enabled":true,"amount":500000},"ma":{"enabled":true,"amount":250000},"amr":{"enabled":true,"amount":50000}}'::jsonb,
    'active',
    now()
  );

  -- Client 223: Doc Mavreen Bautro
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Doc Mavreen',
    'Bautro',
    NULL,
    'Doctor',
    'RED VELVET KPOP GROUP? WEBINARS',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PHP',
    '25277694',
    'Pru Life UK',
    5000,
    'monthly',
    now(),
    1974235,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":1974235},"dhi":{"enabled":true,"daily_rate":2468},"ser":{"enabled":true,"amount":5552},"icu":{"enabled":true,"amount":2468123452}}'::jsonb,
    'active',
    now()
  );

  -- Client 224: Celestine Salcedo
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Celestine',
    'Salcedo',
    NULL,
    'Baby',
    'baby',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '25282999',
    'Pru Life UK',
    30000,
    'semi_annual',
    now(),
    1200000,
    NULL,
    NULL,
    '{"tpd":{"enabled":true,"amount":500000},"core_add":{"enabled":true,"amount":100000}}'::jsonb,
    'active',
    now()
  );

  -- Client 225: PO: Flordeliza Bautro PLI: Kyle Paolo Bautro
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'PO: Flordeliza Bautro PLI: Kyle Paolo',
    'Bautro',
    NULL,
    'Student',
    'STUDENT',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '25401393',
    'Pru Life UK',
    2000,
    'monthly',
    now(),
    1000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":250000},"tpd":{"enabled":true,"amount":500000},"core_add":{"enabled":true,"amount":100000},"wptpd":{"enabled":true},"pa_add":{"enabled":true,"amount":250000},"pa_atpd":{"enabled":true,"amount":250000},"ma":{"enabled":true,"amount":125000},"amr":{"enabled":true,"amount":25000}}'::jsonb,
    'active',
    now()
  );

  -- Client 226: Doc Carlo Malade
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Doc Carlo',
    'Malade',
    NULL,
    'Doctor',
    'doctor',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'Elite 15',
    '25441812',
    'Pru Life UK',
    10000,
    'monthly',
    now(),
    3000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":600000},"tpd":{"enabled":true,"amount":1500000},"core_add":{"enabled":true,"amount":250000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"icu":{"enabled":true,"amount":2000},"pa_add":{"enabled":true,"amount":1000000},"pa_atpd":{"enabled":true,"amount":1000000},"ma":{"enabled":true,"amount":500000},"amr":{"enabled":true,"amount":100000}}'::jsonb,
    'active',
    now()
  );

  -- Client 227: Mary Grace M. Castro
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Mary Grace M.',
    'Castro',
    NULL,
    'Admin staff',
    'cousin of Thea',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '25460419',
    'Pru Life UK',
    2500,
    'monthly',
    now(),
    2000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":200000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":100000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":300000},"pa_atpd":{"enabled":true,"amount":300000},"ma":{"enabled":true,"amount":150000},"amr":{"enabled":true,"amount":30000}}'::jsonb,
    'active',
    now()
  );

  -- Client 228: Elena Yecyec
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Elena',
    'Yecyec',
    NULL,
    'Businesswoman',
    NULL,
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '25462977',
    'Pru Life UK',
    4100,
    'monthly',
    now(),
    522300,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":100000},"tpd":{"enabled":true,"amount":250000},"core_add":{"enabled":true,"amount":100000},"wptpd":{"enabled":true},"pa_add":{"enabled":true,"amount":250000},"pa_atpd":{"enabled":true,"amount":250000},"ma":{"enabled":true,"amount":125000},"amr":{"enabled":true,"amount":25000}}'::jsonb,
    'active',
    now()
  );

  -- Client 229: Kierr Sadicon
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Kierr',
    'Sadicon',
    NULL,
    'VA',
    'business',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '25475549',
    'Pru Life UK',
    3361,
    'monthly',
    now(),
    2800000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":1000000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":100000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":500000},"pa_atpd":{"enabled":true,"amount":500000},"ma":{"enabled":true,"amount":250000},"amr":{"enabled":true,"amount":50000}}'::jsonb,
    'active',
    now()
  );

  -- Client 230: Mae Ann Colcol
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Mae Ann',
    'Colcol',
    NULL,
    'Pharmacist',
    'running',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '25504745',
    'Pru Life UK',
    3000,
    'monthly',
    now(),
    2400000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":1000000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":100000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"icu":{"enabled":true,"amount":2000},"pa_add":{"enabled":true,"amount":300000},"pa_atpd":{"enabled":true,"amount":300000},"ma":{"enabled":true,"amount":150000},"amr":{"enabled":true,"amount":30000}}'::jsonb,
    'active',
    now()
  );

  -- Client 231: Nova Nicole Pimentel
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Nova Nicole',
    'Pimentel',
    NULL,
    'Office worker',
    'dog lover',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '25551427',
    'Pru Life UK',
    8103,
    'quarterly',
    now(),
    1200000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":450000},"tpd":{"enabled":true,"amount":700000},"core_add":{"enabled":true,"amount":100000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":200000},"pa_atpd":{"enabled":true,"amount":200000},"ma":{"enabled":true,"amount":100000},"amr":{"enabled":true,"amount":20000}}'::jsonb,
    'active',
    now()
  );

  -- Client 232: Roger James G. Rosas
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Roger James G.',
    'Rosas',
    '09771689789',
    'VA',
    'cafe, planning for wedding',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '25810794',
    'Pru Life UK',
    3500,
    'monthly',
    now(),
    2500000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":1000000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":100000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":500000},"pa_atpd":{"enabled":true,"amount":500000},"ma":{"enabled":true,"amount":250000},"amr":{"enabled":true,"amount":50000}}'::jsonb,
    'active',
    now()
  );

  -- Client 233: Fegie Anne T. Yamit
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Fegie Anne T.',
    'Yamit',
    '09358580080',
    'Government employee',
    'camiguin, working bank',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '25838333',
    'Pru Life UK',
    3300,
    'monthly',
    now(),
    3000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":1000000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":100000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"icu":{"enabled":true,"amount":2000},"pa_add":{"enabled":true,"amount":500000},"pa_atpd":{"enabled":true,"amount":500000},"ma":{"enabled":true,"amount":250000},"amr":{"enabled":true,"amount":50000}}'::jsonb,
    'active',
    now()
  );

  -- Client 234: Christelle Deanne Abada Adlaon
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Christelle Deanne Abada',
    'Adlaon',
    '09361288204',
    'VA',
    'has 2 kids 1 girl si Cassie and 1 boy si baby Luke',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '25977281',
    'Pru Life UK',
    2500,
    'monthly',
    now(),
    2000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":400000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":100000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":300000},"pa_atpd":{"enabled":true,"amount":300000},"ma":{"enabled":true,"amount":150000},"amr":{"enabled":true,"amount":30000}}'::jsonb,
    'active',
    now()
  );

  -- Client 235: Clark Joseph Dela Torre Adlaon
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Clark Joseph Dela Torre',
    'Adlaon',
    '09057787208',
    'VA',
    'has 2 kids 1 girl si Cassie and 1 boy si baby Luke',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '25977235',
    'Pru Life UK',
    2500,
    'monthly',
    now(),
    2000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":400000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":100000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":400000},"pa_atpd":{"enabled":true,"amount":400000},"ma":{"enabled":true,"amount":200000},"amr":{"enabled":true,"amount":40000}}'::jsonb,
    'active',
    now()
  );

  -- Client 236: Hanna Jane Salvana
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Hanna Jane',
    'Salvana',
    NULL,
    'VA',
    '1 BOY anak Bjorn, hilig hiking si Ms Han',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '26366421',
    'Pru Life UK',
    3000,
    'monthly',
    now(),
    2500000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":500000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":200000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":500000},"pa_atpd":{"enabled":true,"amount":500000},"ma":{"enabled":true,"amount":250000},"amr":{"enabled":true,"amount":50000}}'::jsonb,
    'active',
    now()
  );

  -- Client 237: PO: Hanna Jane Salvana PLI: BJORN RYLEIGH LINDONGAN
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'PO: Hanna Jane Salvana PLI: BJORN RYLEIGH',
    'LINDONGAN',
    NULL,
    'VA',
    'baby boy anak Ms Han',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PHP',
    '26366501',
    'Pru Life UK',
    2101.75,
    'monthly',
    now(),
    700000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":700},"dhi":{"enabled":true,"daily_rate":875},"ser":{"enabled":true,"amount":5552},"icu":{"enabled":true,"amount":87587552}}'::jsonb,
    'active',
    now()
  );

  -- Client 238: Jovelyn Dalman
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Jovelyn',
    'Dalman',
    NULL,
    NULL,
    'Asawa Kol Lyndon Dalman',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PEP 10',
    '11175396',
    'Pru Life UK',
    7118.42,
    'monthly',
    now(),
    1000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":300000},"tpd":{"enabled":true,"amount":200000},"core_add":{"enabled":true,"amount":165000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1500},"ser":{"enabled":true,"amount":22500},"pa_add":{"enabled":true,"amount":200000},"pa_atpd":{"enabled":true,"amount":200000},"ma":{"enabled":true,"amount":100000},"amr":{"enabled":true,"amount":20000},"fs":{"enabled":true,"amount":407100.42}}'::jsonb,
    'active',
    now()
  );

  -- Client 239: PO: Ana Kathrina M. Arevalo PLI: Andres Kenzo M. Arevalo
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'PO: Ana Kathrina M. Arevalo PLI: Andres Kenzo M.',
    'Arevalo',
    NULL,
    'MBM Accounting Firm',
    'Baby',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PHP',
    '26535268',
    'Pru Life UK',
    2500,
    'monthly',
    now(),
    1065680,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":1065680},"dhi":{"enabled":true,"daily_rate":1333},"ser":{"enabled":true,"amount":5552},"icu":{"enabled":true,"amount":133366752}}'::jsonb,
    'active',
    now()
  );

  -- Client 240: PO: Armando Yecyec PLI: Lorenze Yecyec
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'PO: Armando Yecyec PLI: Lorenze',
    'Yecyec',
    NULL,
    'OFW',
    'With guaranteed payout 6th yr onwards, Non guaranteed dividends, guaranteed cash values',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'Pru Lifetime Income',
    '26751204',
    'Pru Life UK',
    4909.6,
    'monthly',
    now(),
    510000,
    NULL,
    NULL,
    '{}'::jsonb,
    'active',
    now()
  );

  -- Client 241: Renee Jane G. Barrio
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Renee Jane G.',
    'Barrio',
    NULL,
    'OFW Teacher',
    'Will move teaching to Vietnam for higher salary has a sister working as va',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '26867882',
    'Pru Life UK',
    3500,
    'monthly',
    now(),
    3000000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":1000000},"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":200000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000}}'::jsonb,
    'active',
    now()
  );

  -- Client 242: Stephanie A. Langam
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Stephanie A.',
    'Langam',
    NULL,
    'CPA',
    'Loves running, fiance of Cocong, loves kpop and cats',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'Prulove for Life',
    '26882287',
    'Pru Life UK',
    2830.26,
    'monthly',
    now(),
    1050000,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":300000},"tpd":{"enabled":true,"amount":500000},"core_add":{"enabled":true,"amount":100000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":1000},"ser":{"enabled":true,"amount":15000},"pa_add":{"enabled":true,"amount":500000},"pa_atpd":{"enabled":true,"amount":500000},"ma":{"enabled":true,"amount":250000},"amr":{"enabled":true,"amount":50000}}'::jsonb,
    'active',
    now()
  );

  -- Client 243: Alleah June C. Abao
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'Alleah June C.',
    'Abao',
    NULL,
    'OFW Teacher',
    'Has Italian boyfriend for 3 yrs ldr wla pa nag meet personally. brother died leukemia jan 15 at 26 yrs old. Plans to transfer teaching to uzbekhistan or china.',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PHP',
    '26945404',
    'Pru Life UK',
    1480.59,
    'monthly',
    now(),
    50000025052,
    NULL,
    NULL,
    '{"ccb":{"enabled":true,"amount":250000},"wptpd":{"enabled":true},"dhi":{"enabled":true,"daily_rate":625},"ser":{"enabled":true,"amount":5552},"icu":{"enabled":true,"amount":62531352}}'::jsonb,
    'active',
    now()
  );

  -- Client 244: June Roy C. Torremocha
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    'June Roy C.',
    'Torremocha',
    NULL,
    'OFW manpower services',
    'Worker in Abu Dhabi',
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    'PAA Plus',
    '27033948',
    'Pru Life UK',
    5000,
    'monthly',
    now(),
    4000000,
    NULL,
    NULL,
    '{"tpd":{"enabled":true,"amount":1000000},"core_add":{"enabled":true,"amount":200000},"wptpd":{"enabled":true}}'::jsonb,
    'active',
    now()
  );

END $$;
