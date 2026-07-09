# Database-Driven Public Footer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the public website footer data-driven — stored in `site_settings` table, editable by admins, with no footer rendered if no config exists.

**Architecture:** A `site_settings` key-value table stores footer config as JSON. `PublicFooter` reads it server-side and renders nothing if absent. Admin UI on the existing `/admin/website` page provides a form to create/edit footer content.

**Tech Stack:** Supabase (Postgres migration, RLS), Next.js server components, React client components

---

### Task 1: Create `site_settings` migration

**Files:**
- Create: `supabase/migrations/024_site_settings.sql`

**Step 1: Write the migration**

```sql
-- ============================================================
-- Site Settings — Key-value store for site-wide configuration
-- ============================================================

create table site_settings (
  key text primary key,
  value jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- Updated-at trigger
create trigger trg_site_settings_updated_at before update on site_settings
  for each row execute function update_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table site_settings enable row level security;

grant select, insert, update, delete on site_settings to anon, authenticated, service_role;

-- Public can read settings
create policy "Public can view site settings"
  on site_settings for select
  using (true);

-- Admin full CRUD
create policy "Admins have full access to site_settings"
  on site_settings for all
  using (is_admin(auth.uid()));
```

**Step 2: Apply migration**

Run: `npx supabase migration up` (local) — verify table exists.

**Step 3: Commit**

```
feat: add site_settings table for site-wide configuration
```

---

### Task 2: Add TypeScript types

**Files:**
- Modify: `src/shared/types/database.ts`

**Step 1: Add interfaces at the end of the file**

```typescript
export interface SiteSettings {
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
}

export interface FooterConfig {
  description: string;
  email: string;
  copyrightText?: string;
}
```

**Step 2: Verify**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```
feat: add SiteSettings and FooterConfig types
```

---

### Task 3: Update `PublicFooter` to read from DB

**Files:**
- Modify: `src/shared/components/public-footer.tsx`

**Step 1: Replace the entire file**

The footer should:
- Read `footer_config` from `site_settings`
- If no row exists, render nothing (`return null`)
- Quick links still auto-generated from `site_pages`
- Structure stays the same (logo, description, quick links, connect, copyright)

```tsx
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/shared/utils/supabase/server";
import type { FooterConfig } from "@/shared/types/database";

export async function PublicFooter() {
  const supabase = await createClient();

  // Read footer config
  const { data: settings } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "footer_config")
    .single();

  if (!settings) return null;

  const config = settings.value as unknown as FooterConfig;

  // Read nav links
  const { data: pages } = await supabase
    .from("site_pages")
    .select("title, slug, is_home, show_in_nav")
    .eq("published", true)
    .eq("show_in_nav", true)
    .order("sort_order");

  const links = (pages ?? [])
    .filter((p) => !p.is_home)
    .map((p) => ({ label: p.title, href: `/${p.slug}` }));

  const copyrightText = config.copyrightText
    || `© ${new Date().getFullYear()} Billion Soul Harvest. All rights reserved.`;

  return (
    <footer className="bg-[#0a1e38] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <Image
                src="/bsh-logo.png"
                alt="Billion Soul Harvest"
                width={200}
                height={54}
                className="h-12 w-auto brightness-0 invert"
              />
            </div>
            <p className="text-gray-400 text-sm max-w-md leading-relaxed">
              {config.description}
            </p>
          </div>

          {/* Quick Links */}
          {links.length > 0 && (
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Quick Links</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-gray-400 hover:text-[#29BDD6] text-sm transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Connect */}
          {config.email && (
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Connect</h4>
              <ul className="space-y-2.5">
                <li>
                  <a href={`mailto:${config.email}`} className="text-gray-400 hover:text-[#29BDD6] text-sm transition-colors">
                    {config.email}
                  </a>
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-gray-500 text-xs">
            {copyrightText}
          </p>
          <a
            href={process.env.NEXT_PUBLIC_ADMIN_DOMAIN ? `https://${process.env.NEXT_PUBLIC_ADMIN_DOMAIN}/login` : "/login"}
            className="text-gray-500 hover:text-gray-400 text-xs transition-colors"
          >
            Admin Login
          </a>
        </div>
      </div>
    </footer>
  );
}
```

**Step 2: Verify**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```
feat: make PublicFooter data-driven from site_settings
```

---

### Task 4: Add admin footer settings UI

**Files:**
- Create: `src/features/website/admin/footer-settings.tsx`
- Modify: `src/app/admin/website/page.tsx`

**Step 1: Create the footer settings client component**

`src/features/website/admin/footer-settings.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/shared/utils/supabase/client";
import type { FooterConfig } from "@/shared/types/database";

interface Props {
  initialConfig: FooterConfig | null;
}

export function FooterSettings({ initialConfig }: Props) {
  const [config, setConfig] = useState<FooterConfig>(
    initialConfig ?? { description: "", email: "" }
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    const supabase = createClient();

    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "footer_config", value: config as unknown as Record<string, unknown> }, { onConflict: "key" });

    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Footer Settings</h2>
          <p className="text-sm text-gray-500">Configure the public website footer. Leave empty and save to hide the footer.</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-xs text-green-600 font-medium">Saved</span>}
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Footer"}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
          <textarea
            value={config.description}
            onChange={(e) => setConfig({ ...config, description: e.target.value })}
            rows={3}
            className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="A brief description of your organization shown in the footer..."
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Contact Email</label>
          <Input
            type="email"
            value={config.email}
            onChange={(e) => setConfig({ ...config, email: e.target.value })}
            placeholder="info@example.org"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Copyright Text (optional)</label>
          <Input
            value={config.copyrightText ?? ""}
            onChange={(e) => setConfig({ ...config, copyrightText: e.target.value || undefined })}
            placeholder={`© ${new Date().getFullYear()} Billion Soul Harvest. All rights reserved.`}
          />
          <p className="text-xs text-gray-400 mt-1">Leave empty to use default with current year.</p>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Update the admin website page to include footer settings**

In `src/app/admin/website/page.tsx`, add the footer settings section below the page list. Fetch the `footer_config` from `site_settings` and pass it to the component.

```tsx
import { createClient } from "@/shared/utils/supabase/server";
import { WebsitePageList } from "@/features/website/admin/website-page-list";
import { FooterSettings } from "@/features/website/admin/footer-settings";
import type { SitePage, FooterConfig } from "@/shared/types/database";

export const dynamic = "force-dynamic";

export default async function WebsitePagesAdmin() {
  const supabase = await createClient();

  const [{ data, error }, { data: footerRow }] = await Promise.all([
    supabase
      .from("site_pages")
      .select("*")
      .order("sort_order"),
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "footer_config")
      .single(),
  ]);

  if (error) console.error("site_pages fetch error:", error);

  const footerConfig = footerRow
    ? (footerRow.value as unknown as FooterConfig)
    : null;

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

      <div className="mt-8">
        <FooterSettings initialConfig={footerConfig} />
      </div>
    </div>
  );
}
```

**Step 3: Verify**

Run: `npx tsc --noEmit`

**Step 4: Commit**

```
feat: add footer settings admin UI on website pages
```

---

### Task 5: Verify end-to-end

**Step 1:** Start dev server (`npm run dev`) and navigate to `/admin/website`
**Step 2:** Verify the Footer Settings panel appears below the page list
**Step 3:** Fill in description and email, click Save
**Step 4:** Visit the public website — footer should appear with the saved content
**Step 5:** Clear description and email, save — footer should disappear
**Step 6:** Run `npx tsc --noEmit` — clean compilation
