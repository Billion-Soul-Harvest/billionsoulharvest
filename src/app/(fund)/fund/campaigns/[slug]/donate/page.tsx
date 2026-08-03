import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/shared/utils/supabase/server";
import { DonateForm } from "@/features/fund/components/donate-form";
import { ProgressBar } from "@/features/fund/components/progress-bar";
import { formatCents } from "@/features/fund/utils/format-currency";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("fund_campaigns")
    .select("title")
    .eq("slug", slug)
    .single();

  return { title: data ? `Donate to ${data.title}` : "Donate" };
}

export default async function DonatePage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("fund_campaigns")
    .select("id, title, slug, status, raised_cents, goal_cents, donor_count, banner_url")
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (!campaign) notFound();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href={`/fund/campaigns/${slug}`} className="text-sm text-cyan-600 hover:text-cyan-700 mb-6 inline-flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to campaign
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-4">
        {/* Campaign summary */}
        <div className="space-y-4">
          {campaign.banner_url && (
            <img src={campaign.banner_url} alt={campaign.title} className="w-full aspect-video object-cover rounded-xl" />
          )}
          <h1 className="text-2xl font-bold text-gray-900">{campaign.title}</h1>
          <ProgressBar raisedCents={campaign.raised_cents} goalCents={campaign.goal_cents} size="md" showLabel />
          <p className="text-sm text-gray-500">
            {formatCents(campaign.raised_cents)} raised of {formatCents(campaign.goal_cents)} &middot; {campaign.donor_count} donors
          </p>
        </div>

        {/* Donation form */}
        <div className="bg-white rounded-2xl border shadow-sm p-6 sm:p-8">
          <DonateForm campaignId={campaign.id} campaignTitle={campaign.title} />
        </div>
      </div>
    </div>
  );
}
