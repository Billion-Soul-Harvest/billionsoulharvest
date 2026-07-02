-- Fix infinite recursion in admin_users RLS policies
-- The old policies queried admin_users from within admin_users policies,
-- causing Postgres to recurse the RLS check infinitely.
-- Fix: use SECURITY DEFINER functions that bypass RLS.

CREATE OR REPLACE FUNCTION is_admin(check_uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM admin_users WHERE id = check_uid);
$$;

CREATE OR REPLACE FUNCTION is_super_admin(check_uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM admin_users WHERE id = check_uid AND role = 'super_admin');
$$;

DROP POLICY IF EXISTS "Admins can view admin_users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can manage admin_users" ON admin_users;

CREATE POLICY "Admins can view admin_users"
  ON admin_users FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Super admins can manage admin_users"
  ON admin_users FOR ALL
  USING (is_super_admin(auth.uid()));
