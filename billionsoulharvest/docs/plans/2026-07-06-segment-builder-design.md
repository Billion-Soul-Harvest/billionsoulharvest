# Design: CC-Style Segment Builder

## Context

The Audiences feature supports two types: Lists (manual) and Segments (criteria-based, auto-updating). The current segment creation uses a basic inline form with text inputs. The goal is to replace it with a full-page CC-style segment builder with a criteria picker dialog, operators per field, and live contact count.

## Data Model

### New type: `SegmentCriterion`

```typescript
interface SegmentCriterion {
  field: string;       // e.g. "first_name", "country", "tags"
  operator: string;    // e.g. "is", "contains", "includes_any"
  value: string | string[];
}
```

### Extended `SegmentFilter`

```typescript
interface SegmentFilter {
  // existing flat fields (backward compat for campaigns)
  contact_type?: string[];
  region_id?: string;
  language?: string;
  country?: string;
  tags_include?: string[];
  email_lists?: string[];
  contact_ids?: string[];

  // new criteria-based filtering
  criteria?: SegmentCriterion[];
}
```

`buildSegmentQuery` handles both shapes: if `criteria` array exists, use it; otherwise fall back to flat fields. No database migration needed since `segment_filter` is already JSONB.

## Criteria Categories

| Category | Fields | Count |
|----------|--------|-------|
| Contact profiles | first_name, last_name, email, phone, city, state, country, church_name, church_role, job_title, gender, age_group, language, birthday | 14 |
| Contact type | contact_type | 1 |
| List membership | email_lists | 1 |
| Tags | tags | 1 |
| Sources | source, referred_by | 2 |
| Dates | created_at, updated_at | 2 |

Total: 21 criteria across 6 categories.

## Operators by Field Type

| Field type | Operators |
|-----------|-----------|
| Text (name, email, city, etc.) | is, is not, contains, starts with, is blank, is not blank |
| Select (contact_type, gender) | is, is not |
| Array (tags, email_lists) | includes any of, includes all of, does not include |
| Date (created_at, birthday) | is before, is after, is between, in the last N days |

All criteria are AND'd together (no group/OR logic). Covers 95% of use cases.

## UI Flow

### Step 1: Create Audience type picker dialog

Replaces the current single create dialog. Two cards:
- **Segment**: refresh icon, "Create a list from a set of criteria that updates contacts automatically."
- **List**: list icon, "Manually add contacts to a list that can only be updated by you."

Cancel + Continue buttons. List opens the existing name/description form. Segment navigates to the builder page.

### Step 2: Full-page segment builder

Route: `/admin/audiences/segments/new` (create) and `/admin/audiences/segments/[id]` (edit)

- Header bar: editable segment name (auto-generated "Segment created [date]") + Cancel + Save segment buttons
- Criteria area: empty state with "+ Add Criteria" button
- Each added criterion renders as a card: field label, operator dropdown, value input, remove button
- Live contact count badge updates as criteria change (debounced API call)

### Step 3: Criteria picker dialog

Opens when clicking "+ Add Criteria":
- Left sidebar: categories with item counts
- Right side: searchable list of criteria items
- Clicking an item adds it and closes the dialog

### Step 4: Operator + value inputs per type

- Text fields: operator dropdown + text input
- Select fields: operator dropdown + select with predefined options
- Array fields: operator dropdown + multi-value tag input
- Date fields: operator dropdown + date picker or "N days" number input

## Files

| Action | File |
|--------|------|
| Create | `src/app/admin/audiences/segments/new/page.tsx` |
| Create | `src/app/admin/audiences/segments/[id]/page.tsx` |
| Create | `src/features/audiences/segment-builder.tsx` |
| Create | `src/features/audiences/criteria-picker.tsx` |
| Create | `src/features/audiences/criteria-row.tsx` |
| Create | `src/app/api/audiences/segments/count/route.ts` |
| Edit | `src/shared/types/database.ts` |
| Edit | `src/shared/utils/segment-query.ts` |
| Edit | `src/features/audiences/audiences-list.tsx` |

## What stays unchanged

- Campaign segment builder (flat SegmentFilter)
- Audience list RPCs and table page
- Database schema (JSONB already supports new shape)
