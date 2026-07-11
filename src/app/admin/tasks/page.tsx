import { createClient } from "@/shared/utils/supabase/server";
import { BoardList } from "@/features/tasks/board-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tasks — BSH Admin",
};

export default async function TasksPage() {
  const supabase = await createClient();

  const { data: boards } = await supabase
    .from("boards")
    .select("*")
    .order("position");

  // Get column counts and task counts per board
  const { data: columns } = await supabase
    .from("board_columns")
    .select("id, board_id");

  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, column_id");

  const columnsByBoard = new Map<string, string[]>();
  for (const col of columns ?? []) {
    const list = columnsByBoard.get(col.board_id) ?? [];
    list.push(col.id);
    columnsByBoard.set(col.board_id, list);
  }

  const taskCountByBoard = new Map<string, number>();
  for (const task of tasks ?? []) {
    for (const [boardId, colIds] of columnsByBoard) {
      if (colIds.includes(task.column_id)) {
        taskCountByBoard.set(boardId, (taskCountByBoard.get(boardId) ?? 0) + 1);
        break;
      }
    }
  }

  const boardsWithCounts = (boards ?? []).map((b) => ({
    ...b,
    columnCount: columnsByBoard.get(b.id)?.length ?? 0,
    taskCount: taskCountByBoard.get(b.id) ?? 0,
  }));

  return <BoardList boards={boardsWithCounts} />;
}
