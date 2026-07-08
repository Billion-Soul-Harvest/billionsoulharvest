import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/shared/utils/supabase/server";
import { getServiceSupabase, prepareCampaignSends, processNextBatch, finalizeCampaign } from "@/features/email/send-campaign";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const authSupabase = await createServerClient();
    const { data: { user } } = await authSupabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getServiceSupabase();
    const body = await request.json();

    const {
      template_id,
      subject,
      body_html,
      preview_text,
      contact_ids,
      select_all_filter,
      save_as_template,
    } = body;

    // Resolve content: from template or inline
    let emailSubject = subject;
    let emailBodyHtml = body_html;
    let emailPreviewText = preview_text ?? "";
    let resolvedTemplateId = template_id ?? null;

    if (template_id) {
      const { data: template } = await supabase
        .from("campaign_templates")
        .select("*")
        .eq("id", template_id)
        .single();

      if (!template) {
        return NextResponse.json({ error: "Template not found" }, { status: 404 });
      }

      emailSubject = emailSubject || template.subject;
      emailBodyHtml = emailBodyHtml || template.body_html;
      emailPreviewText = emailPreviewText || template.preview_text || "";
    }

    if (!emailSubject || !emailBodyHtml) {
      return NextResponse.json(
        { error: "Subject and body are required" },
        { status: 400 }
      );
    }

    // Optionally save as a new template
    if (save_as_template && !template_id) {
      const { data: newTemplate } = await supabase
        .from("campaign_templates")
        .insert({
          name: emailSubject,
          subject: emailSubject,
          body_html: emailBodyHtml,
          preview_text: emailPreviewText || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (newTemplate) {
        resolvedTemplateId = newTemplate.id;
      }
    }

    // Build segment filter
    const segmentFilter = contact_ids
      ? { contact_ids }
      : select_all_filter ?? {};

    // Create campaign row
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .insert({
        name: emailSubject,
        subject: emailSubject,
        body_html: emailBodyHtml,
        preview_text: emailPreviewText || null,
        status: "sending",
        segment_filter: segmentFilter,
        template_id: resolvedTemplateId,
        started_at: new Date().toISOString(),
        created_by: user.id,
      })
      .select()
      .single();

    if (campaignError || !campaign) {
      console.error("Failed to create campaign:", campaignError);
      return NextResponse.json({ error: "Failed to create send" }, { status: 500 });
    }

    // Prepare campaign sends (insert rows)
    await prepareCampaignSends(supabase, campaign, campaign.id);

    // Process all batches inline (Hobby plan can't run cron frequently)
    let remaining = 1;
    while (remaining > 0) {
      const result = await processNextBatch(supabase, campaign.id);
      remaining = result.remaining;
      if (result.processed === 0 && remaining === 0) break;
    }
    await finalizeCampaign(supabase, campaign.id);

    return NextResponse.json(
      { campaign_id: campaign.id, status: "sent" },
      { status: 202 }
    );
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
