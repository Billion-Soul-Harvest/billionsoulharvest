-- Fix get_tags_with_counts() to count from contacts.tags (source of truth)
-- instead of the taggables table which was never kept in sync.
CREATE OR REPLACE FUNCTION get_tags_with_counts()
RETURNS TABLE(id uuid, name text, created_at timestamptz, contact_count bigint) AS $$
  SELECT t.id, t.name, t.created_at,
    (SELECT COUNT(*) FROM contacts c WHERE t.name = ANY(c.tags)) AS contact_count
  FROM tags t;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Update the sync trigger to also maintain taggables entries
CREATE OR REPLACE FUNCTION sync_contact_tags_to_table()
RETURNS trigger AS $$
BEGIN
  -- Ensure all tag names exist in the tags table
  IF NEW.tags IS NOT NULL AND array_length(NEW.tags, 1) > 0 THEN
    INSERT INTO tags (name)
    SELECT unnest(NEW.tags)
    ON CONFLICT (name) DO NOTHING;
  END IF;

  -- Remove old taggables entries for this contact
  DELETE FROM taggables
  WHERE taggable_id = NEW.id AND taggable_type = 'contact';

  -- Insert current taggables entries
  IF NEW.tags IS NOT NULL AND array_length(NEW.tags, 1) > 0 THEN
    INSERT INTO taggables (tag_id, taggable_id, taggable_type)
    SELECT t.id, NEW.id, 'contact'
    FROM tags t
    WHERE t.name = ANY(NEW.tags)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill: rebuild taggables from current contacts.tags data
DELETE FROM taggables WHERE taggable_type = 'contact';
INSERT INTO taggables (tag_id, taggable_id, taggable_type)
SELECT t.id, c.id, 'contact'
FROM contacts c, unnest(c.tags) AS tag_name
JOIN tags t ON t.name = tag_name
WHERE c.tags IS NOT NULL AND array_length(c.tags, 1) > 0
ON CONFLICT DO NOTHING;

-- Add GIN index on contacts.tags for performant counting
CREATE INDEX IF NOT EXISTS idx_contacts_tags_gin ON contacts USING GIN(tags);
