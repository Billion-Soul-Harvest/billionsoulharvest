-- ============================================================
-- Event Rich Content Tables
-- Speakers, Programs, FAQs, and Sections for event pages
-- ============================================================

-- Event Speakers
create table event_speakers (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  name text not null,
  title text not null,
  organization text,
  bio text,
  photo_url text,
  role text not null default 'speaker'
    check (role in ('keynote', 'speaker', 'panelist', 'worship')),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_event_speakers_event on event_speakers(event_id);

-- Event Programs (schedule items)
create table event_programs (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  title text not null,
  description text,
  day_date date not null,
  start_time time not null,
  end_time time,
  location text,
  type text not null default 'main_session'
    check (type in ('main_session', 'breakout', 'workshop', 'worship', 'meal', 'free_time')),
  speaker_id uuid references event_speakers(id) on delete set null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_event_programs_event on event_programs(event_id);
create index idx_event_programs_speaker on event_programs(speaker_id);

-- Event FAQs
create table event_faqs (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  question text not null,
  answer text not null,
  category text default 'general'
    check (category in ('general', 'travel', 'accommodation', 'registration')),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_event_faqs_event on event_faqs(event_id);

-- Event Sections (arrival info, accommodation, etc.)
create table event_sections (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  section_type text not null default 'custom'
    check (section_type in ('arrival_info', 'accommodation', 'transportation', 'about', 'custom')),
  title text not null,
  content text not null,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_event_sections_event on event_sections(event_id);

-- Updated-at triggers
create trigger trg_event_speakers_updated_at before update on event_speakers
  for each row execute function update_updated_at();
create trigger trg_event_programs_updated_at before update on event_programs
  for each row execute function update_updated_at();
create trigger trg_event_faqs_updated_at before update on event_faqs
  for each row execute function update_updated_at();
create trigger trg_event_sections_updated_at before update on event_sections
  for each row execute function update_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table event_speakers enable row level security;
alter table event_programs enable row level security;
alter table event_faqs enable row level security;
alter table event_sections enable row level security;

-- Public read: speakers, programs, FAQs for published events; published sections
create policy "Public can view event speakers"
  on event_speakers for select
  using (exists (
    select 1 from events
    where events.id = event_speakers.event_id
    and events.status in ('published', 'registration_open')
  ));

create policy "Public can view event programs"
  on event_programs for select
  using (exists (
    select 1 from events
    where events.id = event_programs.event_id
    and events.status in ('published', 'registration_open')
  ));

create policy "Public can view event faqs"
  on event_faqs for select
  using (exists (
    select 1 from events
    where events.id = event_faqs.event_id
    and events.status in ('published', 'registration_open')
  ));

create policy "Public can view published event sections"
  on event_sections for select
  using (
    published = true
    and exists (
      select 1 from events
      where events.id = event_sections.event_id
      and events.status in ('published', 'registration_open')
    )
  );

-- Admin full CRUD (reuse is_admin from migration 004)
create policy "Admins have full access to event_speakers"
  on event_speakers for all
  using (is_admin(auth.uid()));

create policy "Admins have full access to event_programs"
  on event_programs for all
  using (is_admin(auth.uid()));

create policy "Admins have full access to event_faqs"
  on event_faqs for all
  using (is_admin(auth.uid()));

create policy "Admins have full access to event_sections"
  on event_sections for all
  using (is_admin(auth.uid()));
