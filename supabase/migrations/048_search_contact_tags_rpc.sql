-- RPC: search distinct tags from contacts.tags array
-- Returns up to p_limit distinct tag names matching p_query (case-insensitive)
CREATE OR REPLACE FUNCTION search_contact_tags(p_query text DEFAULT '', p_limit int DEFAULT 50)
RETURNS TABLE(name text) AS $$
  SELECT t.name FROM (
    SELECT DISTINCT unnest(tags) AS name
    FROM contacts
    WHERE tags IS NOT NULL AND array_length(tags, 1) > 0
  ) t
  WHERE p_query = '' OR t.name ILIKE '%' || p_query || '%'
  ORDER BY t.name
  LIMIT p_limit;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION search_contact_tags TO authenticated;
