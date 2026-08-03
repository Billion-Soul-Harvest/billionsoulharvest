import { createClient } from "@/shared/utils/supabase/server";
import { formatCentsWithDecimals } from "@/features/fund/utils/format-currency";
import { DONATION_STATUS_LABELS } from "@/features/fund/constants";
import type { FundDonation } from "@/features/fund/types";

export default async function DonationsReceivedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get campaigns owned by this user, then donations for those campaigns
  const { data: campaigns } = await supabase
    .from("fund_campaigns")
    .select("id, title")
    .eq("creator_id", user!.id);

  const campaignIds = (campaigns ?? []).map((c) => c.id);

  let donations: FundDonation[] = [];
  if (campaignIds.length > 0) {
    const { data } = await supabase
      .from("fund_donations")
      .select("*, campaign:fund_campaigns(id, title, slug)")
      .in("campaign_id", campaignIds)
      .order("created_at", { ascending: false });
    donations = (data ?? []) as FundDonation[];
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Donations Received</h1>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Donor</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Campaign</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">Amount</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {donations.map((d) => (
              <tr key={d.id}>
                <td className="px-4 py-3">{d.is_anonymous ? "Anonymous" : d.donor_name}</td>
                <td className="px-4 py-3 text-gray-500">{d.campaign?.title || "—"}</td>
                <td className="px-4 py-3 text-right font-medium">{formatCentsWithDecimals(d.amount_cents)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    d.status === "succeeded" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  }`}>
                    {DONATION_STATUS_LABELS[d.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{new Date(d.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {donations.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No donations received yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
