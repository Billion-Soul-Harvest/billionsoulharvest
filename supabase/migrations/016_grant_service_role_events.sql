-- Grant service_role access to tables used by the registration API (route.ts)
-- The API creates a Supabase client with the service_role key and needs:
--   events: SELECT (look up event by slug)
--   registrations: SELECT (check duplicate), INSERT (create registration)
GRANT SELECT ON events TO service_role;
GRANT SELECT, INSERT ON registrations TO service_role;
