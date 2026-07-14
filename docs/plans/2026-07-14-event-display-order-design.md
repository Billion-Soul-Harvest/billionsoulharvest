# Event Display Order Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow admins to drag-and-drop reorder upcoming events from the admin events page, with a preview tab matching the public site.

**Architecture:** Add `display_order` column to events table. Admin events page gets two tabs: "All Events" (existing) and "Display Order" (drag-and-drop preview). Public gatherings page sorts by display_order then start_date.

**Tech Stack:** Supabase migration, @dnd-kit/core + @dnd-kit/sortable (already installed), Next.js server components + client components.

---

### Task 1: Database Migration — Add display_order Column

**Files:**
- Create: `supabase/migrations/045_event_display_order.sql`

**Step 1: Create the migration file**

```sql
-- Add display_order column for manual event ordering on public site
ALTER TABLE events ADD COLUMN display_order INT DEFAULT NULL;
```

**Step 2: Apply migration locally**

Run: `npx supabase migration up`
Expected: Migration applies successfully.

**Step 3: Commit**

```bash
git add supabase/migrations/045_event_display_order.sql
git commit -m "feat: add display_order column to events table"
```

---

### Task 2: Update TypeScript Types

**Files:**
- Modify: `src/shared/types/database.ts:97-122` (Event interface)

**Step 1: Add display_order to Event interface**

In `src/shared/types/database.ts`, add `display_order: number | null;` to the `Event` interface, after `external_url`:

```typescript
export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  long_description: string | null;
  location: string | null;
  address: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  postal_code: string | null;
  start_date: string | null;
  end_date: string | null;
  status: EventStatus;
  event_type: EventType;
  is_external: boolean;
  external_url: string | null;
  display_order: number | null;
  banner_url: string | null;
  page_content: Record<string, unknown> | null;
  max_registrations: number | null;
  registration_fee_cents: number;
  registration_config: RegistrationConfig | null;
  created_at: string;
  updated_at: string;
}
```

**Step 2: Commit**

```bash
git add src/shared/types/database.ts
git commit -m "feat: add display_order to Event type"
```

---

### Task 3: Update Public Gatherings Page Sort Order

**Files:**
- Modify: `src/app/(static-site)/static-render/gatherings/page.tsx:10-17`

**Step 1: Change query to sort by display_order first, then start_date**

Replace the existing query (lines 10-17):

```typescript
const { data: events } = await supabase
  .from("events")
  .select(
    "id, title, slug, start_date, end_date, city, country, banner_url, status, is_external, external_url, display_order"
  )
  .in("status", ["published", "registration_open", "registration_closed"])
  .order("display_order", { ascending: true, nullsFirst: false })
  .order("start_date", { ascending: true });
```

Key changes:
- Added `display_order` to the select
- Primary sort: `display_order ASC NULLS LAST`
- Secondary sort: `start_date ASC`

**Step 2: Commit**

```bash
git add src/app/(static-site)/static-render/gatherings/page.tsx
git commit -m "feat: sort public gatherings by display_order then start_date"
```

---

### Task 4: Admin Events Page — Add Tabs and Fetch Display Order Events

**Files:**
- Modify: `src/app/admin/events/page.tsx`

**Step 1: Add a second query for display-order events and pass both datasets plus a tab layout**

Replace the entire file with:

```typescript
import { createClient } from "@/shared/utils/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import { EventsList } from "@/features/events/admin/events-list";
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
```

**Step 2: Commit**

```bash
git add src/app/admin/events/page.tsx
git commit -m "feat: add display order query to admin events page"
```

---

### Task 5: Create EventsPageTabs Component

**Files:**
- Create: `src/features/events/admin/events-page-tabs.tsx`

**Step 1: Create the tabs component that switches between All Events and Display Order**

```typescript
"use client";

import { useState } from "react";
import { EventsList } from "./events-list";
import { DisplayOrderList } from "./display-order-list";

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
  events: EventRow[];
  displayOrderEvents: DisplayOrderEvent[];
  registrationCounts: Record<string, number>;
}

export function EventsPageTabs({ events, displayOrderEvents, registrationCounts }: Props) {
  const [activeTab, setActiveTab] = useState<"all" | "display-order">("all");

  return (
    <div>
      <div className="flex gap-1 mb-6 border-b">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "all"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          All Events
        </button>
        <button
          onClick={() => setActiveTab("display-order")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "display-order"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Display Order
        </button>
      </div>

      {activeTab === "all" ? (
        <EventsList events={events} registrationCounts={registrationCounts} />
      ) : (
        <DisplayOrderList events={displayOrderEvents} />
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/features/events/admin/events-page-tabs.tsx
git commit -m "feat: create EventsPageTabs component"
```

---

### Task 6: Create DisplayOrderList Component (Drag-and-Drop Preview)

**Files:**
- Create: `src/features/events/admin/display-order-list.tsx`

This is the main component. It renders event cards styled like the public "Upcoming Gatherings" section, wrapped in @dnd-kit sortable context for drag-and-drop reordering. It has a "Save Order" button that persists changes.

**Step 1: Create the component**

```typescript
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

    // Update each event's display_order
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
      {/* Header with save button */}
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

      {/* Preview section styled like public site */}
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
```

**Step 2: Commit**

```bash
git add src/features/events/admin/display-order-list.tsx
git commit -m "feat: create DisplayOrderList with drag-and-drop reordering"
```

---

### Task 7: Verify End-to-End

**Step 1: Start dev server and verify**

Run: `npm run dev`

1. Go to `/admin/events` — verify two tabs appear
2. Click "Display Order" tab — verify only published/registration_open/closed events show
3. Drag a card to reorder — verify cards move
4. Click "Save Order" — verify it saves
5. Check public gatherings page — verify new order is reflected

**Step 2: Final commit with all changes**

```bash
git add -A
git commit -m "feat: add event display order reordering from admin page"
```
