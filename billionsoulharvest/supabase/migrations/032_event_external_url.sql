-- Add external_url column for events hosted on external sites (e.g. sites.google.com)
ALTER TABLE events ADD COLUMN IF NOT EXISTS external_url text;
