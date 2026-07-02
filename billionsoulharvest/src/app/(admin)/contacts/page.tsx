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

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: contacts, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  const { data: regions } = await supabase
    .from("ministry_regions")
    .select("id, name, color")
    .order("name");

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
      />
    </div>
  );
}
