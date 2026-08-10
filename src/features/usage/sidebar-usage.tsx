"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getUsageData } from "./actions";
import type { UsageData } from "./types";

function barColor(pct: number) {
  if (pct >= 80) return "bg-red-400";
  if (pct >= 50) return "bg-yellow-400";
  return "bg-emerald-400";
}

export function SidebarUsage() {
  const [data, setData] = useState<UsageData | null>(null);

  useEffect(() => {
    getUsageData().then(setData).catch(() => {});
  }, []);

  if (!data) return null;

  return (
    <Link
      href="/admin/settings/usage"
      className="block px-4 py-2 group"
      title="View detailed usage"
    >
      <p className="text-[10px] font-semibold text-white/60 uppercase tracking-wider mb-1.5">
        Free Tier Usage
      </p>
      {[
        {
          label: "DB",
          pct: data.database.percentage,
          used: data.database.total_size_pretty,
          limit: data.database.limit_pretty,
        },
        {
          label: "Storage",
          pct: data.storage.percentage,
          used: data.storage.total_size_pretty,
          limit: data.storage.limit_pretty,
        },
      ].map((item) => (
        <div key={item.label} className="mb-1 last:mb-0">
          <div className="flex justify-between text-[10px] text-white/70 mb-0.5">
            <span>{item.label}</span>
            <span>
              {item.used} / {item.limit}
            </span>
          </div>
          <div className="h-1.5 bg-white/15 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${barColor(item.pct)}`}
              style={{ width: `${Math.max(item.pct, 1)}%` }}
            />
          </div>
        </div>
      ))}
    </Link>
  );
}
