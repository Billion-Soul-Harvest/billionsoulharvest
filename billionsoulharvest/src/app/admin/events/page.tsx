import { createClient } from "@/shared/utils/supabase/server";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import type { EventStatus, EventType } from "@/shared/types/database";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Events — BSH Admin",
};

const statusColors: Record<EventStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  published: "bg-blue-100 text-blue-700",
  registration_open: "bg-green-100 text-green-700",
  registration_closed: "bg-amber-100 text-amber-700",
  completed: "bg-purple-100 text-purple-700",
  cancelled: "bg-red-100 text-red-700",
};

const eventTypeLabels: Record<EventType, string> = {
  service: "Service",
  conference: "Conference",
  workshop: "Workshop",
  social: "Social",
  prayer_meeting: "Prayer Meeting",
  youth_event: "Youth Event",
  training: "Training",
  church_anniversary: "Church Anniversary",
  other: "Other",
};

const eventTypeColors: Record<EventType, string> = {
  service: "#3b82f6",
  conference: "#8b5cf6",
  workshop: "#22c55e",
  social: "#f472b6",
  prayer_meeting: "#f97316",
  youth_event: "#ef4444",
  training: "#a855f7",
  church_anniversary: "#ec4899",
  other: "#6b7280",
};

const statusLabels: Record<EventStatus, string> = {
  draft: "Draft",
  published: "Published",
  registration_open: "Registration Open",
  registration_closed: "Registration Closed",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default async function EventsPage() {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("events")
    .select("*")
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

      <div className="grid gap-4">
        {events && events.length > 0 ? (
          events.map((event) => (
            <Link
              key={event.id}
              href={`/admin/events/edit/${event.id}`}
              className="bg-white rounded-xl border p-5 hover:shadow-md transition-shadow block"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{event.title}</h3>
                    {event.event_type && (
                      <span className="flex items-center gap-1.5 text-xs text-gray-500">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: eventTypeColors[event.event_type as EventType] ?? "#6b7280" }} />
                        {eventTypeLabels[event.event_type as EventType] ?? event.event_type}
                      </span>
                    )}
                    <Badge variant="secondary" className={statusColors[event.status as EventStatus]}>
                      {statusLabels[event.status as EventStatus]}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-1">{event.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    {event.start_date && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(event.start_date + "T00:00:00").toLocaleDateString()}
                      </span>
                    )}
                    {event.city && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {event.city}, {event.country}
                      </span>
                    )}
                    {event.external_url && (
                      <span className="flex items-center gap-1 text-blue-500">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        External
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-2xl font-bold text-gray-900">{countMap[event.id] ?? 0}</p>
                  <p className="text-xs text-gray-400">registrations</p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="bg-white rounded-xl border p-12 text-center text-gray-400">
            No events yet. Create your first event.
          </div>
        )}
      </div>
    </div>
  );
}
