-- ============================================================
-- Site Pages — Website CMS Page Builder
-- Stores editable website pages with Craft.js content
-- ============================================================

create table site_pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  sort_order int not null default 0,
  published boolean not null default false,
  show_in_nav boolean not null default true,
  is_home boolean not null default false,
  page_content jsonb,
  meta_title text,
  meta_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_site_pages_slug on site_pages(slug);
create index idx_site_pages_sort on site_pages(sort_order);

-- Only one home page allowed
create unique index idx_site_pages_home on site_pages(is_home) where is_home = true;

-- Updated-at trigger
create trigger trg_site_pages_updated_at before update on site_pages
  for each row execute function update_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table site_pages enable row level security;

-- Grant access to Supabase API roles
grant select, insert, update, delete on site_pages to anon, authenticated, service_role;

-- Public can read published pages
create policy "Public can view published site pages"
  on site_pages for select
  using (published = true);

-- Admin full CRUD
create policy "Admins have full access to site_pages"
  on site_pages for all
  using (is_admin(auth.uid()));

-- ============================================================
-- Seed: Create default pages matching current hardcoded pages
-- (no page_content yet — will be populated via builder)
-- ============================================================

insert into site_pages (title, slug, sort_order, published, show_in_nav, is_home) values
  ('Home', 'home', 0, true, false, true),
  ('About', 'about', 1, true, true, false),
  ('Initiatives', 'initiatives', 2, true, true, false),
  ('Global Gatherings', 'gatherings', 3, true, true, false),
  ('Media', 'media', 4, true, true, false),
  ('Connect', 'connect', 5, true, true, false);
