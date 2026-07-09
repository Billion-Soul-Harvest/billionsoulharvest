import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/shared/utils/supabase/server";
import { getServiceSupabase, prepareCampaignSends } from "@/features/email/send-campaign";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Use auth client to verify admin access
    const authSupabase = await createServerClient();
    const { data: { user } } = await authSupabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use service role for the actual operations
    const supabase = getServiceSupabase();

    const { data: campaign } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", id)
      .single();

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (campaign.status !== "draft") {
      return NextResponse.json(
        { error: "Only draft campaigns can be sent" },
        { status: 400 }
      );
    }

    if (!campaign.subject || !campaign.body_html) {
      return NextResponse.json(
        { error: "Campaign must have a subject and body" },
        { status: 400 }
      );
    }

    // Set status to sending
    await supabase
      .from("campaigns")
      .update({ status: "sending", started_at: new Date().toISOString() })
      .eq("id", id);

    // Prepare campaign sends (insert rows) — cron handles batch processing
    await prepareCampaignSends(supabase, campaign, id);

    return NextResponse.json({ status: "sending" }, { status: 202 });
  } catch (error) {
    console.error("Send API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
