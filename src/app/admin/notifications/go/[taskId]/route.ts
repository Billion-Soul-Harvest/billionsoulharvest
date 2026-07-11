import { createClient } from "@/shared/utils/supabase/server";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;
  const supabase = await createClient();

  const { data: task } = await supabase
    .from("tasks")
    .select("column_id")
    .eq("id", taskId)
    .single();

  if (!task) {
    redirect("/admin/tasks");
  }

  const { data: column } = await supabase
    .from("board_columns")
    .select("board_id")
    .eq("id", task.column_id)
    .single();

  if (!column) {
    redirect("/admin/tasks");
  }

  redirect(`/admin/tasks/${column.board_id}?task=${taskId}`);
}
