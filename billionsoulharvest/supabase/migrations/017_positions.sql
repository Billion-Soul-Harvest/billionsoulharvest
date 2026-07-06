-- positions table
CREATE TABLE positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER set_positions_updated_at
  BEFORE UPDATE ON positions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS (same pattern as ministry_regions)
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access on positions" ON positions FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Public read positions" ON positions FOR SELECT USING (true);

-- Grant access to roles
GRANT SELECT, INSERT, UPDATE, DELETE ON positions TO authenticated;
GRANT SELECT ON positions TO anon;
GRANT ALL ON positions TO service_role;

-- FK on contacts
ALTER TABLE contacts ADD COLUMN position_id uuid REFERENCES positions(id) ON DELETE SET NULL;
CREATE INDEX idx_contacts_position_id ON contacts(position_id);
