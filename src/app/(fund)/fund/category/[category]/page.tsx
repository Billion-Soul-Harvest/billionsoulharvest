"use client";

import { useState, useEffect, use } from "react";
import { CampaignGrid } from "@/features/fund/components/campaign-grid";
import { CategoryFilter } from "@/features/fund/components/category-filter";
import { CAMPAIGN_CATEGORY_LABELS } from "@/features/fund/constants";
import type { FundCampaign, FundCampaignCategory } from "@/features/fund/types";

interface Props {
  params: Promise<{ category: string }>;
}

export default function CategoryPage({ params }: Props) {
  const { category } = use(params);
  const [campaigns, setCampaigns] = useState<FundCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  const label = CAMPAIGN_CATEGORY_LABELS[category as FundCampaignCategory] || category;

  useEffect(() => {
    setLoading(true);
    fetch(`/api/fund/campaigns?category=${category}`)
      .then((res) => res.json())
      .then((data) => setCampaigns(data.campaigns || []))
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{label}</h1>
      <p className="text-gray-500 mb-6">Campaigns in the {label.toLowerCase()} category</p>

      <div className="mb-8">
        <CategoryFilter active={category as FundCampaignCategory} />
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : (
        <CampaignGrid campaigns={campaigns} emptyMessage={`No ${label.toLowerCase()} campaigns yet.`} />
      )}
    </div>
  );
}
