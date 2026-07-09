import { createClient } from "@/shared/utils/supabase/server";
import { CampaignQueue } from "@/features/campaigns/campaign-queue";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Campaigns — BSH Admin",
};

export default async function CampaignsPage() {
  const supabase = await createClient();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  return <CampaignQueue initialCampaigns={campaigns ?? []} />;
}
