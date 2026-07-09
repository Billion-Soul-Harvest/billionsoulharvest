-- Add page_content column to event_pages for per-page Craft.js builder data
ALTER TABLE event_pages ADD COLUMN IF NOT EXISTS page_content JSONB DEFAULT NULL;
