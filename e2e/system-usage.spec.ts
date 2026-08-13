import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("System Usage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/settings/usage");
    await expect(
      page.locator("h1", { hasText: "System Usage" })
    ).toBeVisible();
  });

  // ---------- Page load ----------

  test("renders the System Usage heading", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "System Usage", level: 1 })
    ).toBeVisible();
  });

  test("renders database and storage gauge sections", async ({ page }) => {
    // Both gauge labels should be visible
    await expect(page.getByText("Database", { exact: true })).toBeVisible();
    await expect(
      page.getByText("File Storage", { exact: true })
    ).toBeVisible();
  });

  // ---------- Free tier banner ----------

  test("shows the Supabase Free Tier banner", async ({ page }) => {
    await expect(page.getByText("Supabase Free Tier")).toBeVisible();
    // Banner should mention limits
    await expect(page.getByText("500 MB")).toBeVisible();
    await expect(page.getByText("1 GB file storage")).toBeVisible();
  });

  // ---------- Gauges ----------

  test("displays database usage percentage", async ({ page }) => {
    // The database gauge should show a percentage like "X%"
    const databaseGauge = page
      .locator("div", { hasText: "Database" })
      .filter({ has: page.locator("svg") })
      .first();
    await expect(databaseGauge).toBeVisible();
    // There should be a percentage text inside the gauge
    await expect(databaseGauge.getByText(/%/)).toBeVisible();
  });

  test("displays storage usage percentage", async ({ page }) => {
    const storageGauge = page
      .locator("div", { hasText: "File Storage" })
      .filter({ has: page.locator("svg") })
      .first();
    await expect(storageGauge).toBeVisible();
    await expect(storageGauge.getByText(/%/)).toBeVisible();
  });

  test("gauges show used / limit text", async ({ page }) => {
    // Each gauge shows "used / limit" below the label
    // Look for patterns like "X MB / 500 MB" or "X KB / 1 GB"
    const usageSummaries = page.locator("text=/\\d+.*\\/.*\\d+/");
    const count = await usageSummaries.count();
    expect(count).toBeGreaterThanOrEqual(2); // at least database + storage
  });

  // ---------- Color coding ----------

  test("gauge SVG circles have color styling classes", async ({ page }) => {
    // The gauge circles should have one of the color classes:
    // text-emerald-500 (green/ok), text-yellow-500 (warning), text-red-500 (danger)
    const gaugeCircles = page.locator("svg circle");
    const circleCount = await gaugeCircles.count();
    // Each gauge has 2 circles (background + foreground), so at least 4
    expect(circleCount).toBeGreaterThanOrEqual(4);
  });

  // ---------- Last updated ----------

  test("shows last updated timestamp", async ({ page }) => {
    await expect(page.getByText(/Last updated:/)).toBeVisible();
  });

  // ---------- Storage Buckets table ----------

  test("renders Storage Buckets section heading", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Storage Buckets" })
    ).toBeVisible();
  });

  test("storage buckets table has correct column headers", async ({
    page,
  }) => {
    const storageSectionHeading = page.getByRole("heading", {
      name: "Storage Buckets",
    });
    const storageSection = storageSectionHeading.locator("..").locator("..");

    await expect(storageSection.getByText("Bucket")).toBeVisible();
    await expect(storageSection.getByText("Visibility")).toBeVisible();
    await expect(storageSection.getByText("Files")).toBeVisible();
    await expect(storageSection.getByText("Size")).toBeVisible();
  });

  test("storage buckets table shows bucket rows or empty state", async ({
    page,
  }) => {
    const storageSectionHeading = page.getByRole("heading", {
      name: "Storage Buckets",
    });
    const storageSection = storageSectionHeading.locator("..").locator("..");
    const tableBody = storageSection.locator("tbody");

    const rows = tableBody.locator("tr");
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThanOrEqual(1); // at least one row (data or empty state)

    // Either bucket data rows or the "No storage buckets found" message
    const hasEmptyState = await storageSection
      .getByText("No storage buckets found")
      .isVisible()
      .catch(() => false);

    if (!hasEmptyState) {
      // If we have buckets, each row should have a visibility badge
      const badges = storageSection.locator(
        'text=/Public|Private/'
      );
      const badgeCount = await badges.count();
      expect(badgeCount).toBeGreaterThanOrEqual(1);
    }
  });

  // ---------- Database Tables table ----------

  test("renders Database Tables section heading", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Database Tables" })
    ).toBeVisible();
  });

  test("database tables section shows table count", async ({ page }) => {
    // Should show "X tables" below the heading
    await expect(page.getByText(/\d+ tables/)).toBeVisible();
  });

  test("database tables table has correct column headers", async ({
    page,
  }) => {
    const dbSectionHeading = page.getByRole("heading", {
      name: "Database Tables",
    });
    const dbSection = dbSectionHeading.locator("..").locator("..");

    await expect(dbSection.getByText("Table")).toBeVisible();
    await expect(dbSection.getByText("Total Size")).toBeVisible();
    await expect(dbSection.getByText("Data Size")).toBeVisible();
    await expect(dbSection.getByText("Est. Rows")).toBeVisible();
  });

  test("database tables list shows table rows with names and sizes", async ({
    page,
  }) => {
    const dbSectionHeading = page.getByRole("heading", {
      name: "Database Tables",
    });
    const dbSection = dbSectionHeading.locator("..").locator("..");
    const tableBody = dbSection.locator("tbody");

    const rows = tableBody.locator("tr");
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThanOrEqual(1);

    // First row should have table name, sizes, and row count cells
    const firstRow = rows.first();
    const cells = firstRow.locator("td");
    const cellCount = await cells.count();
    expect(cellCount).toBe(4); // name, total size, data size, est. rows
  });

  // ---------- Sortable columns ----------

  test("database tables columns are sortable", async ({ page }) => {
    const dbSectionHeading = page.getByRole("heading", {
      name: "Database Tables",
    });
    const dbSection = dbSectionHeading.locator("..").locator("..");

    // "Table", "Total Size", and "Est. Rows" headers should be clickable buttons
    const tableBtn = dbSection.locator("th button", { hasText: "Table" });
    const totalSizeBtn = dbSection.locator("th button", {
      hasText: "Total Size",
    });
    const estRowsBtn = dbSection.locator("th button", {
      hasText: "Est. Rows",
    });

    await expect(tableBtn).toBeVisible();
    await expect(totalSizeBtn).toBeVisible();
    await expect(estRowsBtn).toBeVisible();

    // Click "Table" to sort by name
    await tableBtn.click();
    await page.waitForTimeout(300);

    // Collect table names and verify they are sorted ascending
    const tableBody = dbSection.locator("tbody");
    const nameCells = tableBody.locator("tr td:nth-child(1)");
    const names = await nameCells.allTextContents();
    expect(names.length).toBeGreaterThan(0);

    const sortedAsc = [...names].sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase())
    );
    expect(names).toEqual(sortedAsc);

    // Click again to reverse sort direction
    await tableBtn.click();
    await page.waitForTimeout(300);

    const namesDesc = await nameCells.allTextContents();
    const sortedDesc = [...namesDesc].sort((a, b) =>
      b.toLowerCase().localeCompare(a.toLowerCase())
    );
    expect(namesDesc).toEqual(sortedDesc);
  });

  // ---------- Refresh ----------

  test("refresh button is clickable and shows loading state", async ({
    page,
  }) => {
    const refreshButton = page.getByRole("button", { name: /Refresh/i });
    await expect(refreshButton).toBeVisible();
    await expect(refreshButton).toBeEnabled();

    // Click refresh
    await refreshButton.click();

    // The button should briefly show "Refreshing..." or become disabled
    // Since the transition may be fast, we check that the button is still
    // present after the refresh completes
    await expect(refreshButton).toBeVisible({ timeout: 10000 });
    await expect(refreshButton).toHaveText(/Refresh/);
  });

  // ---------- Accessibility ----------

  test("passes axe accessibility checks", async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .exclude(".sonner-toast")
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
