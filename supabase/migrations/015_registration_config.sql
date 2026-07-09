-- Add registration_config column to events table
ALTER TABLE events ADD COLUMN registration_config jsonb DEFAULT null;

-- Add custom_fields column to registrations table
ALTER TABLE registrations ADD COLUMN custom_fields jsonb DEFAULT '{}';
