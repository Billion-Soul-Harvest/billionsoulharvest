import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/utils/supabase/server";
import { buildSegmentQuery } from "@/shared/utils/segment-query";
import type { SegmentFilter } from "@/shared/types/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const filter = (body.filter || {}) as SegmentFilter;

    const supabase = await createClient();
    const { count, error } = await buildSegmentQuery(supabase, filter, { countOnly: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ count: count ?? 0 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
