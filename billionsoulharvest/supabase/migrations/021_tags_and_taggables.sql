-- Tags registry
CREATE TABLE tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_tags_updated_at
  BEFORE UPDATE ON tags FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access on tags" ON tags FOR ALL
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Public read tags" ON tags FOR SELECT USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON tags TO authenticated;
GRANT SELECT ON tags TO anon;
GRANT ALL ON tags TO service_role;

-- Polymorphic join table
CREATE TABLE taggables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  taggable_id uuid NOT NULL,
  taggable_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tag_id, taggable_id, taggable_type)
);

CREATE INDEX idx_taggables_tag_id ON taggables(tag_id);
CREATE INDEX idx_taggables_taggable ON taggables(taggable_id, taggable_type);

ALTER TABLE taggables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access on taggables" ON taggables FOR ALL
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON taggables TO authenticated;
GRANT ALL ON taggables TO service_role;

-- Seed tags from existing contacts.tags
INSERT INTO tags (name)
SELECT DISTINCT unnest(tags)
FROM contacts
WHERE tags IS NOT NULL AND array_length(tags, 1) > 0
ON CONFLICT (name) DO NOTHING;

-- Populate taggables from existing contacts.tags
INSERT INTO taggables (tag_id, taggable_id, taggable_type)
SELECT t.id, c.id, 'contact'
FROM contacts c, unnest(c.tags) AS tag_name
JOIN tags t ON t.name = tag_name
WHERE c.tags IS NOT NULL AND array_length(c.tags, 1) > 0
ON CONFLICT DO NOTHING;

-- RPC: get all tags with contact counts
CREATE OR REPLACE FUNCTION get_tags_with_counts()
RETURNS TABLE(id uuid, name text, created_at timestamptz, contact_count bigint) AS $$
  SELECT t.id, t.name, t.created_at,
    COUNT(tg.id) FILTER (WHERE tg.taggable_type = 'contact') AS contact_count
  FROM tags t
  LEFT JOIN taggables tg ON tg.tag_id = t.id
  GROUP BY t.id, t.name, t.created_at;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- RPC: rename tag (updates tags table + contacts.tags array)
CREATE OR REPLACE FUNCTION rename_tag(p_old text, p_new text)
RETURNS void AS $$
BEGIN
  UPDATE tags SET name = p_new WHERE name = p_old;
  UPDATE contacts SET tags = array_replace(tags, p_old, p_new)
    WHERE tags @> ARRAY[p_old];
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: delete tag (deletes from tags + removes from contacts.tags array)
CREATE OR REPLACE FUNCTION delete_tag(p_name text)
RETURNS void AS $$
BEGIN
  DELETE FROM tags WHERE name = p_name;
  UPDATE contacts SET tags = array_remove(tags, p_name)
    WHERE tags @> ARRAY[p_name];
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: bulk delete tags
CREATE OR REPLACE FUNCTION delete_tags(p_names text[])
RETURNS void AS $$
BEGIN
  DELETE FROM tags WHERE name = ANY(p_names);
  UPDATE contacts SET tags = (
    SELECT COALESCE(array_agg(elem), '{}')
    FROM unnest(tags) AS elem
    WHERE elem != ALL(p_names)
  )
  WHERE tags && p_names;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_tags_with_counts TO authenticated;
GRANT EXECUTE ON FUNCTION rename_tag TO authenticated;
GRANT EXECUTE ON FUNCTION delete_tag TO authenticated;
GRANT EXECUTE ON FUNCTION delete_tags TO authenticated;
