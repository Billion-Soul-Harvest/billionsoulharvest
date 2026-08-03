import Link from "next/link";
import { createClient } from "@/shared/utils/supabase/server";
import { formatCents } from "@/features/fund/utils/format-currency";
import { CAMPAIGN_STATUS_LABELS } from "@/features/fund/constants";
import { getProgressPercentage } from "@/features/fund/utils/campaign-progress";
import type { FundCampaign } from "@/features/fund/types";

export default async function MyCampaignsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: campaigns } = await supabase
    .from("fund_campaigns")
    .select("*")
    .eq("creator_id", user!.id)
    .order("created_at", { ascending: false });

  const typedCampaigns = (campaigns ?? []) as FundCampaign[];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Campaigns</h1>
        <Link
          href="/fund/campaigns/new"
          className="inline-flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg"
        >
          New Campaign
        </Link>
      </div>

      <div className="bg-white rounded-xl border divide-y">
        {typedCampaigns.map((c) => (
          <div key={c.id} className="p-3 sm:p-4">
            <div className="flex items-start sm:items-center justify-between gap-2">
              <Link href={`/fund/dashboard/campaigns/${c.id}/edit`} className="font-medium text-sm sm:text-base text-gray-900 hover:text-cyan-700 line-clamp-2 sm:truncate block">
                {c.title}
              </Link>
              <div className="flex gap-2 shrink-0">
                <Link href={`/fund/dashboard/campaigns/${c.id}/updates`} className="text-xs text-gray-500 hover:text-cyan-600">Updates</Link>
                <Link href={`/fund/dashboard/campaigns/${c.id}/edit`} className="text-xs text-cyan-600 hover:text-cyan-700">Edit</Link>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5 text-xs text-gray-500">
              <span className={`px-2 py-0.5 rounded-full font-medium ${
                c.status === "active" ? "bg-green-100 text-green-700" :
                c.status === "draft" ? "bg-gray-100 text-gray-600" :
                c.status === "pending_review" ? "bg-yellow-100 text-yellow-700" :
                "bg-gray-100 text-gray-600"
              }`}>
                {CAMPAIGN_STATUS_LABELS[c.status]}
              </span>
              <span>{formatCents(c.raised_cents)} / {formatCents(c.goal_cents)}</span>
              <span>{getProgressPercentage(c.raised_cents, c.goal_cents)}%</span>
              <span>{c.donor_count} donors</span>
            </div>
          </div>
        ))}
        {typedCampaigns.length === 0 && (
          <div className="p-8 text-center text-gray-500">No campaigns yet.</div>
        )}
      </div>
    </div>
  );
}
