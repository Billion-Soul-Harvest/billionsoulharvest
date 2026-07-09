-- ============================================================
-- Event Pages & Blocks — Microsite Page Builder
-- Allows admins to compose event pages with reorderable blocks
-- ============================================================

-- Event Pages (tabs/pages per event)
create table event_pages (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  title text not null,
  slug text not null,
  icon text,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, slug)
);

create index idx_event_pages_event on event_pages(event_id);

-- Event Page Blocks (content blocks placed on pages)
create table event_page_blocks (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references event_pages(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  block_type text not null
    check (block_type in ('rich_text', 'speakers', 'schedule', 'faq', 'hero', 'image', 'video', 'cta')),
  title text,
  content jsonb not null default '{}'::jsonb,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_event_page_blocks_page on event_page_blocks(page_id);
create index idx_event_page_blocks_event on event_page_blocks(event_id);

-- Updated-at triggers
create trigger trg_event_pages_updated_at before update on event_pages
  for each row execute function update_updated_at();
create trigger trg_event_page_blocks_updated_at before update on event_page_blocks
  for each row execute function update_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table event_pages enable row level security;
alter table event_page_blocks enable row level security;

-- Public read: published pages/blocks for published events
create policy "Public can view published event pages"
  on event_pages for select
  using (
    published = true
    and exists (
      select 1 from events
      where events.id = event_pages.event_id
      and events.status in ('published', 'registration_open')
    )
  );

create policy "Public can view published event page blocks"
  on event_page_blocks for select
  using (
    published = true
    and exists (
      select 1 from events
      where events.id = event_page_blocks.event_id
      and events.status in ('published', 'registration_open')
    )
  );

-- Admin full CRUD
create policy "Admins have full access to event_pages"
  on event_pages for all
  using (is_admin(auth.uid()));

create policy "Admins have full access to event_page_blocks"
  on event_page_blocks for all
  using (is_admin(auth.uid()));

-- ============================================================
-- Data Migration: Create default pages for existing events
-- that have content (speakers, programs, faqs, sections)
-- ============================================================

do $$
declare
  evt record;
  page_id uuid;
  block_order int;
begin
  for evt in
    select e.id, e.status, e.long_description,
      (select count(*) from event_speakers where event_id = e.id) as speaker_count,
      (select count(*) from event_programs where event_id = e.id) as program_count,
      (select count(*) from event_faqs where event_id = e.id) as faq_count,
      (select count(*) from event_sections where event_id = e.id and published = true) as section_count
    from events e
  loop
    -- Only create default page if the event has any content
    if evt.speaker_count > 0 or evt.program_count > 0 or evt.faq_count > 0
       or evt.section_count > 0 or evt.long_description is not null then

      page_id := gen_random_uuid();
      block_order := 0;

      insert into event_pages (id, event_id, title, slug, sort_order)
      values (page_id, evt.id, 'Overview', 'overview', 0);

      -- Hero block
      insert into event_page_blocks (page_id, event_id, block_type, sort_order, content)
      values (page_id, evt.id, 'hero', block_order, '{"show_dates": true, "show_cta": true}'::jsonb);
      block_order := block_order + 1;

      -- Rich text block for long_description
      if evt.long_description is not null then
        insert into event_page_blocks (page_id, event_id, block_type, title, sort_order, content)
        values (page_id, evt.id, 'rich_text', 'About This Event', block_order,
                jsonb_build_object('html', evt.long_description));
        block_order := block_order + 1;
      end if;

      -- Speakers block
      if evt.speaker_count > 0 then
        insert into event_page_blocks (page_id, event_id, block_type, sort_order, content)
        values (page_id, evt.id, 'speakers', block_order, '{"layout": "grid"}'::jsonb);
        block_order := block_order + 1;
      end if;

      -- Schedule block
      if evt.program_count > 0 then
        insert into event_page_blocks (page_id, event_id, block_type, sort_order, content)
        values (page_id, evt.id, 'schedule', block_order, '{"show_day_tabs": true}'::jsonb);
        block_order := block_order + 1;
      end if;

      -- FAQ block
      if evt.faq_count > 0 then
        insert into event_page_blocks (page_id, event_id, block_type, sort_order, content)
        values (page_id, evt.id, 'faq', block_order, '{}'::jsonb);
        block_order := block_order + 1;
      end if;

      -- CTA block
      if evt.status = 'registration_open' then
        insert into event_page_blocks (page_id, event_id, block_type, sort_order, content)
        values (page_id, evt.id, 'cta', block_order,
                '{"text": "Register Now", "subtitle": "Don''t miss this opportunity to be part of what God is doing through the global harvest movement."}'::jsonb);
        block_order := block_order + 1;
      end if;

    end if;
  end loop;
end $$;
