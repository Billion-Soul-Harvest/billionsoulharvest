"use client";

import { formatCents } from "../utils/format-currency";
import type { FundDonation } from "../types";

interface DonorListProps {
  donations: FundDonation[];
}

export function DonorList({ donations }: DonorListProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-900">
        Recent Donors ({donations.length})
      </h3>
      <div className="space-y-3">
        {donations.map((d) => (
          <div key={d.id} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-semibold text-xs shrink-0">
              {(d.is_anonymous ? "A" : d.donor_name[0] || "?").toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  {d.is_anonymous ? "Anonymous" : d.donor_name}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCents(d.amount_cents)}
                </span>
              </div>
              {d.message && (
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{d.message}</p>
              )}
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(d.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
        {donations.length === 0 && (
          <p className="text-sm text-gray-400">No donations yet. Be the first!</p>
        )}
      </div>
    </div>
  );
}
