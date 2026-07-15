ALTER TABLE stories ADD COLUMN content_html text;
ALTER TABLE stories ADD COLUMN gallery_images jsonb DEFAULT '[]'::jsonb;
