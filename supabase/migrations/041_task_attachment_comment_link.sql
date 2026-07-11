-- ============================================================
-- Link task attachments to comments (optional)
-- ============================================================

alter table task_attachments
  add column comment_id uuid references task_comments(id) on delete set null;

create index idx_task_attachments_comment on task_attachments(comment_id);
