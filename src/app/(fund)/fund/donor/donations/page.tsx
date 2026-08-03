import Link from "next/link";
import { createClient } from "@/shared/utils/supabase/server";
import { formatCentsWithDecimals } from "@/features/fund/utils/format-currency";
import type { FundDonation } from "@/features/fund/types";

export default async function MyDonationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: donations } = await supabase
    .from("fund_donations")
    .select("*, campaign:fund_campaigns(id, title, slug)")
    .eq("donor_id", user!.id)
    .order("created_at", { ascending: false });

  const typedDonations = (donations ?? []) as FundDonation[];

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Donations</h1>

      {/* Mobile: card layout */}
      <div className="sm:hidden space-y-3">
        {typedDonations.map((d) => (
          <div key={d.id} className="bg-white rounded-xl border p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-medium text-sm text-gray-900 truncate mr-2">
                {d.campaign ? (
                  <Link href={`/fund/campaigns/${d.campaign.slug}`} className="text-cyan-600 hover:text-cyan-700">
                    {d.campaign.title}
                  </Link>
                ) : "—"}
              </p>
              <p className="font-semibold text-gray-900 shrink-0">{formatCentsWithDecimals(d.amount_cents)}</p>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                d.status === "succeeded" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
              }`}>
                {d.status}
              </span>
              <span className="text-xs text-gray-400">{new Date(d.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
        {typedDonations.length === 0 && (
          <div className="bg-white rounded-xl border p-8 text-center text-gray-400">No donations yet.</div>
        )}
      </div>

      {/* Desktop: table layout */}
      <div className="hidden sm:block bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Campaign</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">Amount</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {typedDonations.map((d) => (
              <tr key={d.id}>
                <td className="px-4 py-3">
                  {d.campaign ? (
                    <Link href={`/fund/campaigns/${d.campaign.slug}`} className="text-cyan-600 hover:text-cyan-700">
                      {d.campaign.title}
                    </Link>
                  ) : "—"}
                </td>
                <td className="px-4 py-3 text-right font-medium">{formatCentsWithDecimals(d.amount_cents)}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(d.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    d.status === "succeeded" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  }`}>
                    {d.status}
                  </span>
                </td>
              </tr>
            ))}
            {typedDonations.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No donations yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
