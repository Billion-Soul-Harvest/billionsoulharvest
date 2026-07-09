# Google Places Location Autocomplete — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Google Places Autocomplete to the event form so users can search for venues and auto-populate location fields (venue, address, city, region, country, postal code).

**Architecture:** A new `GooglePlacesInput` client component wraps the Google Places Autocomplete API. When a place is selected, it extracts address components and calls back to the parent form. The event form's Location & Dates section is redesigned with a search bar + auto-filled editable fields. DB migration adds `address`, `postal_code`, `region` text columns and drops `region_id` FK.

**Tech Stack:** `@googlemaps/js-api-loader`, Google Places API (New), Next.js client components, Supabase migrations.

---

### Task 1: Install dependency and add API key config

**Files:**
- Modify: `package.json`
- Modify: `.env.local.example`
- Modify: `.env.local`

**Step 1: Install @googlemaps/js-api-loader**

Run: `npm install @googlemaps/js-api-loader`

**Step 2: Add API key to .env.local.example**

Add this line to `.env.local.example`:
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

**Step 3: Add actual API key to .env.local**

Ask user for their Google Maps API key and add:
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<actual-key>
```

**Step 4: Commit**

```bash
git add package.json package-lock.json .env.local.example
git commit -m "feat: add @googlemaps/js-api-loader for Places autocomplete"
```

---

### Task 2: Database migration — add location columns, drop region_id

**Files:**
- Create: `supabase/migrations/031_event_location_fields.sql`

**Step 1: Write the migration**

```sql
-- Add new location detail columns to events
ALTER TABLE events ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS postal_code text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS region text;

-- Drop the region_id foreign key (ministry_regions table stays intact)
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_region_id_fkey;
ALTER TABLE events DROP COLUMN IF EXISTS region_id;
```

**Step 2: Apply the migration**

Run: `npx supabase migration up`

**Step 3: Commit**

```bash
git add supabase/migrations/031_event_location_fields.sql
git commit -m "feat: add address/postal_code/region columns, drop region_id from events"
```

---

### Task 3: Update TypeScript types

**Files:**
- Modify: `src/shared/types/database.ts` (lines 97-118, Event interface)

**Step 1: Update Event interface**

Replace in `src/shared/types/database.ts`:

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
  banner_url: string | null;
  page_content: Record<string, unknown> | null;
  max_registrations: number | null;
  registration_fee_cents: number;
  registration_config: RegistrationConfig | null;
  created_at: string;
  updated_at: string;
}
```

Note: `region_id` removed, `address`, `region`, `postal_code` added.

**Step 2: Commit**

```bash
git add src/shared/types/database.ts
git commit -m "feat: update Event type with new location fields"
```

---

### Task 4: Create GooglePlacesInput component

**Files:**
- Create: `src/features/events/google-places-input.tsx`

**Step 1: Create the component**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

export interface PlaceResult {
  venue: string;
  address: string;
  city: string;
  region: string;
  country: string;
  postalCode: string;
}

interface Props {
  onPlaceSelect: (place: PlaceResult) => void;
}

export function GooglePlacesInput({ onPlaceSelect }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || !inputRef.current) return;

    const loader = new Loader({
      apiKey,
      version: "weekly",
      libraries: ["places"],
    });

    let autocomplete: google.maps.places.Autocomplete | null = null;

    loader.importLibrary("places").then(() => {
      if (!inputRef.current) return;
      setLoaded(true);

      autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        types: ["establishment", "geocode"],
        fields: ["name", "formatted_address", "address_components"],
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete?.getPlace();
        if (!place?.address_components) return;

        const get = (type: string): string => {
          const comp = place.address_components?.find((c) =>
            c.types.includes(type)
          );
          return comp?.long_name ?? "";
        };

        onPlaceSelect({
          venue: place.name ?? "",
          address: place.formatted_address ?? "",
          city:
            get("locality") ||
            get("administrative_area_level_2") ||
            get("sublocality_level_1"),
          region: get("administrative_area_level_1"),
          country: get("country"),
          postalCode: get("postal_code"),
        });

        // Clear the search input after selection
        if (inputRef.current) inputRef.current.value = "";
      });
    });

    return () => {
      if (autocomplete) {
        google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, [onPlaceSelect]);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <p className="text-xs text-amber-600">
        Google Maps API key not configured. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local
      </p>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        ref={inputRef}
        type="text"
        placeholder={loaded ? "Search for a venue or address..." : "Loading..."}
        disabled={!loaded}
        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#29BDD6] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
      />
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/features/events/google-places-input.tsx
git commit -m "feat: add GooglePlacesInput component with Places Autocomplete"
```

---

### Task 5: Update event form — replace Location & Dates section

**Files:**
- Modify: `src/features/events/event-form.tsx` (lines 1-50 imports/interfaces, lines 81-95 form state, lines 114-130 payload, lines 234-271 Location section)

**Step 1: Update imports — add GooglePlacesInput, remove SearchableSelect**

At top of `event-form.tsx`, add import:
```tsx
import { GooglePlacesInput, type PlaceResult } from "@/features/events/google-places-input";
```

Remove the `SearchableSelect` import (line 17) and the `Region` interface (lines 23-26).

**Step 2: Update EventData interface**

Replace the EventData interface (lines 28-44):
```tsx
interface EventData {
  id?: string;
  title: string;
  slug: string;
  description: string;
  location: string;
  address: string;
  city: string;
  region: string;
  country: string;
  postal_code: string;
  start_date: string;
  end_date: string;
  event_type: EventType;
  status: EventStatus;
  max_registrations: string;
  banner_url: string;
  registration_config?: RegistrationConfig | null;
}
```

Note: `region_id` removed, `address`, `region`, `postal_code` added.

**Step 3: Update Props interface**

Remove `regions` from Props:
```tsx
interface Props {
  event?: EventData;
}
```

**Step 4: Update component signature and form state**

Change `export function EventForm({ event, regions }: Props)` to `export function EventForm({ event }: Props)`.

Update the `form` useState default (lines 81-95) — remove `region_id`, add new fields:
```tsx
const [form, setForm] = useState<EventData>({
  title: event?.title ?? "",
  slug: event?.slug ?? "",
  description: event?.description ?? "",
  location: event?.location ?? "",
  address: event?.address ?? "",
  city: event?.city ?? "",
  region: event?.region ?? "",
  country: event?.country ?? "",
  postal_code: event?.postal_code ?? "",
  start_date: event?.start_date ?? "",
  end_date: event?.end_date ?? "",
  event_type: event?.event_type ?? "conference",
  status: event?.status ?? "draft",
  max_registrations: event?.max_registrations ?? "",
  banner_url: event?.banner_url ?? "",
});
```

**Step 5: Add handlePlaceSelect callback**

After the `updateField` function, add:
```tsx
function handlePlaceSelect(place: PlaceResult) {
  setForm((prev) => ({
    ...prev,
    location: place.venue,
    address: place.address,
    city: place.city,
    region: place.region,
    country: place.country,
    postal_code: place.postalCode,
  }));
}
```

**Step 6: Update the submit payload**

Replace the payload object (lines 115-130):
```tsx
const payload = {
  title: form.title,
  slug: form.slug,
  description: form.description || null,
  location: form.location || null,
  address: form.address || null,
  city: form.city || null,
  region: form.region || null,
  country: form.country || null,
  postal_code: form.postal_code || null,
  start_date: form.start_date || null,
  end_date: form.end_date || null,
  event_type: form.event_type,
  status: form.status,
  max_registrations: form.max_registrations ? parseInt(form.max_registrations) : null,
  banner_url: form.banner_url || null,
  registration_config: regConfig,
};
```

Note: `region_id` removed, new fields added.

**Step 7: Replace the Location & Dates section (lines 234-271)**

Replace with:
```tsx
<div className="bg-white rounded-xl border p-6 space-y-4">
  <h3 className="font-semibold text-gray-900">Location & Dates</h3>

  <GooglePlacesInput onPlaceSelect={handlePlaceSelect} />

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div className="sm:col-span-2 space-y-1.5">
      <Label>Venue / Location</Label>
      <Input value={form.location} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("location", e.target.value)} />
    </div>
    <div className="sm:col-span-2 space-y-1.5">
      <Label>Address</Label>
      <Input value={form.address} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("address", e.target.value)} />
    </div>
    <div className="space-y-1.5">
      <Label>City</Label>
      <Input value={form.city} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("city", e.target.value)} />
    </div>
    <div className="space-y-1.5">
      <Label>Region</Label>
      <Input value={form.region} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("region", e.target.value)} />
    </div>
    <div className="space-y-1.5">
      <Label>Country</Label>
      <Input value={form.country} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("country", e.target.value)} />
    </div>
    <div className="space-y-1.5">
      <Label>Postal Code</Label>
      <Input value={form.postal_code} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("postal_code", e.target.value)} />
    </div>
    <div className="space-y-1.5">
      <Label>Start Date</Label>
      <Input type="date" value={form.start_date} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("start_date", e.target.value)} />
    </div>
    <div className="space-y-1.5">
      <Label>End Date</Label>
      <Input type="date" value={form.end_date} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("end_date", e.target.value)} />
    </div>
  </div>
</div>
```

**Step 8: Commit**

```bash
git add src/features/events/event-form.tsx
git commit -m "feat: integrate Google Places autocomplete into event form"
```

---

### Task 6: Update parent pages — remove regions prop

**Files:**
- Modify: `src/app/admin/events/new/page.tsx`
- Modify: `src/app/admin/events/edit/[id]/page.tsx`

**Step 1: Update new event page**

In `src/app/admin/events/new/page.tsx`, remove the regions query and prop:

```tsx
import { EventForm } from "@/features/events/event-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Event — BSH Admin",
};

export default async function NewEventPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Event</h1>
      <EventForm />
    </div>
  );
}
```

**Step 2: Update edit event page**

In `src/app/admin/events/edit/[id]/page.tsx`:
- Remove the `ministry_regions` query (lines 36-39)
- Remove `regions` prop from `<EventForm>` (line 154)
- Add `address`, `region`, `postal_code` to the event prop object (around line 137-155)
- Remove `region_id` from the event prop
- Remove the `createClient` import if no longer needed (it's still needed for event + registrations query)

Updated EventForm usage:
```tsx
<EventForm
  event={{
    id: event.id,
    title: event.title,
    slug: event.slug,
    description: event.description ?? "",
    event_type: event.event_type ?? "conference",
    location: event.location ?? "",
    address: event.address ?? "",
    city: event.city ?? "",
    region: event.region ?? "",
    country: event.country ?? "",
    postal_code: event.postal_code ?? "",
    start_date: event.start_date ?? "",
    end_date: event.end_date ?? "",
    status: event.status as EventStatus,
    max_registrations: event.max_registrations?.toString() ?? "",
    banner_url: event.banner_url ?? "",
    registration_config: event.registration_config as RegistrationConfig | null,
  }}
/>
```

**Step 3: Commit**

```bash
git add src/app/admin/events/new/page.tsx src/app/admin/events/edit/[id]/page.tsx
git commit -m "feat: remove regions prop from event form parent pages"
```

---

### Task 7: Clean up stale region_id references

**Files to check and update:**
- `src/features/campaigns/segment-builder.tsx` — may reference region_id for events (check if it's for contacts, which still has region_id)
- `src/shared/utils/segment-query.ts` — same check

These files likely reference `region_id` on **contacts** (not events), so they should be fine. Verify and only change if they reference `events.region_id`.

**Step 1: Verify no remaining event region_id references**

Run: `grep -rn "region_id" src/ --include="*.tsx" --include="*.ts" | grep -i event`

Fix any references found.

**Step 2: Commit if changes were needed**

```bash
git commit -m "fix: clean up stale event region_id references"
```

---

### Task 8: Manual testing

**Step 1: Start dev server**

Run: `npm run dev`

**Step 2: Test new event form**
- Navigate to `/admin/events/new`
- Verify the Google Places search bar appears
- Type a venue name (e.g., "Westminster Chapel London")
- Select from dropdown
- Verify Venue, Address, City, Region, Country, Postal Code auto-fill
- Verify all fields are editable after auto-fill
- Verify form submits successfully

**Step 3: Test edit event form**
- Navigate to an existing event's edit page
- Verify existing location data loads correctly
- Verify Places search works for updating location
- Verify form saves correctly

**Step 4: Test without API key**
- Temporarily remove `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- Verify graceful fallback message appears
- Verify manual entry still works
