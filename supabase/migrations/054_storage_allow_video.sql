-- Update event-assets bucket to allow video uploads (up to 50MB)
UPDATE storage.buckets
SET
  file_size_limit = 52428800, -- 50MB
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']
WHERE id = 'event-assets';
