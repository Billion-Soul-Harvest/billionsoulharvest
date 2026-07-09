import { createClient } from "@/shared/utils/supabase/server";
import { sanitizeSearch } from "@/shared/utils/sanitize-search";
import { ListDetailPage } from "@/features/audiences/list-detail";
import { notFound } from "next/navigation";
import type { Audience } from "@/shared/types/database";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "List Detail — BSH Admin",
};

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
  }>;
}

export default async function ListPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const pageSize = [25, 50, 100].includes(Number(sp.pageSize))
    ? Number(sp.pageSize)
    : 25;
  const search = sp.search ?? "";

  const supabase = await createClient();

  const { data: audience } = await supabase
    .from("audiences")
    .select("*")
    .eq("id", id)
    .single();

  if (!audience || audience.type !== "list") {
    notFound();
  }

  // Fetch contacts in this list
  let query = supabase
    .from("contacts")
    .select("id, first_name, last_name, email, phone, contact_type, church_name, city, country, created_at", { count: "exact" })
    .contains("email_lists", [audience.name])
    .order("created_at", { ascending: false });

  if (search) {
    const s = sanitizeSearch(search);
    query = query.or(
      `first_name.ilike.%${s}%,last_name.ilike.%${s}%,email.ilike.%${s}%`
    );
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data: contacts, count: totalCount } = await query.range(from, to);

  return (
    <ListDetailPage
      audience={audience as Audience}
      contacts={contacts ?? []}
      totalCount={totalCount ?? 0}
      page={page}
      pageSize={pageSize}
      search={search}
    />
  );
}
