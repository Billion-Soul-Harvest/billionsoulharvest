-- ============================================================
-- Billion Soul Harvest — Initial Database Schema
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================================
-- Ministry Regions
-- ============================================================
create table ministry_regions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text not null default '#6366f1', -- hex color for calendar/UI
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Contacts
-- ============================================================
create type contact_type as enum (
  'pastor',
  'leader',
  'donor',
  'attendee',
  'subscriber',
  'other'
);

create table contacts (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text unique,
  phone text,
  contact_type contact_type not null default 'other',
  tags text[] default '{}',
  church_name text,
  church_role text,
  city text,
  state text,
  country text,
  region_id uuid references ministry_regions(id) on delete set null,
  notes text,
  constant_contact_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_contacts_email on contacts(email);
create index idx_contacts_cc_id on contacts(constant_contact_id);
create index idx_contacts_region on contacts(region_id);
create index idx_contacts_type on contacts(contact_type);

-- ============================================================
-- Events
-- ============================================================
create type event_status as enum (
  'draft',
  'published',
  'registration_open',
  'registration_closed',
  'completed',
  'cancelled'
);

create table events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  long_description text,
  location text,
  city text,
  country text,
  start_date date,
  end_date date,
  status event_status not null default 'draft',
  region_id uuid references ministry_regions(id) on delete set null,
  banner_url text,
  max_registrations int,
  registration_fee_cents int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_events_slug on events(slug);
create index idx_events_status on events(status);

-- ============================================================
-- Registrations
-- ============================================================
create type registration_status as enum (
  'pending',
  'confirmed',
  'cancelled',
  'waitlisted'
);

create table registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  contact_id uuid not null references contacts(id) on delete cascade,
  status registration_status not null default 'confirmed',
  church_name text,
  church_role text,
  city text,
  country text,
  dietary_requirements text,
  special_needs text,
  how_heard text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(event_id, contact_id)
);

create index idx_registrations_event on registrations(event_id);
create index idx_registrations_contact on registrations(contact_id);

-- ============================================================
-- Follow-ups
-- ============================================================
create type follow_up_priority as enum ('low', 'medium', 'high', 'urgent');
create type follow_up_status as enum ('pending', 'in_progress', 'completed', 'cancelled');

create table follow_ups (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references contacts(id) on delete cascade,
  assigned_to uuid references auth.users(id) on delete set null,
  title text not null,
  description text,
  priority follow_up_priority not null default 'medium',
  status follow_up_status not null default 'pending',
  due_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_follow_ups_contact on follow_ups(contact_id);
create index idx_follow_ups_assigned on follow_ups(assigned_to);
create index idx_follow_ups_status on follow_ups(status);

-- ============================================================
-- Admin Users (extends Supabase auth.users)
-- ============================================================
create type admin_role as enum ('super_admin', 'admin', 'editor');

create table admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  role admin_role not null default 'editor',
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Updated-at trigger function
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_contacts_updated_at before update on contacts
  for each row execute function update_updated_at();
create trigger trg_events_updated_at before update on events
  for each row execute function update_updated_at();
create trigger trg_registrations_updated_at before update on registrations
  for each row execute function update_updated_at();
create trigger trg_follow_ups_updated_at before update on follow_ups
  for each row execute function update_updated_at();
create trigger trg_ministry_regions_updated_at before update on ministry_regions
  for each row execute function update_updated_at();
create trigger trg_admin_users_updated_at before update on admin_users
  for each row execute function update_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================

-- Enable RLS on all tables
alter table ministry_regions enable row level security;
alter table contacts enable row level security;
alter table events enable row level security;
alter table registrations enable row level security;
alter table follow_ups enable row level security;
alter table admin_users enable row level security;

-- Public: can read published/registration_open events
create policy "Public can view published events"
  on events for select
  using (status in ('published', 'registration_open'));

-- Public: can insert registrations (for event registration)
create policy "Public can create registrations"
  on registrations for insert
  with check (true);

-- Public: can insert contacts (created during registration)
create policy "Public can create contacts"
  on contacts for insert
  with check (true);

-- Public: can read ministry regions
create policy "Public can view regions"
  on ministry_regions for select
  using (true);

-- Admin: full access to everything (authenticated users with admin_users entry)
create policy "Admins have full access to contacts"
  on contacts for all
  using (exists (select 1 from admin_users where id = auth.uid()));

create policy "Admins have full access to events"
  on events for all
  using (exists (select 1 from admin_users where id = auth.uid()));

create policy "Admins have full access to registrations"
  on registrations for all
  using (exists (select 1 from admin_users where id = auth.uid()));

create policy "Admins have full access to follow_ups"
  on follow_ups for all
  using (exists (select 1 from admin_users where id = auth.uid()));

create policy "Admins have full access to regions"
  on ministry_regions for all
  using (exists (select 1 from admin_users where id = auth.uid()));

create policy "Admins can view admin_users"
  on admin_users for select
  using (exists (select 1 from admin_users where id = auth.uid()));

create policy "Super admins can manage admin_users"
  on admin_users for all
  using (exists (select 1 from admin_users where id = auth.uid() and role = 'super_admin'));
