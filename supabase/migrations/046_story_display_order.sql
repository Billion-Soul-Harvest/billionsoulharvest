-- Add display_order column for manual story ordering on public site
ALTER TABLE stories ADD COLUMN display_order INT DEFAULT NULL;
