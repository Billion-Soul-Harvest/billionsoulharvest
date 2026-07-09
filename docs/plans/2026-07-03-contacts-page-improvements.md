# Contacts Page High-Impact Improvements

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add bulk actions, column sorting, language filter, tag expand, clean empty cells, and row quick actions to the contacts list page.

**Architecture:** All filtering/sorting stays server-side via URL params passed to Supabase queries in the server component (`page.tsx`). Bulk selection is client-side state (`useState<Set<string>>`). Bulk mutations use Supabase browser client with `router.refresh()` after. The contacts-list.tsx client component is the main file being modified.

**Tech Stack:** Next.js 15 (server components + client components), Supabase, Tailwind CSS, Base UI primitives, Lucide icons

---

### Task 1: Clean Empty Cells (remove dashes)

**Files:**
- Modify: `src/features/contacts/contacts-list.tsx:216-236`

**Step 1: Replace all `?? "—"` with empty renders**

In the table body, change these lines:

```tsx
// Line 216: Email
<td className="px-4 py-3 text-gray-600">{c.email ?? "—"}</td>
// becomes:
<td className="px-4 py-3 text-gray-600">{c.email}</td>

// Line 217: Phone
<td className="px-4 py-3 text-gray-600">{c.phone ?? "—"}</td>
// becomes:
<td className="px-4 py-3 text-gray-600">{c.phone}</td>

// Line 223: Church
<td className="px-4 py-3 text-gray-600">{c.church_name ?? "—"}</td>
// becomes:
<td className="px-4 py-3 text-gray-600">{c.church_name}</td>

// Line 224: Language
<td className="px-4 py-3 text-gray-600">{c.language ?? "—"}</td>
// becomes:
<td className="px-4 py-3 text-gray-600">{c.language}</td>

// Lines 234-236: Region null case
<span className="text-gray-400">—</span>
// becomes:
null
```

**Step 2: Verify visually**

Run: `npm run dev` and check the contacts page — empty cells should be blank, not show dashes.

**Step 3: Commit**

```bash
git add src/features/contacts/contacts-list.tsx
git commit -m "fix(contacts): remove dash placeholders from empty cells"
```

---

### Task 2: Tag Expand on Click

**Files:**
- Modify: `src/features/contacts/contacts-list.tsx`

**Step 1: Add expandedTags state**

At the top of the `ContactsListClient` component (after `const [isPending, startTransition] = useTransition();`), add:

```tsx
const [expandedTags, setExpandedTags] = useState<Set<string>>(new Set());
```

Add `useState` to the React import on line 3:

```tsx
import { useCallback, useState, useTransition } from "react";
```

**Step 2: Replace the tags cell rendering**

Replace lines 238-249 (the tags `<td>`) with:

```tsx
<td className="px-4 py-3">
  <div className="flex flex-wrap gap-1">
    {(expandedTags.has(c.id) ? c.tags : c.tags.slice(0, 2)).map((tag) => (
      <span key={tag} className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs">
        {tag}
      </span>
    ))}
    {c.tags.length > 2 && (
      <button
        type="button"
        onClick={() => {
          setExpandedTags((prev) => {
            const next = new Set(prev);
            if (next.has(c.id)) next.delete(c.id);
            else next.add(c.id);
            return next;
          });
        }}
        className="text-cyan-600 hover:text-cyan-800 text-xs font-medium px-1"
      >
        {expandedTags.has(c.id) ? "show less" : `+${c.tags.length - 2}`}
      </button>
    )}
  </div>
</td>
```

Note: Changed from 3 to 2 visible tags by default for cleaner display.

**Step 3: Verify visually**

Check that tags show first 2 with a "+N" button, clicking expands to show all, clicking "show less" collapses.

**Step 4: Commit**

```bash
git add src/features/contacts/contacts-list.tsx
git commit -m "feat(contacts): add expandable tag display"
```

---

### Task 3: Column Sorting (server-side)

**Files:**
- Modify: `src/app/admin/contacts/page.tsx` (add sort params to query)
- Modify: `src/features/contacts/contacts-list.tsx` (sortable headers + pass sort state)

**Step 1: Update server component to accept sort params**

In `src/app/admin/contacts/page.tsx`, update the Props interface and query:

```tsx
interface Props {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    type?: string;
    region?: string;
    sort?: string;
    dir?: string;
  }>;
}
```

After the existing param parsing (line 27), add:

```tsx
const SORTABLE_COLUMNS = ["first_name", "email", "contact_type", "church_name", "created_at"] as const;
type SortColumn = typeof SORTABLE_COLUMNS[number];
const sortParam = params.sort as string | undefined;
const sort: SortColumn = SORTABLE_COLUMNS.includes(sortParam as SortColumn) ? (sortParam as SortColumn) : "created_at";
const dir = params.dir === "asc" ? "asc" : "desc";
```

Change the `.order()` call (line 53) from:

```tsx
.order("created_at", { ascending: false })
```

to:

```tsx
.order(sort, { ascending: dir === "asc" })
```

Pass the new props to the client component:

```tsx
<ContactsListClient
  contacts={contacts ?? []}
  regions={regions ?? []}
  totalCount={count ?? 0}
  page={page}
  pageSize={pageSize}
  search={search}
  typeFilter={typeFilter}
  regionFilter={regionFilter}
  sort={sort}
  dir={dir}
/>
```

**Step 2: Update client component Props and add sortable headers**

In `src/features/contacts/contacts-list.tsx`, update the Props interface:

```tsx
interface Props {
  contacts: ContactRow[];
  regions: Region[];
  totalCount: number;
  page: number;
  pageSize: number;
  search: string;
  typeFilter: string;
  regionFilter: string;
  sort: string;
  dir: string;
}
```

Update the component destructuring to include `sort` and `dir`.

Update `navigate` merged defaults to include sort/dir:

```tsx
const merged = { page: String(page), pageSize: String(pageSize), search, type: typeFilter, region: regionFilter, sort, dir, ...updates };
```

Update the param-skipping logic to also skip defaults for sort/dir:

```tsx
if (v && v !== "all" && v !== "1" && !(k === "pageSize" && v === "25") && !(k === "sort" && v === "created_at") && !(k === "dir" && v === "desc")) {
```

Add a helper function inside the component:

```tsx
function sortHeader(label: string, column: string) {
  const isActive = sort === column;
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 hover:text-gray-900"
      onClick={() => navigate({
        sort: column,
        dir: isActive && dir === "asc" ? "desc" : "asc",
        page: "1",
      })}
    >
      {label}
      {isActive ? (
        <span className="text-cyan-600">{dir === "asc" ? "▲" : "▼"}</span>
      ) : (
        <span className="text-gray-300">▲</span>
      )}
    </button>
  );
}
```

Replace the `<thead>` section:

```tsx
<thead>
  <tr className="bg-gray-50 border-b">
    <th className="text-left px-4 py-3 font-medium text-gray-600">
      {sortHeader("Name", "first_name")}
    </th>
    <th className="text-left px-4 py-3 font-medium text-gray-600">
      {sortHeader("Email", "email")}
    </th>
    <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
    <th className="text-left px-4 py-3 font-medium text-gray-600">
      {sortHeader("Type", "contact_type")}
    </th>
    <th className="text-left px-4 py-3 font-medium text-gray-600">
      {sortHeader("Church", "church_name")}
    </th>
    <th className="text-left px-4 py-3 font-medium text-gray-600">Language</th>
    <th className="text-left px-4 py-3 font-medium text-gray-600">Region</th>
    <th className="text-left px-4 py-3 font-medium text-gray-600">Tags</th>
  </tr>
</thead>
```

**Step 3: Verify**

Click column headers — URL should update with `?sort=email&dir=asc`, table should re-sort server-side.

**Step 4: Commit**

```bash
git add src/app/admin/contacts/page.tsx src/features/contacts/contacts-list.tsx
git commit -m "feat(contacts): add server-side column sorting"
```

---

### Task 4: Language Filter

**Files:**
- Modify: `src/app/admin/contacts/page.tsx` (fetch distinct languages, pass to client, filter query)
- Modify: `src/features/contacts/contacts-list.tsx` (add language dropdown)

**Step 1: Add language filter to server component**

In `src/app/admin/contacts/page.tsx`, add `language` to the searchParams type:

```tsx
language?: string;
```

After parsing regionFilter, add:

```tsx
const languageFilter = params.language ?? "all";
```

After the region filter query (line 46), add:

```tsx
if (languageFilter !== "all") {
  query = query.eq("language", languageFilter);
}
```

Fetch distinct languages (after the regions query):

```tsx
const { data: languageRows } = await supabase
  .from("contacts")
  .select("language")
  .not("language", "is", null)
  .not("language", "eq", "")
  .order("language");

const languages = [...new Set((languageRows ?? []).map((r) => r.language as string))];
```

Pass to client:

```tsx
<ContactsListClient
  ...existing props...
  languageFilter={languageFilter}
  languages={languages}
/>
```

**Step 2: Add language filter dropdown to client component**

Add to Props interface:

```tsx
languageFilter: string;
languages: string[];
```

Update component destructuring and `navigate` merged defaults to include `language: languageFilter`.

Add the language Select after the region Select (around line 176):

```tsx
<Select value={languageFilter} onValueChange={(v: string | null) => { if (v) navigate({ language: v, page: "1" }); }}>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="All Languages" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Languages</SelectItem>
    {languages.map((lang) => (
      <SelectItem key={lang} value={lang}>{lang}</SelectItem>
    ))}
  </SelectContent>
</Select>
```

**Step 3: Verify**

Check that the Language dropdown shows distinct language values and filters contacts.

**Step 4: Commit**

```bash
git add src/app/admin/contacts/page.tsx src/features/contacts/contacts-list.tsx
git commit -m "feat(contacts): add language filter dropdown"
```

---

### Task 5: Quick Actions Per Row

**Files:**
- Modify: `src/features/contacts/contacts-list.tsx`

**Step 1: Add lucide-react imports**

Add to imports:

```tsx
import { Eye, Pencil, Mail } from "lucide-react";
```

**Step 2: Add Actions column header**

After the Tags `<th>`, add:

```tsx
<th className="text-left px-4 py-3 font-medium text-gray-600 w-24">
  <span className="sr-only">Actions</span>
</th>
```

Update the empty state `colSpan` from `8` to `9`.

**Step 3: Add action buttons to each row**

After the tags `<td>`, add:

```tsx
<td className="px-4 py-3">
  <div className="flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
    <Link
      href={`/admin/contacts/${c.id}`}
      className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700"
      title="View"
    >
      <Eye className="w-4 h-4" />
    </Link>
    <Link
      href={`/admin/contacts/${c.id}?edit=true`}
      className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700"
      title="Edit"
    >
      <Pencil className="w-4 h-4" />
    </Link>
    {c.email && (
      <a
        href={`mailto:${c.email}`}
        className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700"
        title="Email"
      >
        <Mail className="w-4 h-4" />
      </a>
    )}
  </div>
</td>
```

**Step 4: Add group class to row**

Change the `<tr>` from:

```tsx
<tr key={c.id} className="hover:bg-gray-50/50">
```

to:

```tsx
<tr key={c.id} className="hover:bg-gray-50/50 group/row">
```

**Step 5: Verify**

Hover over a row — should see view/edit/email icons appear. Clicking them navigates correctly.

**Step 6: Commit**

```bash
git add src/features/contacts/contacts-list.tsx
git commit -m "feat(contacts): add hover quick action buttons per row"
```

---

### Task 6: Bulk Actions — Selection UI

**Files:**
- Modify: `src/features/contacts/contacts-list.tsx`

**Step 1: Add selection state**

Add after the `expandedTags` state:

```tsx
const [selected, setSelected] = useState<Set<string>>(new Set());

const allOnPageSelected = contacts.length > 0 && contacts.every((c) => selected.has(c.id));
const someSelected = selected.size > 0;

function toggleOne(id: string) {
  setSelected((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });
}

function toggleAll() {
  if (allOnPageSelected) {
    setSelected((prev) => {
      const next = new Set(prev);
      contacts.forEach((c) => next.delete(c.id));
      return next;
    });
  } else {
    setSelected((prev) => {
      const next = new Set(prev);
      contacts.forEach((c) => next.add(c.id));
      return next;
    });
  }
}
```

**Step 2: Add checkbox column header**

Add as the first `<th>` in `<thead>`:

```tsx
<th className="px-4 py-3 w-10">
  <input
    type="checkbox"
    checked={allOnPageSelected}
    onChange={toggleAll}
    className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
  />
</th>
```

**Step 3: Add checkbox to each row**

Add as the first `<td>` in each contact row (before the Name cell):

```tsx
<td className="px-4 py-3">
  <input
    type="checkbox"
    checked={selected.has(c.id)}
    onChange={() => toggleOne(c.id)}
    className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
  />
</td>
```

Update the empty state `colSpan` from `9` to `10`.

**Step 4: Commit**

```bash
git add src/features/contacts/contacts-list.tsx
git commit -m "feat(contacts): add row selection checkboxes"
```

---

### Task 7: Bulk Actions — Action Bar & Mutations

**Files:**
- Modify: `src/features/contacts/contacts-list.tsx`

**Step 1: Add imports for bulk action UI**

Add to existing dialog imports:

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { createClient } from "@/shared/utils/supabase/client";
```

**Step 2: Add bulk action state**

After the selection state, add:

```tsx
const [bulkDialog, setBulkDialog] = useState<"tags" | "region" | "type" | "delete" | null>(null);
const [bulkLoading, setBulkLoading] = useState(false);
const [bulkTagInput, setBulkTagInput] = useState("");
const [bulkTagMode, setBulkTagMode] = useState<"add" | "replace">("add");
const [bulkRegion, setBulkRegion] = useState("");
const [bulkType, setBulkType] = useState<ContactType | "">("");
```

**Step 3: Add bulk mutation handlers**

Add after the state declarations:

```tsx
async function executeBulk(action: () => Promise<void>) {
  setBulkLoading(true);
  try {
    await action();
    setSelected(new Set());
    setBulkDialog(null);
    router.refresh();
  } finally {
    setBulkLoading(false);
  }
}

async function bulkAssignTags() {
  const supabase = createClient();
  const newTags = bulkTagInput.split(",").map((t) => t.trim()).filter(Boolean);
  if (newTags.length === 0) return;
  const ids = [...selected];

  if (bulkTagMode === "replace") {
    await supabase.from("contacts").update({ tags: newTags }).in("id", ids);
  } else {
    // Fetch current tags, merge, update each
    const { data } = await supabase.from("contacts").select("id, tags").in("id", ids);
    for (const contact of data ?? []) {
      const merged = [...new Set([...(contact.tags ?? []), ...newTags])];
      await supabase.from("contacts").update({ tags: merged }).eq("id", contact.id);
    }
  }
}

async function bulkAssignRegion() {
  const supabase = createClient();
  await supabase.from("contacts").update({ region_id: bulkRegion || null }).in("id", [...selected]);
}

async function bulkChangeType() {
  const supabase = createClient();
  await supabase.from("contacts").update({ contact_type: bulkType as ContactType }).in("id", [...selected]);
}

async function bulkDelete() {
  const supabase = createClient();
  await supabase.from("contacts").delete().in("id", [...selected]);
}

function exportSelectedCSV() {
  const selectedContacts = contacts.filter((c) => selected.has(c.id));
  const headers = ["First Name", "Last Name", "Email", "Phone", "Type", "Church", "City", "Country", "Region", "Tags"];
  const rows = selectedContacts.map((c) => [
    c.first_name, c.last_name, c.email ?? "", c.phone ?? "",
    c.contact_type, c.church_name ?? "", c.city ?? "", c.country ?? "",
    c.region?.name ?? "", c.tags.join("; "),
  ]);
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
  ].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `contacts-selected-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
```

**Step 4: Add the floating action bar**

Place this just before the closing `</div>` of the component (before the final return's closing tag), after the table card div:

```tsx
{/* Bulk Action Bar */}
{someSelected && (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white rounded-xl shadow-2xl px-6 py-3 flex items-center gap-3">
    <span className="text-sm font-medium">{selected.size} selected</span>
    <div className="w-px h-5 bg-gray-600" />
    <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700" onClick={exportSelectedCSV}>
      Export
    </Button>
    <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700" onClick={() => { setBulkTagInput(""); setBulkTagMode("add"); setBulkDialog("tags"); }}>
      Tags
    </Button>
    <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700" onClick={() => { setBulkRegion(""); setBulkDialog("region"); }}>
      Region
    </Button>
    <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700" onClick={() => { setBulkType(""); setBulkDialog("type"); }}>
      Type
    </Button>
    <Button variant="ghost" size="sm" className="text-red-400 hover:bg-gray-700 hover:text-red-300" onClick={() => setBulkDialog("delete")}>
      Delete
    </Button>
    <div className="w-px h-5 bg-gray-600" />
    <Button variant="ghost" size="sm" className="text-gray-400 hover:bg-gray-700 hover:text-white" onClick={() => setSelected(new Set())}>
      Clear
    </Button>
  </div>
)}
```

**Step 5: Add bulk action dialogs**

Place right after the bulk action bar:

```tsx
{/* Assign Tags Dialog */}
<Dialog open={bulkDialog === "tags"} onOpenChange={(open) => { if (!open) setBulkDialog(null); }}>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Assign Tags to {selected.size} contacts</DialogTitle>
      <DialogDescription>Enter tags separated by commas.</DialogDescription>
    </DialogHeader>
    <div className="space-y-3">
      <Input
        placeholder="Tag 1, Tag 2, ..."
        value={bulkTagInput}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBulkTagInput(e.target.value)}
      />
      <div className="flex gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name="tagMode" checked={bulkTagMode === "add"} onChange={() => setBulkTagMode("add")} />
          Add to existing
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name="tagMode" checked={bulkTagMode === "replace"} onChange={() => setBulkTagMode("replace")} />
          Replace all
        </label>
      </div>
    </div>
    <DialogFooter>
      <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
      <Button onClick={() => executeBulk(bulkAssignTags)} disabled={bulkLoading}>
        {bulkLoading ? "Applying..." : "Apply"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

{/* Assign Region Dialog */}
<Dialog open={bulkDialog === "region"} onOpenChange={(open) => { if (!open) setBulkDialog(null); }}>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Assign Region to {selected.size} contacts</DialogTitle>
    </DialogHeader>
    <Select value={bulkRegion} onValueChange={(v: string | null) => setBulkRegion(v ?? "")}>
      <SelectTrigger>
        <SelectValue placeholder="Select region..." />
      </SelectTrigger>
      <SelectContent>
        {regions.map((r) => (
          <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
    <DialogFooter>
      <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
      <Button onClick={() => executeBulk(bulkAssignRegion)} disabled={bulkLoading || !bulkRegion}>
        {bulkLoading ? "Applying..." : "Apply"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

{/* Change Type Dialog */}
<Dialog open={bulkDialog === "type"} onOpenChange={(open) => { if (!open) setBulkDialog(null); }}>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Change Type for {selected.size} contacts</DialogTitle>
    </DialogHeader>
    <Select value={bulkType} onValueChange={(v: string | null) => setBulkType((v ?? "") as ContactType | "")}>
      <SelectTrigger>
        <SelectValue placeholder="Select type..." />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(contactTypeLabels).map(([val, label]) => (
          <SelectItem key={val} value={val}>{label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
    <DialogFooter>
      <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
      <Button onClick={() => executeBulk(bulkChangeType)} disabled={bulkLoading || !bulkType}>
        {bulkLoading ? "Applying..." : "Apply"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

{/* Delete Confirmation Dialog */}
<Dialog open={bulkDialog === "delete"} onOpenChange={(open) => { if (!open) setBulkDialog(null); }}>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Delete {selected.size} contacts?</DialogTitle>
      <DialogDescription>This action cannot be undone. These contacts and all their associated data will be permanently deleted.</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
      <Button variant="destructive" onClick={() => executeBulk(bulkDelete)} disabled={bulkLoading}>
        {bulkLoading ? "Deleting..." : `Delete ${selected.size} contacts`}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Step 6: Verify**

1. Select contacts with checkboxes — floating bar appears
2. Test "Export" — downloads CSV of selected only
3. Test "Tags" — dialog opens, can add/replace tags
4. Test "Region" — dialog opens, can assign region
5. Test "Type" — dialog opens, can change type
6. Test "Delete" — confirmation dialog, deletes contacts
7. Test "Clear" — deselects all, bar disappears

**Step 7: Commit**

```bash
git add src/features/contacts/contacts-list.tsx
git commit -m "feat(contacts): add bulk actions (export, tags, region, type, delete)"
```

---

### Task 8: Final Polish & Fix Contact Detail Link

**Files:**
- Modify: `src/features/contacts/contacts-list.tsx:210` (fix link path)

**Step 1: Fix contact link path**

The Name link currently points to `/contacts/${c.id}` but the admin route is `/admin/contacts/${c.id}`. Verify the current link and fix if needed:

```tsx
// Line 210 - ensure this uses the admin path:
<Link href={`/admin/contacts/${c.id}`} ...>
```

Also make sure the quick action links from Task 5 use `/admin/contacts/`.

**Step 2: Verify all features end to end**

Run through all 6 improvements:
1. Empty cells are blank (no dashes)
2. Tags show 2 + expandable "+N"
3. Column headers sort (Name, Email, Type, Church)
4. Language filter dropdown works
5. Hover shows View/Edit/Email icons
6. Checkboxes + bulk action bar with all 5 operations

**Step 3: Commit**

```bash
git add src/features/contacts/contacts-list.tsx
git commit -m "fix(contacts): ensure admin path prefix on all contact links"
```
