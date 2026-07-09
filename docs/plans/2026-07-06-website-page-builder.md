# Website Page Builder (CMS) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let admins edit all public website pages using the existing Craft.js page builder, with dynamic navigation.

**Architecture:** New `site_pages` table stores page metadata (title, slug, nav order) and Craft.js content as JSONB. Admin gets a `/admin/website` section to list/reorder pages and open the builder. Public header and catch-all `[...slug]` route render pages dynamically from the database. Existing hardcoded pages become seed data.

**Tech Stack:** Next.js (App Router), Craft.js, Supabase (PostgreSQL), Tailwind CSS, shadcn/ui

---

### Task 1: Database Migration — `site_pages` table

**Files:**
- Create: `supabase/migrations/018_site_pages.sql`

**Step 1: Write the migration**

```sql
-- ============================================================
-- Site Pages — Website CMS Page Builder
-- Stores editable website pages with Craft.js content
-- ============================================================

create table site_pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  sort_order int not null default 0,
  published boolean not null default false,
  show_in_nav boolean not null default true,
  is_home boolean not null default false,
  page_content jsonb,
  meta_title text,
  meta_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_site_pages_slug on site_pages(slug);
create index idx_site_pages_sort on site_pages(sort_order);

-- Only one home page allowed
create unique index idx_site_pages_home on site_pages(is_home) where is_home = true;

-- Updated-at trigger
create trigger trg_site_pages_updated_at before update on site_pages
  for each row execute function update_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table site_pages enable row level security;

-- Public can read published pages
create policy "Public can view published site pages"
  on site_pages for select
  using (published = true);

-- Admin full CRUD
create policy "Admins have full access to site_pages"
  on site_pages for all
  using (is_admin(auth.uid()));

-- ============================================================
-- Seed: Create default pages matching current hardcoded pages
-- (no page_content yet — will be populated via builder)
-- ============================================================

insert into site_pages (title, slug, sort_order, published, show_in_nav, is_home) values
  ('Home', 'home', 0, true, false, true),
  ('About', 'about', 1, true, true, false),
  ('Initiatives', 'initiatives', 2, true, true, false),
  ('Global Gatherings', 'gatherings', 3, true, true, false),
  ('Media', 'media', 4, true, true, false),
  ('Connect', 'connect', 5, true, true, false);
```

**Step 2: Apply migration locally**

Run: `supabase migration up`
Expected: Migration applies, `site_pages` table created with 6 seeded rows.

**Step 3: Commit**

```bash
git add supabase/migrations/018_site_pages.sql
git commit -m "feat(cms): add site_pages table for website page builder"
```

---

### Task 2: TypeScript Types — `SitePage` interface

**Files:**
- Modify: `src/shared/types/database.ts`

**Step 1: Add the SitePage type**

Add to the end of the file (before any closing braces):

```typescript
export interface SitePage {
  id: string;
  title: string;
  slug: string;
  sort_order: number;
  published: boolean;
  show_in_nav: boolean;
  is_home: boolean;
  page_content: Record<string, unknown> | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}
```

**Step 2: Commit**

```bash
git add src/shared/types/database.ts
git commit -m "feat(cms): add SitePage TypeScript interface"
```

---

### Task 3: Admin Website Pages List — `/admin/website`

**Files:**
- Create: `src/app/admin/website/page.tsx`
- Modify: `src/shared/components/admin-layout.tsx` (add nav item)

**Step 1: Create the admin website page list**

Create `src/app/admin/website/page.tsx`:

```tsx
import { createClient } from "@/shared/utils/supabase/server";
import { WebsitePageList } from "@/features/website/admin/website-page-list";
import type { SitePage } from "@/shared/types/database";

export const dynamic = "force-dynamic";

export default async function WebsitePagesAdmin() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_pages")
    .select("*")
    .order("sort_order");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Website Pages</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and edit your public website pages
          </p>
        </div>
      </div>
      <WebsitePageList initialPages={(data ?? []) as unknown as SitePage[]} />
    </div>
  );
}
```

**Step 2: Create the client-side page list component**

Create `src/features/website/admin/website-page-list.tsx`:

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/shared/utils/supabase/client";
import { Button } from "@/components/ui/button";
import type { SitePage } from "@/shared/types/database";

interface Props {
  initialPages: SitePage[];
}

export function WebsitePageList({ initialPages }: Props) {
  const [pages, setPages] = useState(initialPages);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const router = useRouter();

  async function handleReorder(id: string, direction: "up" | "down") {
    const idx = pages.findIndex((p) => p.id === id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= pages.length) return;

    const supabase = createClient();
    const a = pages[idx];
    const b = pages[swapIdx];

    await Promise.all([
      supabase.from("site_pages").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("site_pages").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);

    const updated = [...pages];
    const tempOrder = a.sort_order;
    updated[idx] = { ...a, sort_order: b.sort_order };
    updated[swapIdx] = { ...b, sort_order: tempOrder };
    updated.sort((x, y) => x.sort_order - y.sort_order);
    setPages(updated);
  }

  async function handleTogglePublished(id: string, published: boolean) {
    const supabase = createClient();
    await supabase.from("site_pages").update({ published: !published }).eq("id", id);
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, published: !published } : p)));
  }

  async function handleToggleNav(id: string, showInNav: boolean) {
    const supabase = createClient();
    await supabase.from("site_pages").update({ show_in_nav: !showInNav }).eq("id", id);
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, show_in_nav: !showInNav } : p)));
  }

  async function handleAdd() {
    if (!newTitle.trim() || !newSlug.trim()) return;
    const supabase = createClient();
    const maxOrder = pages.length > 0 ? Math.max(...pages.map((p) => p.sort_order)) : -1;
    const { data, error } = await supabase
      .from("site_pages")
      .insert({
        title: newTitle.trim(),
        slug: newSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        sort_order: maxOrder + 1,
        published: false,
        show_in_nav: true,
      })
      .select()
      .single();

    if (!error && data) {
      setPages((prev) => [...prev, data as unknown as SitePage]);
      setNewTitle("");
      setNewSlug("");
      setAdding(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const supabase = createClient();
    await supabase.from("site_pages").delete().eq("id", id);
    setPages((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-4">
      {/* Page List */}
      <div className="bg-white rounded-xl border divide-y">
        {pages.map((page, idx) => (
          <div
            key={page.id}
            className="flex items-center gap-4 px-5 py-4"
          >
            {/* Reorder buttons */}
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => handleReorder(page.id, "up")}
                disabled={idx === 0}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                onClick={() => handleReorder(page.id, "down")}
                disabled={idx === pages.length - 1}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Page info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{page.title}</span>
                {page.is_home && (
                  <span className="text-xs bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-full font-medium">
                    Home
                  </span>
                )}
                <span className="text-xs text-gray-400">/{page.slug}</span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <button
                  onClick={() => handleTogglePublished(page.id, page.published)}
                  className={`text-xs font-medium ${
                    page.published ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  {page.published ? "Published" : "Draft"}
                </button>
                <button
                  onClick={() => handleToggleNav(page.id, page.show_in_nav)}
                  className={`text-xs ${
                    page.show_in_nav ? "text-blue-600" : "text-gray-400"
                  }`}
                >
                  {page.show_in_nav ? "In Nav" : "Hidden from Nav"}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link href={`/admin/website/${page.id}/builder`}>
                <Button size="sm" variant="outline">
                  Edit Page
                </Button>
              </Link>
              {!page.is_home && (
                <button
                  onClick={() => handleDelete(page.id, page.title)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}

        {pages.length === 0 && (
          <div className="px-5 py-12 text-center text-gray-400">
            No pages yet. Add your first page below.
          </div>
        )}
      </div>

      {/* Add Page */}
      {adding ? (
        <div className="bg-white rounded-xl border p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Page Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => {
                  setNewTitle(e.target.value);
                  setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
                }}
                placeholder="e.g. Our Team"
                className="w-full border rounded-lg px-3 py-2 text-sm"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">URL Slug</label>
              <input
                type="text"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                placeholder="e.g. our-team"
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd}>Add Page</Button>
            <Button size="sm" variant="outline" onClick={() => { setAdding(false); setNewTitle(""); setNewSlug(""); }}>Cancel</Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setAdding(true)}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Page
        </Button>
      )}
    </div>
  );
}
```

**Step 3: Add "Website" nav item to admin sidebar**

In `src/shared/components/admin-layout.tsx`, add a new nav item after "Events" (line ~73) in the `navItems` array:

```typescript
{
  label: "Website",
  href: "/admin/website",
  icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  ),
},
```

**Step 4: Commit**

```bash
git add src/app/admin/website/page.tsx src/features/website/admin/website-page-list.tsx src/shared/components/admin-layout.tsx
git commit -m "feat(cms): add admin website pages list with reordering"
```

---

### Task 4: Website Page Builder — `/admin/website/[id]/builder`

**Files:**
- Create: `src/app/admin/website/[id]/builder/page.tsx`
- Create: `src/features/website/builder/site-page-builder.tsx`

**Step 1: Create the builder route page**

Create `src/app/admin/website/[id]/builder/page.tsx`:

```tsx
import { createClient } from "@/shared/utils/supabase/server";
import { notFound } from "next/navigation";
import { SitePageBuilder } from "@/features/website/builder/site-page-builder";
import type { SitePage } from "@/shared/types/database";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SiteBuilderPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: page, error } = await supabase
    .from("site_pages")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !page) notFound();

  return <SitePageBuilder page={page as unknown as SitePage} />;
}
```

**Step 2: Create the SitePageBuilder component**

This is an adaptation of the event `PageBuilder` from `src/features/events/builder/editor.tsx`. Key differences:
- No event context (no CraftEventTitle, CraftEventDates, etc.)
- No status dropdown
- No multi-page tabs (each site page is independent)
- Saves to `site_pages.page_content` instead of `events.page_content`
- Preview links to `/<slug>?preview=true`
- Back link goes to `/admin/website`

Create `src/features/website/builder/site-page-builder.tsx`:

```tsx
"use client";

import { useState, useCallback, useRef } from "react";
import { Editor, useEditor } from "@craftjs/core";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/shared/utils/supabase/client";
import type { SitePage } from "@/shared/types/database";

import { Viewport } from "@/features/events/builder/viewport";
import { RightPanel } from "@/features/events/builder/right-panel";

import { CraftText } from "@/features/events/builder/components/craft-text";
import { CraftImage } from "@/features/events/builder/components/craft-image";
import { CraftButton } from "@/features/events/builder/components/craft-button";
import { CraftVideo } from "@/features/events/builder/components/craft-video";
import { CraftContainer } from "@/features/events/builder/components/craft-container";
import { CraftRow } from "@/features/events/builder/components/craft-row";
import { CraftColumn } from "@/features/events/builder/components/craft-column";
import { CraftDivider } from "@/features/events/builder/components/craft-divider";
import { CraftSpacer } from "@/features/events/builder/components/craft-spacer";
import { CraftHeader } from "@/features/events/builder/components/craft-header";
import { CraftEmbed } from "@/features/events/builder/components/craft-embed";
import { CraftSocialLinks } from "@/features/events/builder/components/craft-social-links";
import { CraftMap } from "@/features/events/builder/components/craft-map";
import { CraftYouTube } from "@/features/events/builder/components/craft-youtube";
import { CraftCarousel } from "@/features/events/builder/components/craft-carousel";

// Event-specific components still included in resolver so existing content doesn't break
import { CraftEventTitle, CraftEventDates, CraftEventLocation, CraftRegisterButton } from "@/features/events/builder/components/event-data";
import { CraftRegistrationForm } from "@/features/events/builder/components/craft-registration-form";

const resolver = {
  CraftText,
  CraftImage,
  CraftButton,
  CraftVideo,
  CraftContainer,
  CraftRow,
  CraftColumn,
  CraftDivider,
  CraftSpacer,
  CraftHeader,
  CraftEmbed,
  CraftSocialLinks,
  CraftMap,
  CraftYouTube,
  CraftCarousel,
  // Include event components in resolver to avoid deserialization errors
  CraftEventTitle,
  CraftEventDates,
  CraftEventLocation,
  CraftRegisterButton,
  CraftRegistrationForm,
};

interface Props {
  page: SitePage;
}

export function SitePageBuilder({ page }: Props) {
  return (
    <Editor resolver={resolver}>
      <SiteEditorLayout page={page} />
    </Editor>
  );
}

const viewports = [
  { label: "Desktop", width: 1200, icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )},
  { label: "Tablet", width: 768, icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  )},
  { label: "Phone", width: 375, icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  )},
];

function SiteEditorLayout({ page }: { page: SitePage }) {
  const { query } = useEditor();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeViewport, setActiveViewport] = useState(0);
  const publishedRef = useRef(page.published);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaved(false);

    const currentJson = query.serialize();
    const supabase = createClient();

    await supabase
      .from("site_pages")
      .update({ page_content: JSON.parse(currentJson) })
      .eq("id", page.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [page.id, query]);

  const handleTogglePublished = useCallback(async () => {
    const supabase = createClient();
    const newVal = !publishedRef.current;
    await supabase.from("site_pages").update({ published: newVal }).eq("id", page.id);
    publishedRef.current = newVal;
    // Force re-render by triggering save feedback
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }, [page.id]);

  const previewSlug = page.is_home ? "/" : `/${page.slug}`;

  return (
    <div className="h-screen flex flex-col">
      {/* Top Bar */}
      <div className="h-14 bg-white border-b flex items-center px-4 gap-3 shrink-0">
        <Link
          href="/admin/website"
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        <div className="w-px h-6 bg-gray-200" />

        <h1 className="text-sm font-semibold text-gray-900 truncate">
          {page.title}
        </h1>

        <span className="text-xs text-gray-400">/{page.slug}</span>

        {/* Viewport Switcher - centered */}
        <div className="flex-1 flex items-center justify-center gap-1">
          {viewports.map((vp, idx) => (
            <button
              key={vp.label}
              onClick={() => setActiveViewport(idx)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeViewport === idx
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              {vp.icon}
              {vp.label}
            </button>
          ))}
        </div>

        {saved && (
          <span className="text-xs text-green-600 font-medium">Saved</span>
        )}

        <Button
          size="sm"
          variant="outline"
          disabled={saving}
          onClick={async () => {
            await handleSave();
            window.open(`${previewSlug}${previewSlug === "/" ? "" : ""}?preview=true`, "_blank");
          }}
        >
          Preview
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      {/* Body — reuse Viewport and RightPanel from event builder */}
      <div className="flex-1 flex overflow-hidden">
        <Viewport
          initialContent={page.page_content ? JSON.stringify(page.page_content) : null}
          canvasWidth={viewports[activeViewport].width}
        />
        <RightPanel />
      </div>
    </div>
  );
}
```

**Note:** The `Viewport` and `RightPanel` components from the event builder are reused directly. The `Viewport` component accepts `initialContent` (JSON string or null) and `canvasWidth`, and `RightPanel` provides the insert/themes tabs. The Pages tab will show but that's harmless since there's no PageContextProvider — we'll address that in the next step.

**Step 3: Wrap with a no-op PageContextProvider**

Since the `RightPanel` uses `PageContext` and the Pages tab expects it, we need to provide a minimal context. Update the `SitePageBuilder` component to wrap with `PageContextProvider`:

Add to the `SitePageBuilder` function in `site-page-builder.tsx`:

```tsx
import { PageContextProvider } from "@/features/events/builder/page-context";

// Inside SitePageBuilder, wrap Editor with PageContextProvider
export function SitePageBuilder({ page }: Props) {
  return (
    <Editor resolver={resolver}>
      <PageContextProvider value={{
        activePageId: null,
        switchPage: () => {},
        pages: [],
        setPages: () => {},
        refreshPages: async () => {},
      }}>
        <SiteEditorLayout page={page} />
      </PageContextProvider>
    </Editor>
  );
}
```

**Step 4: Verify the builder loads**

Run: `npm run dev`
Navigate to: `/admin/website` — should show the 6 seeded pages
Click "Edit Page" on any page — builder should load with empty canvas

**Step 5: Commit**

```bash
git add src/app/admin/website/[id]/builder/page.tsx src/features/website/builder/site-page-builder.tsx
git commit -m "feat(cms): add website page builder using Craft.js"
```

---

### Task 5: Dynamic Public Header — fetch nav from `site_pages`

**Files:**
- Modify: `src/shared/components/public-header.tsx`
- Create: `src/shared/components/public-header-nav.tsx` (client component for interactivity)

**Step 1: Create a server-side header wrapper that fetches pages**

The current `PublicHeader` is a client component with hardcoded `navLinks`. We need to:
1. Create a server component that fetches published `site_pages` with `show_in_nav = true`
2. Pass them to a client component for rendering

Replace `src/shared/components/public-header.tsx` with:

```tsx
import { createClient } from "@/shared/utils/supabase/server";
import { PublicHeaderNav } from "./public-header-nav";

export async function PublicHeader() {
  const supabase = await createClient();
  const { data: pages } = await supabase
    .from("site_pages")
    .select("title, slug, is_home, show_in_nav")
    .eq("published", true)
    .eq("show_in_nav", true)
    .order("sort_order");

  const navLinks = (pages ?? []).map((p) => ({
    label: p.title,
    href: p.is_home ? "/" : `/${p.slug}`,
  }));

  // Fallback if no site pages in DB yet
  const links = navLinks.length > 0 ? navLinks : [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Initiatives", href: "/initiatives" },
    { label: "Global Gatherings", href: "/gatherings" },
    { label: "Media", href: "/media" },
    { label: "Connect", href: "/connect" },
  ];

  return <PublicHeaderNav navLinks={links} />;
}
```

**Step 2: Extract the client-side nav rendering**

Create `src/shared/components/public-header-nav.tsx` — this is the existing `PublicHeader` component contents but receiving `navLinks` as a prop instead of hardcoding them:

```tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface NavLink {
  label: string;
  href: string;
}

interface Props {
  navLinks: NavLink[];
}

export function PublicHeaderNav({ navLinks }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#0f2744]/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <Image
              src="/bsh-logo.png"
              alt="Billion Soul Harvest"
              width={180}
              height={48}
              className="h-10 w-auto brightness-0 invert"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "text-[#29BDD6] bg-white/5"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/connect"
              className="hidden sm:inline-flex items-center gap-2 bg-[#29BDD6] hover:bg-[#1a9ab5] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Join the Movement
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden text-gray-300 hover:text-white p-1"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="lg:hidden pb-4 border-t border-white/10 pt-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "text-[#29BDD6] bg-white/5"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/connect"
              onClick={() => setMobileOpen(false)}
              className="block text-center bg-[#29BDD6] hover:bg-[#1a9ab5] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors mt-3"
            >
              Join the Movement
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
```

**Step 3: Update the public layout to use async header**

The `PublicHeader` is now a server component (async). Check that `src/app/(public)/layout.tsx` doesn't need changes — it should work since it's already a server component importing `PublicHeader`. Verify it renders.

**Step 4: Update the public footer nav links to also be dynamic**

In `src/shared/components/public-footer.tsx`, update the Quick Links section to also query `site_pages`. Since the footer is already a server component (no "use client"), convert it:

Replace the hardcoded links array in `public-footer.tsx` with a dynamic fetch:

```tsx
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/shared/utils/supabase/server";

export async function PublicFooter() {
  const supabase = await createClient();
  const { data: pages } = await supabase
    .from("site_pages")
    .select("title, slug, is_home, show_in_nav")
    .eq("published", true)
    .eq("show_in_nav", true)
    .order("sort_order");

  const quickLinks = (pages ?? [])
    .filter((p) => !p.is_home)
    .map((p) => ({ label: p.title, href: `/${p.slug}` }));

  // Fallback
  const links = quickLinks.length > 0 ? quickLinks : [
    { label: "About", href: "/about" },
    { label: "Initiatives", href: "/initiatives" },
    { label: "Global Gatherings", href: "/gatherings" },
    { label: "Media", href: "/media" },
    { label: "Connect", href: "/connect" },
  ];

  return (
    <footer className="bg-[#0a1e38] border-t border-white/10">
      {/* ... rest of footer stays the same but uses `links` variable instead of hardcoded array */}
    </footer>
  );
}
```

**Step 5: Commit**

```bash
git add src/shared/components/public-header.tsx src/shared/components/public-header-nav.tsx src/shared/components/public-footer.tsx
git commit -m "feat(cms): dynamic header/footer navigation from site_pages"
```

---

### Task 6: Public Page Rendering — catch-all `[...slug]` route

**Files:**
- Create: `src/app/(public)/[...slug]/page.tsx`

**Step 1: Create the catch-all route**

This route catches any slug that doesn't match an existing hardcoded route (like `/register/[eventSlug]`, `/events`, `/gatherings`). It looks up the slug in `site_pages` and renders the Craft.js content.

Create `src/app/(public)/[...slug]/page.tsx`:

```tsx
import { createClient } from "@/shared/utils/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { SitePage } from "@/shared/types/database";
import { CraftPageRenderer } from "@/features/events/builder/render";
import Link from "next/link";

interface Props {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ preview?: string }>;
}

// Reserved slugs that have their own routes — don't intercept
const RESERVED_SLUGS = [
  "about", "initiatives", "gatherings", "media", "connect",
  "events", "register", "login", "admin", "contact", "leadership",
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pageSlug = slug.join("/");

  if (RESERVED_SLUGS.includes(slug[0])) return {};

  const supabase = await createClient();
  const { data } = await supabase
    .from("site_pages")
    .select("title, meta_title, meta_description")
    .eq("slug", pageSlug)
    .single();

  if (!data) return { title: "Page Not Found" };
  return {
    title: data.meta_title || `${data.title} — Billion Soul Harvest`,
    description: data.meta_description ?? undefined,
  };
}

export default async function CatchAllPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === "true";
  const pageSlug = slug.join("/");

  // Don't intercept reserved slugs
  if (RESERVED_SLUGS.includes(slug[0])) {
    notFound();
  }

  const supabase = await createClient();

  let query = supabase
    .from("site_pages")
    .select("*")
    .eq("slug", pageSlug);

  if (!isPreview) {
    query = query.eq("published", true);
  }

  const { data } = await query.single();

  if (!data) notFound();

  const page = data as unknown as SitePage;

  if (!page.page_content) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <p className="text-gray-400 text-lg">This page is under construction.</p>
      </div>
    );
  }

  // Create a minimal event-like object for the renderer
  // The renderer expects an Event but site pages don't have event data
  // Event-specific components (CraftEventTitle etc.) will just render fallbacks
  const dummyEvent = {
    id: page.id,
    title: page.title,
    slug: page.slug,
    status: "published",
    start_date: null,
    end_date: null,
    location: null,
    city: null,
    country: null,
    registration_config: null,
  };

  return (
    <div>
      {isPreview && (
        <div className="bg-amber-500 text-amber-950 text-center text-sm font-medium py-2 px-4">
          Preview Mode — This page is not yet published.
          <Link href="/admin/website" className="underline ml-2">Back to Admin</Link>
        </div>
      )}
      <CraftPageRenderer
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        content={page.page_content as any}
        event={dummyEvent as any}
        pages={[]}
      />
    </div>
  );
}
```

**Step 2: Update the home page to check for site_pages content**

Modify `src/app/(public)/page.tsx` to check if the home site page has Craft.js content. If so, render from builder. Otherwise, keep the existing hardcoded content as fallback.

Add at the top of the existing default export function:

```tsx
import { createClient } from "@/shared/utils/supabase/server";
import { CraftPageRenderer } from "@/features/events/builder/render";

export default async function HomePage() {
  const supabase = await createClient();

  // Check if home page has builder content
  const { data: homePage } = await supabase
    .from("site_pages")
    .select("*")
    .eq("is_home", true)
    .eq("published", true)
    .single();

  if (homePage?.page_content) {
    const dummyEvent = {
      id: homePage.id,
      title: homePage.title,
      slug: "home",
      status: "published",
      start_date: null,
      end_date: null,
      location: null,
      city: null,
      country: null,
      registration_config: null,
    };

    return (
      <CraftPageRenderer
        content={homePage.page_content as any}
        event={dummyEvent as any}
        pages={[]}
      />
    );
  }

  // Existing hardcoded home page content below...
```

**Step 3: Apply same pattern to other existing public pages**

For each of `/about`, `/initiatives`, `/media`, `/connect` — add the same check at the top of their page components. If a matching `site_pages` row with `page_content` exists, render from builder. Otherwise fall back to current hardcoded content.

For each page, add this pattern at the top of the default export:

```tsx
// In src/app/(public)/about/page.tsx:
const supabase = await createClient();
const { data: sitePage } = await supabase
  .from("site_pages")
  .select("*")
  .eq("slug", "about")
  .eq("published", true)
  .single();

if (sitePage?.page_content) {
  const dummyEvent = {
    id: sitePage.id, title: sitePage.title, slug: "about",
    status: "published", start_date: null, end_date: null,
    location: null, city: null, country: null, registration_config: null,
  };
  return (
    <CraftPageRenderer
      content={sitePage.page_content as any}
      event={dummyEvent as any}
      pages={[]}
    />
  );
}
// ... existing hardcoded content continues
```

Apply to: `about/page.tsx`, `initiatives/page.tsx`, `media/page.tsx`, `connect/page.tsx`

Do NOT apply to: `gatherings/page.tsx`, `events/page.tsx` (these are data-driven and stay as-is per design decision), `register/`, `login/`

**Step 4: Commit**

```bash
git add src/app/(public)/[...slug]/page.tsx src/app/(public)/page.tsx src/app/(public)/about/page.tsx src/app/(public)/initiatives/page.tsx src/app/(public)/media/page.tsx src/app/(public)/connect/page.tsx
git commit -m "feat(cms): public page rendering from site_pages with fallback to hardcoded content"
```

---

### Task 7: Remove RESERVED_SLUGS for pages that have builder content

**Files:**
- Modify: `src/app/(public)/[...slug]/page.tsx`

Once the existing hardcoded pages (about, initiatives, media, connect) are checking `site_pages` first and falling back, the catch-all `[...slug]` route should NOT intercept these existing routes. Next.js routing already handles this — static routes (`/about/page.tsx`) take priority over catch-all `[...slug]/page.tsx`. So the `RESERVED_SLUGS` check is just a safety net.

**Step 1: Verify routing priority**

Run `npm run dev` and confirm:
- `/about` → renders from `src/app/(public)/about/page.tsx` (NOT from catch-all)
- `/some-new-slug` → renders from catch-all
- `/admin/website` → renders admin page list

**Step 2: Commit (if any changes needed)**

```bash
git commit -m "chore: verify routing priority for site pages"
```

---

### Task 8: End-to-End Test

**Step 1: Test the full flow manually**

1. Go to `/admin/website` — should see 6 pages (Home, About, Initiatives, Global Gatherings, Media, Connect)
2. Click "Edit Page" on Home — builder should open with empty canvas
3. Add a CraftContainer with background, CraftText with "Welcome to BSH"
4. Click Save
5. Go to `/` — should now show the builder content instead of the hardcoded home page
6. Go to `/admin/website`, click "Add Page", create a new page (e.g., "Resources" with slug "resources")
7. Edit it in the builder, add content, save
8. Publish it (toggle published in the page list)
9. Toggle "In Nav" to show it in navigation
10. Go to public site — navigation should now include "Resources"
11. Click "Resources" — should render the builder content at `/resources`
12. Reorder pages in admin — nav order should update on public site

**Step 2: Final commit**

```bash
git add -A
git commit -m "feat(cms): website page builder — complete implementation"
```

---

## Summary of Files

### New Files
| File | Purpose |
|------|---------|
| `supabase/migrations/018_site_pages.sql` | Database table + RLS + seed data |
| `src/app/admin/website/page.tsx` | Admin page list route |
| `src/app/admin/website/[id]/builder/page.tsx` | Admin builder route |
| `src/features/website/admin/website-page-list.tsx` | Page list with reorder/add/delete |
| `src/features/website/builder/site-page-builder.tsx` | Craft.js builder adapted for site pages |
| `src/shared/components/public-header-nav.tsx` | Client-side nav rendering |
| `src/app/(public)/[...slug]/page.tsx` | Catch-all route for dynamic pages |

### Modified Files
| File | Change |
|------|--------|
| `src/shared/types/database.ts` | Add `SitePage` interface |
| `src/shared/components/admin-layout.tsx` | Add "Website" nav item |
| `src/shared/components/public-header.tsx` | Server component fetching nav from DB |
| `src/shared/components/public-footer.tsx` | Dynamic footer links from DB |
| `src/app/(public)/page.tsx` | Check site_pages before hardcoded content |
| `src/app/(public)/about/page.tsx` | Check site_pages before hardcoded content |
| `src/app/(public)/initiatives/page.tsx` | Check site_pages before hardcoded content |
| `src/app/(public)/media/page.tsx` | Check site_pages before hardcoded content |
| `src/app/(public)/connect/page.tsx` | Check site_pages before hardcoded content |
