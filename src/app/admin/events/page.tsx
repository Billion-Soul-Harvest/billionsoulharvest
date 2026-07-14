import { createClient } from "@/shared/utils/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import { EventsPageTabs } from "@/features/events/admin/events-page-tabs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Events — BSH Admin",
};

export default async function EventsPage() {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("events")
    .select("id, title, description, slug, status, event_type, start_date, city, country, external_url")
    .order("created_at", { ascending: false });

  // Events for display order tab (visible events only)
  const { data: displayOrderEvents } = await supabase
    .from("events")
    .select("id, title, slug, start_date, end_date, city, country, banner_url, status, is_external, external_url, display_order")
    .in("status", ["published", "registration_open", "registration_closed"])
    .order("display_order", { ascending: true, nullsFirst: false })
    .order("start_date", { ascending: true });

  // Get registration counts per event
  const { data: regCounts } = await supabase
    .from("registrations")
    .select("event_id")
    .neq("status", "cancelled");

  const countMap: Record<string, number> = {};
  regCounts?.forEach((r) => {
    countMap[r.event_id] = (countMap[r.event_id] ?? 0) + 1;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Events</h1>
        <Link href="/admin/events/new">
          <Button>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Event
          </Button>
        </Link>
      </div>

      <EventsPageTabs
        events={events ?? []}
        displayOrderEvents={displayOrderEvents ?? []}
        registrationCounts={countMap}
      />
    </div>
  );
}
