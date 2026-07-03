import { createClient } from "@/shared/utils/supabase/server";
import { ContactsListClient } from "@/features/contacts/contacts-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacts — BSH Admin",
};

interface Props {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    type?: string;
    region?: string;
    language?: string;
    sort?: string;
    dir?: string;
  }>;
}

export default async function ContactsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = [25, 50, 100].includes(Number(params.pageSize))
    ? Number(params.pageSize)
    : 25;
  const search = params.search ?? "";
  const typeFilter = params.type ?? "all";
  const regionFilter = params.region ?? "all";
  const languageFilter = params.language ?? "all";

  const SORTABLE_COLUMNS = ["first_name", "email", "contact_type", "church_name", "created_at"] as const;
  type SortColumn = (typeof SORTABLE_COLUMNS)[number];
  const sortParam = params.sort as string | undefined;
  const sort: SortColumn = SORTABLE_COLUMNS.includes(sortParam as SortColumn) ? (sortParam as SortColumn) : "created_at";
  const dir = params.dir === "asc" ? "asc" : "desc";

  const supabase = await createClient();

  let query = supabase
    .from("contacts")
    .select("*, region:ministry_regions(id, name, color)", { count: "exact" });

  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,church_name.ilike.%${search}%`
    );
  }

  if (typeFilter !== "all") {
    query = query.eq("contact_type", typeFilter);
  }

  if (regionFilter !== "all") {
    query = query.eq("region_id", regionFilter);
  }

  if (languageFilter !== "all") {
    query = query.eq("language", languageFilter);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: contacts, count } = await query
    .order(sort, { ascending: dir === "asc" })
    .range(from, to);

  const { data: regions } = await supabase
    .from("ministry_regions")
    .select("id, name, color")
    .order("name");

  const { data: languageRows } = await supabase
    .from("contacts")
    .select("language")
    .not("language", "is", null)
    .not("language", "eq", "")
    .order("language");

  const languages = [...new Set((languageRows ?? []).map((r) => r.language as string))];

  return (
    <div>
      <ContactsListClient
        contacts={contacts ?? []}
        regions={regions ?? []}
        totalCount={count ?? 0}
        page={page}
        pageSize={pageSize}
        search={search}
        typeFilter={typeFilter}
        regionFilter={regionFilter}
        languageFilter={languageFilter}
        languages={languages}
        sort={sort}
        dir={dir}
      />
    </div>
  );
}
