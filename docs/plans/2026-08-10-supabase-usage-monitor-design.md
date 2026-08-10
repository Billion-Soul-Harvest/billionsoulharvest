# Supabase Usage Monitor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a compact sidebar usage widget and a detailed `/admin/settings/usage` page showing Supabase free tier resource consumption.

**Architecture:** A Postgres function returns DB size stats, and the Supabase Storage API provides file storage stats. A server action combines both, cached for 5 minutes. The sidebar renders compact progress bars; the detail page shows full breakdowns.

**Tech Stack:** Next.js server actions, Supabase service client, Postgres `pg_database_size`/`pg_total_relation_size`, Supabase Storage API.

---

### Task 1: Create Postgres function for database usage stats

**Files:**
- Create: `supabase/migrations/20260810_get_database_usage.sql`

**Step 1: Write the migration SQL**

```sql
CREATE OR REPLACE FUNCTION public.get_database_usage()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_size', pg_database_size(current_database()),
    'total_size_pretty', pg_size_pretty(pg_database_size(current_database())),
    'tables', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'name', schemaname || '.' || tablename,
          'total_size', pg_total_relation_size(schemaname || '.' || tablename),
          'total_size_pretty', pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)),
          'table_size', pg_relation_size(schemaname || '.' || tablename),
          'table_size_pretty', pg_size_pretty(pg_relation_size(schemaname || '.' || tablename)),
          'row_estimate', reltuples::bigint
        )
        ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC
      )
      FROM pg_tables t
      JOIN pg_class c ON c.relname = t.tablename AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = t.schemaname)
      WHERE t.schemaname = 'public'
    )
  ) INTO result;
  RETURN result;
END;
$$;
```

**Step 2: Apply migration to production**

Run: `supabase migration up --linked`
Expected: Migration applied successfully.

**Step 3: Verify function works**

Run via Supabase SQL editor or CLI: `SELECT public.get_database_usage();`
Expected: JSON with total_size and tables array.

**Step 4: Commit**

```bash
git add supabase/migrations/20260810_get_database_usage.sql
git commit -m "feat: add get_database_usage postgres function"
```

---

### Task 2: Create server action for usage data

**Files:**
- Create: `src/features/usage/actions.ts`
- Create: `src/features/usage/types.ts`

**Step 1: Create types file**

```typescript
// src/features/usage/types.ts
export interface TableUsage {
  name: string;
  total_size: number;
  total_size_pretty: string;
  table_size: number;
  table_size_pretty: string;
  row_estimate: number;
}

export interface BucketUsage {
  name: string;
  public: boolean;
  file_count: number;
  total_size: number;
  total_size_pretty: string;
}

export interface UsageData {
  database: {
    total_size: number;
    total_size_pretty: string;
    limit: number;
    limit_pretty: string;
    percentage: number;
    tables: TableUsage[];
  };
  storage: {
    total_size: number;
    total_size_pretty: string;
    limit: number;
    limit_pretty: string;
    percentage: number;
    buckets: BucketUsage[];
  };
  fetched_at: string;
}

export const FREE_TIER_LIMITS = {
  database: 500 * 1024 * 1024, // 500 MB
  storage: 1 * 1024 * 1024 * 1024, // 1 GB
} as const;
```

**Step 2: Create server action**

```typescript
// src/features/usage/actions.ts
"use server";

import { createServiceClient } from "@/shared/utils/supabase/service";
import type { UsageData, BucketUsage } from "./types";
import { FREE_TIER_LIMITS } from "./types";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 bytes";
  const units = ["bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 1 ? 1 : 0)} ${units[i]}`;
}

let cachedData: UsageData | null = null;
let cachedAt = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getUsageData(): Promise<UsageData> {
  if (cachedData && Date.now() - cachedAt < CACHE_TTL) {
    return cachedData;
  }

  const supabase = createServiceClient();

  // Fetch database usage via RPC
  const { data: dbUsage, error: dbError } = await supabase.rpc("get_database_usage");
  if (dbError) throw new Error(`Failed to fetch database usage: ${dbError.message}`);

  // Fetch storage buckets
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  if (bucketsError) throw new Error(`Failed to list buckets: ${bucketsError.message}`);

  // Fetch objects per bucket
  const bucketUsages: BucketUsage[] = await Promise.all(
    (buckets ?? []).map(async (bucket) => {
      const { data: objects } = await supabase.storage.from(bucket.name).list("", { limit: 10000 });
      let totalSize = 0;
      let fileCount = 0;
      for (const obj of objects ?? []) {
        if (obj.metadata?.size) {
          totalSize += Number(obj.metadata.size);
          fileCount++;
        }
      }
      return {
        name: bucket.name,
        public: bucket.public,
        file_count: fileCount,
        total_size: totalSize,
        total_size_pretty: formatBytes(totalSize),
      };
    })
  );

  const storageTotalSize = bucketUsages.reduce((sum, b) => sum + b.total_size, 0);
  const dbTotalSize = dbUsage?.total_size ?? 0;

  const result: UsageData = {
    database: {
      total_size: dbTotalSize,
      total_size_pretty: dbUsage?.total_size_pretty ?? formatBytes(dbTotalSize),
      limit: FREE_TIER_LIMITS.database,
      limit_pretty: "500 MB",
      percentage: Math.round((dbTotalSize / FREE_TIER_LIMITS.database) * 1000) / 10,
      tables: dbUsage?.tables ?? [],
    },
    storage: {
      total_size: storageTotalSize,
      total_size_pretty: formatBytes(storageTotalSize),
      limit: FREE_TIER_LIMITS.storage,
      limit_pretty: "1 GB",
      percentage: Math.round((storageTotalSize / FREE_TIER_LIMITS.storage) * 1000) / 10,
      buckets: bucketUsages,
    },
    fetched_at: new Date().toISOString(),
  };

  cachedData = result;
  cachedAt = Date.now();
  return result;
}
```

**Step 3: Commit**

```bash
git add src/features/usage/types.ts src/features/usage/actions.ts
git commit -m "feat: add server action for Supabase usage data"
```

---

### Task 3: Create sidebar usage widget

**Files:**
- Create: `src/features/usage/sidebar-usage.tsx`
- Modify: `src/shared/components/admin-layout.tsx` (lines 352-377, bottom section)

**Step 1: Create the SidebarUsage client component**

```tsx
// src/features/usage/sidebar-usage.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getUsageData } from "./actions";
import type { UsageData } from "./types";

function barColor(pct: number) {
  if (pct >= 80) return "bg-red-400";
  if (pct >= 50) return "bg-yellow-400";
  return "bg-emerald-400";
}

export function SidebarUsage() {
  const [data, setData] = useState<UsageData | null>(null);

  useEffect(() => {
    getUsageData().then(setData).catch(() => {});
  }, []);

  if (!data) return null;

  return (
    <Link
      href="/admin/settings/usage"
      className="block px-4 py-2 group"
      title="View detailed usage"
    >
      <p className="text-[10px] font-semibold text-white/60 uppercase tracking-wider mb-1.5">
        Free Tier Usage
      </p>
      {[
        { label: "DB", pct: data.database.percentage, used: data.database.total_size_pretty, limit: data.database.limit_pretty },
        { label: "Storage", pct: data.storage.percentage, used: data.storage.total_size_pretty, limit: data.storage.limit_pretty },
      ].map((item) => (
        <div key={item.label} className="mb-1 last:mb-0">
          <div className="flex justify-between text-[10px] text-white/70 mb-0.5">
            <span>{item.label}</span>
            <span>{item.used} / {item.limit}</span>
          </div>
          <div className="h-1.5 bg-white/15 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${barColor(item.pct)}`}
              style={{ width: `${Math.max(item.pct, 1)}%` }}
            />
          </div>
        </div>
      ))}
    </Link>
  );
}
```

**Step 2: Add SidebarUsage to admin-layout.tsx**

In `src/shared/components/admin-layout.tsx`, add import at top and insert the component just above the "View Site + User" bottom section (before line 353's `<div className="border-t...">`):

Add import:
```tsx
import { SidebarUsage } from "@/features/usage/sidebar-usage";
```

Insert before the bottom `<div className="border-t border-white/20 px-4 py-3 space-y-2">`:
```tsx
{/* Usage widget */}
<div className="border-t border-white/20">
  <SidebarUsage />
</div>
```

**Step 3: Verify sidebar renders**

Run: `npm run dev` and check sidebar bottom shows DB and Storage bars.

**Step 4: Commit**

```bash
git add src/features/usage/sidebar-usage.tsx src/shared/components/admin-layout.tsx
git commit -m "feat: add compact usage widget to sidebar"
```

---

### Task 4: Create detailed usage page

**Files:**
- Create: `src/app/admin/settings/usage/page.tsx`
- Modify: `src/shared/components/admin-layout.tsx` (navItems Settings children, around line 143)

**Step 1: Create the usage page**

```tsx
// src/app/admin/settings/usage/page.tsx
import { getUsageData } from "@/features/usage/actions";
import type { Metadata } from "next";
import { UsagePageClient } from "@/features/usage/usage-page-client";

export const metadata: Metadata = {
  title: "System Usage - BSH Admin",
};

export default async function UsagePage() {
  const data = await getUsageData();
  return <UsagePageClient initialData={data} />;
}
```

**Step 2: Create the client component for the page**

Create `src/features/usage/usage-page-client.tsx` with:
- Radial gauge cards for DB and Storage percentages
- Table breakdown with sortable columns
- Bucket breakdown with file counts
- Refresh button
- "Last updated" timestamp

The component receives `initialData` and has a refresh button that calls `getUsageData()` again.

**Step 3: Add nav item to Settings group in admin-layout.tsx**

In the Settings children array (after Users), add:
```tsx
{
  label: "System Usage",
  href: "/admin/settings/usage",
  icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
},
```

**Step 4: Verify page loads at /admin/settings/usage**

**Step 5: Commit**

```bash
git add src/app/admin/settings/usage/page.tsx src/features/usage/usage-page-client.tsx src/shared/components/admin-layout.tsx
git commit -m "feat: add detailed system usage page under settings"
```

---

### Task 5: Final verification and cleanup

**Step 1: Test sidebar widget**
- Navigate to any admin page
- Verify bottom of sidebar shows DB and Storage bars
- Verify clicking the widget navigates to /admin/settings/usage

**Step 2: Test detailed page**
- Verify gauge cards show correct percentages
- Verify table breakdown lists all tables sorted by size
- Verify bucket breakdown shows correct file counts
- Verify refresh button fetches fresh data

**Step 3: Test color coding**
- Current usage is < 2% so bars should be green (emerald)

**Step 4: Commit any fixes**
