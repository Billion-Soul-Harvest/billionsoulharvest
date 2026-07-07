import { createClient } from "@/shared/utils/supabase/server";
import { EmailTemplateList } from "@/features/emails/email-template-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Emails — BSH Admin",
};

interface Props {
  searchParams: Promise<{
    status?: string;
  }>;
}

export default async function EmailsPage({ searchParams }: Props) {
  const params = await searchParams;
  const statusFilter = params.status ?? "all";

  const supabase = await createClient();

  // Fetch templates with stats from the view
  const { data: templates } = await supabase
    .from("email_template_stats")
    .select("*")
    .order("updated_at", { ascending: false });

  let filtered = templates ?? [];
  if (statusFilter === "draft") {
    filtered = filtered.filter((t: Record<string, unknown>) => (t.send_count as number) === 0);
  } else if (statusFilter === "sent") {
    filtered = filtered.filter((t: Record<string, unknown>) => (t.send_count as number) > 0);
  }

  return (
    <div>
      <EmailTemplateList
        initialTemplates={filtered as never[]}
        statusFilter={statusFilter}
      />
    </div>
  );
}
