import { SupabaseClient } from "@supabase/supabase-js";

export function getDailyLimit(): number {
  return parseInt(process.env.DAILY_EMAIL_LIMIT || "900", 10);
}

export async function getRemainingQuota(
  supabase: SupabaseClient
): Promise<number> {
  const { data, error } = await supabase.rpc("get_daily_email_remaining", {
    daily_limit: getDailyLimit(),
  });

  if (error) {
    console.error("Failed to get daily email remaining:", error);
    return 0;
  }

  return data as number;
}

export async function recordEmailsSent(
  supabase: SupabaseClient,
  count: number
): Promise<void> {
  if (count <= 0) return;

  const { error } = await supabase.rpc("increment_daily_email_count", {
    count_to_add: count,
  });

  if (error) {
    console.error("Failed to record emails sent:", error);
  }
}
