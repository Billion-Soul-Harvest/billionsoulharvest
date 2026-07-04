-- Fix storage RLS policies that directly query admin_users table.
-- admin_users has RLS enabled, so direct queries from within policies fail.
-- Use the SECURITY DEFINER is_admin() function instead.

DROP POLICY IF EXISTS "event_assets_admin_insert" ON storage.objects;
CREATE POLICY "event_assets_admin_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'event-assets'
    AND is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "event_assets_admin_update" ON storage.objects;
CREATE POLICY "event_assets_admin_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'event-assets'
    AND is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "event_assets_admin_delete" ON storage.objects;
CREATE POLICY "event_assets_admin_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'event-assets'
    AND is_admin(auth.uid())
  );
