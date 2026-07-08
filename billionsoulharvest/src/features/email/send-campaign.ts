import { createClient } from "@supabase/supabase-js";
import { render } from "@react-email/components";
import { buildSegmentQuery } from "@/shared/utils/segment-query";
import { buildUnsubscribeUrl } from "@/shared/utils/unsubscribe-token";
import { CampaignWrapperEmail } from "@/features/email/templates/campaign-wrapper";
import { sendEmails, getFromAddress } from "@/shared/utils/send-email";

export function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Phase 1: Insert campaign_sends rows for all matching contacts.
 * Fast — DB operations only, no SMTP.
 */
export async function prepareCampaignSends(
  supabase: ReturnType<typeof getServiceSupabase>,
  campaign: Record<string, unknown>,
  campaignId: string
) {
  const filter = (campaign.segment_filter || {}) as Record<string, unknown>;
  const { data: contacts } = await buildSegmentQuery(supabase, filter);

  if (!contacts || contacts.length === 0) {
    await supabase
      .from("campaigns")
      .update({ status: "failed", completed_at: new Date().toISOString() })
      .eq("id", campaignId);
    return;
  }

  const sendRows = contacts.map((c) => ({
    campaign_id: campaignId,
    contact_id: c.id,
    email: c.email!,
    status: "queued" as const,
  }));

  await supabase.from("campaign_sends").insert(sendRows);

  await supabase
    .from("campaigns")
    .update({ total_recipients: contacts.length })
    .eq("id", campaignId);
}

/**
 * Phase 2: Process one batch of queued/failed sends for a campaign.
 * Returns { processed, remaining }.
 */
export async function processNextBatch(
  supabase: ReturnType<typeof getServiceSupabase>,
  campaignId: string,
  batchSize = 50
): Promise<{ processed: number; remaining: number }> {
  // Fetch next batch: queued or failed with retries remaining
  const { data: batchSends } = await supabase
    .from("campaign_sends")
    .select("id, contact_id, email, retry_count")
    .eq("campaign_id", campaignId)
    .or("status.eq.queued,and(status.eq.failed,retry_count.lt.3)")
    .order("created_at", { ascending: true })
    .limit(batchSize);

  if (!batchSends || batchSends.length === 0) {
    return { processed: 0, remaining: 0 };
  }

  // Get campaign details for rendering
  const { data: campaign } = await supabase
    .from("campaigns")
    .select("body_html, subject, preview_text, reply_to")
    .eq("id", campaignId)
    .single();

  if (!campaign) {
    return { processed: 0, remaining: 0 };
  }

  // Get contact details for merge fields
  const contactIds = batchSends.map((s) => s.contact_id);
  const { data: contacts } = await supabase
    .from("contacts")
    .select("id, email, first_name, last_name")
    .in("id", contactIds);

  const contactMap = new Map(
    (contacts || []).map((c) => [c.id, c])
  );

  let sentCount = 0;
  let failedCount = 0;

  try {
    const emailPayloads = await Promise.all(
      batchSends.map(async (send) => {
        const contact = contactMap.get(send.contact_id);
        const firstName = contact?.first_name || "";
        const lastName = contact?.last_name || "";
        const unsubscribeUrl = buildUnsubscribeUrl(send.contact_id);

        const bodyHtml = (campaign.body_html as string)
          .replace(/\{\{first_name\}\}/g, firstName)
          .replace(/\{\{last_name\}\}/g, lastName)
          .replace(/\{\{unsubscribe_url\}\}/g, unsubscribeUrl)
          .replace(/<a\s+[^>]*href="#"[^>]*>(.*?)<\/a>/gi, "$1");

        const isFullDocument = /^\s*<!doctype\s|^\s*<html[\s>]/i.test(bodyHtml);
        const html = isFullDocument
          ? bodyHtml
          : await render(
              CampaignWrapperEmail({
                bodyHtml,
                previewText: (campaign.preview_text as string) || "",
                firstName,
                lastName,
                unsubscribeUrl,
              })
            );

        return {
          sendId: send.id,
          retryCount: send.retry_count,
          payload: {
            from: getFromAddress(),
            to: send.email,
            subject: (campaign.subject as string)
              .replace(/\{\{first_name\}\}/g, firstName)
              .replace(/\{\{last_name\}\}/g, lastName),
            html,
            replyTo: (campaign.reply_to as string) || undefined,
          },
        };
      })
    );

    const results = await sendEmails(emailPayloads.map((e) => e.payload));

    for (let j = 0; j < results.length; j++) {
      const { sendId, retryCount } = emailPayloads[j];
      const result = results[j];

      if (result.success) {
        await supabase
          .from("campaign_sends")
          .update({ resend_id: result.messageId, status: "sent" })
          .eq("id", sendId);
        sentCount++;
      } else {
        await supabase
          .from("campaign_sends")
          .update({
            status: "failed",
            error_message: result.error || "Send failed",
            retry_count: retryCount + 1,
          })
          .eq("id", sendId);
        failedCount++;
      }
    }
  } catch (batchError) {
    console.error("Batch send error:", batchError);
    const errorMsg = batchError instanceof Error ? batchError.message : "Batch send failed";
    for (const send of batchSends) {
      await supabase
        .from("campaign_sends")
        .update({
          status: "failed",
          error_message: errorMsg,
          retry_count: send.retry_count + 1,
        })
        .eq("id", send.id)
        .eq("status", "queued");
    }
    failedCount += batchSends.length;
  }

  // Update campaign sent/failed counts from actual data
  await updateCampaignCounts(supabase, campaignId);

  // Count remaining
  const { count: remaining } = await supabase
    .from("campaign_sends")
    .select("id", { count: "exact", head: true })
    .eq("campaign_id", campaignId)
    .or("status.eq.queued,and(status.eq.failed,retry_count.lt.3)");

  return { processed: sentCount + failedCount, remaining: remaining || 0 };
}

/**
 * Update campaign sent_count and failed_count from campaign_sends.
 */
async function updateCampaignCounts(
  supabase: ReturnType<typeof getServiceSupabase>,
  campaignId: string
) {
  const { data: sends } = await supabase
    .from("campaign_sends")
    .select("status")
    .eq("campaign_id", campaignId);

  if (!sends) return;

  const sentCount = sends.filter((s) => s.status === "sent").length;
  const failedCount = sends.filter((s) => s.status === "failed").length;

  await supabase
    .from("campaigns")
    .update({ sent_count: sentCount, failed_count: failedCount })
    .eq("id", campaignId);
}

/**
 * Finalize a campaign: aggregate counts and set final status.
 */
export async function finalizeCampaign(
  supabase: ReturnType<typeof getServiceSupabase>,
  campaignId: string
) {
  const { data: sends } = await supabase
    .from("campaign_sends")
    .select("status")
    .eq("campaign_id", campaignId);

  const sentCount = (sends || []).filter((s) => s.status === "sent").length;
  const failedCount = (sends || []).filter((s) => s.status === "failed").length;

  await supabase
    .from("campaigns")
    .update({
      status: sentCount === 0 ? "failed" : "sent",
      sent_count: sentCount,
      failed_count: failedCount,
      completed_at: new Date().toISOString(),
    })
    .eq("id", campaignId);
}

/**
 * Legacy wrapper: runs prepare + all batches sequentially.
 * Used for backward compat / local dev / small sends.
 */
export async function processCampaignSend(
  supabase: ReturnType<typeof getServiceSupabase>,
  campaign: Record<string, unknown>,
  campaignId: string
) {
  try {
    await prepareCampaignSends(supabase, campaign, campaignId);

    let remaining = 1;
    while (remaining > 0) {
      const result = await processNextBatch(supabase, campaignId);
      remaining = result.remaining;
    }

    await finalizeCampaign(supabase, campaignId);
  } catch (error) {
    console.error("Campaign send processing error:", error);
    await supabase
      .from("campaigns")
      .update({ status: "failed", completed_at: new Date().toISOString() })
      .eq("id", campaignId);
  }
}
