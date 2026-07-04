import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/shared/utils/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { render } from "@react-email/components";
import { buildSegmentQuery } from "@/shared/utils/segment-query";
import { buildUnsubscribeUrl } from "@/shared/utils/unsubscribe-token";
import { CampaignWrapperEmail } from "@/features/email/templates/campaign-wrapper";
import { after } from "next/server";

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

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

    // Respond immediately with 202, process in background
    after(processSend(supabase, campaign, id));

    return NextResponse.json({ status: "sending" }, { status: 202 });
  } catch (error) {
    console.error("Send API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function processSend(
  supabase: ReturnType<typeof getServiceSupabase>,
  campaign: Record<string, unknown>,
  campaignId: string
) {
  const resend = getResend();

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
            let bodyHtml = (campaign.body_html as string)
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
              from: `${campaign.from_name || "Billion Soul Harvest"} <${campaign.from_email || "noreply@billionsoulharvest.org"}>`,
              to: contact.email!,
              subject: (campaign.subject as string)
                .replace(/\{\{first_name\}\}/g, contact.first_name || "")
                .replace(/\{\{last_name\}\}/g, contact.last_name || ""),
              html,
              reply_to: (campaign.reply_to as string) || undefined,
              headers: {
                "List-Unsubscribe": `<${unsubscribeUrl}>`,
                "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
              },
            };
          })
        );

        const result = await resend.batch.send(emails);

        // Update campaign_sends with resend_ids
        if (result.data?.data) {
          for (let j = 0; j < result.data.data.length; j++) {
            const resendItem = result.data.data[j];
            const contact = batch[j];

            await supabase
              .from("campaign_sends")
              .update({
                resend_id: resendItem.id,
                status: "sent",
              })
              .eq("campaign_id", campaignId)
              .eq("contact_id", contact.id);
          }
          sentCount += result.data.data.length;
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
        status: failedCount === contacts.length ? "failed" : "sent",
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
