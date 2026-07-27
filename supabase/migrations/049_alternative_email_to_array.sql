-- Convert alternative_email from text to text[] to support multiple emails per contact
ALTER TABLE contacts
  ALTER COLUMN alternative_email TYPE text[]
  USING CASE
    WHEN alternative_email IS NOT NULL THEN ARRAY[alternative_email]
    ELSE NULL
  END;
