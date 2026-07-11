export type NotificationType =
  | "mentioned"
  | "assigned"
  | "comment_on_task"
  | "task_moved"
  | "attachment_added"
  | "task_due_soon";

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  task_id: string | null;
  actor_id: string | null;
  read: boolean;
  created_at: string;
  actor?: { display_name: string | null } | null;
}
