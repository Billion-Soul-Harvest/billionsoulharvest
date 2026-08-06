# AG Grid Registrations Table Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the custom HTML table in the registrations page with AG Grid React for a Google Sheets-like experience (sorting, filtering, column resizing, pagination, row selection).

**Architecture:** Install `ag-grid-react` + `ag-grid-community` (free). Replace the `<table>` section (lines 926-1211) with `<AgGridReact>`. Keep all existing functionality: stat cards, filter bar, bulk actions, detail panel, delete dialog, send email dialog. AG Grid handles sorting/filtering/pagination/selection natively, so we remove the manual pagination and per-column filter code.

**Tech Stack:** AG Grid Community (free), React 19, Next.js 16, TypeScript, Tailwind CSS

---

### Task 1: Install AG Grid packages

**Step 1: Install dependencies**

Run: `npm install ag-grid-react ag-grid-community`

**Step 2: Verify installation**

Run: `ls node_modules/ag-grid-react/package.json && ls node_modules/ag-grid-community/package.json`
Expected: Both files exist

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install ag-grid-react and ag-grid-community"
```

---

### Task 2: Rewrite registrations-table.tsx with AG Grid

**Files:**
- Modify: `src/features/registration/registrations-table.tsx`

**Step 1: Rewrite the component**

Key changes:
- Import `AgGridReact`, `AgGridProvider`, `AllCommunityModule` from ag-grid packages
- Remove: manual pagination state (`page`, `pageSize`, `paginatedRows`, `totalPages`, etc.)
- Remove: `FilterDropdown` component (AG Grid has built-in column filters)
- Remove: manual `<table>` markup and pagination controls
- Remove: `allFilteredSelected`, `toggleSelectAll` (AG Grid handles selection)
- Keep: stat cards, bulk actions bar, detail panel, delete dialog, send email dialog
- Keep: all handler functions (`handleStatusChange`, `bulkUpdateStatus`, `handleDelete`, `handleResendEmail`, `exportCSV`, etc.)
- Keep: `search`, `eventFilter`, `statusFilter`, `countryFilter` state for the top filter bar (these feed `rowData` to AG Grid)

Column definitions:
```typescript
const columnDefs = useMemo(() => [
  {
    headerName: "Name",
    valueGetter: (p) => `${p.data.contact?.first_name ?? ""} ${p.data.contact?.last_name ?? ""}`.trim(),
    minWidth: 160,
    flex: 1,
  },
  {
    headerName: "Email",
    valueGetter: (p) => p.data.contact?.email ?? "",
    minWidth: 200,
    flex: 1.2,
  },
  {
    headerName: "Phone",
    valueGetter: (p) => p.data.contact?.phone ?? "—",
    minWidth: 140,
  },
  {
    headerName: "Church",
    valueGetter: (p) => p.data.church_name || p.data.contact?.church_name || "—",
    minWidth: 140,
  },
  {
    headerName: "Location",
    valueGetter: (p) => [p.data.city, p.data.country].filter(Boolean).join(", ") || "—",
    minWidth: 150,
  },
  {
    headerName: "Event",
    valueGetter: (p) => p.data.event?.title ?? "",
    minWidth: 180,
    flex: 1.2,
  },
  {
    headerName: "Status",
    field: "status",
    cellRenderer: StatusCellRenderer, // custom Badge renderer
    minWidth: 120,
  },
  {
    headerName: "Date",
    valueGetter: (p) => new Date(p.data.created_at).toLocaleDateString(),
    minWidth: 100,
  },
  {
    headerName: "",
    cellRenderer: ActionsCellRenderer, // custom actions menu renderer
    minWidth: 60,
    maxWidth: 60,
    sortable: false,
    filter: false,
    resizable: false,
    pinned: "right",
  },
], []);
```

Grid config:
```tsx
<AgGridProvider modules={[AllCommunityModule]}>
  <div style={{ height: 600, width: "100%" }}>
    <AgGridReact
      rowData={filtered}
      columnDefs={columnDefs}
      defaultColDef={defaultColDef}
      rowSelection={{ mode: "multiRow", checkboxes: true, headerCheckbox: true }}
      pagination={true}
      paginationPageSize={25}
      paginationPageSizeSelector={[10, 25, 50, 100]}
      onRowClicked={(e) => {
        // Don't open detail if clicking checkbox or actions
        if (e.event?.target closest check) return;
        setSelectedRegistration(e.data);
      }}
      onSelectionChanged={onSelectionChanged}
      getRowId={(params) => params.data.id}
      theme={customTheme}
    />
  </div>
</AgGridProvider>
```

Custom cell renderers (defined inside the file):
- `StatusCellRenderer`: renders `<Badge>` with status color
- `ActionsCellRenderer`: renders the existing `<ActionMenu>` with View, Change Status, Resend Email, Delete

Selection sync:
```typescript
const onSelectionChanged = useCallback((event) => {
  const selectedRows = event.api.getSelectedRows();
  setSelectedIds(new Set(selectedRows.map((r) => r.id)));
}, []);
```

Theme (match existing Tailwind design):
```typescript
import { themeQuartz } from "ag-grid-community";

const registrationsGridTheme = themeQuartz.withParams({
  backgroundColor: "#ffffff",
  headerBackgroundColor: "#f9fafb",  // gray-50
  headerFontSize: 13,
  fontSize: 14,
  rowBorder: { color: "#f3f4f6" },   // gray-100
  borderRadius: 12,
  spacing: 6,
  headerFontWeight: 500,
  selectedRowBackgroundColor: "rgba(6, 182, 212, 0.08)", // cyan tint
});
```

**Step 2: Verify the page renders**

Run: `npm run build` (or check dev server)
Expected: No TypeScript errors, grid renders with data

**Step 3: Commit**

```bash
git add src/features/registration/registrations-table.tsx
git commit -m "feat: replace registrations table with AG Grid for spreadsheet-like UX"
```

---

### Task 3: Verify all existing functionality works

**Manual testing checklist (use playwright-ui-testing skill):**
- [ ] Grid renders with all registration data
- [ ] Columns are resizable by dragging column borders
- [ ] Clicking column header sorts ascending/descending
- [ ] Checkbox selection works (single + header select-all)
- [ ] Bulk actions bar appears when rows are selected
- [ ] Clicking a row opens the detail slide-out panel
- [ ] Actions menu (three dots) works: View, Change Status, Resend Email, Delete
- [ ] Top filter bar (search, event, status, country) filters the grid
- [ ] Export CSV works
- [ ] Stat cards update based on filtered data
- [ ] Pagination controls work (page size selector, page navigation)
- [ ] Delete confirmation dialog works (single + bulk)
- [ ] Send Campaign dialog works from bulk actions

**Step 1: Run dev server and test**

Run: `npm run dev`
Navigate to registrations page and verify all items above.

**Step 2: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: address AG Grid integration issues"
```
