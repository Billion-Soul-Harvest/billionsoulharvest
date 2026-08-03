"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { CampaignGrid } from "@/features/fund/components/campaign-grid";
import { CategoryFilter } from "@/features/fund/components/category-filter";
import type { FundCampaign } from "@/features/fund/types";

function SearchContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [sort, setSort] = useState("recent");
  const [campaigns, setCampaigns] = useState<FundCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    params.set("sort", sort);

    fetch(`/api/fund/campaigns?${params}`)
      .then((res) => res.json())
      .then((data) => setCampaigns(data.campaigns || []))
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false));
  }, [query, sort]);

  return (
    <>
      {/* Filters */}
      <div className="space-y-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="search"
              placeholder="Search campaigns..."
              value={query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
              className="h-11"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-11 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="recent">Most Recent</option>
            <option value="most_funded">Most Funded</option>
            <option value="most_donors">Most Donors</option>
            <option value="ending_soon">Ending Soon</option>
          </select>
        </div>
        <CategoryFilter />
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading campaigns...</div>
      ) : (
        <CampaignGrid campaigns={campaigns} emptyMessage="No campaigns match your search." />
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Browse Campaigns</h1>
      <Suspense fallback={<div className="text-center py-12 text-gray-500">Loading...</div>}>
        <SearchContent />
      </Suspense>
    </div>
  );
}
