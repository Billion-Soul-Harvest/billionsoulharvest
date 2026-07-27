-- Add custom_fields jsonb column for user-defined fields (e.g. from CSV import)
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS custom_fields jsonb DEFAULT NULL;
