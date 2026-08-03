import { CampaignCard } from "./campaign-card";
import type { FundCampaign } from "../types";

interface CampaignGridProps {
  campaigns: FundCampaign[];
  emptyMessage?: string;
}

export function CampaignGrid({ campaigns, emptyMessage = "No campaigns found." }: CampaignGridProps) {
  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  );
}
