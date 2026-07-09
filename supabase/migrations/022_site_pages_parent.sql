ALTER TABLE site_pages ADD COLUMN parent_id uuid REFERENCES site_pages(id) ON DELETE SET NULL;
CREATE INDEX idx_site_pages_parent ON site_pages(parent_id);
