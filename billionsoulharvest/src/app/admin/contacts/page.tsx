import { createClient } from "@/shared/utils/supabase/server";
import { sanitizeSearch } from "@/shared/utils/sanitize-search";
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
    searchField?: string;
    type?: string;
    region?: string;
    position?: string;
    language?: string;
    list?: string;
    tag?: string;
    tagMode?: string;
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
  const SEARCH_FIELDS = ["name_email", "email", "first_name", "last_name", "job_title", "church_name", "city", "country"] as const;
  type SearchField = (typeof SEARCH_FIELDS)[number];
  const searchField: SearchField = SEARCH_FIELDS.includes(params.searchField as SearchField) ? (params.searchField as SearchField) : "name_email";
  const typeFilter = params.type ?? "all";
  const regionFilter = params.region ?? "all";
  const positionFilter = params.position ?? "all";
  const languageFilter = params.language ?? "all";
  const listFilter = params.list ?? "all";
  const tagFilter = params.tag ?? "";
  const tagMode = params.tagMode === "or" ? "or" : "and";

  const SORTABLE_COLUMNS = ["first_name", "email", "contact_type", "church_name", "created_at", "updated_at"] as const;
  type SortColumn = (typeof SORTABLE_COLUMNS)[number];
  const sortParam = params.sort as string | undefined;
  const sort: SortColumn = SORTABLE_COLUMNS.includes(sortParam as SortColumn) ? (sortParam as SortColumn) : "created_at";
  const dir = params.dir === "asc" ? "asc" : "desc";

  const supabase = await createClient();

  let query = supabase
    .from("contacts")
    .select("*, region:ministry_regions(id, name, color), position:positions(id, name)", { count: "exact" });

  if (search) {
    const s = sanitizeSearch(search);
    switch (searchField) {
      case "email":
        query = query.ilike("email", `%${s}%`);
        break;
      case "first_name":
        query = query.ilike("first_name", `%${s}%`);
        break;
      case "last_name":
        query = query.ilike("last_name", `%${s}%`);
        break;
      case "job_title":
        query = query.ilike("job_title", `%${s}%`);
        break;
      case "church_name":
        query = query.ilike("church_name", `%${s}%`);
        break;
      case "city":
        query = query.ilike("city", `%${s}%`);
        break;
      case "country":
        query = query.ilike("country", `%${s}%`);
        break;
      default:
        query = query.or(
          `first_name.ilike.%${s}%,last_name.ilike.%${s}%,email.ilike.%${s}%`
        );
    }
  }

  if (typeFilter !== "all") {
    query = query.eq("contact_type", typeFilter);
  }

  if (regionFilter !== "all") {
    query = query.eq("region_id", regionFilter);
  }

  if (positionFilter !== "all") {
    query = query.eq("position_id", positionFilter);
  }

  if (languageFilter !== "all") {
    query = query.eq("language", languageFilter);
  }

  if (listFilter === "__none__") {
    query = query.or("email_lists.is.null,email_lists.eq.{}");
  } else if (listFilter !== "all") {
    const selectedLists = listFilter.split(",").map((l) => l.trim()).filter(Boolean);
    if (selectedLists.length > 0) {
      query = query.overlaps("email_lists", selectedLists);
    }
  }

  if (tagFilter) {
    const selectedTags = tagFilter.split(",").map((t) => t.trim()).filter(Boolean);
    if (selectedTags.length > 0) {
      if (tagMode === "or") {
        query = query.overlaps("tags", selectedTags);
      } else {
        query = query.contains("tags", selectedTags);
      }
    }
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const [
    { data: contacts, count },
    { data: regions },
    { data: positions },
    { data: languageRows },
    { data: audienceLists },
    { data: tagRows },
  ] = await Promise.all([
    query.order(sort, { ascending: dir === "asc" }).range(from, to),
    supabase.from("ministry_regions").select("id, name, color").order("name"),
    supabase.from("positions").select("id, name").order("name"),
    supabase.from("contacts").select("language").not("language", "is", null).not("language", "eq", "").order("language"),
    supabase.from("audiences").select("name").eq("type", "list").order("name"),
    supabase.from("contacts").select("tags").not("tags", "eq", "{}"),
  ]);

  const languages = [...new Set((languageRows ?? []).map((r) => r.language as string))];
  const listNames = (audienceLists ?? []).map((a) => a.name);
  const allTags = [...new Set((tagRows ?? []).flatMap((r) => (r.tags as string[]) ?? []))].sort();

  return (
    <div>
      <ContactsListClient
        contacts={contacts ?? []}
        regions={regions ?? []}
        positions={positions ?? []}
        totalCount={count ?? 0}
        page={page}
        pageSize={pageSize}
        search={search}
        searchField={searchField}
        typeFilter={typeFilter}
        regionFilter={regionFilter}
        positionFilter={positionFilter}
        languageFilter={languageFilter}
        listFilter={listFilter}
        tagFilter={tagFilter}
        tagMode={tagMode}
        languages={languages}
        listNames={listNames}
        allTags={allTags}
        sort={sort}
        dir={dir}
      />
    </div>
  );
}
