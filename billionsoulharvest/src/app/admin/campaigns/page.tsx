import { createClient } from "@/shared/utils/supabase/server";
import { CampaignListClient } from "@/features/campaigns/campaign-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Campaigns — BSH Admin",
};

interface Props {
  searchParams: Promise<{
    status?: string;
  }>;
}

export default async function CampaignsPage({ searchParams }: Props) {
  const params = await searchParams;
  const statusFilter = params.status ?? "all";

  const supabase = await createClient();

  let query = supabase
    .from("campaigns")
    .select("*");

  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data: campaigns } = await query.order("created_at", { ascending: false });

  return (
    <div>
      <CampaignListClient
        campaigns={campaigns ?? []}
        statusFilter={statusFilter}
      />
    </div>
  );
}
