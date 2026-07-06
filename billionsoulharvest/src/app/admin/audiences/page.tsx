import { createClient } from "@/shared/utils/supabase/server";
import { buildSegmentQuery } from "@/shared/utils/segment-query";
import { AudiencesClient } from "@/features/audiences/audiences-list";
import type { Audience, SegmentFilter } from "@/shared/types/database";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Audiences — BSH Admin",
};

interface Props {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    type?: string;
  }>;
}

export default async function AudiencesPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = [25, 50, 100].includes(Number(params.pageSize))
    ? Number(params.pageSize)
    : 25;
  const search = params.search ?? "";
  const typeFilter = params.type ?? "all";

  const supabase = await createClient();

  // Build query with filters
  let query = supabase
    .from("audiences")
    .select("*", { count: "exact" })
    .order("is_favorite", { ascending: false })
    .order("name");

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  if (typeFilter === "list" || typeFilter === "segment") {
    query = query.eq("type", typeFilter);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data: audiences, count: totalCount } = await query.range(from, to);

  // Get list-type contact counts and email counts via RPC
  const [{ data: listCounts }, { data: emailCounts }] = await Promise.all([
    supabase.rpc("audience_list_counts"),
    supabase.rpc("audience_list_email_counts"),
  ]);
  const listCountMap: Record<string, number> = {};
  listCounts?.forEach((row: { list_name: string; contact_count: number }) => {
    listCountMap[row.list_name] = row.contact_count;
  });
  const emailCountMap: Record<string, number> = {};
  emailCounts?.forEach((row: { list_name: string; email_count: number }) => {
    emailCountMap[row.list_name] = row.email_count;
  });

  // Get segment-type contact counts for current page
  const segmentCountMap: Record<string, number> = {};
  const segmentAudiences = (audiences ?? []).filter(
    (a: Audience) => a.type === "segment" && a.segment_filter
  );
  await Promise.all(
    segmentAudiences.map(async (a: Audience) => {
      const { count } = await buildSegmentQuery(
        supabase,
        a.segment_filter as SegmentFilter,
        { countOnly: true }
      );
      segmentCountMap[a.id] = count ?? 0;
    })
  );

  // Build contact counts and email counts maps keyed by audience id
  const contactCounts: Record<string, number> = {};
  const audienceEmailCounts: Record<string, number> = {};
  (audiences ?? []).forEach((a: Audience) => {
    if (a.type === "list") {
      contactCounts[a.id] = listCountMap[a.name] ?? 0;
      audienceEmailCounts[a.id] = emailCountMap[a.name] ?? 0;
    } else {
      contactCounts[a.id] = segmentCountMap[a.id] ?? 0;
      audienceEmailCounts[a.id] = segmentCountMap[a.id] ?? 0;
    }
  });

  // Stats: new contacts in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const { count: newContactsCount } = await supabase
    .from("contacts")
    .select("*", { count: "exact", head: true })
    .gte("created_at", thirtyDaysAgo.toISOString())
    .not("email", "is", null);

  // Total subscribed (has email, not unsubscribed)
  const { count: subscribedCount } = await supabase
    .from("contacts")
    .select("*", { count: "exact", head: true })
    .not("email", "is", null)
    .eq("email_unsubscribed", false);

  // Total unsubscribed
  const { count: unsubscribedCount } = await supabase
    .from("contacts")
    .select("*", { count: "exact", head: true })
    .not("email", "is", null)
    .eq("email_unsubscribed", true);

  return (
    <AudiencesClient
      audiences={(audiences ?? []) as Audience[]}
      contactCounts={contactCounts}
      emailCounts={audienceEmailCounts}
      totalCount={totalCount ?? 0}
      page={page}
      pageSize={pageSize}
      search={search}
      typeFilter={typeFilter}
      stats={{
        newLast30Days: newContactsCount ?? 0,
        subscribed: subscribedCount ?? 0,
        unsubscribed: unsubscribedCount ?? 0,
      }}
    />
  );
}
