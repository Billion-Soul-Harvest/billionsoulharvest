-- Phase 3: Sales Tracker Data Gap - Add missing fields
-- Adds occupation to leads, fund_value/fund_value_date/riders to policies

-- Add occupation field to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS occupation TEXT;

-- Add fund value tracking to policies table
ALTER TABLE policies ADD COLUMN IF NOT EXISTS fund_value NUMERIC(15,2) DEFAULT 0;
ALTER TABLE policies ADD COLUMN IF NOT EXISTS fund_value_date DATE;

-- Add riders JSONB field to policies table
-- Structure: { "ccb": { "enabled": true, "amount": 280000 }, "tpd": { "enabled": true, "amount": 200000 }, ... }
ALTER TABLE policies ADD COLUMN IF NOT EXISTS riders JSONB DEFAULT '{}';

-- Create index for fund_value queries
CREATE INDEX IF NOT EXISTS idx_policies_fund_value ON policies(fund_value) WHERE fund_value > 0;

-- Update existing policies with sample rider data
UPDATE policies
SET riders = '{"ccb": {"enabled": true, "amount": 100000}, "tpd": {"enabled": true, "amount": 50000}}'
WHERE policy_type = 'life_insurance' AND riders = '{}';

-- Update some leads with sample occupations
UPDATE leads SET occupation = 'Engineer' WHERE first_name = 'Margaret';
UPDATE leads SET occupation = 'Government Employee' WHERE first_name = 'James';
UPDATE leads SET occupation = 'Healthcare Professional' WHERE first_name = 'Linda';
UPDATE leads SET occupation = 'Business Owner' WHERE first_name = 'Robert';
