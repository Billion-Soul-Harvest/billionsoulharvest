"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WysiwygEditor } from "@/shared/components/wysiwyg-editor";
import { CAMPAIGN_CATEGORIES, CAMPAIGN_CATEGORY_LABELS } from "@/features/fund/constants";
import type { FundCampaign, FundCampaignCategory } from "@/features/fund/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditCampaignPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const [campaign, setCampaign] = useState<FundCampaign | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/fund/campaigns/${id}`)
      .then((res) => res.json())
      .then(setCampaign)
      .catch(() => setError("Failed to load campaign"));
  }, [id]);

  async function handleSave() {
    if (!campaign) return;
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/fund/campaigns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: campaign.title,
          story_html: campaign.story_html,
          category: campaign.category,
          goal_cents: campaign.goal_cents,
          end_date: campaign.end_date,
          banner_url: campaign.banner_url,
          gallery_images: campaign.gallery_images,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");
      router.push("/fund/dashboard/campaigns");
    } catch {
      setError("Failed to save campaign");
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmitForReview() {
    if (!campaign) return;
    setSubmitting(true);
    setError(null);

    try {
      // Save changes first
      const saveRes = await fetch(`/api/fund/campaigns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: campaign.title,
          story_html: campaign.story_html,
          category: campaign.category,
          goal_cents: campaign.goal_cents,
          end_date: campaign.end_date,
          banner_url: campaign.banner_url,
          gallery_images: campaign.gallery_images,
        }),
      });
      if (!saveRes.ok) throw new Error("Failed to save");

      // Then submit for review
      const res = await fetch(`/api/fund/campaigns/${id}/publish`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit");
      }

      router.push("/fund/dashboard/campaigns");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit for review");
    } finally {
      setSubmitting(false);
    }
  }

  if (!campaign) return <div className="text-gray-500">Loading...</div>;

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Edit Campaign</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 sm:px-4 py-3 rounded-xl">{error}</div>
      )}

      <div className="bg-white rounded-xl border p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            value={campaign.title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCampaign({ ...campaign, title: e.target.value })}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <select
            value={campaign.category}
            onChange={(e) => setCampaign({ ...campaign, category: e.target.value as FundCampaignCategory })}
            className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm"
          >
            {CAMPAIGN_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{CAMPAIGN_CATEGORY_LABELS[cat]}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Goal ($)</Label>
            <Input
              type="number"
              value={campaign.goal_cents / 100}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setCampaign({ ...campaign, goal_cents: Math.round(parseFloat(e.target.value || "0") * 100) })
              }
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label>End Date</Label>
            <Input
              type="date"
              value={campaign.end_date?.split("T")[0] || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCampaign({ ...campaign, end_date: e.target.value || null })}
              className="h-11"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Story</Label>
          <WysiwygEditor
            value={campaign.story_html}
            onChange={(html) => setCampaign({ ...campaign, story_html: html })}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        {campaign.status === "draft" && (
          <Button onClick={handleSubmitForReview} disabled={saving || submitting} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white order-first sm:order-last">
            {submitting ? "Submitting..." : "Submit for Review"}
          </Button>
        )}
        <Button onClick={handleSave} disabled={saving || submitting} className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700 text-white sm:order-2">
          {saving ? "Saving..." : "Save as Draft"}
        </Button>
        <Button variant="outline" onClick={() => router.back()} className="w-full sm:w-auto sm:order-1">Cancel</Button>
      </div>
    </div>
  );
}
