-- ============================================================
-- Multiple Kanban Boards (projects)
-- ============================================================

-- Boards table
create table boards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  position integer not null default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_boards_position on boards(position);

-- Add board_id to board_columns
alter table board_columns add column board_id uuid references boards(id) on delete cascade;

-- Trigger
create trigger trg_boards_updated_at before update on boards
  for each row execute function update_updated_at();

-- RLS
alter table boards enable row level security;

create policy "Admins have full access to boards"
  on boards for all
  using (exists (select 1 from admin_users where id = auth.uid()));

-- Grants
grant select, insert, update, delete on boards to authenticated;
grant all on boards to service_role;

-- Seed: Create a default board and assign existing columns to it
do $$
declare
  v_board_id uuid;
begin
  insert into boards (name, description, position)
  values ('General', 'Default task board', 0)
  returning id into v_board_id;

  update board_columns set board_id = v_board_id where board_id is null;
end;
$$;

-- Now make board_id NOT NULL
alter table board_columns alter column board_id set not null;
