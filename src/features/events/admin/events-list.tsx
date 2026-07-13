"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/shared/utils/supabase/client";
import type { EventStatus, EventType } from "@/shared/types/database";

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

interface EventRow {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  status: string;
  event_type: string | null;
  start_date: string | null;
  city: string | null;
  country: string | null;
  external_url: string | null;
}

interface Props {
  events: EventRow[];
  registrationCounts: Record<string, number>;
}

export function EventsList({ events, registrationCounts }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState<string | null>(null); // single delete id
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [confirmingBulk, setConfirmingBulk] = useState(false);

  const allSelected = events.length > 0 && selected.size === events.length;
  const someSelected = selected.size > 0 && !allSelected;
  const selectAllRef = useCallback((el: HTMLInputElement | null) => {
    if (el) el.indeterminate = someSelected;
  }, [someSelected]);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(events.map((e) => e.id)));
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    const supabase = createClient();
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) {
      alert(`Failed to delete: ${error.message}`);
      setDeleting(null);
      setConfirmingId(null);
      return;
    }
    setConfirmingId(null);
    setDeleting(null);
    router.refresh();
  }

  async function handleBulkDelete() {
    setBulkDeleting(true);
    const supabase = createClient();
    const ids = Array.from(selected);
    const { error } = await supabase.from("events").delete().in("id", ids);
    if (error) {
      alert(`Failed to delete: ${error.message}`);
      setBulkDeleting(false);
      setConfirmingBulk(false);
      return;
    }
    setSelected(new Set());
    setConfirmingBulk(false);
    setBulkDeleting(false);
    router.refresh();
  }

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-12 text-center text-gray-400">
        No events yet. Create your first event.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 bg-gray-50 border rounded-lg px-4 py-2">
          <span className="text-sm text-gray-600">{selected.size} selected</span>
          {confirmingBulk ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-600">
                Delete {selected.size} event{selected.size > 1 ? "s" : ""}?
              </span>
              <Button size="sm" variant="destructive" onClick={handleBulkDelete} disabled={bulkDeleting}>
                {bulkDeleting ? "Deleting..." : "Confirm"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setConfirmingBulk(false)} disabled={bulkDeleting}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="text-red-500 hover:text-red-700"
              onClick={() => setConfirmingBulk(true)}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Selected
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
            Clear
          </Button>
        </div>
      )}

      {/* Header row with select-all */}
      <div className="flex items-center gap-3 px-1">
        <input
          ref={selectAllRef}
          type="checkbox"
          checked={allSelected}
          onChange={toggleAll}
          className="h-4 w-4 rounded border-gray-300 accent-blue-600"
          aria-label="Select all events"
        />
        <span className="text-xs text-gray-400">Select all</span>
      </div>

      {/* Event cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => {
          const typeColor = event.event_type
            ? eventTypeColors[event.event_type as EventType] ?? "#6b7280"
            : "#6b7280";
          return (
            <div
              key={event.id}
              className={`bg-white rounded-xl border overflow-hidden transition-shadow hover:shadow-md ${
                selected.has(event.id) ? "ring-2 ring-blue-200 border-blue-300" : ""
              }`}
            >
              {/* Color banner */}
              <Link href={`/admin/events/edit/${event.id}`} className="block">
                <div
                  className="relative w-full h-24 flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${typeColor}22, ${typeColor}44)` }}
                >
                  <svg className="w-10 h-10" style={{ color: typeColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className={`${statusColors[event.status as EventStatus]} shadow-sm`}>
                      {statusLabels[event.status as EventStatus]}
                    </Badge>
                  </div>
                  <div className="absolute top-2 right-2 bg-white/90 rounded-full px-2.5 py-1 text-xs font-bold text-gray-900 shadow-sm">
                    {registrationCounts[event.id] ?? 0}
                    <span className="font-normal text-gray-500 ml-1">reg.</span>
                  </div>
                </div>
              </Link>

              {/* Card body */}
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected.has(event.id)}
                      onChange={() => toggleSelect(event.id)}
                      className="h-4 w-4 rounded border-gray-300 accent-blue-600"
                      aria-label={`Select ${event.title}`}
                    />
                  </div>

                  <Link
                    href={`/admin/events/edit/${event.id}`}
                    className="flex-1 min-w-0 hover:opacity-80 transition-opacity"
                  >
                    <h3 className="font-semibold text-gray-900 truncate text-sm">{event.title}</h3>
                    {event.event_type && (
                      <span className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: typeColor }} />
                        {eventTypeLabels[event.event_type as EventType] ?? event.event_type}
                      </span>
                    )}
                    {event.description && (
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1">{event.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      {event.start_date && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(event.start_date + "T00:00:00").toLocaleDateString()}
                        </span>
                      )}
                      {event.city && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {event.city}, {event.country}
                        </span>
                      )}
                      {event.external_url && (
                        <span className="flex items-center gap-1 text-blue-500">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          External
                        </span>
                      )}
                    </div>
                  </Link>

                  <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                    {confirmingId === event.id ? (
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(event.id)}
                          disabled={deleting === event.id}
                        >
                          {deleting === event.id ? "..." : "Yes"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setConfirmingId(null)}
                          disabled={deleting === event.id}
                        >
                          No
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-gray-400 hover:text-red-500 h-7 w-7"
                        onClick={() => setConfirmingId(event.id)}
                        title="Delete event"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
