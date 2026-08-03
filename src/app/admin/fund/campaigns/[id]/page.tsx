"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/features/fund/components/progress-bar";
import { formatCents } from "@/features/fund/utils/format-currency";
import { CAMPAIGN_STATUS_LABELS, CAMPAIGN_CATEGORY_LABELS } from "@/features/fund/constants";
import type { FundCampaign, FundCampaignStatus } from "@/features/fund/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default function AdminCampaignDetailPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const [campaign, setCampaign] = useState<FundCampaign | null>(null);

  useEffect(() => {
    fetch(`/api/fund/campaigns/${id}`)
      .then((res) => res.json())
      .then(setCampaign)
      .catch(() => {});
  }, [id]);

  async function updateStatus(status: FundCampaignStatus) {
    await fetch(`/api/fund/campaigns/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setCampaign((c) => c ? { ...c, status } : c);
  }

  async function toggleFeatured() {
    if (!campaign) return;
    await fetch(`/api/fund/campaigns/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_featured: !campaign.is_featured }),
    });
    setCampaign({ ...campaign, is_featured: !campaign.is_featured });
  }

  if (!campaign) return <div className="text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <button onClick={() => router.back()} className="text-sm text-cyan-600 hover:text-cyan-700 flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{campaign.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              campaign.status === "active" ? "bg-green-100 text-green-700" :
              campaign.status === "pending_review" ? "bg-yellow-100 text-yellow-700" :
              "bg-gray-100 text-gray-600"
            }`}>
              {CAMPAIGN_STATUS_LABELS[campaign.status]}
            </span>
            <span className="text-sm text-gray-500">{CAMPAIGN_CATEGORY_LABELS[campaign.category]}</span>
            {campaign.is_featured && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Featured</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={toggleFeatured}>
            {campaign.is_featured ? "Unfeature" : "Feature"}
          </Button>
          {campaign.status === "pending_review" && (
            <>
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => updateStatus("active")}>Approve</Button>
              <Button size="sm" variant="outline" className="text-red-600" onClick={() => updateStatus("rejected")}>Reject</Button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Raised</p>
          <p className="text-2xl font-bold text-gray-900">{formatCents(campaign.raised_cents)}</p>
          <p className="text-xs text-gray-400 mt-1">of {formatCents(campaign.goal_cents)} goal</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Donors</p>
          <p className="text-2xl font-bold text-gray-900">{campaign.donor_count}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Created</p>
          <p className="text-2xl font-bold text-gray-900">{new Date(campaign.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      <ProgressBar raisedCents={campaign.raised_cents} goalCents={campaign.goal_cents} size="lg" showLabel />

      {/* Story preview */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-3">Campaign Story</h2>
        <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: campaign.story_html }} />
      </div>
    </div>
  );
}
