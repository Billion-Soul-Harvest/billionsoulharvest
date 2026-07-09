# Registrations Page Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the plain registrations table into a full-featured registration management page with summary cards, row actions, bulk operations, and enhanced filters.

**Architecture:** All changes are frontend (registrations-table.tsx) plus one new API route for status updates and resending emails. No DB schema changes needed — existing columns (notes, status, custom_fields) support everything. Uses existing UI components (Dialog, Badge, Button, Select, Input) from src/components/ui/.

**Tech Stack:** Next.js, React, Supabase client, existing UI component library (base-ui based)

---

### Task 1: API Route for Registration Actions

**Files:**
- Create: `src/app/api/registrations/[id]/route.ts`

**What to build:**
A PATCH endpoint that handles:
- `{ action: "update_status", status: "confirmed"|"pending"|"cancelled"|"waitlisted" }`
- `{ action: "update_notes", notes: "..." }`
- `{ action: "resend_email" }` — regenerates QR code and sends confirmation email (reuse logic from src/app/api/register/route.ts)

Uses service role Supabase client. Returns updated registration.

**Step 1:** Create the route file with PATCH handler
**Step 2:** Implement update_status — update registrations table, return updated row
**Step 3:** Implement update_notes — update notes column
**Step 4:** Implement resend_email — fetch registration+contact+event, generate QR, render email template, send via sendEmail utility
**Step 5:** Test manually via curl or browser
**Step 6:** Commit: `feat: add registration actions API route`

---

### Task 2: Summary Stat Cards

**Files:**
- Modify: `src/features/registration/registrations-table.tsx`

**What to build:**
A row of 5 stat cards above the filters. Computed from the filtered registrations array (respects event filter).

Cards: Total | Confirmed (green) | Pending (yellow) | Cancelled (red) | Waitlisted (blue)

Each card: icon + count + label. Use simple divs with colored left borders, no new components needed.

**Step 1:** Add a `useMemo` to compute counts by status from `filtered` array
**Step 2:** Render 5 cards in a responsive grid (grid-cols-2 sm:grid-cols-5) above filters
**Step 3:** Verify cards update when event filter changes
**Step 4:** Commit: `feat: add registration summary stat cards`

---

### Task 3: Enhanced Filters (Status + Country)

**Files:**
- Modify: `src/features/registration/registrations-table.tsx`

**What to build:**
Add two more filter dropdowns alongside existing search + event filter:
- Status filter: all / confirmed / pending / cancelled / waitlisted
- Country filter: dynamically populated from registration data

Update the `filtered` computation to include these new filters.

**Step 1:** Add `statusFilter` and `countryFilter` state
**Step 2:** Compute unique countries from registrations data
**Step 3:** Add Status Select and Country Select dropdowns to filter row
**Step 4:** Update filter logic to include status and country matching
**Step 5:** Commit: `feat: add status and country filters to registrations`

---

### Task 4: Row Checkboxes + Bulk Action Bar

**Files:**
- Modify: `src/features/registration/registrations-table.tsx`

**What to build:**
- Checkbox column in table header ("select all") and each row
- `selectedIds` state tracking selected registration IDs
- When selections exist, show a floating bulk action bar with:
  - "{N} selected" label
  - "Update Status" button → opens a small dropdown to pick status, calls API for each selected
  - "Export Selected" button → reuses existing CSV logic but only for selected rows
- Clear selection after bulk action completes

**Step 1:** Add `selectedIds` state (Set<string>)
**Step 2:** Add checkbox column to thead and tbody
**Step 3:** Implement select-all toggle (all filtered vs none)
**Step 4:** Add bulk action bar (sticky bottom or inline above table) that appears when selectedIds.size > 0
**Step 5:** Implement bulk status update — loops through selected IDs, calls PATCH API
**Step 6:** Implement export selected — filters CSV to selected rows
**Step 7:** Commit: `feat: add bulk selection and actions to registrations`

---

### Task 5: Row Action Menu (3-dot)

**Files:**
- Modify: `src/features/registration/registrations-table.tsx`

**What to build:**
A 3-dot button on each row that opens a small popover/dropdown with actions:
- View Details
- Change Status → submenu with status options
- Add/Edit Note
- Resend Confirmation Email
- Create Follow-up → links to /admin/follow-ups (or opens dialog)

Use a simple custom dropdown (button + absolute positioned div with click-outside close), similar pattern to SearchableSelect component.

**Step 1:** Create a RowActionMenu component within the file
**Step 2:** Add the 3-dot button as the last column in the table
**Step 3:** Implement the dropdown with menu items
**Step 4:** Wire up Change Status to call PATCH API and refresh via router.refresh()
**Step 5:** Wire up Resend Email to call PATCH API with action: "resend_email"
**Step 6:** Wire up Add Note to show inline input and save via API
**Step 7:** Commit: `feat: add row action menu to registrations table`

---

### Task 6: Registration Detail Slide-out Panel

**Files:**
- Modify: `src/features/registration/registrations-table.tsx`

**What to build:**
When "View Details" is clicked (or row is clicked), open a right-side panel (using Dialog component styled as a slide-over) showing:
- Full name, email, phone
- Event name
- Status badge (editable)
- Church / Organization, Role
- Location (city, country)
- Region, Visa requirement, Passport number (from custom_fields)
- Referred by (from custom_fields)
- Notes (editable textarea)
- Registration date
- Any other custom_fields rendered as key-value pairs

**Step 1:** Add `selectedRegistration` state
**Step 2:** Create RegistrationDetailPanel component using Dialog
**Step 3:** Render all registration fields in organized sections
**Step 4:** Add inline-editable notes field
**Step 5:** Add status change dropdown in the panel
**Step 6:** Make row clickable to open panel (in addition to menu "View Details")
**Step 7:** Commit: `feat: add registration detail slide-out panel`

---

### Task 7: Final Polish

**Files:**
- Modify: `src/features/registration/registrations-table.tsx`
- Modify: `src/app/admin/registrations/page.tsx`

**What to build:**
- Pass `router` for refresh after mutations (convert page to use revalidation or client-side refetch)
- Add loading states for API calls (status changes, resend email)
- Add toast notifications (using sonner) for success/error feedback
- Ensure mobile responsiveness of new elements

**Step 1:** Add useRouter and implement refresh after mutations
**Step 2:** Add toast notifications for all actions
**Step 3:** Test all flows end-to-end
**Step 4:** Commit: `feat: polish registrations page with toasts and loading states`
