import { redirect } from "next/navigation";
import { createClient } from "@/shared/utils/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
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

  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: template } = await supabase
    .from("campaign_templates")
    .insert({
      name: "Untitled email",
      subject: "",
      body_html: "",
      preview_text: null,
      created_by: user.id,
    })
    .select()
    .single();

  if (!template) {
    redirect("/admin/emails");
  }

  redirect(`/admin/emails/${template.id}`);
}
