import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent } from "@testing-library/react";
import {
  renderWithProviders,
  screen,
} from "@/shared/test-utils/render";
import { UsagePageClient } from "../usage-page-client";
import type { UsageData } from "../types";

// Mock the server action
vi.mock("../actions", () => ({
  getUsageData: vi.fn(),
}));

function makeUsageData(overrides?: Partial<UsageData>): UsageData {
  return {
    database: {
      total_size: 10 * 1024 * 1024,
      total_size_pretty: "10 MB",
      limit: 500 * 1024 * 1024,
      limit_pretty: "500 MB",
      percentage: 2,
      tables: [
        {
          name: "contacts",
          total_size: 5000000,
          total_size_pretty: "4.8 MB",
          table_size: 4000000,
          table_size_pretty: "3.8 MB",
          row_estimate: 1200,
        },
        {
          name: "events",
          total_size: 3000000,
          total_size_pretty: "2.9 MB",
          table_size: 2500000,
          table_size_pretty: "2.4 MB",
          row_estimate: 50,
        },
        {
          name: "profiles",
          total_size: 2000000,
          total_size_pretty: "1.9 MB",
          table_size: 1500000,
          table_size_pretty: "1.4 MB",
          row_estimate: 300,
        },
      ],
    },
    storage: {
      total_size: 50 * 1024 * 1024,
      total_size_pretty: "50 MB",
      limit: 1024 * 1024 * 1024,
      limit_pretty: "1 GB",
      percentage: 4.9,
      buckets: [
        {
          name: "avatars",
          public: true,
          file_count: 25,
          total_size: 30 * 1024 * 1024,
          total_size_pretty: "30 MB",
        },
        {
          name: "documents",
          public: false,
          file_count: 10,
          total_size: 20 * 1024 * 1024,
          total_size_pretty: "20 MB",
        },
      ],
    },
    fetched_at: "2026-08-13T12:00:00.000Z",
    ...overrides,
  };
}

describe("UsagePageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Basic Rendering ---

  it("renders the System Usage heading", () => {
    renderWithProviders(<UsagePageClient initialData={makeUsageData()} />);
    expect(screen.getByText("System Usage")).toBeInTheDocument();
  });

  it("renders database and storage gauge sections", () => {
    renderWithProviders(<UsagePageClient initialData={makeUsageData()} />);
    expect(screen.getByText("Database")).toBeInTheDocument();
    expect(screen.getByText("File Storage")).toBeInTheDocument();
  });

  it("renders the free tier info banner", () => {
    renderWithProviders(<UsagePageClient initialData={makeUsageData()} />);
    expect(screen.getByText(/Supabase Free Tier/)).toBeInTheDocument();
  });

  // --- Gauge Percentage Display ---

  it("displays database percentage in gauge", () => {
    const data = makeUsageData({
      database: {
        ...makeUsageData().database,
        percentage: 25.3,
      },
    });
    renderWithProviders(<UsagePageClient initialData={data} />);
    expect(screen.getByText("25.3%")).toBeInTheDocument();
  });

  it("displays storage percentage in gauge", () => {
    const data = makeUsageData({
      storage: {
        ...makeUsageData().storage,
        percentage: 4.9,
      },
    });
    renderWithProviders(<UsagePageClient initialData={data} />);
    expect(screen.getByText("4.9%")).toBeInTheDocument();
  });

  it("displays used / limit text for database", () => {
    renderWithProviders(<UsagePageClient initialData={makeUsageData()} />);
    expect(screen.getByText("10 MB / 500 MB")).toBeInTheDocument();
  });

  it("displays used / limit text for storage", () => {
    renderWithProviders(<UsagePageClient initialData={makeUsageData()} />);
    expect(screen.getByText("50 MB / 1 GB")).toBeInTheDocument();
  });

  // --- Color Coding ---

  it("uses green color for percentage under 50%", () => {
    const data = makeUsageData({
      database: { ...makeUsageData().database, percentage: 30 },
    });
    renderWithProviders(<UsagePageClient initialData={data} />);
    const percentText = screen.getByText("30%");
    // Walk up to the gauge card container (bg-white rounded-xl)
    const gaugeCard = percentText.closest(".bg-white");
    expect(gaugeCard?.innerHTML).toContain("text-emerald-500");
  });

  it("uses yellow color for percentage between 50% and 79%", () => {
    const data = makeUsageData({
      database: { ...makeUsageData().database, percentage: 65 },
    });
    renderWithProviders(<UsagePageClient initialData={data} />);
    const percentText = screen.getByText("65%");
    const gaugeCard = percentText.closest(".bg-white");
    expect(gaugeCard?.innerHTML).toContain("text-yellow-500");
  });

  it("uses red color for percentage at 80% or above", () => {
    const data = makeUsageData({
      database: { ...makeUsageData().database, percentage: 85 },
    });
    renderWithProviders(<UsagePageClient initialData={data} />);
    const percentText = screen.getByText("85%");
    const gaugeCard = percentText.closest(".bg-white");
    expect(gaugeCard?.innerHTML).toContain("text-red-500");
  });

  it("uses red color at exactly 80%", () => {
    const data = makeUsageData({
      database: { ...makeUsageData().database, percentage: 80 },
    });
    renderWithProviders(<UsagePageClient initialData={data} />);
    const percentText = screen.getByText("80%");
    const gaugeCard = percentText.closest(".bg-white");
    expect(gaugeCard?.innerHTML).toContain("text-red-500");
  });

  it("uses yellow color at exactly 50%", () => {
    const data = makeUsageData({
      database: { ...makeUsageData().database, percentage: 50 },
    });
    renderWithProviders(<UsagePageClient initialData={data} />);
    const percentText = screen.getByText("50%");
    const gaugeCard = percentText.closest(".bg-white");
    expect(gaugeCard?.innerHTML).toContain("text-yellow-500");
  });

  // --- Storage Buckets Table ---

  it("renders storage buckets section", () => {
    renderWithProviders(<UsagePageClient initialData={makeUsageData()} />);
    expect(screen.getByText("Storage Buckets")).toBeInTheDocument();
  });

  it("renders bucket names in the table", () => {
    renderWithProviders(<UsagePageClient initialData={makeUsageData()} />);
    expect(screen.getByText("avatars")).toBeInTheDocument();
    expect(screen.getByText("documents")).toBeInTheDocument();
  });

  it("shows public/private visibility labels", () => {
    renderWithProviders(<UsagePageClient initialData={makeUsageData()} />);
    expect(screen.getByText("Public")).toBeInTheDocument();
    expect(screen.getByText("Private")).toBeInTheDocument();
  });

  it("shows file counts for buckets", () => {
    renderWithProviders(<UsagePageClient initialData={makeUsageData()} />);
    expect(screen.getByText("25")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("shows bucket sizes", () => {
    renderWithProviders(<UsagePageClient initialData={makeUsageData()} />);
    expect(screen.getByText("30 MB")).toBeInTheDocument();
    expect(screen.getByText("20 MB")).toBeInTheDocument();
  });

  it("shows empty state when no buckets", () => {
    const data = makeUsageData({
      storage: {
        ...makeUsageData().storage,
        buckets: [],
      },
    });
    renderWithProviders(<UsagePageClient initialData={data} />);
    expect(screen.getByText("No storage buckets found")).toBeInTheDocument();
  });

  // --- Database Tables ---

  it("renders database tables section", () => {
    renderWithProviders(<UsagePageClient initialData={makeUsageData()} />);
    expect(screen.getByText("Database Tables")).toBeInTheDocument();
  });

  it("shows table count", () => {
    renderWithProviders(<UsagePageClient initialData={makeUsageData()} />);
    expect(screen.getByText("3 tables")).toBeInTheDocument();
  });

  it("renders table names", () => {
    renderWithProviders(<UsagePageClient initialData={makeUsageData()} />);
    expect(screen.getByText("contacts")).toBeInTheDocument();
    expect(screen.getByText("events")).toBeInTheDocument();
    expect(screen.getByText("profiles")).toBeInTheDocument();
  });

  it("renders table sizes", () => {
    renderWithProviders(<UsagePageClient initialData={makeUsageData()} />);
    expect(screen.getByText("4.8 MB")).toBeInTheDocument();
    expect(screen.getByText("2.9 MB")).toBeInTheDocument();
  });

  it("renders row estimates with locale formatting", () => {
    renderWithProviders(<UsagePageClient initialData={makeUsageData()} />);
    expect(screen.getByText("1,200")).toBeInTheDocument();
  });

  // --- Sort Controls ---

  it("sorts tables by total_size descending by default", () => {
    renderWithProviders(<UsagePageClient initialData={makeUsageData()} />);
    // Default sort is total_size desc, so contacts (5M) should be first
    const rows = screen.getAllByRole("row");
    // First data row (after 2 header rows - one for buckets table, one for db table)
    const tableBodyRows = rows.filter((row) =>
      row.querySelector("td.font-mono")
    );
    expect(tableBodyRows[0]).toHaveTextContent("contacts");
    expect(tableBodyRows[1]).toHaveTextContent("events");
    expect(tableBodyRows[2]).toHaveTextContent("profiles");
  });

  it("toggles sort direction when clicking active sort column", () => {
    renderWithProviders(<UsagePageClient initialData={makeUsageData()} />);

    // Click "Total Size" button (which is the default sort key)
    const totalSizeButton = screen.getByRole("button", { name: /Total Size/i });
    fireEvent.click(totalSizeButton);

    // Now should be ascending: profiles (2M), events (3M), contacts (5M)
    const rows = screen.getAllByRole("row");
    const tableBodyRows = rows.filter((row) =>
      row.querySelector("td.font-mono")
    );
    expect(tableBodyRows[0]).toHaveTextContent("profiles");
    expect(tableBodyRows[1]).toHaveTextContent("events");
    expect(tableBodyRows[2]).toHaveTextContent("contacts");
  });

  it("sorts by name when clicking Table column header", () => {
    renderWithProviders(<UsagePageClient initialData={makeUsageData()} />);

    const tableButton = screen.getByRole("button", { name: /^Table/i });
    fireEvent.click(tableButton);

    // Clicking a new column defaults to desc, so reverse alpha: profiles, events, contacts
    const rows = screen.getAllByRole("row");
    const tableBodyRows = rows.filter((row) =>
      row.querySelector("td.font-mono")
    );
    expect(tableBodyRows[0]).toHaveTextContent("profiles");
    expect(tableBodyRows[1]).toHaveTextContent("events");
    expect(tableBodyRows[2]).toHaveTextContent("contacts");
  });

  it("sorts by row estimate when clicking Est. Rows column header", () => {
    renderWithProviders(<UsagePageClient initialData={makeUsageData()} />);

    const estRowsButton = screen.getByRole("button", { name: /Est\. Rows/i });
    fireEvent.click(estRowsButton);

    // Desc by row_estimate: contacts (1200), profiles (300), events (50)
    const rows = screen.getAllByRole("row");
    const tableBodyRows = rows.filter((row) =>
      row.querySelector("td.font-mono")
    );
    expect(tableBodyRows[0]).toHaveTextContent("contacts");
    expect(tableBodyRows[1]).toHaveTextContent("profiles");
    expect(tableBodyRows[2]).toHaveTextContent("events");
  });

  // --- Refresh Button ---

  it("renders refresh button", () => {
    renderWithProviders(<UsagePageClient initialData={makeUsageData()} />);
    expect(screen.getByText("Refresh")).toBeInTheDocument();
  });

  // --- Timestamp Display ---

  it("displays the last updated timestamp", () => {
    renderWithProviders(<UsagePageClient initialData={makeUsageData()} />);
    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
  });

  // --- Data from Props ---

  it("renders data from initialData prop correctly", () => {
    const customData = makeUsageData({
      database: {
        total_size: 100 * 1024 * 1024,
        total_size_pretty: "100 MB",
        limit: 500 * 1024 * 1024,
        limit_pretty: "500 MB",
        percentage: 20,
        tables: [
          {
            name: "custom_table",
            total_size: 100000,
            total_size_pretty: "97.7 KB",
            table_size: 80000,
            table_size_pretty: "78.1 KB",
            row_estimate: 42,
          },
        ],
      },
    });
    renderWithProviders(<UsagePageClient initialData={customData} />);
    expect(screen.getByText("20%")).toBeInTheDocument();
    expect(screen.getByText("100 MB / 500 MB")).toBeInTheDocument();
    expect(screen.getByText("custom_table")).toBeInTheDocument();
    expect(screen.getByText("1 tables")).toBeInTheDocument();
  });
});
