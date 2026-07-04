import type { SupabaseClient } from "@supabase/supabase-js";
import type { SegmentFilter } from "@/shared/types/database";

/**
 * Builds a Supabase query from a campaign segment_filter JSONB.
 * Always excludes contacts without email and unsubscribed contacts.
 */
export function buildSegmentQuery(
  supabase: SupabaseClient,
  filter: SegmentFilter,
  { countOnly = false }: { countOnly?: boolean } = {}
) {
  let query = supabase
    .from("contacts")
    .select("*", countOnly ? { count: "exact", head: true } : { count: "exact" });

  // Always exclude contacts without email or who have unsubscribed
  query = query
    .not("email", "is", null)
    .eq("email_unsubscribed", false);

  // Filter by contact_type (in)
  if (filter.contact_type && filter.contact_type.length > 0) {
    query = query.in("contact_type", filter.contact_type);
  }

  // Filter by region_id (eq)
  if (filter.region_id) {
    query = query.eq("region_id", filter.region_id);
  }

  // Filter by language (eq)
  if (filter.language) {
    query = query.eq("language", filter.language);
  }

  // Filter by country (eq)
  if (filter.country) {
    query = query.eq("country", filter.country);
  }

  // Filter by tags_include (overlaps — contact has at least one of these tags)
  if (filter.tags_include && filter.tags_include.length > 0) {
    query = query.overlaps("tags", filter.tags_include);
  }

  // Filter by email_lists (overlaps)
  if (filter.email_lists && filter.email_lists.length > 0) {
    query = query.overlaps("email_lists", filter.email_lists);
  }

  // Filter by specific contact_ids (for bulk action sends)
  if (filter.contact_ids && filter.contact_ids.length > 0) {
    query = query.in("id", filter.contact_ids);
  }

  return query;
}
