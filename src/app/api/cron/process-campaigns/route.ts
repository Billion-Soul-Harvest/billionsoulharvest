import { NextRequest, NextResponse } from "next/server";
import {
  getServiceSupabase,
  prepareCampaignSends,
  processNextBatch,
  finalizeCampaign,
} from "@/features/email/send-campaign";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceSupabase();
  const summary: Record<string, unknown>[] = [];

  // 1. Handle scheduled campaigns that are due
  const { data: scheduledCampaigns } = await supabase
    .from("campaigns")
    .select("*")
    .eq("status", "scheduled")
    .lte("scheduled_at", new Date().toISOString());

  if (scheduledCampaigns) {
    for (const campaign of scheduledCampaigns) {
      await supabase
        .from("campaigns")
        .update({ status: "sending", started_at: new Date().toISOString() })
        .eq("id", campaign.id);

      await prepareCampaignSends(supabase, campaign, campaign.id);
      summary.push({ campaign_id: campaign.id, action: "scheduled_started" });
    }
  }

  // 2. Process active sending campaigns
  const { data: sendingCampaigns } = await supabase
    .from("campaigns")
    .select("id")
    .eq("status", "sending");

  if (sendingCampaigns) {
    for (const campaign of sendingCampaigns) {
      const { processed, remaining } = await processNextBatch(
        supabase,
        campaign.id
      );

      if (remaining === 0 && processed === 0) {
        // No more sends to process — finalize
        await finalizeCampaign(supabase, campaign.id);
        summary.push({
          campaign_id: campaign.id,
          action: "completed",
        });
      } else {
        summary.push({
          campaign_id: campaign.id,
          action: "batch_processed",
          processed,
          remaining,
        });
      }
    }
  }

  return NextResponse.json({ ok: true, summary });
}
