-- Add new location detail columns to events
ALTER TABLE events ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS postal_code text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS region text;

-- Drop the region_id foreign key (ministry_regions table stays intact)
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_region_id_fkey;
ALTER TABLE events DROP COLUMN IF EXISTS region_id;
