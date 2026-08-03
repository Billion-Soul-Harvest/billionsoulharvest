import Link from "next/link";
import { createClient } from "@/shared/utils/supabase/server";
import { formatCents } from "@/features/fund/utils/format-currency";
import { CAMPAIGN_STATUS_LABELS } from "@/features/fund/constants";
import type { FundCampaign } from "@/features/fund/types";

export default async function DashboardOverviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: campaigns } = await supabase
    .from("fund_campaigns")
    .select("*")
    .eq("creator_id", user!.id)
    .order("created_at", { ascending: false });

  const typedCampaigns = (campaigns ?? []) as FundCampaign[];
  const totalRaised = typedCampaigns.reduce((sum, c) => sum + c.raised_cents, 0);
  const totalDonors = typedCampaigns.reduce((sum, c) => sum + c.donor_count, 0);
  const activeCampaigns = typedCampaigns.filter((c) => c.status === "active");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link
          href="/fund/campaigns/new"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
        >
          New Campaign
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Total Raised</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCents(totalRaised)}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Total Donors</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalDonors}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Active Campaigns</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{activeCampaigns.length}</p>
        </div>
      </div>

      {/* Recent campaigns */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Campaigns</h2>
        {typedCampaigns.length === 0 ? (
          <div className="bg-white rounded-xl border p-8 text-center">
            <p className="text-gray-500 mb-4">You haven&apos;t created any campaigns yet.</p>
            <Link href="/fund/campaigns/new" className="text-cyan-600 hover:text-cyan-700 font-medium">
              Create your first campaign &rarr;
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border divide-y">
            {typedCampaigns.slice(0, 5).map((campaign) => (
              <div key={campaign.id} className="flex items-center justify-between p-4">
                <div>
                  <Link href={`/fund/dashboard/campaigns/${campaign.id}/edit`} className="font-medium text-gray-900 hover:text-cyan-700">
                    {campaign.title}
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {CAMPAIGN_STATUS_LABELS[campaign.status]} &middot; {formatCents(campaign.raised_cents)} raised
                  </p>
                </div>
                <Link
                  href={`/fund/dashboard/campaigns/${campaign.id}/edit`}
                  className="text-sm text-cyan-600 hover:text-cyan-700"
                >
                  Edit
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
