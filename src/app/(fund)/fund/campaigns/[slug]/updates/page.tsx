import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/shared/utils/supabase/server";
import { UpdateCard } from "@/features/fund/components/update-card";
import type { FundUpdate } from "@/features/fund/types";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CampaignUpdatesPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("fund_campaigns")
    .select("id, title, slug, status")
    .eq("slug", slug)
    .single();

  if (!campaign || campaign.status !== "active") notFound();

  const { data: updates } = await supabase
    .from("fund_updates")
    .select("*")
    .eq("campaign_id", campaign.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href={`/fund/campaigns/${slug}`} className="text-sm text-cyan-600 hover:text-cyan-700 mb-6 inline-flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to campaign
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-6">Updates for {campaign.title}</h1>

      <div className="space-y-6">
        {(updates as FundUpdate[] ?? []).map((update) => (
          <UpdateCard key={update.id} update={update} />
        ))}
        {(!updates || updates.length === 0) && (
          <p className="text-gray-500">No updates yet.</p>
        )}
      </div>
    </div>
  );
}
