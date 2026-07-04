import { createClient } from "@/shared/utils/supabase/server";
import { redirect } from "next/navigation";
import { CampaignEditor } from "@/features/campaigns/campaign-editor";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Campaign — BSH Admin",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CampaignEditorPage({ params }: Props) {
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

  // If campaign is not draft, redirect to report
  if (campaign.status !== "draft") {
    redirect(`/admin/campaigns/${id}/report`);
  }

  // Fetch data needed for segment builder
  const { data: regions } = await supabase
    .from("ministry_regions")
    .select("id, name")
    .order("name");

  const { data: languageRows } = await supabase
    .from("contacts")
    .select("language")
    .not("language", "is", null)
    .not("language", "eq", "")
    .order("language");

  const languages = [...new Set((languageRows ?? []).map((r) => r.language as string))];

  const { data: countryRows } = await supabase
    .from("contacts")
    .select("country")
    .not("country", "is", null)
    .not("country", "eq", "")
    .order("country");

  const countries = [...new Set((countryRows ?? []).map((r) => r.country as string))];

  // Fetch templates
  const { data: templates } = await supabase
    .from("campaign_templates")
    .select("id, name, subject, body_html, preview_text")
    .order("name");

  return (
    <CampaignEditor
      campaign={campaign}
      regions={regions ?? []}
      languages={languages}
      countries={countries}
      templates={templates ?? []}
    />
  );
}
