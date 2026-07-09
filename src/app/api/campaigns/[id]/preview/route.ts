import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/utils/supabase/server";
import { render } from "@react-email/components";
import { CampaignWrapperEmail } from "@/features/email/templates/campaign-wrapper";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: campaign } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", id)
      .single();

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Render with sample merge data
    const html = await render(
      CampaignWrapperEmail({
        bodyHtml: campaign.body_html || "<p>No content yet</p>",
        previewText: campaign.preview_text || "",
        firstName: "John",
        lastName: "Doe",
        unsubscribeUrl: "#",
      })
    );

    return NextResponse.json({ html });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
