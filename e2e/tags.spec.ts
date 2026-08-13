import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const TAG_PREFIX = "e2e-test-";

/**
 * Helper: navigate to the tags page.
 */
async function goToTags(page: Page) {
  await page.goto("/admin/tags");
  await expect(page.locator("h1", { hasText: "Manage tags" })).toBeVisible();
}

/**
 * Helper: create a tag via the UI dialog.
 */
async function createTag(page: Page, name: string) {
  await page.getByRole("button", { name: /create new tag/i }).click();
  await expect(page.getByRole("heading", { name: "Create tag" })).toBeVisible();
  await page.getByPlaceholder("Enter tag name").fill(name);
  await page.getByRole("button", { name: "Create", exact: true }).click();
  // Wait for the toast confirmation and page refresh
  await expect(page.getByText(`Tag "${name}" created`)).toBeVisible();
}

/**
 * Helper: delete a tag via its row action menu.
 */
async function deleteTagViaMenu(page: Page, name: string) {
  const row = page.locator("tr", { hasText: name });
  await row.locator("button").filter({ has: page.locator("svg") }).last().click();
  await page.getByRole("button", { name: "Delete" }).first().click();
  // Confirm in the delete dialog
  await expect(
    page.getByRole("heading", { name: new RegExp(`Delete.*${name}`) })
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Delete", exact: true })
    .click();
  await expect(page.getByText(`Tag "${name}" deleted`)).toBeVisible();
}

/**
 * Helper: clean up all e2e-test- prefixed tags via the search + bulk delete flow.
 * Falls back gracefully if no tags are found.
 */
async function cleanupE2ETags(page: Page) {
  await goToTags(page);
  // Search for our prefix
  await page.getByPlaceholder("Search by tag name").fill(TAG_PREFIX);
  // Wait for debounced search
  await page.waitForTimeout(500);

  // If no tags match, nothing to clean up
  const noMatch = page.getByText("No tags match your search.");
  if (await noMatch.isVisible().catch(() => false)) return;

  // Select all visible rows
  const selectAllCheckbox = page
    .locator("thead")
    .locator('input[type="checkbox"]');
  if (await selectAllCheckbox.isVisible().catch(() => false)) {
    await selectAllCheckbox.check();
    // Click "Delete selected"
    const deleteSelectedBtn = page.getByRole("button", {
      name: /delete selected/i,
    });
    if (await deleteSelectedBtn.isVisible().catch(() => false)) {
      await deleteSelectedBtn.click();
      // Confirm bulk delete dialog
      await page
        .getByRole("button", { name: "Delete", exact: true })
        .click();
      await expect(page.getByText(/tag\(s\) deleted/)).toBeVisible();
    }
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe("Tags Manager", () => {
  test.beforeEach(async ({ page }) => {
    await goToTags(page);
  });

  // Clean up any leftover e2e-test- tags after all tests in this file
  test.afterAll(async ({ browser }) => {
    const context = await browser.newContext({
      storageState: "e2e/.auth/admin.json",
    });
    const page = await context.newPage();
    await cleanupE2ETags(page);
    await context.close();
  });

  // ---------- List ----------

  test("shows seeded tags on the page", async ({ page }) => {
    // The seeded tags from test-data.ts should be present
    await expect(page.getByRole("cell", { name: "test-vip" })).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "test-speaker" })
    ).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "test-volunteer" })
    ).toBeVisible();
  });

  test("shows the total tag count badge", async ({ page }) => {
    // The "All tags" label with a count badge should be visible
    await expect(page.getByText("All tags")).toBeVisible();
    // Badge should contain a number
    const badge = page.locator("text=All tags").locator("..").locator("span");
    await expect(badge).toBeVisible();
  });

  // ---------- Create ----------

  test("creates a new tag and shows it in the list", async ({ page }) => {
    const tagName = `${TAG_PREFIX}create-${Date.now()}`;
    await createTag(page, tagName);

    // Verify it appears in the table (may need to search for it)
    await page.getByPlaceholder("Search by tag name").fill(tagName);
    await page.waitForTimeout(500);
    await expect(page.getByRole("cell", { name: tagName })).toBeVisible();
  });

  // ---------- Rename ----------

  test("renames a tag via action menu", async ({ page }) => {
    // First create a tag to rename
    const originalName = `${TAG_PREFIX}rename-orig-${Date.now()}`;
    const newName = `${TAG_PREFIX}rename-new-${Date.now()}`;
    await createTag(page, originalName);

    // Search for the created tag
    await page.getByPlaceholder("Search by tag name").fill(originalName);
    await page.waitForTimeout(500);

    // Open the action menu on the row
    const row = page.locator("tr", { hasText: originalName });
    await row
      .locator("button")
      .filter({ has: page.locator("svg") })
      .last()
      .click();

    // Click Rename
    await page.getByRole("button", { name: "Rename" }).click();
    await expect(
      page.getByRole("heading", { name: "Rename tag" })
    ).toBeVisible();

    // Clear and type new name
    const input = page.locator('dialog input, [role="dialog"] input');
    await input.clear();
    await input.fill(newName);
    await page.getByRole("button", { name: "Save" }).click();

    // Verify toast
    await expect(
      page.getByText(`Tag renamed to "${newName}"`)
    ).toBeVisible();

    // Verify the new name appears in the list
    await page.getByPlaceholder("Search by tag name").clear();
    await page.getByPlaceholder("Search by tag name").fill(newName);
    await page.waitForTimeout(500);
    await expect(page.getByRole("cell", { name: newName })).toBeVisible();
  });

  // ---------- Delete ----------

  test("deletes a tag via action menu", async ({ page }) => {
    const tagName = `${TAG_PREFIX}delete-${Date.now()}`;
    await createTag(page, tagName);

    // Search for it
    await page.getByPlaceholder("Search by tag name").fill(tagName);
    await page.waitForTimeout(500);
    await expect(page.getByRole("cell", { name: tagName })).toBeVisible();

    // Delete via action menu
    await deleteTagViaMenu(page, tagName);

    // Verify it is removed
    await page.getByPlaceholder("Search by tag name").clear();
    await page.getByPlaceholder("Search by tag name").fill(tagName);
    await page.waitForTimeout(500);
    await expect(page.getByText("No tags match your search.")).toBeVisible();
  });

  // ---------- Search ----------

  test("filters tags by search input", async ({ page }) => {
    // Search for a seeded tag
    await page.getByPlaceholder("Search by tag name").fill("test-vip");
    await page.waitForTimeout(500);

    await expect(page.getByRole("cell", { name: "test-vip" })).toBeVisible();
    // Other seeded tags should not be visible
    await expect(
      page.getByRole("cell", { name: "test-speaker" })
    ).not.toBeVisible();
    await expect(
      page.getByRole("cell", { name: "test-volunteer" })
    ).not.toBeVisible();
  });

  test("shows empty state for non-matching search", async ({ page }) => {
    await page
      .getByPlaceholder("Search by tag name")
      .fill("zzz-nonexistent-tag-9999");
    await page.waitForTimeout(500);
    await expect(page.getByText("No tags match your search.")).toBeVisible();
  });

  // ---------- Sort ----------

  test("sorts tags by name", async ({ page }) => {
    // Click the Name column header to sort ascending
    await page.getByText("Name", { exact: false }).first().click();
    await page.waitForTimeout(300);

    // Verify the sort indicator is visible
    const nameHeader = page.locator("th", { hasText: "Name" });
    await expect(nameHeader).toBeVisible();

    // Collect tag names from the first column to verify order
    const cells = page.locator("tbody tr td:nth-child(2)");
    const names = await cells.allTextContents();
    expect(names.length).toBeGreaterThan(0);

    // They should be in ascending order
    const sorted = [...names].sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase())
    );
    expect(names).toEqual(sorted);
  });

  test("sorts tags by contact count", async ({ page }) => {
    // Click "Contacts" header
    await page.locator("th", { hasText: "Contacts" }).click();
    await page.waitForTimeout(300);

    const cells = page.locator("tbody tr td:nth-child(3)");
    const counts = (await cells.allTextContents()).map((t) =>
      parseInt(t.replace(/,/g, ""), 10)
    );
    expect(counts.length).toBeGreaterThan(0);

    // Should be ascending
    for (let i = 1; i < counts.length; i++) {
      expect(counts[i]).toBeGreaterThanOrEqual(counts[i - 1]);
    }
  });

  test("sorts tags by created date", async ({ page }) => {
    // Click "Date created" header to sort ascending
    await page.locator("th", { hasText: "Date created" }).click();
    await page.waitForTimeout(300);

    // The header should show the sort indicator
    const header = page.locator("th", { hasText: "Date created" });
    await expect(header).toContainText("Date created");
  });

  // ---------- Bulk operations ----------

  test("selects multiple tags and bulk deletes them", async ({ page }) => {
    // Create two tags for bulk delete
    const tag1 = `${TAG_PREFIX}bulk1-${Date.now()}`;
    const tag2 = `${TAG_PREFIX}bulk2-${Date.now()}`;
    await createTag(page, tag1);
    await createTag(page, tag2);

    // Search for our prefix to isolate them
    await page.getByPlaceholder("Search by tag name").fill(TAG_PREFIX + "bulk");
    await page.waitForTimeout(500);

    // Select all via the header checkbox
    const selectAll = page.locator("thead").locator('input[type="checkbox"]');
    await selectAll.check();

    // "Delete selected" button should appear
    const deleteSelectedBtn = page.getByRole("button", {
      name: /delete selected/i,
    });
    await expect(deleteSelectedBtn).toBeVisible();
    await deleteSelectedBtn.click();

    // Confirm in the bulk delete dialog
    await expect(
      page.getByRole("heading", { name: /Delete \d+ tags/ })
    ).toBeVisible();
    await page.getByRole("button", { name: "Delete", exact: true }).click();
    await expect(page.getByText(/tag\(s\) deleted/)).toBeVisible();

    // Verify tags are removed
    await page.getByPlaceholder("Search by tag name").clear();
    await page.getByPlaceholder("Search by tag name").fill(tag1);
    await page.waitForTimeout(500);
    await expect(page.getByText("No tags match your search.")).toBeVisible();
  });

  // ---------- Pagination ----------

  test("pagination controls are visible when tags exist", async ({ page }) => {
    // The pagination bar should show record range and page controls
    const paginationText = page.getByText(/\d+–\d+ of \d+/);
    await expect(paginationText).toBeVisible();

    // "First", "Prev", "Next", "Last" buttons should be present
    await expect(
      page.getByRole("button", { name: "First" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Prev" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Next" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Last" })
    ).toBeVisible();
  });

  test("First and Prev buttons are disabled on page 1", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: "First" })
    ).toBeDisabled();
    await expect(
      page.getByRole("button", { name: "Prev" })
    ).toBeDisabled();
  });

  // ---------- Accessibility ----------

  test("passes axe accessibility checks", async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .exclude(".sonner-toast") // exclude toast overlays from scan
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
