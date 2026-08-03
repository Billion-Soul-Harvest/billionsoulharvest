import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const campaignId = request.nextUrl.searchParams.get("campaign_id");

    if (!campaignId) {
      return NextResponse.json({ error: "campaign_id required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("fund_comments")
      .select("*")
      .eq("campaign_id", campaignId)
      .eq("is_hidden", false)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { campaign_id, body, author_name, donation_id } = await request.json();

    if (!campaign_id || !body) {
      return NextResponse.json({ error: "campaign_id and body required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("fund_comments")
      .insert({
        campaign_id,
        donor_id: user?.id || null,
        author_name: author_name || user?.email?.split("@")[0] || "Anonymous",
        body,
        donation_id: donation_id || null,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
