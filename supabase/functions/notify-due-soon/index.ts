import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Find tasks due tomorrow with an assignee
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const { data: tasks, error: taskError } = await supabase
    .from("tasks")
    .select("id, title, assigned_to, due_date")
    .eq("due_date", tomorrowStr)
    .not("assigned_to", "is", null);

  if (taskError) {
    return new Response(JSON.stringify({ error: taskError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let created = 0;
  const today = new Date().toISOString().split("T")[0];

  for (const task of tasks ?? []) {
    // Check if we already sent a due_soon notification for this task today
    const { data: existing } = await supabase
      .from("notifications")
      .select("id")
      .eq("task_id", task.id)
      .eq("type", "task_due_soon")
      .gte("created_at", `${today}T00:00:00Z`)
      .limit(1);

    if (existing && existing.length > 0) continue;

    await supabase.from("notifications").insert({
      user_id: task.assigned_to,
      type: "task_due_soon",
      title: "Task due tomorrow",
      body: `"${task.title}" is due ${tomorrowStr}`,
      task_id: task.id,
      actor_id: null,
    });
    created++;
  }

  return new Response(
    JSON.stringify({ success: true, tasks_checked: tasks?.length ?? 0, notifications_created: created }),
    { headers: { "Content-Type": "application/json" } }
  );
});
