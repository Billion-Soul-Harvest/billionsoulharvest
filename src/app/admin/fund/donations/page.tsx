import { createClient } from "@/shared/utils/supabase/server";
import { formatCentsWithDecimals } from "@/features/fund/utils/format-currency";
import { DONATION_STATUS_LABELS } from "@/features/fund/constants";
import type { FundDonation } from "@/features/fund/types";

export default async function AdminDonationsPage() {
  const supabase = await createClient();

  const { data: donations } = await supabase
    .from("fund_donations")
    .select("*, campaign:fund_campaigns(id, title, slug)")
    .order("created_at", { ascending: false })
    .limit(100);

  const typedDonations = (donations ?? []) as FundDonation[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">All Donations</h1>

      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Donor</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Campaign</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">Amount</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">Matched</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {typedDonations.map((d) => (
              <tr key={d.id}>
                <td className="px-4 py-3">{d.is_anonymous ? "Anonymous" : d.donor_name}</td>
                <td className="px-4 py-3 text-gray-500">{d.donor_email || "—"}</td>
                <td className="px-4 py-3 text-gray-500">{d.campaign?.title || "—"}</td>
                <td className="px-4 py-3 text-right font-medium">{formatCentsWithDecimals(d.amount_cents)}</td>
                <td className="px-4 py-3 text-right text-gray-500">
                  {d.matched_amount_cents > 0 ? formatCentsWithDecimals(d.matched_amount_cents) : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    d.status === "succeeded" ? "bg-green-100 text-green-700" :
                    d.status === "refunded" ? "bg-red-100 text-red-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {DONATION_STATUS_LABELS[d.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{new Date(d.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {typedDonations.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No donations yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
