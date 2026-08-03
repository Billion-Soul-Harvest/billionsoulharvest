import { createClient } from "@/shared/utils/supabase/server";
import { formatCents } from "@/features/fund/utils/format-currency";

export default async function FundAdminOverviewPage() {
  const supabase = await createClient();

  const { count: totalCampaigns } = await supabase
    .from("fund_campaigns")
    .select("*", { count: "exact", head: true });

  const { count: activeCampaigns } = await supabase
    .from("fund_campaigns")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  const { count: pendingReview } = await supabase
    .from("fund_campaigns")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending_review");

  const { data: donationStats } = await supabase
    .from("fund_donations")
    .select("amount_cents")
    .eq("status", "succeeded");

  const totalRaised = (donationStats ?? []).reduce((sum, d) => sum + d.amount_cents, 0);
  const totalDonations = donationStats?.length ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Fundraising Overview</h1>
        <p className="text-gray-500 mt-1">Platform-wide fundraising statistics</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Raised" value={formatCents(totalRaised)} />
        <StatCard label="Total Donations" value={totalDonations.toString()} />
        <StatCard label="Active Campaigns" value={(activeCampaigns ?? 0).toString()} />
        <StatCard label="Pending Review" value={(pendingReview ?? 0).toString()} highlight={!!pendingReview} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500 mb-1">Total Campaigns</p>
          <p className="text-2xl font-bold text-gray-900">{totalCampaigns ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500 mb-1">Avg per Campaign</p>
          <p className="text-2xl font-bold text-gray-900">
            {activeCampaigns ? formatCents(Math.round(totalRaised / activeCampaigns)) : "$0"}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-5 ${highlight ? "bg-yellow-50 border-yellow-200" : "bg-white"}`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${highlight ? "text-yellow-700" : "text-gray-900"}`}>{value}</p>
    </div>
  );
}
