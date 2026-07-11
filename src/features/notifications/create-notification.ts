import { createClient } from "@/shared/utils/supabase/client";
import type { NotificationType } from "./notification-types";

interface CreateNotificationParams {
  recipientId: string;
  type: NotificationType;
  title: string;
  body?: string;
  taskId?: string;
}

export async function createNotification({
  recipientId,
  type,
  title,
  body,
  taskId,
}: CreateNotificationParams) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Never notify yourself
  if (user?.id === recipientId) return;

  await supabase.from("notifications").insert({
    user_id: recipientId,
    type,
    title,
    body: body ?? null,
    task_id: taskId ?? null,
    actor_id: user?.id ?? null,
  });
}
