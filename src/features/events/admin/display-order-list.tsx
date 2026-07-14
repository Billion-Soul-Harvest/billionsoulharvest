"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createClient } from "@/shared/utils/supabase/client";

interface DisplayOrderEvent {
  id: string;
  title: string;
  slug: string;
  start_date: string | null;
  end_date: string | null;
  city: string | null;
  country: string | null;
  banner_url: string | null;
  status: string;
  is_external: boolean;
  external_url: string | null;
  display_order: number | null;
}

interface Props {
  events: DisplayOrderEvent[];
}

function formatDateRange(start_date: string | null, end_date: string | null) {
  if (!start_date) return null;
  const start = new Date(start_date);
  const end = end_date ? new Date(end_date) : null;
  if (end && end.toISOString().slice(0, 10) !== start.toISOString().slice(0, 10)) {
    return `${start.toLocaleDateString("en-US", { month: "long", day: "numeric" })}\u2013${end.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`;
  }
  return start.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function SortableEventCard({ event, isDragOverlay }: { event: DisplayOrderEvent; isDragOverlay?: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: event.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const dateStr = formatDateRange(event.start_date, event.end_date);
  const location = [event.city, event.country].filter(Boolean).join(", ");

  return (
    <div
      ref={setNodeRef}
      style={isDragOverlay ? undefined : style}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-2xl border border-[#b4c7ec]/30 overflow-hidden flex flex-col cursor-grab active:cursor-grabbing ${
        isDragOverlay ? "shadow-2xl ring-2 ring-blue-400" : "hover:shadow-lg hover:border-[#00b8d4]/30"
      } transition-all duration-300`}
    >
      {event.banner_url && (
        <div className="relative w-full h-48">
          <Image
            src={event.banner_url}
            alt={event.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      )}
      <div className="p-6 flex flex-col flex-1">
        {(event.status === "registration_open" || event.status === "registration_closed") && (
          <span
            className={`inline-block w-fit text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${
              event.status === "registration_open"
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {event.status === "registration_open" ? "Registration Open" : "Registration Closed"}
          </span>
        )}
        <h3 className="text-lg font-bold text-[#0d223f] mb-2">{event.title}</h3>
        {dateStr && (
          <p className="text-sm font-semibold text-[#00b8d4] mb-1">{dateStr}</p>
        )}
        {location && (
          <p className="text-sm text-[#44474d] mb-4">{location}</p>
        )}
        <div className="mt-auto">
          <span className="inline-flex items-center gap-1 text-[#00b8d4] text-sm font-semibold">
            Learn More &rarr;
          </span>
        </div>
      </div>
    </div>
  );
}

export function DisplayOrderList({ events: initialEvents }: Props) {
  const router = useRouter();
  const [events, setEvents] = useState(initialEvents);
  const [activeEvent, setActiveEvent] = useState<DisplayOrderEvent | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveEvent(events.find((e) => e.id === event.active.id) ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveEvent(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setEvents((prev) => {
      const oldIndex = prev.findIndex((e) => e.id === active.id);
      const newIndex = prev.findIndex((e) => e.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
    setHasChanges(true);
  }

  async function saveOrder() {
    setSaving(true);
    const supabase = createClient();

    const updates = events.map((e, i) => ({
      id: e.id,
      display_order: i + 1,
    }));

    for (const { id, display_order } of updates) {
      const { error } = await supabase
        .from("events")
        .update({ display_order })
        .eq("id", id);
      if (error) {
        alert(`Failed to save order: ${error.message}`);
        setSaving(false);
        return;
      }
    }

    setHasChanges(false);
    setSaving(false);
    router.refresh();
  }

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#b4c7ec]/30 p-12 text-center">
        <p className="text-lg text-[#44474d]">
          No published events to order. Publish events to see them here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">
          Drag and drop to reorder how events appear on the public site.
        </p>
        <button
          onClick={saveOrder}
          disabled={!hasChanges || saving}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            hasChanges
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {saving ? "Saving..." : "Save Order"}
        </button>
      </div>

      <div className="bg-[#f9f9ff] rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-[#0d223f] tracking-[-0.02em] mb-8">
          Upcoming Gatherings
        </h2>

        <DndContext
          id="display-order-dnd"
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={events.map((e) => e.id)} strategy={rectSortingStrategy}>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <SortableEventCard key={event.id} event={event} />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeEvent ? (
              <SortableEventCard event={activeEvent} isDragOverlay />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
