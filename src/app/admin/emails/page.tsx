import { createClient } from "@/shared/utils/supabase/server";
import { EmailTemplateList } from "@/features/emails/email-template-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Emails — BSH Admin",
};

interface Props {
  searchParams: Promise<{
    status?: string;
    page?: string;
    pageSize?: string;
  }>;
}

export default async function EmailsPage({ searchParams }: Props) {
  const params = await searchParams;
  const statusFilter = params.status ?? "all";
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = [10, 25, 50].includes(Number(params.pageSize))
    ? Number(params.pageSize)
    : 10;

  const supabase = await createClient();

  let query = supabase
    .from("email_template_stats")
    .select("*", { count: "exact" })
    .order("updated_at", { ascending: false });

  if (statusFilter === "draft") {
    query = query.eq("send_count", 0);
  } else if (statusFilter === "sent") {
    query = query.gt("send_count", 0);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: templates, count } = await query.range(from, to);

  return (
    <div>
      <EmailTemplateList
        initialTemplates={(templates ?? []) as never[]}
        statusFilter={statusFilter}
        totalCount={count ?? 0}
        page={page}
        pageSize={pageSize}
      />
    </div>
  );
}
