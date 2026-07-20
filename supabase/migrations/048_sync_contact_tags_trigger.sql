-- Trigger: auto-sync contacts.tags array into the tags table
CREATE OR REPLACE FUNCTION sync_contact_tags_to_table()
RETURNS trigger AS $$
BEGIN
  IF NEW.tags IS NOT NULL AND array_length(NEW.tags, 1) > 0 THEN
    INSERT INTO tags (name)
    SELECT unnest(NEW.tags)
    ON CONFLICT (name) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_sync_contact_tags
  AFTER INSERT OR UPDATE OF tags ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION sync_contact_tags_to_table();

-- Backfill: ensure all existing contact tags are in the tags table
INSERT INTO tags (name)
SELECT DISTINCT unnest(tags)
FROM contacts
WHERE tags IS NOT NULL AND array_length(tags, 1) > 0
ON CONFLICT (name) DO NOTHING;
