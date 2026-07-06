export type ContactType = "pastor" | "leader" | "donor" | "attendee" | "subscriber" | "other";

export type EventStatus =
  | "draft"
  | "published"
  | "registration_open"
  | "registration_closed"
  | "completed"
  | "cancelled";

export type EventType =
  | "service"
  | "conference"
  | "workshop"
  | "social"
  | "prayer_meeting"
  | "youth_event"
  | "training"
  | "church_anniversary"
  | "other";

export type RegistrationStatus = "pending" | "confirmed" | "cancelled" | "waitlisted";

export type FollowUpPriority = "low" | "medium" | "high" | "urgent";
export type FollowUpStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type AdminRole = "super_admin" | "admin" | "editor";

export interface MinistryRegion {
  id: string;
  name: string;
  color: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  contact_type: ContactType;
  tags: string[];
  church_name: string | null;
  church_role: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  region_id: string | null;
  notes: string | null;
  constant_contact_id: string | null;
  phone_home: string | null;
  phone_mobile: string | null;
  phone_work: string | null;
  street_address: string | null;
  email_status: string | null;
  email_permission: string | null;
  alternative_email: string | null;
  birthday: string | null;
  gender: string | null;
  age_group: string | null;
  language: string | null;
  job_title: string | null;
  referred_by: string | null;
  interests: string | null;
  expectations: string | null;
  source: string | null;
  cc_region: string | null;
  email_lists: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  long_description: string | null;
  location: string | null;
  city: string | null;
  country: string | null;
  start_date: string | null;
  end_date: string | null;
  status: EventStatus;
  event_type: EventType;
  region_id: string | null;
  banner_url: string | null;
  page_content: Record<string, unknown> | null;
  max_registrations: number | null;
  registration_fee_cents: number;
  registration_config: RegistrationConfig | null;
  created_at: string;
  updated_at: string;
}

export interface Registration {
  id: string;
  event_id: string;
  contact_id: string;
  status: RegistrationStatus;
  church_name: string | null;
  church_role: string | null;
  city: string | null;
  country: string | null;
  dietary_requirements: string | null;
  special_needs: string | null;
  how_heard: string | null;
  notes: string | null;
  custom_fields: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface RegistrationWithContact extends Registration {
  contact: Contact;
}

export interface FollowUp {
  id: string;
  contact_id: string;
  assigned_to: string | null;
  title: string;
  description: string | null;
  priority: FollowUpPriority;
  status: FollowUpStatus;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  role: AdminRole;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

// Campaign types
export type CampaignStatus = "draft" | "sending" | "sent" | "failed" | "scheduled" | "cancelled";
export type CampaignSendStatus = "queued" | "sent" | "delivered" | "opened" | "clicked" | "bounced" | "complained" | "failed" | "unsubscribed";

export interface SegmentFilter {
  contact_type?: string[];
  region_id?: string;
  language?: string;
  country?: string;
  tags_include?: string[];
  email_lists?: string[];
  contact_ids?: string[];
}

export interface CampaignTemplate {
  id: string;
  name: string;
  subject: string;
  body_html: string;
  preview_text: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  subject: string | null;
  body_html: string | null;
  preview_text: string | null;
  from_name: string | null;
  from_email: string | null;
  reply_to: string | null;
  status: CampaignStatus;
  segment_filter: SegmentFilter;
  template_id: string | null;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  bounced_count: number;
  complained_count: number;
  failed_count: number;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignSend {
  id: string;
  campaign_id: string;
  contact_id: string;
  email: string;
  status: CampaignSendStatus;
  resend_id: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  bounced_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export type SpeakerRole = "keynote" | "speaker" | "panelist" | "worship";
export type ProgramType = "main_session" | "breakout" | "workshop" | "worship" | "meal" | "free_time";
export type FaqCategory = "general" | "travel" | "accommodation" | "registration";
export type SectionType = "arrival_info" | "accommodation" | "transportation" | "about" | "custom";

export interface EventSpeaker {
  id: string;
  event_id: string;
  name: string;
  title: string;
  organization: string | null;
  bio: string | null;
  photo_url: string | null;
  role: SpeakerRole;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface EventProgram {
  id: string;
  event_id: string;
  title: string;
  description: string | null;
  day_date: string;
  start_time: string;
  end_time: string | null;
  location: string | null;
  type: ProgramType;
  speaker_id: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface EventFaq {
  id: string;
  event_id: string;
  question: string;
  answer: string;
  category: FaqCategory | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface EventSection {
  id: string;
  event_id: string;
  section_type: SectionType;
  title: string;
  content: string;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

// Registration Config types
export interface RegistrationFieldConfig {
  visible: boolean;
  required: boolean;
}

export type RegistrationCustomFieldType =
  | "text"
  | "textarea"
  | "select"
  | "checkbox"
  | "number"
  | "date"
  | "email"
  | "tel"
  | "url";

export interface RegistrationCustomField {
  id: string;
  label: string;
  type: RegistrationCustomFieldType;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface RegistrationConfig {
  enabled: boolean;
  fields: {
    region: RegistrationFieldConfig;
    country: RegistrationFieldConfig;
    visaRequired: RegistrationFieldConfig;
    passportNumber: RegistrationFieldConfig;
    phone: RegistrationFieldConfig;
    churchName: RegistrationFieldConfig;
    churchRole: RegistrationFieldConfig;
    referredBy: RegistrationFieldConfig;
    city: RegistrationFieldConfig;
    dietaryRequirements: RegistrationFieldConfig;
    howHeard: RegistrationFieldConfig;
    specialNeeds: RegistrationFieldConfig;
  };
  customFields: RegistrationCustomField[];
}

// Page Builder types
export type BlockType = "rich_text" | "speakers" | "schedule" | "faq" | "hero" | "image" | "video" | "cta";

export interface EventPage {
  id: string;
  event_id: string;
  title: string;
  slug: string;
  icon: string | null;
  sort_order: number;
  published: boolean;
  page_content: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface EventPageBlock {
  id: string;
  page_id: string;
  event_id: string;
  block_type: BlockType;
  title: string | null;
  content: Record<string, unknown>;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}
