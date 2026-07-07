import { createClient } from "@/shared/utils/supabase/server";
import { TagsManager } from "@/features/tags/tags-manager";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tags — BSH Admin",
};

interface Props {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    sort?: string;
    dir?: string;
  }>;
}

export default async function TagsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = [25, 50, 100].includes(Number(params.pageSize))
    ? Number(params.pageSize)
    : 25;
  const search = params.search ?? "";

  const SORTABLE_COLUMNS = ["name", "contact_count", "created_at"] as const;
  type SortColumn = (typeof SORTABLE_COLUMNS)[number];
  const sort: SortColumn = SORTABLE_COLUMNS.includes(params.sort as SortColumn)
    ? (params.sort as SortColumn)
    : "created_at";
  const dir = params.dir === "asc" ? "asc" : "desc";

  const supabase = await createClient();

  let query = supabase.rpc("get_tags_with_counts", undefined, {
    count: "exact",
  });

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: tags, count } = await query
    .order(sort, { ascending: dir === "asc" })
    .range(from, to);

  return (
    <TagsManager
      tags={tags ?? []}
      totalCount={count ?? 0}
      page={page}
      pageSize={pageSize}
      search={search}
      sort={sort}
      dir={dir}
    />
  );
}
