create table stories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  banner_url text,
  page_content jsonb,
  author text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index idx_stories_slug on stories(slug);
create index idx_stories_status on stories(status);

-- Updated-at trigger (reuse existing function)
create trigger trg_stories_updated_at before update on stories
  for each row execute function update_updated_at();

-- RLS
alter table stories enable row level security;

create policy "Public can view published stories"
  on stories for select using (status = 'published');

create policy "Admins have full access to stories"
  on stories for all using (is_admin(auth.uid()));

-- Grants
grant all on public.stories to authenticated;
grant select on public.stories to anon;
