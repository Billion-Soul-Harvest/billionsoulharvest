import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = request.nextUrl;
    const campaignId = searchParams.get("campaign_id");

    let query = supabase
      .from("fund_donations")
      .select("*, campaign:fund_campaigns(id, title, slug)")
      .eq("status", "succeeded")
      .order("created_at", { ascending: false });

    if (campaignId) {
      query = query.eq("campaign_id", campaignId);
    } else {
      query = query.eq("donor_id", user.id);
    }

    const { data, error } = await query;

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
