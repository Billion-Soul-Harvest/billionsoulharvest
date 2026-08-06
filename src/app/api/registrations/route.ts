import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/shared/utils/supabase/server";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Map client sort field names to Supabase column/relation paths
const SORT_FIELD_MAP: Record<string, { column: string; foreignTable?: string }> = {
  name: { column: "first_name", foreignTable: "contacts" },
  email: { column: "email", foreignTable: "contacts" },
  phone: { column: "phone", foreignTable: "contacts" },
  church: { column: "church_name" },
  location: { column: "country" },
  event: { column: "title", foreignTable: "events" },
  status: { column: "status" },
  date: { column: "created_at" },
};

export async function GET(request: NextRequest) {
  try {
    const authSupabase = await createServerClient();
    const { data: { user } } = await authSupabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "25")));
    const search = searchParams.get("search") || "";
    const eventSlug = searchParams.get("event") || "";
    const country = searchParams.get("country") || "";
    const sortField = searchParams.get("sortField") || "date";
    const sortDir = searchParams.get("sortDir") || "desc";

    const supabase = getSupabase();

    // Build query
    let query = supabase
      .from("registrations")
      .select(`
        *,
        contact:contacts!inner(first_name, last_name, email, phone, church_name),
        event:events!inner(title, slug)
      `, { count: "exact" });

    // Search filter (name or email via contact)
    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`,
        { referencedTable: "contacts" }
      );
    }

    // Event filter
    if (eventSlug) {
      query = query.eq("event.slug", eventSlug);
    }

    // Country filter
    if (country) {
      query = query.eq("country", country);
    }

    // Sorting
    const sortMapping = SORT_FIELD_MAP[sortField] || SORT_FIELD_MAP.date;
    const ascending = sortDir === "asc";
    if (sortMapping.foreignTable) {
      query = query.order(sortMapping.column, {
        ascending,
        referencedTable: sortMapping.foreignTable,
      });
    } else {
      query = query.order(sortMapping.column, { ascending });
    }

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("Registrations query error:", error);
      return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 });
    }

    // Fetch unique countries for the filter dropdown (lightweight query)
    const { data: countriesData } = await supabase
      .from("registrations")
      .select("country")
      .not("country", "is", null)
      .order("country");

    const uniqueCountries = Array.from(
      new Set((countriesData ?? []).map((r) => r.country as string))
    ).sort();

    // Compute stat counts for the current filter set (separate count queries)
    // Build base filter for counts (same filters minus pagination)
    let countBase = supabase
      .from("registrations")
      .select("status, contact:contacts!inner(first_name, last_name, email), event:events!inner(slug)", { count: "exact", head: false });

    if (search) {
      countBase = countBase.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`,
        { referencedTable: "contacts" }
      );
    }
    if (eventSlug) {
      countBase = countBase.eq("event.slug", eventSlug);
    }
    if (country) {
      countBase = countBase.eq("country", country);
    }

    const { data: statusRows } = await countBase;
    const stats = { total: 0, confirmed: 0, pending: 0, cancelled: 0, waitlisted: 0 };
    if (statusRows) {
      stats.total = statusRows.length;
      for (const row of statusRows) {
        const s = row.status as keyof typeof stats;
        if (s in stats) stats[s]++;
      }
    }

    return NextResponse.json({
      rows: data ?? [],
      totalCount: count ?? 0,
      stats,
      uniqueCountries,
    });
  } catch (error) {
    console.error("Registrations API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
