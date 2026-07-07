import { redirect } from "next/navigation";
import { createClient } from "@/shared/utils/supabase/server";
import { TemplatePicker } from "@/features/emails/template-picker";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Email — BSH Admin",
};

export default async function NewEmailPage() {
  const authSupabase = await createClient();
  const { data: { user } } = await authSupabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div>
      <TemplatePicker />
    </div>
  );
}
