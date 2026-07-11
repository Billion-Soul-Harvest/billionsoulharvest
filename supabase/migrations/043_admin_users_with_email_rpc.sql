-- RPC function to get admin users joined with auth.users emails
-- Uses SECURITY DEFINER to access auth.users (which is not accessible via RLS)

CREATE OR REPLACE FUNCTION get_admin_users_with_email()
RETURNS TABLE (
  id uuid,
  role text,
  display_name text,
  email text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    au.id,
    au.role::text,
    au.display_name,
    u.email,
    au.created_at,
    au.updated_at
  FROM admin_users au
  JOIN auth.users u ON u.id = au.id
  WHERE is_admin(auth.uid())
  ORDER BY au.created_at ASC;
$$;

-- Restrict execution to authenticated users only
REVOKE EXECUTE ON FUNCTION get_admin_users_with_email() FROM anon;
REVOKE EXECUTE ON FUNCTION get_admin_users_with_email() FROM public;
GRANT EXECUTE ON FUNCTION get_admin_users_with_email() TO authenticated;
