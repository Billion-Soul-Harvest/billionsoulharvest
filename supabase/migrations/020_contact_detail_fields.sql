-- Add missing contact detail fields
ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS anniversary date,
  ADD COLUMN IF NOT EXISTS zip_code text,
  ADD COLUMN IF NOT EXISTS address_line_2 text,
  ADD COLUMN IF NOT EXISTS phone_other text;

-- Contact notes table (replaces single-text contacts.notes)
CREATE TABLE contact_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_contact_notes_contact_id ON contact_notes(contact_id);

CREATE TRIGGER set_contact_notes_updated_at
  BEFORE UPDATE ON contact_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE contact_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access on contact_notes" ON contact_notes FOR ALL
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON contact_notes TO authenticated;
GRANT ALL ON contact_notes TO service_role;

-- Migrate existing notes data into contact_notes
INSERT INTO contact_notes (contact_id, content, created_at)
SELECT id, notes, COALESCE(updated_at, created_at, now())
FROM contacts
WHERE notes IS NOT NULL AND notes != '';
