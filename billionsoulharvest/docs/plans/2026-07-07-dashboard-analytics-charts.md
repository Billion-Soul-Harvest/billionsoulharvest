# Dashboard Analytics Charts Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add 4 interactive Recharts-based analytics cards below the country map: Contact Type Breakdown, Registrations Over Time, Registration Status, and Follow-up Overview.

**Architecture:** Install Recharts. Create 4 client components in `src/features/dashboard/`. Fetch all data server-side in the dashboard page's existing `Promise.all` and pass as props. Charts render in a 2x2 responsive grid.

**Tech Stack:** Recharts, Next.js server components, Supabase queries, Tailwind CSS

---

### Task 1: Install Recharts

**Step 1: Install dependency**

Run: `npm install recharts`

**Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add recharts dependency"
```

---

### Task 2: Contact Type Breakdown Chart

**Files:**
- Create: `src/features/dashboard/contact-type-chart.tsx`
- Modify: `src/app/admin/dashboard/page.tsx`

**Step 1: Add query to dashboard page**

In `src/app/admin/dashboard/page.tsx`, add to the `Promise.all`:
```ts
supabase.from("contacts").select("contact_type")
```

Aggregate the result into `{ name: string; value: number }[]` like:
```ts
const contactTypeData = Object.entries(
  (contactTypesRes.data ?? []).reduce<Record<string, number>>((acc, row) => {
    const t = (row.contact_type as string) || "other";
    acc[t] = (acc[t] ?? 0) + 1;
    return acc;
  }, {})
).map(([name, value]) => ({ name, value }));
```

**Step 2: Create the chart component**

Create `src/features/dashboard/contact-type-chart.tsx`:
- "use client" component
- Recharts `PieChart` with `Pie` (donut via `innerRadius`)
- Color palette: `{ pastor: "#3b82f6", leader: "#8b5cf6", donor: "#10b981", attendee: "#f59e0b", subscriber: "#06b6d4", other: "#9ca3af" }`
- Custom legend below the chart showing label + count
- Wrapped in white rounded-xl border card with header "Contact Types"
- Empty state if no data

**Step 3: Render in dashboard page**

Add the component after the country map section, inside a new 2x2 grid:
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
  <ContactTypeChart data={contactTypeData} />
  {/* other charts will go here */}
</div>
```

**Step 4: Verify**

Run: `npm run build`
Expected: Build passes, no type errors.

**Step 5: Commit**

```bash
git add src/features/dashboard/contact-type-chart.tsx src/app/admin/dashboard/page.tsx
git commit -m "feat: add contact type breakdown donut chart to dashboard"
```

---

### Task 3: Registrations Over Time Chart

**Files:**
- Create: `src/features/dashboard/registrations-timeline-chart.tsx`
- Modify: `src/app/admin/dashboard/page.tsx`

**Step 1: Add query to dashboard page**

In `src/app/admin/dashboard/page.tsx`, add to the `Promise.all`:
```ts
supabase.from("registrations").select("created_at")
```

Aggregate into monthly buckets `{ month: string; count: number }[]`:
```ts
const regTimelineData = Object.entries(
  (regTimelineRes.data ?? []).reduce<Record<string, number>>((acc, row) => {
    const d = new Date(row.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {})
)
  .map(([month, count]) => ({ month, count }))
  .sort((a, b) => a.month.localeCompare(b.month));
```

**Step 2: Create the chart component**

Create `src/features/dashboard/registrations-timeline-chart.tsx`:
- "use client" component
- Recharts `BarChart` with `Bar`, `XAxis`, `YAxis`, `Tooltip`, `ResponsiveContainer`
- Bar color: `#3b82f6` (blue-500)
- XAxis shows month labels formatted as "Jan", "Feb", etc.
- Tooltip shows full month name + count
- Card wrapper with header "Registrations Over Time"
- Empty state if no data

**Step 3: Add to dashboard grid**

Place next to ContactTypeChart in the 2x2 grid.

**Step 4: Verify**

Run: `npm run build`

**Step 5: Commit**

```bash
git add src/features/dashboard/registrations-timeline-chart.tsx src/app/admin/dashboard/page.tsx
git commit -m "feat: add registrations over time bar chart to dashboard"
```

---

### Task 4: Registration Status Breakdown Chart

**Files:**
- Create: `src/features/dashboard/registration-status-chart.tsx`
- Modify: `src/app/admin/dashboard/page.tsx`

**Step 1: Add query to dashboard page**

In `src/app/admin/dashboard/page.tsx`, add to the `Promise.all`:
```ts
supabase.from("registrations").select("status")
```

Aggregate into `{ name: string; value: number }[]`.

**Step 2: Create the chart component**

Create `src/features/dashboard/registration-status-chart.tsx`:
- "use client" component
- Recharts `PieChart` with donut `Pie`
- Color map: `{ pending: "#f59e0b", confirmed: "#10b981", cancelled: "#ef4444", waitlisted: "#3b82f6" }`
- Legend with counts below
- Card with header "Registration Status"

**Step 3: Add to dashboard grid**

Third position in the 2x2 grid.

**Step 4: Verify**

Run: `npm run build`

**Step 5: Commit**

```bash
git add src/features/dashboard/registration-status-chart.tsx src/app/admin/dashboard/page.tsx
git commit -m "feat: add registration status donut chart to dashboard"
```

---

### Task 5: Follow-up Overview Chart

**Files:**
- Create: `src/features/dashboard/followup-overview-chart.tsx`
- Modify: `src/app/admin/dashboard/page.tsx`

**Step 1: Add queries to dashboard page**

In `src/app/admin/dashboard/page.tsx`, add to the `Promise.all`:
```ts
supabase.from("follow_ups").select("priority, status, due_date")
```

Compute three datasets server-side:
- `priorityData`: `{ name: string; value: number }[]` grouped by priority
- `overdueCount`: count where `status` is "pending" or "in_progress" AND `due_date < today`
- `completionRate`: percentage of follow-ups with status "completed" out of total

Pass as a single props object:
```ts
{ priorityData, overdueCount, completionRate, totalCount }
```

**Step 2: Create the chart component**

Create `src/features/dashboard/followup-overview-chart.tsx`:
- "use client" component
- Layout: Left side = small donut chart for priority distribution, Right side = stat cards for overdue count + completion rate
- Priority colors: `{ urgent: "#ef4444", high: "#f97316", medium: "#3b82f6", low: "#9ca3af" }`
- Overdue count shown as a bold number with "Overdue" label, red text if > 0
- Completion rate shown as percentage with a small progress bar
- Card with header "Follow-up Overview"

**Step 3: Add to dashboard grid**

Fourth position in the 2x2 grid.

**Step 4: Verify**

Run: `npm run build`

**Step 5: Commit**

```bash
git add src/features/dashboard/followup-overview-chart.tsx src/app/admin/dashboard/page.tsx
git commit -m "feat: add follow-up overview chart to dashboard"
```

---

### Verification

1. Run `npm run build` - should pass with no errors
2. Run local dev server `npm run dev` and visit `/admin/dashboard`
3. Verify all 4 chart cards render below the country map
4. Verify charts show real data from the database
5. Verify responsive layout: 2x2 on desktop, stacked on mobile
6. Verify empty states display correctly when no data exists
