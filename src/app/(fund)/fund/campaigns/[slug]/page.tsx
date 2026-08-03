import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/shared/utils/supabase/server";
import { ProgressBar } from "@/features/fund/components/progress-bar";
import { ShareButtons } from "@/features/fund/components/share-buttons";
import { DonorList } from "@/features/fund/components/donor-list";
import { CommentSection } from "@/features/fund/components/comment-section";
import { UpdateCard } from "@/features/fund/components/update-card";
import { formatCents } from "@/features/fund/utils/format-currency";
import { getDaysRemaining } from "@/features/fund/utils/campaign-progress";
import { CAMPAIGN_CATEGORY_LABELS } from "@/features/fund/constants";
import type { FundCampaign, FundDonation, FundUpdate } from "@/features/fund/types";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("fund_campaigns")
    .select("title, story_html")
    .eq("slug", slug)
    .single();

  if (!data) return { title: "Campaign Not Found" };

  return {
    title: data.title,
    description: data.story_html?.replace(/<[^>]*>/g, "").slice(0, 160),
    openGraph: {
      title: data.title,
      description: data.story_html?.replace(/<[^>]*>/g, "").slice(0, 160),
    },
  };
}

export default async function CampaignDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("fund_campaigns")
    .select("*, creator:fund_profiles!fund_campaigns_creator_profile_fkey(*)")
    .eq("slug", slug)
    .single();

  if (!campaign || (campaign.status !== "active" && campaign.status !== "completed")) {
    notFound();
  }

  const typedCampaign = campaign as unknown as FundCampaign;

  const { data: donations } = await supabase
    .from("fund_donations")
    .select("*")
    .eq("campaign_id", campaign.id)
    .eq("status", "succeeded")
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: updates } = await supabase
    .from("fund_updates")
    .select("*")
    .eq("campaign_id", campaign.id)
    .order("created_at", { ascending: false });

  const daysLeft = getDaysRemaining(typedCampaign.end_date);
  const campaignUrl = `https://fund.billionsoulharvest.org/campaigns/${slug}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Banner */}
          {typedCampaign.banner_url && (
            <img
              src={typedCampaign.banner_url}
              alt={typedCampaign.title}
              className="w-full aspect-[16/9] object-cover rounded-xl"
            />
          )}

          <div>
            <span className="text-xs font-medium text-cyan-600 bg-cyan-50 px-2.5 py-1 rounded-full">
              {CAMPAIGN_CATEGORY_LABELS[typedCampaign.category]}
            </span>
            <h1 className="text-3xl font-bold text-gray-900 mt-3">{typedCampaign.title}</h1>
            {typedCampaign.creator && (
              <p className="text-gray-500 mt-1">
                by <span className="font-medium text-gray-700">{typedCampaign.creator.display_name}</span>
              </p>
            )}
          </div>

          {/* Story */}
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: typedCampaign.story_html }}
          />

          {/* Gallery */}
          {typedCampaign.gallery_images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {typedCampaign.gallery_images.map((url, i) => (
                <img key={i} src={url} alt={`Photo ${i + 1}`} className="w-full h-40 object-cover rounded-lg" />
              ))}
            </div>
          )}

          {/* Updates */}
          {(updates?.length ?? 0) > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Updates</h2>
              <div className="space-y-6">
                {(updates as FundUpdate[]).map((update) => (
                  <UpdateCard key={update.id} update={update} />
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <CommentSection campaignId={campaign.id} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress card */}
          <div className="bg-white rounded-xl border p-6 sticky top-20">
            <div className="space-y-4">
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCents(typedCampaign.raised_cents)}
                </p>
                <p className="text-sm text-gray-500">
                  raised of {formatCents(typedCampaign.goal_cents)} goal
                </p>
              </div>

              <ProgressBar
                raisedCents={typedCampaign.raised_cents}
                goalCents={typedCampaign.goal_cents}
                size="lg"
              />

              <div className="flex gap-6">
                <div>
                  <p className="text-lg font-semibold text-gray-900">{typedCampaign.donor_count}</p>
                  <p className="text-xs text-gray-500">donors</p>
                </div>
                {daysLeft !== null && (
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{daysLeft}</p>
                    <p className="text-xs text-gray-500">days left</p>
                  </div>
                )}
              </div>

              {typedCampaign.status === "active" && (
                <Link
                  href={`/fund/campaigns/${slug}/donate`}
                  className="block w-full text-center py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl transition-colors"
                >
                  Donate Now
                </Link>
              )}

              <ShareButtons url={campaignUrl} title={typedCampaign.title} />
            </div>
          </div>

          {/* Donor list */}
          <div className="bg-white rounded-xl border p-6">
            <DonorList donations={(donations ?? []) as FundDonation[]} />
          </div>
        </div>
      </div>
    </div>
  );
}
