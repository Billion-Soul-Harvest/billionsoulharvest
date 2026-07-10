import { NextRequest, NextResponse } from "next/server";
import {
  getServiceSupabase,
  prepareCampaignSends,
  processNextBatch,
  finalizeCampaign,
} from "@/features/email/send-campaign";
import { getRemainingQuota } from "@/shared/utils/daily-email-quota";

export const maxDuration = 300;

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceSupabase();
  const summary: Record<string, unknown>[] = [];

  // Check quota upfront
  let quota = await getRemainingQuota(supabase);
  if (quota <= 0) {
    return NextResponse.json({ ok: true, summary: [{ action: "quota_exhausted", remaining_quota: 0 }] });
  }

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

  // 2. Process active sending campaigns (multi-batch, quota-aware)
  const { data: sendingCampaigns } = await supabase
    .from("campaigns")
    .select("id")
    .eq("status", "sending");

  if (sendingCampaigns) {
    for (const campaign of sendingCampaigns) {
      let totalProcessed = 0;
      let lastRemaining = 0;

      // Loop through batches until quota exhausted or no queued sends
      while (true) {
        const result = await processNextBatch(supabase, campaign.id);
        totalProcessed += result.processed;
        lastRemaining = result.remaining;

        if (result.quotaExhausted) {
          summary.push({
            campaign_id: campaign.id,
            action: "quota_paused",
            processed: totalProcessed,
            remaining: lastRemaining,
          });
          quota = 0;
          break;
        }

        if (result.remaining === 0 && result.processed === 0) {
          // No more sends to process — finalize
          await finalizeCampaign(supabase, campaign.id);
          summary.push({
            campaign_id: campaign.id,
            action: "completed",
            processed: totalProcessed,
          });
          break;
        }
      }

      // Stop processing further campaigns if quota is exhausted
      if (quota <= 0) break;
    }
  }

  return NextResponse.json({ ok: true, summary });
}
