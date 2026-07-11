-- ============================================================
-- In-App Notifications
-- ============================================================

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  task_id uuid references tasks(id) on delete set null,
  actor_id uuid references auth.users(id) on delete set null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_notifications_user_unread on notifications(user_id, read, created_at desc);
create index idx_notifications_user_created on notifications(user_id, created_at desc);

alter table notifications enable row level security;

-- Users can read & update only their own notifications
create policy "Users can view own notifications"
  on notifications for select
  using (user_id = auth.uid());

create policy "Users can update own notifications"
  on notifications for update
  using (user_id = auth.uid());

-- Any authenticated user can insert (app creates on behalf of actor)
create policy "Authenticated users can create notifications"
  on notifications for insert
  to authenticated
  with check (true);

-- Service role for cron
grant select, insert, update, delete on notifications to authenticated;
grant all on notifications to service_role;

-- Enable Realtime for INSERT events
alter publication supabase_realtime add table notifications;
