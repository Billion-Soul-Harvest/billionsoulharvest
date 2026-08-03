import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { campaign_id, title, body_html } = await request.json();

    if (!campaign_id || !title) {
      return NextResponse.json({ error: "campaign_id and title required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("fund_updates")
      .insert({
        campaign_id,
        author_id: user.id,
        title,
        body_html: body_html || "",
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
