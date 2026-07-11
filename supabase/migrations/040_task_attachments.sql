-- ============================================================
-- Task Attachments — storage bucket + metadata table
-- ============================================================

-- Storage bucket (not public — admin-only access)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'task-attachments',
  'task-attachments',
  false,
  10485760, -- 10MB
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain', 'text/csv'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: admin-only read/write/delete
DO $$ BEGIN
CREATE POLICY "task_attachments_admin_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'task-attachments'
    AND EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
CREATE POLICY "task_attachments_admin_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'task-attachments'
    AND EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
CREATE POLICY "task_attachments_admin_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'task-attachments'
    AND EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
CREATE POLICY "task_attachments_admin_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'task-attachments'
    AND EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Metadata table
create table task_attachments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_size integer not null default 0,
  content_type text not null default 'application/octet-stream',
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_task_attachments_task on task_attachments(task_id);

alter table task_attachments enable row level security;

create policy "Admins have full access to task_attachments"
  on task_attachments for all
  using (exists (select 1 from admin_users where id = auth.uid()));

grant select, insert, update, delete on task_attachments to authenticated;
grant all on task_attachments to service_role;
