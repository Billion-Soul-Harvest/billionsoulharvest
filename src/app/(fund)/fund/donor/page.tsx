import { createClient } from "@/shared/utils/supabase/server";
import { formatCents } from "@/features/fund/utils/format-currency";
import type { FundDonation } from "@/features/fund/types";

export default async function DonorOverviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: donations } = await supabase
    .from("fund_donations")
    .select("*, campaign:fund_campaigns(id, title, slug)")
    .eq("donor_id", user!.id)
    .eq("status", "succeeded")
    .order("created_at", { ascending: false });

  const typedDonations = (donations ?? []) as FundDonation[];
  const totalGiven = typedDonations.reduce((sum, d) => sum + d.amount_cents, 0);
  const campaignsSupported = new Set(typedDonations.map((d) => d.campaign_id)).size;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Donor Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Total Given</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCents(totalGiven)}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Donations</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{typedDonations.length}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Campaigns Supported</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{campaignsSupported}</p>
        </div>
      </div>

      {/* Recent donations */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Donations</h2>
        <div className="bg-white rounded-xl border divide-y">
          {typedDonations.slice(0, 5).map((d) => (
            <div key={d.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-gray-900">{d.campaign?.title || "Campaign"}</p>
                <p className="text-xs text-gray-500">{new Date(d.created_at).toLocaleDateString()}</p>
              </div>
              <p className="font-semibold text-gray-900">{formatCents(d.amount_cents)}</p>
            </div>
          ))}
          {typedDonations.length === 0 && (
            <div className="p-8 text-center text-gray-400">No donations yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
