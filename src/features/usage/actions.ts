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

  // Fetch database usage via RPC (may fail if PostgREST cache hasn't refreshed)
  const { data: dbUsage } = await supabase.rpc("get_database_usage");

  // Fetch storage buckets
  const { data: buckets } = await supabase.storage.listBuckets();

  // Fetch objects per bucket
  const bucketUsages: BucketUsage[] = await Promise.all(
    (buckets ?? []).map(async (bucket) => {
      const { data: objects } = await supabase.storage
        .from(bucket.name)
        .list("", { limit: 10000 });
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

  const storageTotalSize = bucketUsages.reduce(
    (sum, b) => sum + b.total_size,
    0
  );
  const dbTotalSize = dbUsage?.total_size ?? 0;

  const result: UsageData = {
    database: {
      total_size: dbTotalSize,
      total_size_pretty: dbUsage?.total_size_pretty ?? formatBytes(dbTotalSize),
      limit: FREE_TIER_LIMITS.database,
      limit_pretty: "500 MB",
      percentage:
        Math.round((dbTotalSize / FREE_TIER_LIMITS.database) * 1000) / 10,
      tables: dbUsage?.tables ?? [],
    },
    storage: {
      total_size: storageTotalSize,
      total_size_pretty: formatBytes(storageTotalSize),
      limit: FREE_TIER_LIMITS.storage,
      limit_pretty: "1 GB",
      percentage:
        Math.round((storageTotalSize / FREE_TIER_LIMITS.storage) * 1000) / 10,
      buckets: bucketUsages,
    },
    fetched_at: new Date().toISOString(),
  };

  cachedData = result;
  cachedAt = Date.now();
  return result;
}
