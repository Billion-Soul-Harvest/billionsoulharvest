-- ============================================================
-- Site Settings — Key-value store for site-wide configuration
-- ============================================================

create table site_settings (
  key text primary key,
  value jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- Updated-at trigger
create trigger trg_site_settings_updated_at before update on site_settings
  for each row execute function update_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table site_settings enable row level security;

grant select, insert, update, delete on site_settings to anon, authenticated, service_role;

-- Public can read settings
create policy "Public can view site settings"
  on site_settings for select
  using (true);

-- Admin full CRUD
create policy "Admins have full access to site_settings"
  on site_settings for all
  using (is_admin(auth.uid()));
