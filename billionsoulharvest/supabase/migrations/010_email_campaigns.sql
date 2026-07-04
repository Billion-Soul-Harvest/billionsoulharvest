-- ============================================================
-- Email Campaigns — Tables, RLS, and Indexes
-- ============================================================

-- Campaign status enum
create type campaign_status as enum (
  'draft',
  'sending',
  'sent',
  'failed',
  'scheduled',
  'cancelled'
);

-- Campaign send status enum
create type campaign_send_status as enum (
  'queued',
  'sent',
  'delivered',
  'opened',
  'clicked',
  'bounced',
  'complained',
  'failed',
  'unsubscribed'
);

-- ============================================================
-- Campaign Templates — reusable email designs
-- ============================================================
create table campaign_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject text not null,
  body_html text not null,
  preview_text text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Campaigns — a specific send
-- ============================================================
create table campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject text,
  body_html text,
  preview_text text,
  from_name text default 'Billion Soul Harvest',
  from_email text default 'noreply@billionsoulharvest.org',
  reply_to text,
  status campaign_status not null default 'draft',
  segment_filter jsonb default '{}',
  template_id uuid references campaign_templates(id) on delete set null,
  total_recipients int not null default 0,
  sent_count int not null default 0,
  delivered_count int not null default 0,
  opened_count int not null default 0,
  clicked_count int not null default 0,
  bounced_count int not null default 0,
  complained_count int not null default 0,
  failed_count int not null default 0,
  scheduled_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Campaign Sends — per-recipient tracking
-- ============================================================
create table campaign_sends (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  contact_id uuid not null references contacts(id) on delete cascade,
  email text not null,
  status campaign_send_status not null default 'queued',
  resend_id text,
  opened_at timestamptz,
  clicked_at timestamptz,
  bounced_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(campaign_id, contact_id)
);

-- ============================================================
-- Contact table additions
-- ============================================================
alter table contacts add column if not exists email_unsubscribed boolean not null default false;
alter table contacts add column if not exists email_unsubscribed_at timestamptz;

-- ============================================================
-- Indexes
-- ============================================================
create index idx_campaign_sends_campaign on campaign_sends(campaign_id);
create index idx_campaign_sends_contact on campaign_sends(contact_id);
create index idx_campaign_sends_resend on campaign_sends(resend_id);
create index idx_campaign_sends_status on campaign_sends(status);
create index idx_campaigns_status on campaigns(status);
create index idx_campaigns_created on campaigns(created_at);

-- ============================================================
-- Updated-at triggers
-- ============================================================
create trigger trg_campaign_templates_updated_at before update on campaign_templates
  for each row execute function update_updated_at();
create trigger trg_campaigns_updated_at before update on campaigns
  for each row execute function update_updated_at();
create trigger trg_campaign_sends_updated_at before update on campaign_sends
  for each row execute function update_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table campaign_templates enable row level security;
alter table campaigns enable row level security;
alter table campaign_sends enable row level security;

create policy "Admins have full access to campaign_templates"
  on campaign_templates for all
  using (is_admin(auth.uid()));

create policy "Admins have full access to campaigns"
  on campaigns for all
  using (is_admin(auth.uid()));

create policy "Admins have full access to campaign_sends"
  on campaign_sends for all
  using (is_admin(auth.uid()));

-- ============================================================
-- Grants
-- ============================================================
grant all on public.campaign_templates to authenticated;
grant all on public.campaigns to authenticated;
grant all on public.campaign_sends to authenticated;
