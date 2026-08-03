import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/utils/supabase/server";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Verify ownership
    const { data: campaign } = await supabase
      .from("fund_campaigns")
      .select("id, creator_id, status")
      .eq("id", id)
      .single();

    if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    if (campaign.creator_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (campaign.status !== "draft") {
      return NextResponse.json({ error: "Only draft campaigns can be submitted" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("fund_campaigns")
      .update({ status: "pending_review" })
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
