"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { formatCents } from "@/features/fund/utils/format-currency";
import type { FundRecurringSubscription } from "@/features/fund/types";

export default function RecurringDonationsPage() {
  const [subscriptions, setSubscriptions] = useState<FundRecurringSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/fund/recurring")
      .then((res) => res.json())
      .then((data) => setSubscriptions(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleCancel(id: string) {
    if (!confirm("Are you sure you want to cancel this recurring donation?")) return;
    setCancelling(id);

    try {
      await fetch("/api/fund/recurring", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription_id: id }),
      });
      setSubscriptions(subscriptions.map((s) =>
        s.id === id ? { ...s, status: "cancelled" as const } : s
      ));
    } catch {
      // Silent fail
    } finally {
      setCancelling(null);
    }
  }

  if (loading) return <div className="text-gray-500">Loading...</div>;

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Recurring Donations</h1>

      <div className="bg-white rounded-xl border divide-y">
        {subscriptions.map((sub) => (
          <div key={sub.id} className="p-3 sm:p-4">
            <div className="flex items-start sm:items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium text-sm sm:text-base text-gray-900 truncate">{sub.campaign?.title || "Campaign"}</p>
                <p className="text-xs sm:text-sm text-gray-500">
                  {formatCents(sub.amount_cents)}/{sub.interval}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-3 shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  sub.status === "active" ? "bg-green-100 text-green-700" :
                  sub.status === "paused" ? "bg-yellow-100 text-yellow-700" :
                  "bg-gray-100 text-gray-600"
                }`}>
                  {sub.status}
                </span>
                {sub.status === "active" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancel(sub.id)}
                    disabled={cancelling === sub.id}
                  >
                    {cancelling === sub.id ? "Cancelling..." : "Cancel"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
        {subscriptions.length === 0 && (
          <div className="p-8 text-center text-gray-400">No recurring donations.</div>
        )}
      </div>
    </div>
  );
}
