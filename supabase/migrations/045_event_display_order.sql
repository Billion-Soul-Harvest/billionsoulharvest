-- Add display_order column for manual event ordering on public site
ALTER TABLE events ADD COLUMN display_order INT DEFAULT NULL;
