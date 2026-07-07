import { createClient } from "@supabase/supabase-js";
import { render } from "@react-email/components";
import { buildSegmentQuery } from "@/shared/utils/segment-query";
import { buildUnsubscribeUrl } from "@/shared/utils/unsubscribe-token";
import { CampaignWrapperEmail } from "@/features/email/templates/campaign-wrapper";
import { getSmtpTransport, getFromAddress } from "@/shared/utils/smtp";

export function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function processCampaignSend(
  supabase: ReturnType<typeof getServiceSupabase>,
  campaign: Record<string, unknown>,
  campaignId: string
) {
  const transport = await getSmtpTransport();

  try {
    // Query contacts matching segment_filter
    const filter = (campaign.segment_filter || {}) as Record<string, unknown>;
    const { data: contacts } = await buildSegmentQuery(supabase, filter);

    if (!contacts || contacts.length === 0) {
      await supabase
        .from("campaigns")
        .update({ status: "failed", completed_at: new Date().toISOString() })
        .eq("id", campaignId);
      return;
    }

    // Insert campaign_sends rows
    const sendRows = contacts.map((c) => ({
      campaign_id: campaignId,
      contact_id: c.id,
      email: c.email!,
      status: "queued" as const,
    }));

    await supabase.from("campaign_sends").insert(sendRows);

    // Update total_recipients
    await supabase
      .from("campaigns")
      .update({ total_recipients: contacts.length })
      .eq("id", campaignId);

    // Chunk into batches of 100
    const BATCH_SIZE = 100;
    let sentCount = 0;
    let failedCount = 0;

    for (let i = 0; i < contacts.length; i += BATCH_SIZE) {
      const batch = contacts.slice(i, i + BATCH_SIZE);

      try {
        const emails = await Promise.all(
          batch.map(async (contact) => {
            const unsubscribeUrl = buildUnsubscribeUrl(contact.id);

            // Replace merge fields
            const bodyHtml = (campaign.body_html as string)
              .replace(/\{\{first_name\}\}/g, contact.first_name || "")
              .replace(/\{\{last_name\}\}/g, contact.last_name || "");

            const html = await render(
              CampaignWrapperEmail({
                bodyHtml,
                previewText: (campaign.preview_text as string) || "",
                firstName: contact.first_name || "",
                lastName: contact.last_name || "",
                unsubscribeUrl,
              })
            );

            return {
              from: getFromAddress(),
              to: contact.email!,
              subject: (campaign.subject as string)
                .replace(/\{\{first_name\}\}/g, contact.first_name || "")
                .replace(/\{\{last_name\}\}/g, contact.last_name || ""),
              html,
              replyTo: (campaign.reply_to as string) || undefined,
              headers: {
                "List-Unsubscribe": `<${unsubscribeUrl}>`,
                "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
              },
            };
          })
        );

        // Send individually
        for (let j = 0; j < emails.length; j++) {
          const contact = batch[j];
          try {
            const info = await transport.sendMail(emails[j]);

            await supabase
              .from("campaign_sends")
              .update({
                resend_id: info.messageId,
                status: "sent",
              })
              .eq("campaign_id", campaignId)
              .eq("contact_id", contact.id);
            sentCount++;
          } catch (sendError) {
            console.error("Individual send error:", sendError);
            await supabase
              .from("campaign_sends")
              .update({
                status: "failed",
                error_message: sendError instanceof Error ? sendError.message : "Send failed",
              })
              .eq("campaign_id", campaignId)
              .eq("contact_id", contact.id);
            failedCount++;
          }
        }
      } catch (batchError) {
        console.error("Batch send error:", batchError);
        // Mark remaining in this batch as failed
        for (const contact of batch) {
          await supabase
            .from("campaign_sends")
            .update({
              status: "failed",
              error_message: batchError instanceof Error ? batchError.message : "Batch send failed",
            })
            .eq("campaign_id", campaignId)
            .eq("contact_id", contact.id)
            .eq("status", "queued");
        }
        failedCount += batch.length;
      }
    }

    // Update campaign completion
    await supabase
      .from("campaigns")
      .update({
        status: sentCount === 0 ? "failed" : "sent",
        sent_count: sentCount,
        failed_count: failedCount,
        completed_at: new Date().toISOString(),
      })
      .eq("id", campaignId);
  } catch (error) {
    console.error("Campaign send processing error:", error);
    await supabase
      .from("campaigns")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", campaignId);
  }
}
