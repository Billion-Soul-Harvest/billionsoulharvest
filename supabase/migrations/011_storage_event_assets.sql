-- Create event-assets storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-assets',
  'event-assets',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Public read access
DO $$ BEGIN
CREATE POLICY "event_assets_public_read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'event-assets');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Admin-only upload
DO $$ BEGIN
CREATE POLICY "event_assets_admin_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'event-assets'
    AND EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Admin-only update
DO $$ BEGIN
CREATE POLICY "event_assets_admin_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'event-assets'
    AND EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Admin-only delete
DO $$ BEGIN
CREATE POLICY "event_assets_admin_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'event-assets'
    AND EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
