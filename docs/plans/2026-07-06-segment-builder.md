# Segment Builder Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the basic inline segment filter form with a full-page CC-style segment builder featuring a criteria picker dialog, per-field operators, and live contact count.

**Architecture:** Criteria-based filtering stored as `SegmentCriterion[]` inside the existing JSONB `segment_filter` column. All criteria AND'd together. `buildSegmentQuery` extended to handle both old flat shape and new criteria array. Full-page builder at `/admin/audiences/segments/new` and `/admin/audiences/segments/[id]`.

**Tech Stack:** Next.js App Router, Supabase, React, Tailwind CSS, shadcn/ui components.

---

## Task 1: Add `SegmentCriterion` type and criteria definitions

**Files:**
- Modify: `src/shared/types/database.ts:169-177`
- Create: `src/features/audiences/criteria-definitions.ts`

**Step 1: Add SegmentCriterion to database types**

In `src/shared/types/database.ts`, add `SegmentCriterion` above the existing `SegmentFilter` and add `criteria?` field to `SegmentFilter`:

```typescript
// Add before SegmentFilter (line 169)
export interface SegmentCriterion {
  field: string;
  operator: string;
  value: string | string[];
}

export interface SegmentFilter {
  // Existing flat fields (backward compat for campaigns)
  contact_type?: string[];
  region_id?: string;
  language?: string;
  country?: string;
  tags_include?: string[];
  email_lists?: string[];
  contact_ids?: string[];
  // New criteria-based filtering
  criteria?: SegmentCriterion[];
}
```

**Step 2: Create criteria definitions file**

Create `src/features/audiences/criteria-definitions.ts` with the full criteria catalog:

```typescript
export type FieldType = "text" | "select" | "array" | "date";

export interface CriteriaDefinition {
  field: string;
  label: string;
  category: string;
  fieldType: FieldType;
  operators: { value: string; label: string }[];
  options?: { value: string; label: string }[];  // for select fields
}

const textOperators = [
  { value: "is", label: "is" },
  { value: "is_not", label: "is not" },
  { value: "contains", label: "contains" },
  { value: "starts_with", label: "starts with" },
  { value: "is_blank", label: "is blank" },
  { value: "is_not_blank", label: "is not blank" },
];

const selectOperators = [
  { value: "is", label: "is" },
  { value: "is_not", label: "is not" },
];

const arrayOperators = [
  { value: "includes_any", label: "includes any of" },
  { value: "includes_all", label: "includes all of" },
  { value: "not_includes", label: "does not include" },
];

const dateOperators = [
  { value: "is_before", label: "is before" },
  { value: "is_after", label: "is after" },
  { value: "in_last_days", label: "in the last N days" },
];

export const CRITERIA_DEFINITIONS: CriteriaDefinition[] = [
  // Contact profiles (14)
  { field: "first_name", label: "First name", category: "Contact profiles", fieldType: "text", operators: textOperators },
  { field: "last_name", label: "Last name", category: "Contact profiles", fieldType: "text", operators: textOperators },
  { field: "email", label: "Email address", category: "Contact profiles", fieldType: "text", operators: textOperators },
  { field: "phone", label: "Phone", category: "Contact profiles", fieldType: "text", operators: textOperators },
  { field: "city", label: "City", category: "Contact profiles", fieldType: "text", operators: textOperators },
  { field: "state", label: "State", category: "Contact profiles", fieldType: "text", operators: textOperators },
  { field: "country", label: "Country", category: "Contact profiles", fieldType: "text", operators: textOperators },
  { field: "church_name", label: "Church/Organization", category: "Contact profiles", fieldType: "text", operators: textOperators },
  { field: "church_role", label: "Church role", category: "Contact profiles", fieldType: "text", operators: textOperators },
  { field: "job_title", label: "Job title", category: "Contact profiles", fieldType: "text", operators: textOperators },
  { field: "gender", label: "Gender", category: "Contact profiles", fieldType: "select", operators: selectOperators, options: [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
  ]},
  { field: "age_group", label: "Age group", category: "Contact profiles", fieldType: "select", operators: selectOperators, options: [
    { value: "18-24", label: "18-24" },
    { value: "25-34", label: "25-34" },
    { value: "35-44", label: "35-44" },
    { value: "45-54", label: "45-54" },
    { value: "55-64", label: "55-64" },
    { value: "65+", label: "65+" },
  ]},
  { field: "language", label: "Language", category: "Contact profiles", fieldType: "text", operators: textOperators },
  { field: "birthday", label: "Birthday", category: "Contact profiles", fieldType: "date", operators: dateOperators },

  // Contact type (1)
  { field: "contact_type", label: "Contact type", category: "Contact type", fieldType: "select", operators: selectOperators, options: [
    { value: "pastor", label: "Pastor" },
    { value: "leader", label: "Leader" },
    { value: "donor", label: "Donor" },
    { value: "attendee", label: "Attendee" },
    { value: "subscriber", label: "Subscriber" },
    { value: "other", label: "Other" },
  ]},

  // List membership (1)
  { field: "email_lists", label: "List membership", category: "List membership", fieldType: "array", operators: arrayOperators },

  // Tags (1)
  { field: "tags", label: "Tags", category: "Tags", fieldType: "array", operators: arrayOperators },

  // Sources (2)
  { field: "source", label: "Source", category: "Sources", fieldType: "text", operators: textOperators },
  { field: "referred_by", label: "Referred by", category: "Sources", fieldType: "text", operators: textOperators },

  // Dates (2)
  { field: "created_at", label: "Date added", category: "Dates", fieldType: "date", operators: dateOperators },
  { field: "updated_at", label: "Date modified", category: "Dates", fieldType: "date", operators: dateOperators },
];

export const CATEGORIES = [
  { name: "Contact profiles", icon: "user" },
  { name: "Contact type", icon: "tag" },
  { name: "List membership", icon: "list" },
  { name: "Tags", icon: "tag" },
  { name: "Sources", icon: "link" },
  { name: "Dates", icon: "calendar" },
];

export function getCriteriaByCategory(category: string): CriteriaDefinition[] {
  return CRITERIA_DEFINITIONS.filter((c) => c.category === category);
}

export function getCriterionByField(field: string): CriteriaDefinition | undefined {
  return CRITERIA_DEFINITIONS.find((c) => c.field === field);
}
```

**Step 3: Verify no TypeScript errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to SegmentCriterion or SegmentFilter.

**Step 4: Commit**

```bash
git add src/shared/types/database.ts src/features/audiences/criteria-definitions.ts
git commit -m "feat(segments): add SegmentCriterion type and criteria definitions"
```

---

## Task 2: Extend `buildSegmentQuery` for criteria array

**Files:**
- Modify: `src/shared/utils/segment-query.ts`

**Step 1: Add criteria-based query building**

Replace the entire file with the extended version that handles both old flat shape and new criteria array:

```typescript
import type { SupabaseClient } from "@supabase/supabase-js";
import type { SegmentFilter, SegmentCriterion } from "@/shared/types/database";

/**
 * Builds a Supabase query from a segment_filter JSONB.
 * Supports both the legacy flat shape and the new criteria[] shape.
 * Always excludes contacts without email and unsubscribed contacts.
 */
export function buildSegmentQuery(
  supabase: SupabaseClient,
  filter: SegmentFilter,
  { countOnly = false }: { countOnly?: boolean } = {}
) {
  let query = supabase
    .from("contacts")
    .select("*", countOnly ? { count: "exact", head: true } : { count: "exact" });

  // Always exclude contacts without email or who have unsubscribed
  query = query
    .not("email", "is", null)
    .eq("email_unsubscribed", false);

  // New criteria-based filtering
  if (filter.criteria && filter.criteria.length > 0) {
    for (const criterion of filter.criteria) {
      query = applyCriterion(query, criterion);
    }
    return query;
  }

  // Legacy flat-field filtering (backward compat for campaigns)
  if (filter.contact_type && filter.contact_type.length > 0) {
    query = query.in("contact_type", filter.contact_type);
  }
  if (filter.region_id) {
    query = query.eq("region_id", filter.region_id);
  }
  if (filter.language) {
    query = query.eq("language", filter.language);
  }
  if (filter.country) {
    query = query.eq("country", filter.country);
  }
  if (filter.tags_include && filter.tags_include.length > 0) {
    query = query.overlaps("tags", filter.tags_include);
  }
  if (filter.email_lists && filter.email_lists.length > 0) {
    query = query.overlaps("email_lists", filter.email_lists);
  }
  if (filter.contact_ids && filter.contact_ids.length > 0) {
    query = query.in("id", filter.contact_ids);
  }

  return query;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyCriterion(query: any, c: SegmentCriterion) {
  const { field, operator, value } = c;

  switch (operator) {
    // Text operators
    case "is":
      return query.eq(field, value);
    case "is_not":
      return query.neq(field, value);
    case "contains":
      return query.ilike(field, `%${value}%`);
    case "starts_with":
      return query.ilike(field, `${value}%`);
    case "is_blank":
      return query.is(field, null);
    case "is_not_blank":
      return query.not(field, "is", null);

    // Array operators (tags, email_lists)
    case "includes_any": {
      const arr = Array.isArray(value) ? value : [value];
      return query.overlaps(field, arr);
    }
    case "includes_all": {
      const arr = Array.isArray(value) ? value : [value];
      return query.contains(field, arr);
    }
    case "not_includes": {
      const arr = Array.isArray(value) ? value : [value];
      // cd = "contains" negated — no contact whose array contains any of these
      // Use .not().overlaps() to exclude
      return query.not(field, "ov", `{${arr.join(",")}}`);
    }

    // Date operators
    case "is_before":
      return query.lt(field, value);
    case "is_after":
      return query.gt(field, value);
    case "in_last_days": {
      const days = Number(value);
      if (isNaN(days) || days <= 0) return query;
      const since = new Date();
      since.setDate(since.getDate() - days);
      return query.gte(field, since.toISOString());
    }

    default:
      return query;
  }
}
```

**Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors.

**Step 3: Commit**

```bash
git add src/shared/utils/segment-query.ts
git commit -m "feat(segments): extend buildSegmentQuery for criteria array"
```

---

## Task 3: Create the criteria picker dialog

**Files:**
- Create: `src/features/audiences/criteria-picker.tsx`

**Step 1: Build the criteria picker component**

This dialog matches CC's layout: categories on the left with counts, searchable criteria items on the right.

```typescript
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  CRITERIA_DEFINITIONS,
  CATEGORIES,
  type CriteriaDefinition,
} from "./criteria-definitions";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (criterion: CriteriaDefinition) => void;
  /** Fields already added (to show as disabled/greyed) */
  usedFields?: string[];
}

export function CriteriaPicker({ open, onClose, onSelect, usedFields = [] }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = CRITERIA_DEFINITIONS.filter((c) => {
    if (activeCategory && c.category !== activeCategory) return false;
    if (search) return c.label.toLowerCase().includes(search.toLowerCase());
    return true;
  });

  const categoryCounts = CATEGORIES.map((cat) => ({
    ...cat,
    count: CRITERIA_DEFINITIONS.filter((c) => c.category === cat.name).length,
  }));

  const totalCount = CRITERIA_DEFINITIONS.length;

  function handleSelect(criterion: CriteriaDefinition) {
    onSelect(criterion);
    setSearch("");
    setActiveCategory(null);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle>Criteria</DialogTitle>
        </DialogHeader>

        <div className="flex min-h-[400px]">
          {/* Left sidebar — categories */}
          <div className="w-48 border-r p-4 space-y-1 shrink-0">
            <button
              onClick={() => setActiveCategory(null)}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg flex items-center justify-between ${
                !activeCategory ? "bg-cyan-50 text-cyan-700 font-medium" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span>All criteria</span>
              <span className="text-xs bg-gray-100 rounded-full px-2 py-0.5">{totalCount}</span>
            </button>
            {categoryCounts.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`w-full text-left text-sm px-3 py-2 rounded-lg flex items-center justify-between ${
                  activeCategory === cat.name ? "bg-cyan-50 text-cyan-700 font-medium" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span>{cat.name}</span>
                <span className="text-xs bg-gray-100 rounded-full px-2 py-0.5">{cat.count}</span>
              </button>
            ))}
          </div>

          {/* Right side — search + items */}
          <div className="flex-1 p-4">
            <div className="relative mb-4">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <Input
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                placeholder="Search criteria"
                className="pl-9"
              />
            </div>

            {/* Group by category */}
            {(activeCategory ? [activeCategory] : CATEGORIES.map((c) => c.name)).map((catName) => {
              const items = filtered.filter((c) => c.category === catName);
              if (items.length === 0) return null;
              return (
                <div key={catName} className="mb-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{catName}</p>
                  <div className="space-y-0.5">
                    {items.map((item) => {
                      const isUsed = usedFields.includes(item.field);
                      return (
                        <button
                          key={item.field}
                          onClick={() => !isUsed && handleSelect(item)}
                          disabled={isUsed}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                            isUsed
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-gray-700 hover:bg-gray-50 cursor-pointer"
                          }`}
                        >
                          {item.label}
                          {isUsed && <span className="ml-2 text-xs text-gray-300">(added)</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">No criteria match your search.</p>
            )}
          </div>
        </div>

        <div className="border-t px-6 py-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 border rounded-lg hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

**Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`

**Step 3: Commit**

```bash
git add src/features/audiences/criteria-picker.tsx
git commit -m "feat(segments): add criteria picker dialog"
```

---

## Task 4: Create the criteria row component

**Files:**
- Create: `src/features/audiences/criteria-row.tsx`

**Step 1: Build the criteria row component**

Each added criterion renders as a card with field label, operator dropdown, value input, and remove button.

```typescript
"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SegmentCriterion } from "@/shared/types/database";
import { getCriterionByField, type CriteriaDefinition } from "./criteria-definitions";

interface Props {
  criterion: SegmentCriterion;
  onChange: (updated: SegmentCriterion) => void;
  onRemove: () => void;
  /** Available list names for the email_lists field */
  listNames?: string[];
}

export function CriteriaRow({ criterion, onChange, onRemove, listNames = [] }: Props) {
  const def = getCriterionByField(criterion.field);
  if (!def) return null;

  const needsValue = !["is_blank", "is_not_blank"].includes(criterion.operator);

  return (
    <div className="flex items-start gap-3 p-4 bg-white border rounded-lg group">
      {/* Field label */}
      <div className="shrink-0 w-36">
        <p className="text-sm font-medium text-gray-900">{def.label}</p>
        <p className="text-xs text-gray-400">{def.category}</p>
      </div>

      {/* Operator */}
      <div className="w-44 shrink-0">
        <Select
          value={criterion.operator}
          onValueChange={(v) => v && onChange({ ...criterion, operator: v })}
        >
          <SelectTrigger className="text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {def.operators.map((op) => (
              <SelectItem key={op.value} value={op.value}>
                {op.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Value input — varies by field type */}
      <div className="flex-1">
        {needsValue && (
          <ValueInput
            definition={def}
            criterion={criterion}
            onChange={onChange}
            listNames={listNames}
          />
        )}
      </div>

      {/* Remove button */}
      <button
        onClick={onRemove}
        className="shrink-0 p-1.5 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
        title="Remove criterion"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

function ValueInput({
  definition,
  criterion,
  onChange,
  listNames,
}: {
  definition: CriteriaDefinition;
  criterion: SegmentCriterion;
  onChange: (updated: SegmentCriterion) => void;
  listNames: string[];
}) {
  const value = criterion.value;

  // Select fields (contact_type, gender, age_group)
  if (definition.fieldType === "select" && definition.options) {
    return (
      <Select
        value={typeof value === "string" ? value : ""}
        onValueChange={(v) => v && onChange({ ...criterion, value: v })}
      >
        <SelectTrigger className="text-sm">
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          {definition.options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  // Array fields (tags, email_lists) — comma-separated input
  if (definition.fieldType === "array") {
    const arrValue = Array.isArray(value) ? value.join(", ") : (value ?? "");

    // For email_lists, show available lists as suggestions
    if (definition.field === "email_lists" && listNames.length > 0) {
      return (
        <div className="space-y-1">
          <Input
            value={arrValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const arr = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
              onChange({ ...criterion, value: arr });
            }}
            placeholder="Enter list names, comma separated"
            className="text-sm"
          />
          <div className="flex flex-wrap gap-1">
            {listNames.slice(0, 8).map((name) => {
              const current = Array.isArray(value) ? value : [];
              const selected = current.includes(name);
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    const next = selected
                      ? current.filter((v) => v !== name)
                      : [...current, name];
                    onChange({ ...criterion, value: next });
                  }}
                  className={`text-xs px-2 py-0.5 rounded-full border ${
                    selected
                      ? "bg-cyan-50 border-cyan-300 text-cyan-700"
                      : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <Input
        value={arrValue}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const arr = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
          onChange({ ...criterion, value: arr });
        }}
        placeholder="Comma separated values"
        className="text-sm"
      />
    );
  }

  // Date fields
  if (definition.fieldType === "date") {
    if (criterion.operator === "in_last_days") {
      return (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={1}
            value={typeof value === "string" ? value : ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onChange({ ...criterion, value: e.target.value })
            }
            placeholder="30"
            className="text-sm w-24"
          />
          <span className="text-sm text-gray-500">days</span>
        </div>
      );
    }
    return (
      <Input
        type="date"
        value={typeof value === "string" ? value : ""}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange({ ...criterion, value: e.target.value })
        }
        className="text-sm"
      />
    );
  }

  // Default: text input
  return (
    <Input
      value={typeof value === "string" ? value : ""}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        onChange({ ...criterion, value: e.target.value })
      }
      placeholder="Enter value..."
      className="text-sm"
    />
  );
}
```

**Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`

**Step 3: Commit**

```bash
git add src/features/audiences/criteria-row.tsx
git commit -m "feat(segments): add criteria row component with operator/value inputs"
```

---

## Task 5: Create the segment count API route

**Files:**
- Create: `src/app/api/audiences/segments/count/route.ts`

**Step 1: Build the API route**

This route receives a `SegmentFilter` via POST and returns the matching contact count.

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/utils/supabase/server";
import { buildSegmentQuery } from "@/shared/utils/segment-query";
import type { SegmentFilter } from "@/shared/types/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const filter = (body.filter || {}) as SegmentFilter;

    const supabase = await createClient();
    const { count, error } = await buildSegmentQuery(supabase, filter, { countOnly: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ count: count ?? 0 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
```

**Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`

**Step 3: Commit**

```bash
git add src/app/api/audiences/segments/count/route.ts
git commit -m "feat(segments): add segment count API route"
```

---

## Task 6: Create the main segment builder component

**Files:**
- Create: `src/features/audiences/segment-builder.tsx`

**Step 1: Build the full-page segment builder**

This is the main component rendered on the builder page. It shows a header with name + Cancel/Save, the criteria list, "+ Add Criteria" button, and a live contact count badge.

```typescript
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/shared/utils/supabase/client";
import type { Audience, SegmentCriterion, SegmentFilter } from "@/shared/types/database";
import { CriteriaPicker } from "./criteria-picker";
import { CriteriaRow } from "./criteria-row";
import type { CriteriaDefinition } from "./criteria-definitions";

interface Props {
  /** Existing audience when editing, null when creating */
  audience: Audience | null;
  /** Available list names for the email_lists criteria */
  listNames: string[];
}

export function SegmentBuilderPage({ audience, listNames }: Props) {
  const router = useRouter();
  const [name, setName] = useState(
    audience?.name ?? `Segment created ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}`
  );
  const [criteria, setCriteria] = useState<SegmentCriterion[]>(
    audience?.segment_filter?.criteria ?? []
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [matchCount, setMatchCount] = useState<number | null>(null);
  const [counting, setCounting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Live count — debounced
  const fetchCount = useCallback(async (criteriaToCount: SegmentCriterion[]) => {
    if (criteriaToCount.length === 0) {
      setMatchCount(null);
      return;
    }
    setCounting(true);
    try {
      const filter: SegmentFilter = { criteria: criteriaToCount };
      const res = await fetch("/api/audiences/segments/count", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filter }),
      });
      const data = await res.json();
      setMatchCount(data.count ?? 0);
    } catch {
      setMatchCount(null);
    } finally {
      setCounting(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchCount(criteria), 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [criteria, fetchCount]);

  function handleAddCriteria(def: CriteriaDefinition) {
    const newCriterion: SegmentCriterion = {
      field: def.field,
      operator: def.operators[0].value,
      value: def.fieldType === "array" ? [] : "",
    };
    setCriteria([...criteria, newCriterion]);
  }

  function handleUpdateCriteria(index: number, updated: SegmentCriterion) {
    const next = [...criteria];
    next[index] = updated;
    setCriteria(next);
  }

  function handleRemoveCriteria(index: number) {
    setCriteria(criteria.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);

    const supabase = createClient();
    const payload = {
      name: name.trim(),
      type: "segment" as const,
      segment_filter: { criteria } as SegmentFilter,
    };

    if (audience) {
      await supabase.from("audiences").update(payload).eq("id", audience.id);
    } else {
      await supabase.from("audiences").insert(payload);
    }

    setSaving(false);
    router.push("/admin/audiences");
    router.refresh();
  }

  const usedFields = criteria.map((c) => c.field);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header bar */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Input
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            className="text-base font-medium border-none shadow-none px-0 focus-visible:ring-0 w-auto min-w-[300px]"
            placeholder="Segment name"
          />
          {matchCount !== null && (
            <Badge variant="secondary" className="text-sm">
              {counting ? "Counting..." : `${matchCount.toLocaleString()} contacts`}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/audiences")}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            {saving ? "Saving..." : "Save segment"}
          </Button>
        </div>
      </div>

      {/* Builder body */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {criteria.length === 0 ? (
          /* Empty state */
          <div className="bg-white border rounded-xl p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Add criteria to build from scratch</h2>
            <p className="text-sm text-gray-500 mb-6">
              Create segments based on contact profiles, lists, tags, or other contact details.
            </p>
            <Button
              variant="outline"
              onClick={() => setPickerOpen(true)}
              className="text-cyan-600 border-cyan-300 hover:bg-cyan-50"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Criteria
            </Button>
          </div>
        ) : (
          /* Criteria list */
          <div className="space-y-3">
            {criteria.map((c, i) => (
              <CriteriaRow
                key={`${c.field}-${i}`}
                criterion={c}
                onChange={(updated) => handleUpdateCriteria(i, updated)}
                onRemove={() => handleRemoveCriteria(i)}
                listNames={listNames}
              />
            ))}

            <Button
              variant="outline"
              onClick={() => setPickerOpen(true)}
              className="text-cyan-600 border-cyan-300 hover:bg-cyan-50"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Criteria
            </Button>
          </div>
        )}
      </div>

      <CriteriaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleAddCriteria}
        usedFields={usedFields}
      />
    </div>
  );
}
```

**Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`

**Step 3: Commit**

```bash
git add src/features/audiences/segment-builder.tsx
git commit -m "feat(segments): add full-page segment builder component"
```

---

## Task 7: Create server pages for segment builder routes

**Files:**
- Create: `src/app/admin/audiences/segments/new/page.tsx`
- Create: `src/app/admin/audiences/segments/[id]/page.tsx`

**Step 1: Create the "new segment" page**

```typescript
import { createClient } from "@/shared/utils/supabase/server";
import { SegmentBuilderPage } from "@/features/audiences/segment-builder";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Segment — BSH Admin",
};

export default async function NewSegmentPage() {
  const supabase = await createClient();

  // Fetch list names for the email_lists criteria picker
  const { data: audiences } = await supabase
    .from("audiences")
    .select("name")
    .eq("type", "list")
    .order("name");

  const listNames = (audiences ?? []).map((a) => a.name);

  return <SegmentBuilderPage audience={null} listNames={listNames} />;
}
```

**Step 2: Create the "edit segment" page**

```typescript
import { createClient } from "@/shared/utils/supabase/server";
import { SegmentBuilderPage } from "@/features/audiences/segment-builder";
import { notFound } from "next/navigation";
import type { Audience } from "@/shared/types/database";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Segment — BSH Admin",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditSegmentPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: audience } = await supabase
    .from("audiences")
    .select("*")
    .eq("id", id)
    .single();

  if (!audience || audience.type !== "segment") {
    notFound();
  }

  // Fetch list names for the email_lists criteria picker
  const { data: audiences } = await supabase
    .from("audiences")
    .select("name")
    .eq("type", "list")
    .order("name");

  const listNames = (audiences ?? []).map((a) => a.name);

  return <SegmentBuilderPage audience={audience as Audience} listNames={listNames} />;
}
```

**Step 3: Verify no TypeScript errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`

**Step 4: Commit**

```bash
git add src/app/admin/audiences/segments/
git commit -m "feat(segments): add new/edit segment server pages"
```

---

## Task 8: Update audiences-list.tsx — type picker dialog and segment routing

**Files:**
- Modify: `src/features/audiences/audiences-list.tsx`

**Step 1: Replace Create Audience dialog with CC-style type picker**

Replace the current `Dialog` for creation (lines 239-304) with a two-step flow:
1. Type picker dialog (Segment vs List cards)
2. For List: the existing name/description form dialog
3. For Segment: navigate to `/admin/audiences/segments/new`

Also update the "Rename" action for segment audiences to navigate to the edit page instead of opening the inline form.

Changes needed:
- Add `typePickerOpen` state
- The "Create Audience" button opens the type picker dialog
- Type picker has two cards: Segment and List
- Choosing Segment: close dialog, navigate to `/admin/audiences/segments/new`
- Choosing List: close type picker, open the existing form dialog
- The 3-dot "Rename" action for segment audiences: navigate to `/admin/audiences/segments/[id]`
- Remove the inline `SegmentFilterBuilder` component at the bottom of the file
- Remove the `Select` for audience type in the edit form (no longer needed in the list form)

The specific edits:

**a) Add state for type picker:**
After line 69 (`const [menuOpen, setMenuOpen] = useState...`), add:
```typescript
const [typePickerOpen, setTypePickerOpen] = useState(false);
const [typePickerChoice, setTypePickerChoice] = useState<"segment" | "list">("segment");
```

**b) Change `openCreate` to open type picker:**
Replace `openCreate` function (lines 119-123):
```typescript
function openCreate() {
  setTypePickerChoice("segment");
  setTypePickerOpen(true);
}

function handleTypeContinue() {
  setTypePickerOpen(false);
  if (typePickerChoice === "segment") {
    router.push("/admin/audiences/segments/new");
  } else {
    setEditingId(null);
    setForm({ name: "", description: "", type: "list", segment_filter: { ...emptyFilter } });
    setDialogOpen(true);
  }
}
```

**c) Change `openEdit` for segments:**
Update `openEdit` (lines 125-134) to route segment edits to the builder page:
```typescript
function openEdit(audience: Audience) {
  if (audience.type === "segment") {
    router.push(`/admin/audiences/segments/${audience.id}`);
    return;
  }
  setEditingId(audience.id);
  setForm({
    name: audience.name,
    description: audience.description ?? "",
    type: audience.type,
    segment_filter: audience.segment_filter ?? { ...emptyFilter },
  });
  setDialogOpen(true);
}
```

**d) Replace the `<Dialog>` wrapping Create button (lines 239-304) with:**
```tsx
<Button onClick={openCreate}>
  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
  Create Audience
</Button>

{/* Type Picker Dialog */}
<Dialog open={typePickerOpen} onOpenChange={setTypePickerOpen}>
  <DialogContent className="max-w-lg">
    <DialogHeader>
      <DialogTitle>Select the type of list you would like to create</DialogTitle>
    </DialogHeader>
    <div className="space-y-3 mt-2">
      <button
        onClick={() => setTypePickerChoice("segment")}
        className={`w-full text-left p-4 rounded-xl border-2 transition-colors flex items-start gap-4 ${
          typePickerChoice === "segment"
            ? "border-cyan-400 bg-cyan-50/50"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <div className="shrink-0 w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-gray-900">Segment</p>
          <p className="text-sm text-gray-500">Create a list from a set of criteria that updates contacts automatically.</p>
        </div>
      </button>
      <button
        onClick={() => setTypePickerChoice("list")}
        className={`w-full text-left p-4 rounded-xl border-2 transition-colors flex items-start gap-4 ${
          typePickerChoice === "list"
            ? "border-cyan-400 bg-cyan-50/50"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <div className="shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-gray-900">List</p>
          <p className="text-sm text-gray-500">Manually add contacts to a list that can only be updated by you.</p>
        </div>
      </button>
    </div>
    <DialogFooter className="mt-4">
      <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
      <Button onClick={handleTypeContinue} className="bg-cyan-600 hover:bg-cyan-700 text-white">
        Continue
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

{/* List Edit Dialog (only for list type) */}
<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>{editingId ? "Edit List" : "New List"}</DialogTitle>
      <DialogDescription>
        {editingId ? "Update your list details." : "Create a new list."}
      </DialogDescription>
    </DialogHeader>
    <form onSubmit={handleSave} className="space-y-4 mt-2">
      <div className="space-y-1.5">
        <Label>Name</Label>
        <Input
          value={form.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setForm({ ...form, name: e.target.value })
          }
          required
          placeholder="e.g. Newsletter Subscribers"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Description</Label>
        <Textarea
          value={form.description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setForm({ ...form, description: e.target.value })
          }
          placeholder="Brief description..."
          className="min-h-[60px]"
        />
      </div>
      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? "Saving..." : editingId ? "Update List" : "Create List"}
      </Button>
    </form>
  </DialogContent>
</Dialog>
```

**e) Remove the `SegmentFilterBuilder` function** (lines 630-718) — it's no longer used.

**f) Remove unused imports**: Remove `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` and `SegmentFilter` if no longer used. Keep `AudienceType` if still used.

**Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`

**Step 3: Verify the dev server renders**

Run: visit `http://localhost:3005/admin/audiences` — verify the page loads, Create Audience opens type picker, List opens form, Segment navigates to builder page.

**Step 4: Commit**

```bash
git add src/features/audiences/audiences-list.tsx
git commit -m "feat(segments): replace create dialog with type picker, route segments to builder"
```

---

## Task 9: Manual integration testing with Playwright

**Step 1: Test the full segment builder flow**

Using Playwright MCP tools:

1. Navigate to `/admin/audiences`
2. Click "Create Audience" — verify type picker dialog appears with Segment and List cards
3. Select "Segment" and click "Continue" — verify navigation to `/admin/audiences/segments/new`
4. Verify builder page: name input, empty state with "+ Add Criteria" button
5. Click "+ Add Criteria" — verify picker dialog with categories and searchable items
6. Select "Country" criteria — verify it appears as a criteria row
7. Set operator to "is" and value to "USA" — verify live count updates
8. Add another criteria "Contact type" = "Pastor" — verify count updates again
9. Click "Save segment" — verify redirect to `/admin/audiences`
10. Verify new segment appears in table with "Segment" badge
11. Click 3-dot menu → "Rename" on the segment — verify navigation to edit page with criteria loaded
12. Check console for JS errors

**Step 2: Test the list creation flow still works**

1. Click "Create Audience"
2. Select "List" and "Continue" — verify the name/description form dialog opens
3. Enter name and save — verify list appears in table

**Step 3: Commit final state**

```bash
git add -A
git commit -m "feat(segments): complete CC-style segment builder with criteria picker"
```
