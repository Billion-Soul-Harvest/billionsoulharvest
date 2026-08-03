"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WysiwygEditor } from "@/shared/components/wysiwyg-editor";
import type { FundUpdate } from "@/features/fund/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default function CampaignUpdatesManagePage({ params }: Props) {
  const { id } = use(params);
  const [updates, setUpdates] = useState<FundUpdate[]>([]);
  const [title, setTitle] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    // We don't have a direct by-campaign updates endpoint with auth, so use comments endpoint pattern
    // For now we fetch from the campaigns detail
    fetch(`/api/fund/campaigns/${id}`)
      .then((res) => res.json())
      .then((campaign) => {
        if (campaign.id) {
          // Fetch updates separately
          // Using supabase client-side would be ideal, but let's keep API pattern
        }
      })
      .catch(() => {});
  }, [id]);

  async function handlePost() {
    if (!title.trim()) return;
    setPosting(true);

    try {
      const res = await fetch("/api/fund/updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaign_id: id, title, body_html: bodyHtml }),
      });

      if (res.ok) {
        const update = await res.json();
        setUpdates([update, ...updates]);
        setTitle("");
        setBodyHtml("");
      }
    } catch {
      // Silent fail
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Campaign Updates</h1>

      {/* New update form */}
      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Post an Update</h2>
        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            placeholder="Update title"
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label>Content</Label>
          <WysiwygEditor value={bodyHtml} onChange={setBodyHtml} />
        </div>
        <Button
          onClick={handlePost}
          disabled={!title.trim() || posting}
          className="bg-cyan-600 hover:bg-cyan-700 text-white"
        >
          {posting ? "Posting..." : "Post Update"}
        </Button>
      </div>

      {/* Existing updates */}
      <div className="space-y-4">
        {updates.map((update) => (
          <div key={update.id} className="bg-white rounded-xl border p-4">
            <h3 className="font-medium text-gray-900">{update.title}</h3>
            <p className="text-xs text-gray-400 mt-1">{new Date(update.created_at).toLocaleDateString()}</p>
            <div className="prose prose-sm mt-2" dangerouslySetInnerHTML={{ __html: update.body_html }} />
          </div>
        ))}
      </div>
    </div>
  );
}
