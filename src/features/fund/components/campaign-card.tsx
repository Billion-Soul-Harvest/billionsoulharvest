"use client";

import Link from "next/link";
import Image from "next/image";
import { ProgressBar } from "./progress-bar";
import { formatCents } from "../utils/format-currency";
import { getDaysRemaining } from "../utils/campaign-progress";
import { CAMPAIGN_CATEGORY_LABELS } from "../constants";
import type { FundCampaign } from "../types";

interface CampaignCardProps {
  campaign: FundCampaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const daysLeft = getDaysRemaining(campaign.end_date);

  return (
    <Link
      href={`/fund/campaigns/${campaign.slug}`}
      className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Banner */}
      <div className="relative aspect-[16/9] bg-gray-100">
        {campaign.banner_url ? (
          <Image
            src={campaign.banner_url}
            alt={campaign.title}
            fill
            unoptimized
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-50 to-cyan-100">
            <svg className="w-12 h-12 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
        )}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 px-2.5 py-1 rounded-full">
          {CAMPAIGN_CATEGORY_LABELS[campaign.category]}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-cyan-700 transition-colors">
          {campaign.title}
        </h3>
        {campaign.creator && (
          <p className="text-xs text-gray-500 mt-1">
            by {campaign.creator.display_name}
          </p>
        )}

        <ProgressBar
          raisedCents={campaign.raised_cents}
          goalCents={campaign.goal_cents}
          className="mt-3"
          size="sm"
        />

        <div className="flex items-center justify-between mt-2">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {formatCents(campaign.raised_cents)}
            </p>
            <p className="text-xs text-gray-500">
              raised of {formatCents(campaign.goal_cents)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">
              {campaign.donor_count}
            </p>
            <p className="text-xs text-gray-500">
              {campaign.donor_count === 1 ? "donor" : "donors"}
            </p>
          </div>
          {daysLeft !== null && (
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{daysLeft}</p>
              <p className="text-xs text-gray-500">days left</p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
