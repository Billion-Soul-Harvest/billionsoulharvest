export interface Board {
  id: string;
  name: string;
  description: string | null;
  position: number;
}

export interface BoardColumn {
  id: string;
  board_id: string;
  name: string;
  position: number;
  color: string;
}

export interface TaskLabel {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  column_id: string;
  title: string;
  description: string | null;
  priority: "low" | "medium" | "high" | "urgent";
  due_date: string | null;
  assigned_to: string | null;
  position: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  labels: TaskLabel[];
  assignee?: { display_name: string | null } | null;
}

export interface AdminUser {
  id: string;
  display_name: string | null;
}

export interface TaskComment {
  id: string;
  task_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author?: { display_name: string | null } | null;
}

export interface TaskActivity {
  id: string;
  task_id: string;
  actor_id: string | null;
  action: string;
  details: Record<string, string> | null;
  created_at: string;
  actor?: { display_name: string | null } | null;
}

export interface TaskAttachment {
  id: string;
  task_id: string;
  comment_id: string | null;
  file_name: string;
  file_path: string;
  file_size: number;
  content_type: string;
  uploaded_by: string | null;
  created_at: string;
}
