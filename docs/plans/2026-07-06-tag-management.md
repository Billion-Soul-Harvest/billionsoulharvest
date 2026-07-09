# Tag Management Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a tag management page under People Management with create, rename, delete, bulk delete, and search.

**Architecture:** New `tags` + polymorphic `taggables` tables. Server page fetches tags with contact counts via RPC. Client component handles CRUD with dialogs and toast feedback. Keep `contacts.tags` text[] in sync via RPCs.

**Tech Stack:** Supabase (migration, RPCs, RLS), Next.js server page, React client component, shadcn Dialog, sonner toast, lucide-react icons.

---

### Task 1: Create migration `021_tags_and_taggables.sql`

**Files:**
- Create: `supabase/migrations/021_tags_and_taggables.sql`

**Step 1: Write migration**

```sql
-- Tags registry
CREATE TABLE tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_tags_updated_at
  BEFORE UPDATE ON tags FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access on tags" ON tags FOR ALL
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Public read tags" ON tags FOR SELECT USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON tags TO authenticated;
GRANT SELECT ON tags TO anon;
GRANT ALL ON tags TO service_role;

-- Polymorphic join table
CREATE TABLE taggables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  taggable_id uuid NOT NULL,
  taggable_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tag_id, taggable_id, taggable_type)
);

CREATE INDEX idx_taggables_tag_id ON taggables(tag_id);
CREATE INDEX idx_taggables_taggable ON taggables(taggable_id, taggable_type);

ALTER TABLE taggables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access on taggables" ON taggables FOR ALL
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON taggables TO authenticated;
GRANT ALL ON taggables TO service_role;

-- Seed tags from existing contacts.tags
INSERT INTO tags (name)
SELECT DISTINCT unnest(tags)
FROM contacts
WHERE tags IS NOT NULL AND array_length(tags, 1) > 0
ON CONFLICT (name) DO NOTHING;

-- Populate taggables from existing contacts.tags
INSERT INTO taggables (tag_id, taggable_id, taggable_type)
SELECT t.id, c.id, 'contact'
FROM contacts c, unnest(c.tags) AS tag_name
JOIN tags t ON t.name = tag_name
WHERE c.tags IS NOT NULL AND array_length(c.tags, 1) > 0
ON CONFLICT DO NOTHING;

-- RPC: get all tags with contact counts
CREATE OR REPLACE FUNCTION get_tags_with_counts()
RETURNS TABLE(id uuid, name text, created_at timestamptz, contact_count bigint) AS $$
  SELECT t.id, t.name, t.created_at,
    COUNT(tg.id) FILTER (WHERE tg.taggable_type = 'contact') AS contact_count
  FROM tags t
  LEFT JOIN taggables tg ON tg.tag_id = t.id
  GROUP BY t.id, t.name, t.created_at;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- RPC: rename tag (updates tags table + contacts.tags array)
CREATE OR REPLACE FUNCTION rename_tag(p_old text, p_new text)
RETURNS void AS $$
BEGIN
  UPDATE tags SET name = p_new WHERE name = p_old;
  UPDATE contacts SET tags = array_replace(tags, p_old, p_new)
    WHERE tags @> ARRAY[p_old];
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: delete tag (deletes from tags + removes from contacts.tags array)
CREATE OR REPLACE FUNCTION delete_tag(p_name text)
RETURNS void AS $$
BEGIN
  DELETE FROM tags WHERE name = p_name;
  UPDATE contacts SET tags = array_remove(tags, p_name)
    WHERE tags @> ARRAY[p_name];
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: bulk delete tags
CREATE OR REPLACE FUNCTION delete_tags(p_names text[])
RETURNS void AS $$
BEGIN
  DELETE FROM tags WHERE name = ANY(p_names);
  UPDATE contacts SET tags = (
    SELECT COALESCE(array_agg(elem), '{}')
    FROM unnest(tags) AS elem
    WHERE elem != ALL(p_names)
  )
  WHERE tags && p_names;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_tags_with_counts TO authenticated;
GRANT EXECUTE ON FUNCTION rename_tag TO authenticated;
GRANT EXECUTE ON FUNCTION delete_tag TO authenticated;
GRANT EXECUTE ON FUNCTION delete_tags TO authenticated;
```

**Step 2: Apply migration**

Run: `npx supabase migration up`
Expected: Migration applied successfully

**Step 3: Commit**

```bash
git add supabase/migrations/021_tags_and_taggables.sql
git commit -m "feat(tags): add tags and taggables tables with RPCs"
```

---

### Task 2: Add nav item to admin layout

**Files:**
- Modify: `src/shared/components/admin-layout.tsx`

**Step 1: Add "Tags" nav item**

In the `navItems` array, find the People Management group's `children` array (after Positions). Add a new entry:

```tsx
{
  label: "Tags",
  href: "/admin/tags",
  icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
},
```

**Step 2: Commit**

```bash
git add src/shared/components/admin-layout.tsx
git commit -m "feat(tags): add Tags nav item under People Management"
```

---

### Task 3: Create server page `src/app/admin/tags/page.tsx`

**Files:**
- Create: `src/app/admin/tags/page.tsx`

**Step 1: Write server page**

```tsx
import { createClient } from "@/shared/utils/supabase/server";
import { TagsManager } from "@/features/tags/tags-manager";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tags — BSH Admin",
};

export default async function TagsPage() {
  const supabase = await createClient();
  const { data: tags } = await supabase.rpc("get_tags_with_counts");

  return <TagsManager tags={tags ?? []} />;
}
```

**Step 2: Commit** (will commit together with Task 4)

---

### Task 4: Create client component `src/features/tags/tags-manager.tsx`

**Files:**
- Create: `src/features/tags/tags-manager.tsx`

This is the main component. It should implement:

**Header:**
- `<h1>` "Manage tags"
- Subtitle: "Tags are simple labels used to help organize and filter your contacts."
- "+ Create new tag" button (top right)

**Search + count bar:**
- "All tags" with count badge
- Search input "Search by tag name" (client-side filter on the loaded tags)

**Table:**
- Columns: Checkbox | Name (sortable) | Contacts (sortable) | Date created (sortable) | Actions (3-dot)
- Default sort: created_at DESC
- Row checkboxes + header "select all" checkbox
- When items selected: show "Delete selected (N)" button next to search
- 3-dot menu per row: simple `<button>` that toggles a positioned div with "Rename" and "Delete" options

**Dialogs (using existing `@/components/ui/dialog`):**

1. **Create tag dialog:** "Tag name" input with 255 char limit + counter (`{length}/255`), Cancel/Create buttons. On create: `supabase.from("tags").insert({ name })`, then add to local state + toast success.

2. **Rename tag dialog:** Pre-filled input, Cancel/Save. On save: `supabase.rpc("rename_tag", { p_old, p_new })`, update local state + toast.

3. **Delete tag dialog:** "Delete '{name}'? This will remove the tag from {count} contacts. This cannot be undone." Cancel/Delete. On delete: `supabase.rpc("delete_tag", { p_name })`, remove from local state + toast.

4. **Bulk delete:** Uses same confirmation pattern. On confirm: `supabase.rpc("delete_tags", { p_names })`.

**Sort state:** `useState<{ col: string; dir: "asc" | "desc" }>({ col: "created_at", dir: "desc" })`

**Key imports:**
- `@/components/ui/input` — search + dialog inputs
- `@/components/ui/button` — buttons
- `@/components/ui/badge` — count badge
- `@/components/ui/dialog` — Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription
- `@/components/ui/checkbox` — table checkboxes
- `sonner` — toast
- `lucide-react` — Search, Plus, MoreVertical, Pencil, Trash2
- `@/shared/utils/supabase/client` — createClient

**Step 1: Write the component**

Create `src/features/tags/tags-manager.tsx` with all the above.

**Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/app/admin/tags/page.tsx src/features/tags/tags-manager.tsx
git commit -m "feat(tags): add tag management page with CRUD and bulk delete"
```

---

### Task 5: Verify in browser

**Step 1:** Navigate to `/admin/tags`
**Step 2:** Verify table renders with existing tags, contact counts, dates
**Step 3:** Create a new tag via dialog
**Step 4:** Rename it
**Step 5:** Delete it
**Step 6:** Test bulk selection + delete
**Step 7:** Test search filtering
**Step 8:** Test column sorting

---

### Task 6: Check for checkbox component

Before Task 4, verify `@/components/ui/checkbox` exists. If not, use a plain `<input type="checkbox">` styled with Tailwind instead. Check with:

```bash
ls src/components/ui/checkbox.tsx
```

If missing, use inline checkbox:
```tsx
<input type="checkbox" className="size-4 rounded border-gray-300" />
```

---

### Task 7: Final commit and push

```bash
git push origin main
```
