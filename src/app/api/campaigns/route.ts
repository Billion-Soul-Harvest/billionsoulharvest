import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/utils/supabase/server";
import { buildSegmentQuery } from "@/shared/utils/segment-query";
import type { SegmentFilter } from "@/shared/types/database";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: campaigns, error } = await supabase
      .from("campaigns")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(campaigns);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, subject, body_html, preview_text, segment_filter } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Compute total_recipients from segment_filter
    let totalRecipients = 0;
    const filter = (segment_filter || {}) as SegmentFilter;
    if (Object.keys(filter).length > 0) {
      const countQuery = buildSegmentQuery(supabase, filter, { countOnly: true });
      const { count } = await countQuery;
      totalRecipients = count ?? 0;
    }

    const { data: campaign, error } = await supabase
      .from("campaigns")
      .insert({
        name,
        subject: subject || null,
        body_html: body_html || null,
        preview_text: preview_text || null,
        segment_filter: filter,
        total_recipients: totalRecipients,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(campaign, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
