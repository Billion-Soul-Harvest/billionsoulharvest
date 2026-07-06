-- Audiences: lists & segments for contact management
CREATE TYPE audience_type AS ENUM ('list', 'segment');

CREATE TABLE audiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  type audience_type NOT NULL DEFAULT 'list',
  segment_filter jsonb,
  is_favorite boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_audiences_updated_at
  BEFORE UPDATE ON audiences FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE audiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access on audiences" ON audiences FOR ALL
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Public read audiences" ON audiences FOR SELECT USING (true);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON audiences TO authenticated;
GRANT SELECT ON audiences TO anon;
GRANT ALL ON audiences TO service_role;

-- Seed from existing email_lists values
INSERT INTO audiences (name, type)
SELECT DISTINCT unnest(email_lists), 'list'::audience_type
FROM contacts WHERE email_lists IS NOT NULL
ON CONFLICT (name) DO NOTHING;

-- RPC: count contacts per list name (single efficient query)
CREATE OR REPLACE FUNCTION audience_list_counts()
RETURNS TABLE(list_name text, contact_count bigint) AS $$
  SELECT unnest(email_lists), count(*)
  FROM contacts WHERE email_lists IS NOT NULL
  GROUP BY 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- RPC: count contacts with email per list name
CREATE OR REPLACE FUNCTION audience_list_email_counts()
RETURNS TABLE(list_name text, email_count bigint) AS $$
  SELECT unnest(email_lists), count(*)
  FROM contacts
  WHERE email_lists IS NOT NULL AND email IS NOT NULL
  GROUP BY 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- RPC: remove a list from all contacts
CREATE OR REPLACE FUNCTION remove_audience_list(p_name text)
RETURNS void AS $$
  UPDATE contacts SET email_lists = array_remove(email_lists, p_name)
  WHERE email_lists @> ARRAY[p_name];
$$ LANGUAGE sql SECURITY DEFINER;

-- RPC: rename a list across all contacts
CREATE OR REPLACE FUNCTION rename_audience_list(p_old text, p_new text)
RETURNS void AS $$
  UPDATE contacts SET email_lists = array_replace(email_lists, p_old, p_new)
  WHERE email_lists @> ARRAY[p_old];
$$ LANGUAGE sql SECURITY DEFINER;

-- Grant RPC access
GRANT EXECUTE ON FUNCTION audience_list_counts TO authenticated;
GRANT EXECUTE ON FUNCTION audience_list_email_counts TO authenticated;
GRANT EXECUTE ON FUNCTION remove_audience_list TO authenticated;
GRANT EXECUTE ON FUNCTION rename_audience_list TO authenticated;
