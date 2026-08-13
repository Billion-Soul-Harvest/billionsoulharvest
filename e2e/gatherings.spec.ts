import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const E2E_SLUG_PREFIX = "e2e-test-";

test.describe("Gatherings (Events)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/events");
    await expect(page.locator("h1", { hasText: "Gatherings" })).toBeVisible();
  });

  // ── List ──────────────────────────────────────────────────────────────

  test("list page loads and shows seeded events", async ({ page }) => {
    // The "All Gatherings" tab should be active by default
    await expect(page.locator("button", { hasText: "All Gatherings" })).toBeVisible();

    // Seeded events should be visible as cards
    await expect(page.locator("h3", { hasText: "Test Upcoming Gathering" })).toBeVisible();
    await expect(page.locator("h3", { hasText: "Test Past Gathering" })).toBeVisible();
  });

  test("New Gathering button links to create page", async ({ page }) => {
    await page.getByRole("link", { name: /New Gathering/i }).click();
    await page.waitForURL(/\/admin\/events\/new/);
    await expect(page.locator("h1", { hasText: "New Gathering" })).toBeVisible();
  });

  // ── Status badges ────────────────────────────────────────────────────

  test("status badges display correctly for seeded events", async ({ page }) => {
    // The upcoming event is "published"
    const upcomingCard = page.locator("div").filter({ has: page.locator("h3", { hasText: "Test Upcoming Gathering" }) });
    await expect(upcomingCard.locator("text=Published").first()).toBeVisible();

    // The past event is "completed"
    const pastCard = page.locator("div").filter({ has: page.locator("h3", { hasText: "Test Past Gathering" }) });
    await expect(pastCard.locator("text=Completed").first()).toBeVisible();
  });

  // ── Create ────────────────────────────────────────────────────────────

  test("create a new gathering with required fields", async ({ page }) => {
    const title = `E2E Test Gathering ${Date.now()}`;
    const slug = `${E2E_SLUG_PREFIX}${Date.now()}`;
    const today = new Date();
    const startDate = formatDate(today, 10);
    const endDate = formatDate(today, 12);

    // Navigate to new event form
    await page.getByRole("link", { name: /New Gathering/i }).click();
    await page.waitForURL(/\/admin\/events\/new/);

    // Fill required fields
    const titleInput = page.locator("label", { hasText: "Title" }).locator("..").locator("input");
    await titleInput.fill(title);

    // Override the auto-generated slug with our e2e-test- prefixed slug
    const slugInput = page.locator("label", { hasText: "Slug" }).locator("..").locator("input");
    await slugInput.fill(slug);

    // Fill dates
    const startDateInput = page.locator("label", { hasText: "Start Date" }).locator("..").locator("input");
    await startDateInput.fill(startDate);

    const endDateInput = page.locator("label", { hasText: "End Date" }).locator("..").locator("input");
    await endDateInput.fill(endDate);

    // Fill location
    const cityInput = page.locator("label", { hasText: "City" }).locator("..").locator("input");
    await cityInput.fill("E2E Test City");

    // Set status to draft
    const statusTrigger = page.locator("label", { hasText: "Status" }).locator("..").locator("[role='combobox']");
    await statusTrigger.click();
    await page.locator("[role='option']", { hasText: "Draft" }).click();

    // Submit form
    await page.getByRole("button", { name: /Create Gathering/i }).click();

    // After creation, redirects to edit page (or builder page)
    await page.waitForURL(/\/admin\/events\/edit\//);

    // Navigate back to list and verify the event appears
    await page.goto("/admin/events");
    await expect(page.locator("h3", { hasText: title })).toBeVisible();
  });

  // ── Edit ──────────────────────────────────────────────────────────────

  test("edit an existing gathering title and description", async ({ page }) => {
    // Click on the seeded upcoming event to navigate to edit page
    await page.locator("a", { hasText: "Test Upcoming Gathering" }).first().click();
    await page.waitForURL(/\/admin\/events\/edit\//);

    // The form should be inside the "Gathering Details" tab which is the default
    const titleInput = page.locator("label", { hasText: "Title" }).locator("..").locator("input");
    await expect(titleInput).toHaveValue("Test Upcoming Gathering");

    // Edit the description
    const descTextarea = page.locator("label", { hasText: "Short Description" }).locator("..").locator("textarea");
    const originalDesc = await descTextarea.inputValue();
    const updatedDesc = `${originalDesc} - edited by e2e`;

    await descTextarea.fill(updatedDesc);

    // Submit the form
    await page.getByRole("button", { name: /Update Gathering/i }).click();

    // Should redirect to the events list
    await page.waitForURL(/\/admin\/events$/);

    // Navigate back to the event to verify the description was saved
    await page.locator("a", { hasText: "Test Upcoming Gathering" }).first().click();
    await page.waitForURL(/\/admin\/events\/edit\//);

    const descAfterSave = page.locator("label", { hasText: "Short Description" }).locator("..").locator("textarea");
    await expect(descAfterSave).toHaveValue(updatedDesc);

    // Restore the original description
    await descAfterSave.fill(originalDesc);
    await page.getByRole("button", { name: /Update Gathering/i }).click();
    await page.waitForURL(/\/admin\/events$/);
  });

  // ── Delete (from list card) ───────────────────────────────────────────

  test("delete a gathering from the list", async ({ page }) => {
    // First, create a gathering to delete
    const title = `E2E Delete Me ${Date.now()}`;
    const slug = `${E2E_SLUG_PREFIX}delete-${Date.now()}`;
    await createTestGathering(page, title, slug);

    // Go back to list
    await page.goto("/admin/events");
    await expect(page.locator("h3", { hasText: title })).toBeVisible();

    // Find the card for this event and click the delete button (trash icon)
    const card = page.locator("div").filter({ has: page.locator("h3", { hasText: title }) });
    await card.locator("button[title='Delete event']").click();

    // Confirm deletion — the card shows "Yes" / "No" buttons
    await card.getByRole("button", { name: "Yes" }).click();

    // Wait for the event to be removed
    await expect(page.locator("h3", { hasText: title })).toBeHidden({ timeout: 10000 });
  });

  // ── Delete (from edit page) ───────────────────────────────────────────

  test("delete a gathering from the edit page", async ({ page }) => {
    // Create a gathering to delete
    const title = `E2E Delete Edit ${Date.now()}`;
    const slug = `${E2E_SLUG_PREFIX}delete-edit-${Date.now()}`;
    await createTestGathering(page, title, slug);

    // Go to the events list, find and click into the event
    await page.goto("/admin/events");
    await page.locator("a", { hasText: title }).first().click();
    await page.waitForURL(/\/admin\/events\/edit\//);

    // Click the Delete button in the header
    await page.getByRole("button", { name: /Delete/i }).click();

    // Confirm
    await page.getByRole("button", { name: /Confirm/i }).click();

    // Should redirect to events list
    await page.waitForURL(/\/admin\/events/, { timeout: 10000 });

    // Verify event is gone
    await expect(page.locator("h3", { hasText: title })).toBeHidden();
  });

  // ── Display Order tab ─────────────────────────────────────────────────

  test("display order tab shows visible events", async ({ page }) => {
    // Switch to Display Order tab
    await page.locator("button", { hasText: "Display Order" }).click();

    // The seeded published event should appear in the display order tab
    // (only published/registration_open/registration_closed events are shown)
    await expect(page.locator("text=Test Upcoming Gathering")).toBeVisible();
  });

  // ── Select all / bulk actions ─────────────────────────────────────────

  test("select all checkbox toggles bulk selection", async ({ page }) => {
    // Click the "Select all" checkbox
    const selectAll = page.locator("input[aria-label='Select all events']");
    await selectAll.check();

    // Should show a bulk actions bar with selected count
    await expect(page.locator("text=/\\d+ selected/")).toBeVisible();

    // Uncheck select all
    await selectAll.uncheck();
    await expect(page.locator("text=/\\d+ selected/")).toBeHidden();
  });

  // ── Accessibility ─────────────────────────────────────────────────────

  test("events list page passes axe accessibility check", async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .exclude(".recharts-wrapper") // exclude chart widgets if present
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test("new gathering form passes axe accessibility check", async ({ page }) => {
    await page.goto("/admin/events/new");
    await expect(page.locator("h1", { hasText: "New Gathering" })).toBeVisible();

    const results = await new AxeBuilder({ page })
      .exclude(".recharts-wrapper")
      .analyze();

    expect(results.violations).toEqual([]);
  });

  // Cleanup of e2e-test- prefixed events is handled by the global teardown
  // in e2e/fixtures/teardown.ts (which calls cleanup() from seed.ts).
  // On next test run, seed.ts also cleans up leftover e2e-test-% slugs.
});

// ── Helpers ───────────────────────────────────────────────────────────────

/**
 * Creates a test gathering via the UI and returns to the events list.
 */
async function createTestGathering(page: import("@playwright/test").Page, title: string, slug: string) {
  await page.goto("/admin/events/new");
  await expect(page.locator("h1", { hasText: "New Gathering" })).toBeVisible();

  const titleInput = page.locator("label", { hasText: "Title" }).locator("..").locator("input");
  await titleInput.fill(title);

  const slugInput = page.locator("label", { hasText: "Slug" }).locator("..").locator("input");
  await slugInput.fill(slug);

  const today = new Date();
  const startDateInput = page.locator("label", { hasText: "Start Date" }).locator("..").locator("input");
  await startDateInput.fill(formatDate(today, 10));

  const endDateInput = page.locator("label", { hasText: "End Date" }).locator("..").locator("input");
  await endDateInput.fill(formatDate(today, 12));

  // Set status to draft so it's easy to clean up
  const statusTrigger = page.locator("label", { hasText: "Status" }).locator("..").locator("[role='combobox']");
  await statusTrigger.click();
  await page.locator("[role='option']", { hasText: "Draft" }).click();

  await page.getByRole("button", { name: /Create Gathering/i }).click();
  await page.waitForURL(/\/admin\/events\/edit\//, { timeout: 15000 });
}

/**
 * Returns a date string in YYYY-MM-DD format, offset by `daysOffset` days from `base`.
 */
function formatDate(base: Date, daysOffset: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split("T")[0];
}
