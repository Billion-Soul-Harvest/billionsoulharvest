import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/shared/utils/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .single();

  if (!campaign) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: sends } = await supabase
    .from("campaign_sends")
    .select("*")
    .eq("campaign_id", id)
    .order("created_at", { ascending: true });

  return NextResponse.json({ campaign, sends: sends ?? [] });
}
