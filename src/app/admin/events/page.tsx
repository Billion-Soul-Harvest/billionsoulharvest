import { createClient } from "@/shared/utils/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import { EventsList } from "@/features/events/admin/events-list";

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

      <EventsList
        events={events ?? []}
        registrationCounts={countMap}
      />
    </div>
  );
}
