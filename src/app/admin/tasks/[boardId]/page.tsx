import { createClient } from "@/shared/utils/supabase/server";
import { KanbanBoard } from "@/features/tasks/kanban-board";
import type { Metadata } from "next";
import type { Task } from "@/features/tasks/task-types";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Tasks — BSH Admin",
};

export default async function BoardPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const { boardId } = await params;
  const supabase = await createClient();

  const { data: board } = await supabase
    .from("boards")
    .select("*")
    .eq("id", boardId)
    .single();

  if (!board) notFound();

  const { data: columns } = await supabase
    .from("board_columns")
    .select("*")
    .eq("board_id", boardId)
    .order("position");

  const columnIds = (columns ?? []).map((c) => c.id);

  const { data: rawTasks } = columnIds.length > 0
    ? await supabase
        .from("tasks")
        .select("*, task_label_assignments(label_id, task_labels(id, name, color))")
        .in("column_id", columnIds)
        .order("position")
    : { data: [] };

  const { data: adminUsers } = await supabase
    .from("admin_users")
    .select("id, display_name")
    .order("display_name");

  const adminMap = new Map(
    (adminUsers ?? []).map((u) => [u.id, u])
  );

  const tasks: Task[] = (rawTasks ?? []).map((t) => ({
    ...t,
    labels: (t.task_label_assignments ?? []).map(
      (a: { task_labels: { id: string; name: string; color: string } }) => a.task_labels
    ),
    assignee: t.assigned_to ? adminMap.get(t.assigned_to) ?? null : null,
  }));

  const { data: labels } = await supabase
    .from("task_labels")
    .select("*")
    .order("name");

  return (
    <KanbanBoard
      board={board}
      initialColumns={columns ?? []}
      initialTasks={tasks}
      adminUsers={adminUsers ?? []}
      allLabels={labels ?? []}
    />
  );
}
