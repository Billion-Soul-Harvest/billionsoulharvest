import type { FundCampaignCategory, FundCampaignStatus, FundDonationStatus } from "./types";

export const CAMPAIGN_CATEGORY_LABELS: Record<FundCampaignCategory, string> = {
  church_planting: "Church Planting",
  missions_trips: "Missions Trips",
  bible_distribution: "Bible Distribution",
  medical_missions: "Medical Missions",
  disaster_relief: "Disaster Relief",
  building_projects: "Building Projects",
  youth_ministry: "Youth Ministry",
  worship_ministry: "Worship & Ministry",
  other: "Other",
};

export const CAMPAIGN_STATUS_LABELS: Record<FundCampaignStatus, string> = {
  draft: "Draft",
  pending_review: "Pending Review",
  active: "Active",
  paused: "Paused",
  completed: "Completed",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

export const DONATION_STATUS_LABELS: Record<FundDonationStatus, string> = {
  pending: "Pending",
  succeeded: "Succeeded",
  failed: "Failed",
  refunded: "Refunded",
  partially_refunded: "Partially Refunded",
};

export const CAMPAIGN_CATEGORIES: FundCampaignCategory[] = [
  "church_planting",
  "missions_trips",
  "bible_distribution",
  "medical_missions",
  "disaster_relief",
  "building_projects",
  "youth_ministry",
  "worship_ministry",
  "other",
];

export const DONATION_PRESETS = [2500, 5000, 10000, 25000, 50000, 100000]; // in cents

export const FUND_SITE_NAME = "BSH Fund";
export const FUND_SITE_DESCRIPTION = "Support ministry campaigns through Billion Soul Harvest";
