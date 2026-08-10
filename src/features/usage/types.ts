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
