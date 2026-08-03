export type FundCampaignStatus =
  | "draft"
  | "pending_review"
  | "active"
  | "paused"
  | "completed"
  | "rejected"
  | "cancelled";

export type FundCampaignCategory =
  | "church_planting"
  | "missions_trips"
  | "bible_distribution"
  | "medical_missions"
  | "disaster_relief"
  | "building_projects"
  | "youth_ministry"
  | "worship_ministry"
  | "other";

export type FundDonationStatus =
  | "pending"
  | "succeeded"
  | "failed"
  | "refunded"
  | "partially_refunded";

export type FundRecurringInterval = "week" | "month" | "year";

export type FundSubscriptionStatus = "active" | "paused" | "cancelled";

export type FundTeamRole = "captain" | "member";

export interface FundProfile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface FundCampaign {
  id: string;
  creator_id: string;
  title: string;
  slug: string;
  story_html: string;
  category: FundCampaignCategory;
  status: FundCampaignStatus;
  goal_cents: number;
  raised_cents: number;
  donor_count: number;
  banner_url: string | null;
  gallery_images: string[];
  team_id: string | null;
  end_date: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  creator?: FundProfile;
  team?: FundTeam;
}

export interface FundDonation {
  id: string;
  campaign_id: string;
  donor_id: string | null;
  donor_name: string;
  donor_email: string | null;
  amount_cents: number;
  fee_cents: number;
  status: FundDonationStatus;
  is_anonymous: boolean;
  is_recurring: boolean;
  message: string | null;
  stripe_payment_intent_id: string | null;
  matched_amount_cents: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  campaign?: FundCampaign;
}

export interface FundUpdate {
  id: string;
  campaign_id: string;
  author_id: string;
  title: string;
  body_html: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  author?: FundProfile;
}

export interface FundComment {
  id: string;
  campaign_id: string;
  donor_id: string | null;
  donation_id: string | null;
  author_name: string;
  body: string;
  is_hidden: boolean;
  created_at: string;
}

export interface FundTeam {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  goal_cents: number;
  captain_id: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  members?: FundTeamMember[];
}

export interface FundTeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: FundTeamRole;
  created_at: string;
  // Joined fields
  profile?: FundProfile;
}

export interface FundMatchingRule {
  id: string;
  match_ratio: number;
  max_match_cents: number | null;
  total_budget_cents: number;
  spent_cents: number;
  category: FundCampaignCategory | null;
  campaign_id: string | null;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FundRecurringSubscription {
  id: string;
  campaign_id: string;
  donor_id: string;
  amount_cents: number;
  interval: FundRecurringInterval;
  stripe_subscription_id: string | null;
  status: FundSubscriptionStatus;
  created_at: string;
  updated_at: string;
  // Joined fields
  campaign?: FundCampaign;
}
