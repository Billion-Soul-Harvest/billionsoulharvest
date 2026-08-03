"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { CAMPAIGN_CATEGORIES, CAMPAIGN_CATEGORY_LABELS } from "../constants";
import type { FundCampaignCategory } from "../types";

interface CategoryFilterProps {
  active?: FundCampaignCategory;
}

export function CategoryFilter({ active }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/fund/search"
        className={cn(
          "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
          !active
            ? "bg-cyan-600 text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        )}
      >
        All
      </Link>
      {CAMPAIGN_CATEGORIES.map((cat) => (
        <Link
          key={cat}
          href={`/fund/category/${cat}`}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
            active === cat
              ? "bg-cyan-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          {CAMPAIGN_CATEGORY_LABELS[cat]}
        </Link>
      ))}
    </div>
  );
}
