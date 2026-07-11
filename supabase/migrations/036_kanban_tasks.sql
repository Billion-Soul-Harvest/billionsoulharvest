-- ============================================================
-- Kanban Board Task Management
-- ============================================================

-- Board columns (shared board for all admins)
create table board_columns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  position integer not null default 0,
  color text not null default '#6366f1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_board_columns_position on board_columns(position);

-- Tasks
create table tasks (
  id uuid primary key default gen_random_uuid(),
  column_id uuid not null references board_columns(id) on delete cascade,
  title text not null,
  description text,
  priority follow_up_priority not null default 'medium',
  due_date date,
  assigned_to uuid references auth.users(id) on delete set null,
  position integer not null default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_tasks_column on tasks(column_id);
create index idx_tasks_assigned on tasks(assigned_to);
create index idx_tasks_position on tasks(position);

-- Reusable color-coded labels
create table task_labels (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text not null default '#6366f1',
  created_at timestamptz not null default now()
);

-- Join table: task <-> label
create table task_label_assignments (
  task_id uuid not null references tasks(id) on delete cascade,
  label_id uuid not null references task_labels(id) on delete cascade,
  primary key (task_id, label_id)
);

-- ============================================================
-- Triggers
-- ============================================================
create trigger trg_board_columns_updated_at before update on board_columns
  for each row execute function update_updated_at();
create trigger trg_tasks_updated_at before update on tasks
  for each row execute function update_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table board_columns enable row level security;
alter table tasks enable row level security;
alter table task_labels enable row level security;
alter table task_label_assignments enable row level security;

create policy "Admins have full access to board_columns"
  on board_columns for all
  using (exists (select 1 from admin_users where id = auth.uid()));

create policy "Admins have full access to tasks"
  on tasks for all
  using (exists (select 1 from admin_users where id = auth.uid()));

create policy "Admins have full access to task_labels"
  on task_labels for all
  using (exists (select 1 from admin_users where id = auth.uid()));

create policy "Admins have full access to task_label_assignments"
  on task_label_assignments for all
  using (exists (select 1 from admin_users where id = auth.uid()));

-- ============================================================
-- Grants
-- ============================================================
grant select, insert, update, delete on board_columns to authenticated;
grant select, insert, update, delete on tasks to authenticated;
grant select, insert, update, delete on task_labels to authenticated;
grant select, insert, update, delete on task_label_assignments to authenticated;

grant all on board_columns to service_role;
grant all on tasks to service_role;
grant all on task_labels to service_role;
grant all on task_label_assignments to service_role;

-- ============================================================
-- RPC: Atomic task reordering
-- ============================================================
create or replace function reorder_task(
  p_task_id uuid,
  p_new_column_id uuid,
  p_new_position integer
)
returns void
language plpgsql
security definer
as $$
declare
  v_old_column_id uuid;
  v_old_position integer;
begin
  -- Get current position
  select column_id, position into v_old_column_id, v_old_position
  from tasks where id = p_task_id;

  if not found then
    raise exception 'Task not found';
  end if;

  if v_old_column_id = p_new_column_id then
    -- Same column: shift positions
    if v_old_position < p_new_position then
      update tasks
      set position = position - 1
      where column_id = v_old_column_id
        and position > v_old_position
        and position <= p_new_position;
    elsif v_old_position > p_new_position then
      update tasks
      set position = position + 1
      where column_id = v_old_column_id
        and position >= p_new_position
        and position < v_old_position;
    end if;
  else
    -- Different column: close gap in old, open gap in new
    update tasks
    set position = position - 1
    where column_id = v_old_column_id
      and position > v_old_position;

    update tasks
    set position = position + 1
    where column_id = p_new_column_id
      and position >= p_new_position;
  end if;

  -- Move the task
  update tasks
  set column_id = p_new_column_id,
      position = p_new_position
  where id = p_task_id;
end;
$$;

-- ============================================================
-- Seed: Default columns
-- ============================================================
insert into board_columns (name, position, color) values
  ('To Do', 0, '#6b7280'),
  ('In Progress', 1, '#f59e0b'),
  ('Done', 2, '#10b981');
