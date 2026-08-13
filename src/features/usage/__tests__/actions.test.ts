import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the service client before importing the module under test
const mockRpc = vi.fn();
const mockListBuckets = vi.fn();
const mockList = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/shared/utils/supabase/service", () => ({
  createServiceClient: () => ({
    rpc: mockRpc,
    storage: {
      listBuckets: mockListBuckets,
      from: mockFrom,
    },
  }),
}));

// We need to test the internal formatBytes and the getUsageData server action.
// Since "use server" prevents direct import in some setups, we import it directly
// and rely on vitest to handle it as a normal module.
import { getUsageData } from "../actions";
import { FREE_TIER_LIMITS } from "../types";

describe("getUsageData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the module-level cache by re-importing would be complex,
    // so we rely on the cache TTL. We'll use vi.spyOn(Date, 'now') to control caching.
    // Actually, we need to bust the cache between tests.
    // The simplest approach: advance time past the 5-minute TTL.
    vi.spyOn(Date, "now").mockReturnValue(Date.now() + 10 * 60 * 1000);
  });

  function setupMocks({
    dbUsage = { total_size: 1024 * 1024, total_size_pretty: "1 MB", tables: [] },
    buckets = [] as Array<{ name: string; public: boolean }>,
    bucketObjects = {} as Record<string, Array<{ metadata?: { size?: number } }>>,
  } = {}) {
    mockRpc.mockResolvedValue({ data: dbUsage });
    mockListBuckets.mockResolvedValue({ data: buckets });
    mockFrom.mockImplementation((bucketName: string) => ({
      list: vi.fn().mockResolvedValue({
        data: bucketObjects[bucketName] ?? [],
      }),
    }));
  }

  it("returns database usage with correct percentage calculation", async () => {
    const dbSize = 250 * 1024 * 1024; // 250 MB
    setupMocks({
      dbUsage: {
        total_size: dbSize,
        total_size_pretty: "250 MB",
        tables: [],
      },
    });

    const result = await getUsageData();

    expect(result.database.total_size).toBe(dbSize);
    expect(result.database.total_size_pretty).toBe("250 MB");
    expect(result.database.limit).toBe(FREE_TIER_LIMITS.database);
    expect(result.database.limit_pretty).toBe("500 MB");
    // 250 / 500 = 50%
    expect(result.database.percentage).toBe(50);
  });

  it("returns storage usage aggregated across buckets", async () => {
    const buckets = [
      { name: "avatars", public: true },
      { name: "documents", public: false },
    ];
    const bucketObjects = {
      avatars: [
        { metadata: { size: 1000 } },
        { metadata: { size: 2000 } },
      ],
      documents: [
        { metadata: { size: 5000 } },
      ],
    };

    setupMocks({ buckets, bucketObjects });

    const result = await getUsageData();

    expect(result.storage.buckets).toHaveLength(2);

    const avatarsBucket = result.storage.buckets.find((b) => b.name === "avatars");
    expect(avatarsBucket).toBeDefined();
    expect(avatarsBucket!.total_size).toBe(3000);
    expect(avatarsBucket!.file_count).toBe(2);
    expect(avatarsBucket!.public).toBe(true);

    const docsBucket = result.storage.buckets.find((b) => b.name === "documents");
    expect(docsBucket).toBeDefined();
    expect(docsBucket!.total_size).toBe(5000);
    expect(docsBucket!.file_count).toBe(1);
    expect(docsBucket!.public).toBe(false);

    // Total storage = 3000 + 5000 = 8000
    expect(result.storage.total_size).toBe(8000);
  });

  it("calculates storage percentage correctly", async () => {
    const halfGB = FREE_TIER_LIMITS.storage / 2;
    setupMocks({
      buckets: [{ name: "media", public: true }],
      bucketObjects: {
        media: [{ metadata: { size: halfGB } }],
      },
    });

    const result = await getUsageData();
    expect(result.storage.percentage).toBe(50);
  });

  it("handles empty buckets list gracefully", async () => {
    setupMocks({ buckets: [] });

    const result = await getUsageData();

    expect(result.storage.buckets).toHaveLength(0);
    expect(result.storage.total_size).toBe(0);
    expect(result.storage.percentage).toBe(0);
  });

  it("handles null buckets response gracefully", async () => {
    mockRpc.mockResolvedValue({ data: null });
    mockListBuckets.mockResolvedValue({ data: null });

    const result = await getUsageData();

    expect(result.storage.buckets).toHaveLength(0);
    expect(result.storage.total_size).toBe(0);
    expect(result.database.total_size).toBe(0);
    expect(result.database.tables).toEqual([]);
  });

  it("skips objects without metadata.size", async () => {
    setupMocks({
      buckets: [{ name: "uploads", public: true }],
      bucketObjects: {
        uploads: [
          { metadata: { size: 1000 } },
          { metadata: undefined },
          {},
          { metadata: { size: 2000 } },
        ] as Array<{ metadata?: { size?: number } }>,
      },
    });

    const result = await getUsageData();

    const bucket = result.storage.buckets[0];
    expect(bucket.total_size).toBe(3000);
    expect(bucket.file_count).toBe(2);
  });

  it("includes fetched_at as ISO string", async () => {
    setupMocks();

    const result = await getUsageData();

    expect(result.fetched_at).toBeDefined();
    // Should be a valid ISO date string
    expect(new Date(result.fetched_at).toISOString()).toBe(result.fetched_at);
  });

  it("passes tables through from RPC response", async () => {
    const tables = [
      {
        name: "contacts",
        total_size: 50000,
        total_size_pretty: "48.8 KB",
        table_size: 40000,
        table_size_pretty: "39.1 KB",
        row_estimate: 500,
      },
    ];
    setupMocks({
      dbUsage: { total_size: 50000, total_size_pretty: "48.8 KB", tables },
    });

    const result = await getUsageData();

    expect(result.database.tables).toEqual(tables);
    expect(result.database.tables[0].name).toBe("contacts");
    expect(result.database.tables[0].row_estimate).toBe(500);
  });

  it("returns cached data within TTL window", async () => {
    setupMocks({
      dbUsage: { total_size: 1000, total_size_pretty: "1000 bytes", tables: [] },
    });

    // Use a fixed time for the first call
    const baseTime = 1000000000000;
    vi.spyOn(Date, "now").mockReturnValue(baseTime);

    const first = await getUsageData();

    // Reset mocks to verify second call doesn't hit them
    vi.clearAllMocks();
    setupMocks({
      dbUsage: { total_size: 9999, total_size_pretty: "9999 bytes", tables: [] },
    });

    // Within 5 min TTL
    vi.spyOn(Date, "now").mockReturnValue(baseTime + 60 * 1000);

    const second = await getUsageData();

    // Should return cached data, not the new mock data
    expect(second.database.total_size).toBe(first.database.total_size);
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it("refreshes data after TTL expires", async () => {
    setupMocks({
      dbUsage: { total_size: 1000, total_size_pretty: "1000 bytes", tables: [] },
    });

    const baseTime = 2000000000000;
    vi.spyOn(Date, "now").mockReturnValue(baseTime);

    await getUsageData();

    // Setup new data for after TTL
    vi.clearAllMocks();
    setupMocks({
      dbUsage: { total_size: 9999, total_size_pretty: "9999 bytes", tables: [] },
    });

    // Past 5 min TTL
    vi.spyOn(Date, "now").mockReturnValue(baseTime + 6 * 60 * 1000);

    const result = await getUsageData();

    expect(result.database.total_size).toBe(9999);
    expect(mockRpc).toHaveBeenCalled();
  });

  it("formats bytes correctly for bucket total_size_pretty", async () => {
    setupMocks({
      buckets: [{ name: "test", public: true }],
      bucketObjects: {
        test: [{ metadata: { size: 0 } }],
      },
    });

    // The object has size 0, so it won't be counted (size is falsy)
    const result = await getUsageData();

    // With no counted files, total is 0
    expect(result.storage.total_size_pretty).toBe("0 bytes");
  });
});
