export type ContactType = "pastor" | "leader" | "donor" | "attendee" | "subscriber" | "other";

export type EventStatus =
  | "draft"
  | "published"
  | "registration_open"
  | "registration_closed"
  | "completed"
  | "cancelled";

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
  region_id: string | null;
  banner_url: string | null;
  max_registrations: number | null;
  registration_fee_cents: number;
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
