import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * E2E tests for the Audiences feature.
 *
 * Relies on seeded test data:
 *   - "Test Newsletter List" (list type, 2 contacts assigned)
 *   - "Test VIP Segment" (segment type)
 *
 * Tests that create data use "e2e-test-" prefix so teardown can clean them up.
 */

test.describe("Audiences", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/audiences");
    await page.waitForLoadState("networkidle");
  });

  // ---------------------------------------------------------------------------
  // List page
  // ---------------------------------------------------------------------------

  test("page loads and shows heading and stats", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Audiences" })).toBeVisible();
    // Stats cards
    await expect(page.getByText("New Subscribers (30d)")).toBeVisible();
    await expect(page.getByText("Subscribed")).toBeVisible();
    await expect(page.getByText("Unsubscribed")).toBeVisible();
  });

  test("shows seeded audiences", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Test Newsletter List" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Test VIP Segment" })).toBeVisible();
  });

  test("shows correct badges for list and segment types", async ({ page }) => {
    const newsletterRow = page.locator("tr", { hasText: "Test Newsletter List" });
    await expect(newsletterRow.getByText("List")).toBeVisible();

    const segmentRow = page.locator("tr", { hasText: "Test VIP Segment" });
    await expect(segmentRow.getByText("Segment")).toBeVisible();
  });

  test("type filter tabs work", async ({ page }) => {
    // Click Lists tab
    await page.getByRole("button", { name: "Lists" }).click();
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("button", { name: "Test Newsletter List" })).toBeVisible();
    // Segment should not be visible when filtering by list
    await expect(page.getByRole("button", { name: "Test VIP Segment" })).toBeHidden();

    // Click Segments tab
    await page.getByRole("button", { name: "Segments" }).click();
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("button", { name: "Test VIP Segment" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Test Newsletter List" })).toBeHidden();

    // Click All tab to reset
    await page.getByRole("button", { name: "All" }).click();
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("button", { name: "Test Newsletter List" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Test VIP Segment" })).toBeVisible();
  });

  test("search filters audiences by name", async ({ page }) => {
    await page.getByPlaceholder("Search by list name").fill("Newsletter");
    // Wait for debounce (350ms) + network
    await page.waitForTimeout(500);
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("button", { name: "Test Newsletter List" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Test VIP Segment" })).toBeHidden();

    // Clear search
    await page.getByPlaceholder("Search by list name").fill("");
    await page.waitForTimeout(500);
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("button", { name: "Test VIP Segment" })).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // Create list audience
  // ---------------------------------------------------------------------------

  test("create a new list audience", async ({ page }) => {
    // Open type picker dialog
    await page.getByRole("button", { name: "Create Audience" }).click();
    await expect(page.getByText("Create an audience")).toBeVisible();

    // Select List type
    await page.getByText("List", { exact: true }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    // Name dialog should appear
    await expect(page.getByText("Name your list")).toBeVisible();
    await page.getByPlaceholder("Untitled list").fill("e2e-test-New List Audience");
    await page.getByRole("button", { name: "Save" }).click();

    // Should navigate to the list detail page
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: "e2e-test-New List Audience" })).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // Create segment audience
  // ---------------------------------------------------------------------------

  test("create a segment with criteria", async ({ page }) => {
    // Open type picker dialog
    await page.getByRole("button", { name: "Create Audience" }).click();
    await expect(page.getByText("Create an audience")).toBeVisible();

    // Segment is the default selection, click Continue
    await page.getByRole("button", { name: "Continue" }).click();

    // Should navigate to segment builder
    await page.waitForURL(/\/admin\/audiences\/segments\/new/);

    // Set segment name
    const nameInput = page.getByPlaceholder("Segment name");
    await nameInput.clear();
    await nameInput.fill("e2e-test-US Contacts Segment");

    // Add criteria — click "Add Criteria" button
    await page.getByRole("button", { name: "Add Criteria" }).click();

    // Criteria picker dialog should appear
    await expect(page.getByRole("heading", { name: "Criteria" })).toBeVisible();

    // Select "Country" from Contact profiles
    await page.getByRole("button", { name: "Country" }).click();

    // The criteria row should appear with the "Country" label
    await expect(page.getByText("Country").first()).toBeVisible();

    // The operator defaults to "is" — type value
    await page.getByPlaceholder("Enter value...").fill("United States");

    // Wait for count to update
    await page.waitForTimeout(700);

    // Save the segment
    await page.getByRole("button", { name: "Save segment" }).click();

    // Should redirect back to audiences list
    await page.waitForURL(/\/admin\/audiences/);
    await page.waitForLoadState("networkidle");

    // Verify the new segment appears
    await expect(page.getByRole("button", { name: "e2e-test-US Contacts Segment" })).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // Edit audience
  // ---------------------------------------------------------------------------

  test("edit a list audience name via context menu", async ({ page }) => {
    // First, create a list to edit
    await page.getByRole("button", { name: "Create Audience" }).click();
    await page.getByText("List", { exact: true }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByPlaceholder("Untitled list").fill("e2e-test-Edit Target");
    await page.getByRole("button", { name: "Save" }).click();
    await page.waitForLoadState("networkidle");

    // Go back to audiences list
    await page.goto("/admin/audiences");
    await page.waitForLoadState("networkidle");

    // Open context menu for the created audience
    const row = page.locator("tr", { hasText: "e2e-test-Edit Target" });
    await row.locator("button").filter({ has: page.locator("circle") }).click();

    // Click Rename
    await page.getByRole("button", { name: "Rename" }).click();

    // Rename dialog should show
    await expect(page.getByText("Rename list")).toBeVisible();

    // Clear and type new name
    const nameInput = page.locator('input[placeholder="Untitled list"]');
    await nameInput.clear();
    await nameInput.fill("e2e-test-Edit Target Renamed");
    await page.getByRole("button", { name: "Save" }).click();
    await page.waitForLoadState("networkidle");

    // Verify the renamed audience appears
    await expect(page.getByRole("button", { name: "e2e-test-Edit Target Renamed" })).toBeVisible();
    await expect(page.getByRole("button", { name: "e2e-test-Edit Target" })).toBeHidden();
  });

  // ---------------------------------------------------------------------------
  // Delete audience
  // ---------------------------------------------------------------------------

  test("delete an audience via context menu", async ({ page }) => {
    // First, create a list to delete
    await page.getByRole("button", { name: "Create Audience" }).click();
    await page.getByText("List", { exact: true }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByPlaceholder("Untitled list").fill("e2e-test-Delete Target");
    await page.getByRole("button", { name: "Save" }).click();
    await page.waitForLoadState("networkidle");

    // Go back to audiences list
    await page.goto("/admin/audiences");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("button", { name: "e2e-test-Delete Target" })).toBeVisible();

    // Open context menu
    const row = page.locator("tr", { hasText: "e2e-test-Delete Target" });
    await row.locator("button").filter({ has: page.locator("circle") }).click();

    // Click Delete list
    await page.getByRole("button", { name: "Delete list" }).click();

    // Confirm deletion
    await expect(page.getByText("Delete Audience")).toBeVisible();
    await page.getByRole("button", { name: "Delete" }).click();
    await page.waitForLoadState("networkidle");

    // Verify the audience is removed
    await expect(page.getByRole("button", { name: "e2e-test-Delete Target" })).toBeHidden();
  });

  // ---------------------------------------------------------------------------
  // List detail — click through, members, and search
  // ---------------------------------------------------------------------------

  test("list detail shows members and supports search", async ({ page }) => {
    // Click on the Test Newsletter List
    await page.getByRole("button", { name: "Test Newsletter List" }).click();
    await page.waitForURL(/\/admin\/audiences\/lists\//);
    await page.waitForLoadState("networkidle");

    // Verify heading
    await expect(page.getByRole("heading", { name: "Test Newsletter List" })).toBeVisible();
    await expect(page.getByText("List").first()).toBeVisible();

    // Verify contacts table is shown with at least the seeded contacts
    await expect(page.getByText("Contacts").first()).toBeVisible();
    // The first two contacts ("Test Pastor" and "Test Leader") were assigned to this list
    await expect(page.getByText("Test Pastor")).toBeVisible();
    await expect(page.getByText("Test Leader")).toBeVisible();

    // Search within the list
    await page.getByPlaceholder("Search contacts...").fill("Pastor");
    await page.keyboard.press("Enter");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("Test Pastor")).toBeVisible();
    // "Test Leader" should be filtered out
    await expect(page.getByText("Test Leader")).toBeHidden();

    // Clear search
    await page.getByPlaceholder("Search contacts...").fill("");
    await page.keyboard.press("Enter");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("Test Leader")).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // Bulk operations — select and delete
  // ---------------------------------------------------------------------------

  test("bulk select and delete audiences", async ({ page }) => {
    // Create two audiences to bulk delete
    for (const name of ["e2e-test-Bulk One", "e2e-test-Bulk Two"]) {
      await page.getByRole("button", { name: "Create Audience" }).click();
      await page.getByText("List", { exact: true }).click();
      await page.getByRole("button", { name: "Continue" }).click();
      await page.getByPlaceholder("Untitled list").fill(name);
      await page.getByRole("button", { name: "Save" }).click();
      await page.waitForLoadState("networkidle");
      await page.goto("/admin/audiences");
      await page.waitForLoadState("networkidle");
    }

    // Select both audiences using their row checkboxes
    const rowOne = page.locator("tr", { hasText: "e2e-test-Bulk One" });
    await rowOne.locator('input[type="checkbox"]').check();

    const rowTwo = page.locator("tr", { hasText: "e2e-test-Bulk Two" });
    await rowTwo.locator('input[type="checkbox"]').check();

    // Verify selection indicator
    await expect(page.getByText("Selected lists")).toBeVisible();
    await expect(page.getByText("2", { exact: true }).first()).toBeVisible();

    // Click bulk Delete button
    await page.getByRole("button", { name: "Delete" }).first().click();

    // Confirm bulk deletion
    await expect(page.getByText("Delete 2 audiences?")).toBeVisible();
    await page.getByRole("button", { name: "Delete 2 audiences" }).click();
    await page.waitForLoadState("networkidle");

    // Verify both audiences are removed
    await expect(page.getByRole("button", { name: "e2e-test-Bulk One" })).toBeHidden();
    await expect(page.getByRole("button", { name: "e2e-test-Bulk Two" })).toBeHidden();
  });

  // ---------------------------------------------------------------------------
  // Favorite toggle
  // ---------------------------------------------------------------------------

  test("toggle favorite on an audience", async ({ page }) => {
    const row = page.locator("tr", { hasText: "Test Newsletter List" });

    // The star button should be present — click to add favorite
    const starButton = row.locator('button[title="Add to favorites"]');
    if (await starButton.isVisible()) {
      await starButton.click();
      await page.waitForLoadState("networkidle");

      // After favoriting, the button title should change
      await expect(row.locator('button[title="Remove from favorites"]')).toBeVisible();

      // Toggle it back off
      await row.locator('button[title="Remove from favorites"]').click();
      await page.waitForLoadState("networkidle");
      await expect(row.locator('button[title="Add to favorites"]')).toBeVisible();
    } else {
      // Already favorited — unfavorite first
      await row.locator('button[title="Remove from favorites"]').click();
      await page.waitForLoadState("networkidle");
      await expect(row.locator('button[title="Add to favorites"]')).toBeVisible();

      // Re-favorite
      await row.locator('button[title="Add to favorites"]').click();
      await page.waitForLoadState("networkidle");
      await expect(row.locator('button[title="Remove from favorites"]')).toBeVisible();

      // Reset back
      await row.locator('button[title="Remove from favorites"]').click();
      await page.waitForLoadState("networkidle");
    }
  });

  // ---------------------------------------------------------------------------
  // Select all / clear
  // ---------------------------------------------------------------------------

  test("select all checkbox and clear button", async ({ page }) => {
    // Click the header "select all" checkbox
    const headerCheckbox = page.locator("thead input[type='checkbox']");
    await headerCheckbox.check();

    // Verify "Selected lists" indicator appears
    await expect(page.getByText("Selected lists")).toBeVisible();

    // Click Clear button
    await page.getByRole("button", { name: "Clear" }).click();

    // Verify selection is cleared — "Your lists" text should return
    await expect(page.getByText("Your lists")).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // Context menu — Copy
  // ---------------------------------------------------------------------------

  test("copy an audience via context menu", async ({ page }) => {
    const row = page.locator("tr", { hasText: "Test Newsletter List" });
    await row.locator("button").filter({ has: page.locator("circle") }).click();

    await page.getByRole("button", { name: "Copy" }).click();
    await page.waitForLoadState("networkidle");

    // A copy should appear
    await expect(page.getByRole("button", { name: "Test Newsletter List (copy)" })).toBeVisible();

    // Clean up: delete the copy
    const copyRow = page.locator("tr", { hasText: "Test Newsletter List (copy)" });
    await copyRow.locator("button").filter({ has: page.locator("circle") }).click();
    await page.getByRole("button", { name: "Delete list" }).click();
    await page.getByRole("button", { name: "Delete" }).click();
    await page.waitForLoadState("networkidle");
  });

  // ---------------------------------------------------------------------------
  // Accessibility
  // ---------------------------------------------------------------------------

  test("audiences page passes axe accessibility checks", async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .exclude(".recharts-wrapper") // exclude chart components if any
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test("list detail page passes axe accessibility checks", async ({ page }) => {
    // Navigate to the Test Newsletter List detail
    await page.getByRole("button", { name: "Test Newsletter List" }).click();
    await page.waitForURL(/\/admin\/audiences\/lists\//);
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .exclude(".recharts-wrapper")
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
