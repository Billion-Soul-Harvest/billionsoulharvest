import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/utils/supabase/server";
import { buildSegmentQuery } from "@/shared/utils/segment-query";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: campaign } = await supabase
      .from("campaigns")
      .select("segment_filter")
      .eq("id", id)
      .single();

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const filter = campaign.segment_filter || {};

    // Get count
    const countQuery = buildSegmentQuery(supabase, filter, { countOnly: true });
    const { count } = await countQuery;

    // Get first 50 for preview
    const previewQuery = buildSegmentQuery(supabase, filter);
    const { data: contacts } = await previewQuery
      .order("first_name")
      .limit(50);

    return NextResponse.json({
      count: count ?? 0,
      contacts: contacts ?? [],
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
