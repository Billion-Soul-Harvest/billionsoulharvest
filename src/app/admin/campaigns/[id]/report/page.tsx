import { createClient } from "@/shared/utils/supabase/server";
import { redirect } from "next/navigation";
import { CampaignReport } from "@/features/campaigns/campaign-report";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Campaign Report — BSH Admin",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CampaignReportPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .single();

  if (!campaign) {
    redirect("/admin/campaigns");
  }

  let templateName: string | null = null;
  if (campaign.template_id) {
    const { data: tpl } = await supabase
      .from("campaign_templates")
      .select("name")
      .eq("id", campaign.template_id)
      .single();
    templateName = tpl?.name ?? null;
  }

  const { data: sends } = await supabase
    .from("campaign_sends")
    .select("*")
    .eq("campaign_id", id)
    .order("created_at", { ascending: true });

  return (
    <CampaignReport
      campaign={campaign}
      sends={sends ?? []}
      templateName={templateName}
    />
  );
}
