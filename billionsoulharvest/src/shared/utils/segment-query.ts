import type { SupabaseClient } from "@supabase/supabase-js";
import type { SegmentFilter, SegmentCriterion } from "@/shared/types/database";

/**
 * Builds a Supabase query from a segment_filter JSONB.
 * Supports both the legacy flat shape and the new criteria[] shape.
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

  // New criteria-based filtering
  if (filter.criteria && filter.criteria.length > 0) {
    for (const criterion of filter.criteria) {
      query = applyCriterion(query, criterion);
    }
    return query;
  }

  // Legacy flat-field filtering (backward compat for campaigns)
  if (filter.contact_type && filter.contact_type.length > 0) {
    query = query.in("contact_type", filter.contact_type);
  }
  if (filter.region_id) {
    query = query.eq("region_id", filter.region_id);
  }
  if (filter.language) {
    query = query.eq("language", filter.language);
  }
  if (filter.country) {
    query = query.eq("country", filter.country);
  }
  if (filter.tags_include && filter.tags_include.length > 0) {
    query = query.overlaps("tags", filter.tags_include);
  }
  if (filter.email_lists && filter.email_lists.length > 0) {
    query = query.overlaps("email_lists", filter.email_lists);
  }
  if (filter.contact_ids && filter.contact_ids.length > 0) {
    query = query.in("id", filter.contact_ids);
  }

  return query;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyCriterion(query: any, c: SegmentCriterion) {
  const { field, operator, value } = c;

  switch (operator) {
    // Text operators
    case "is":
      return query.eq(field, value);
    case "is_not":
      return query.neq(field, value);
    case "contains":
      return query.ilike(field, `%${value}%`);
    case "starts_with":
      return query.ilike(field, `${value}%`);
    case "is_blank":
      return query.is(field, null);
    case "is_not_blank":
      return query.not(field, "is", null);

    // Array operators (tags, email_lists)
    case "includes_any": {
      const arr = Array.isArray(value) ? value : [value];
      return query.overlaps(field, arr);
    }
    case "includes_all": {
      const arr = Array.isArray(value) ? value : [value];
      return query.contains(field, arr);
    }
    case "not_includes": {
      const arr = Array.isArray(value) ? value : [value];
      return query.not(field, "ov", `{${arr.join(",")}}`);
    }

    // Date operators
    case "is_before":
      return query.lt(field, value);
    case "is_after":
      return query.gt(field, value);
    case "in_last_days": {
      const days = Number(value);
      if (isNaN(days) || days <= 0) return query;
      const since = new Date();
      since.setDate(since.getDate() - days);
      return query.gte(field, since.toISOString());
    }

    default:
      return query;
  }
}
