import type { Metadata } from "next";
import { CampaignWizard } from "@/features/fund/components/campaign-form/campaign-wizard";

export const metadata: Metadata = {
  title: "Start a Campaign",
};

export default function NewCampaignPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <CampaignWizard />
    </div>
  );
}
