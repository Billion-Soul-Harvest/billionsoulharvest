CREATE OR REPLACE FUNCTION public.get_database_usage()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_size', pg_database_size(current_database()),
    'total_size_pretty', pg_size_pretty(pg_database_size(current_database())),
    'tables', (
      SELECT jsonb_agg(row_data ORDER BY total_sz DESC)
      FROM (
        SELECT
          jsonb_build_object(
            'name', t.schemaname || '.' || t.tablename,
            'total_size', pg_total_relation_size(t.schemaname || '.' || t.tablename),
            'total_size_pretty', pg_size_pretty(pg_total_relation_size(t.schemaname || '.' || t.tablename)),
            'table_size', pg_relation_size(t.schemaname || '.' || t.tablename),
            'table_size_pretty', pg_size_pretty(pg_relation_size(t.schemaname || '.' || t.tablename)),
            'row_estimate', c.reltuples::bigint
          ) AS row_data,
          pg_total_relation_size(t.schemaname || '.' || t.tablename) AS total_sz
        FROM pg_tables t
        JOIN pg_class c ON c.relname = t.tablename
          AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = t.schemaname)
        WHERE t.schemaname = 'public'
      ) sub
    )
  ) INTO result;
  RETURN result;
END;
$$;
