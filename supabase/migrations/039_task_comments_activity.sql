-- ============================================================
-- Task Comments & Activity History
-- ============================================================

-- Comments on tasks
create table task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_task_comments_task on task_comments(task_id);
create index idx_task_comments_created on task_comments(task_id, created_at);

-- Activity log for tasks
create table task_activity (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  details jsonb,
  created_at timestamptz not null default now()
);

create index idx_task_activity_task on task_activity(task_id);
create index idx_task_activity_created on task_activity(task_id, created_at);

-- ============================================================
-- Triggers
-- ============================================================
create trigger trg_task_comments_updated_at before update on task_comments
  for each row execute function update_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table task_comments enable row level security;
alter table task_activity enable row level security;

create policy "Admins have full access to task_comments"
  on task_comments for all
  using (exists (select 1 from admin_users where id = auth.uid()));

create policy "Admins have full access to task_activity"
  on task_activity for all
  using (exists (select 1 from admin_users where id = auth.uid()));

-- ============================================================
-- Grants
-- ============================================================
grant select, insert, update, delete on task_comments to authenticated;
grant select, insert, update, delete on task_activity to authenticated;
grant all on task_comments to service_role;
grant all on task_activity to service_role;
