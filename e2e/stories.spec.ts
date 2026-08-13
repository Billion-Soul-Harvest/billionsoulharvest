import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const E2E_SLUG_PREFIX = "e2e-test-";

test.describe("Stories", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/stories");
    await expect(page.locator("h1", { hasText: "Stories" })).toBeVisible();
  });

  // ── List ──────────────────────────────────────────────────────────────

  test("list page loads and shows seeded stories", async ({ page }) => {
    // The "All Stories" tab should be active by default
    await expect(page.locator("button", { hasText: "All Stories" })).toBeVisible();

    // Seeded stories should be visible as cards
    await expect(page.locator("h3", { hasText: "Test Published Story" })).toBeVisible();
    await expect(page.locator("h3", { hasText: "Test Draft Story" })).toBeVisible();
  });

  test("New Story button links to create page", async ({ page }) => {
    await page.getByRole("link", { name: /New Story/i }).click();
    await page.waitForURL(/\/admin\/stories\/new/);
    await expect(page.locator("h1", { hasText: "New Story" })).toBeVisible();
  });

  // ── Status badges ────────────────────────────────────────────────────

  test("status badges display correctly for seeded stories", async ({ page }) => {
    // The published story shows "Published" badge
    const publishedCard = page.locator("div").filter({ has: page.locator("h3", { hasText: "Test Published Story" }) });
    await expect(publishedCard.locator("text=Published").first()).toBeVisible();

    // The draft story shows "Draft" badge
    const draftCard = page.locator("div").filter({ has: page.locator("h3", { hasText: "Test Draft Story" }) });
    await expect(draftCard.locator("text=Draft").first()).toBeVisible();
  });

  // ── Create ────────────────────────────────────────────────────────────

  test("create a new story via the 3-step form", async ({ page }) => {
    const title = `E2E Test Story ${Date.now()}`;
    const slug = `${E2E_SLUG_PREFIX}${Date.now()}`;

    // Navigate to new story form
    await page.getByRole("link", { name: /New Story/i }).click();
    await page.waitForURL(/\/admin\/stories\/new/);

    // ── Step 1: Story Details ──
    await expect(page.locator("h3", { hasText: "Story Details" })).toBeVisible();

    const titleInput = page.locator("label", { hasText: "Title" }).locator("..").locator("input");
    await titleInput.fill(title);

    // Override auto-generated slug with e2e-test- prefix
    const slugInput = page.locator("label", { hasText: "Slug" }).locator("..").locator("input");
    await slugInput.fill(slug);

    const descriptionTextarea = page.locator("label", { hasText: "Description" }).locator("..").locator("textarea");
    await descriptionTextarea.fill("E2E test story description");

    const authorInput = page.locator("label", { hasText: "Author" }).locator("..").locator("input");
    await authorInput.fill("E2E Test Author");

    // Click Next to go to Step 2
    await page.getByRole("button", { name: /Next/i }).click();

    // ── Step 2: Story Content ──
    await expect(page.locator("h3", { hasText: "Story Content" })).toBeVisible();
    // Verify the Tiptap editor renders (don't try to type into it)
    await expect(page.locator(".tiptap, .ProseMirror, [contenteditable]").first()).toBeVisible({ timeout: 10000 });

    // Click Next to go to Step 3
    await page.getByRole("button", { name: /Next/i }).click();

    // ── Step 3: Gallery Images ──
    await expect(page.locator("h3", { hasText: "Gallery Images" })).toBeVisible();

    // Submit the form (Create Story button is available on all steps)
    await page.getByRole("button", { name: /Create Story/i }).click();

    // After creation, redirects to edit page
    await page.waitForURL(/\/admin\/stories\/edit\//, { timeout: 15000 });

    // Navigate back to list and verify the story appears
    await page.goto("/admin/stories");
    await expect(page.locator("h3", { hasText: title })).toBeVisible();
  });

  // ── Step navigation ────────────────────────────────────────────────────

  test("step navigation works via step buttons", async ({ page }) => {
    await page.goto("/admin/stories/new");
    await expect(page.locator("h1", { hasText: "New Story" })).toBeVisible();

    // Step 1 is active by default
    await expect(page.locator("h3", { hasText: "Story Details" })).toBeVisible();

    // Click step 2 button (contains "2" in the step circle)
    await page.locator("button", { hasText: "Story Content" }).click();
    await expect(page.locator("h3", { hasText: "Story Content" })).toBeVisible();

    // Click step 3 button
    await page.locator("button", { hasText: "Gallery Images" }).click();
    await expect(page.locator("h3", { hasText: "Gallery Images" })).toBeVisible();

    // Click step 1 button to go back
    await page.locator("button", { hasText: "Story Details" }).click();
    await expect(page.locator("h3", { hasText: "Story Details" })).toBeVisible();

    // Test the Back button from step 2
    await page.locator("button", { hasText: "Story Content" }).click();
    await page.getByRole("button", { name: /^Back$/i }).click();
    await expect(page.locator("h3", { hasText: "Story Details" })).toBeVisible();
  });

  // ── Edit ──────────────────────────────────────────────────────────────

  test("edit an existing story title", async ({ page }) => {
    // Click on the seeded published story to navigate to edit page
    await page.locator("a", { hasText: "Test Published Story" }).first().click();
    await page.waitForURL(/\/admin\/stories\/edit\//);

    // Step 1 should be visible by default with the title pre-filled
    const titleInput = page.locator("label", { hasText: "Title" }).locator("..").locator("input");
    await expect(titleInput).toHaveValue("Test Published Story");

    // Edit the description (non-destructive edit)
    const descTextarea = page.locator("label", { hasText: "Description" }).locator("..").locator("textarea");
    const originalDesc = await descTextarea.inputValue();
    const updatedDesc = `${originalDesc} - edited by e2e`;

    await descTextarea.fill(updatedDesc);

    // Submit the form
    await page.getByRole("button", { name: /Update Story/i }).click();

    // Should redirect to the stories list
    await page.waitForURL(/\/admin\/stories$/);

    // Navigate back to verify the description was saved
    await page.locator("a", { hasText: "Test Published Story" }).first().click();
    await page.waitForURL(/\/admin\/stories\/edit\//);

    const descAfterSave = page.locator("label", { hasText: "Description" }).locator("..").locator("textarea");
    await expect(descAfterSave).toHaveValue(updatedDesc);

    // Restore original description
    await descAfterSave.fill(originalDesc);
    await page.getByRole("button", { name: /Update Story/i }).click();
    await page.waitForURL(/\/admin\/stories$/);
  });

  // ── Publish / Unpublish ─────────────────────────────────────────────────

  test("toggle story status between draft and published", async ({ page }) => {
    // Click into the draft story
    await page.locator("a", { hasText: "Test Draft Story" }).first().click();
    await page.waitForURL(/\/admin\/stories\/edit\//);

    // Change status from Draft to Published
    const statusTrigger = page.locator("label", { hasText: "Status" }).locator("..").locator("[role='combobox']");
    await statusTrigger.click();
    await page.locator("[role='option']", { hasText: "Published" }).click();

    // Save
    await page.getByRole("button", { name: /Update Story/i }).click();
    await page.waitForURL(/\/admin\/stories$/);

    // Verify the story now shows "Published" badge
    const storyCard = page.locator("div").filter({ has: page.locator("h3", { hasText: "Test Draft Story" }) });
    await expect(storyCard.locator("text=Published").first()).toBeVisible();

    // Now revert it back to Draft
    await page.locator("a", { hasText: "Test Draft Story" }).first().click();
    await page.waitForURL(/\/admin\/stories\/edit\//);

    await statusTrigger.click();
    await page.locator("[role='option']", { hasText: "Draft" }).click();

    await page.getByRole("button", { name: /Update Story/i }).click();
    await page.waitForURL(/\/admin\/stories$/);

    // Verify it shows "Draft" again
    const revertedCard = page.locator("div").filter({ has: page.locator("h3", { hasText: "Test Draft Story" }) });
    await expect(revertedCard.locator("text=Draft").first()).toBeVisible();
  });

  // ── Delete (from list card) ───────────────────────────────────────────

  test("delete a story from the list", async ({ page }) => {
    // First, create a story to delete
    const title = `E2E Delete Me ${Date.now()}`;
    const slug = `${E2E_SLUG_PREFIX}delete-${Date.now()}`;
    await createTestStory(page, title, slug);

    // Go back to list
    await page.goto("/admin/stories");
    await expect(page.locator("h3", { hasText: title })).toBeVisible();

    // Find the card and click the delete button (trash icon)
    const card = page.locator("div").filter({ has: page.locator("h3", { hasText: title }) });
    await card.locator("button[title='Delete story']").click();

    // Confirm deletion — the card shows "Yes" / "No" buttons
    await card.getByRole("button", { name: "Yes" }).click();

    // Wait for the story to be removed
    await expect(page.locator("h3", { hasText: title })).toBeHidden({ timeout: 10000 });
  });

  // ── Delete (from edit page) ───────────────────────────────────────────

  test("delete a story from the edit page", async ({ page }) => {
    // Create a story to delete
    const title = `E2E Delete Edit ${Date.now()}`;
    const slug = `${E2E_SLUG_PREFIX}delete-edit-${Date.now()}`;
    await createTestStory(page, title, slug);

    // Go to the stories list, find and click into the story
    await page.goto("/admin/stories");
    await page.locator("a", { hasText: title }).first().click();
    await page.waitForURL(/\/admin\/stories\/edit\//);

    // Click the Delete button in the header
    await page.getByRole("button", { name: /Delete/i }).click();

    // Confirm
    await page.getByRole("button", { name: /Confirm/i }).click();

    // Should redirect to stories list
    await page.waitForURL(/\/admin\/stories/, { timeout: 10000 });

    // Verify story is gone
    await expect(page.locator("h3", { hasText: title })).toBeHidden();
  });

  // ── Display Order tab ─────────────────────────────────────────────────

  test("display order tab shows published stories", async ({ page }) => {
    // Switch to Display Order tab
    await page.locator("button", { hasText: "Display Order" }).click();

    // The seeded published story should appear in the display order tab
    await expect(page.locator("text=Test Published Story")).toBeVisible();
  });

  // ── Select all / bulk actions ─────────────────────────────────────────

  test("select all checkbox toggles bulk selection", async ({ page }) => {
    // Click the "Select all" checkbox
    const selectAll = page.locator("input[aria-label='Select all stories']");
    await selectAll.check();

    // Should show a bulk actions bar with selected count
    await expect(page.locator("text=/\\d+ selected/")).toBeVisible();

    // Uncheck select all
    await selectAll.uncheck();
    await expect(page.locator("text=/\\d+ selected/")).toBeHidden();
  });

  // ── Accessibility ─────────────────────────────────────────────────────

  test("stories list page passes axe accessibility check", async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .exclude(".recharts-wrapper")
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test("new story form passes axe accessibility check", async ({ page }) => {
    await page.goto("/admin/stories/new");
    await expect(page.locator("h1", { hasText: "New Story" })).toBeVisible();

    const results = await new AxeBuilder({ page })
      .exclude(".recharts-wrapper")
      .analyze();

    expect(results.violations).toEqual([]);
  });

  // Cleanup of e2e-test- prefixed stories is handled by the global teardown
  // in e2e/fixtures/teardown.ts (which calls cleanup() from seed.ts).
  // On next test run, seed.ts also cleans up leftover e2e-test-% slugs.
});

// ── Helpers ───────────────────────────────────────────────────────────────

/**
 * Creates a test story via the UI. Leaves the browser on the edit page.
 */
async function createTestStory(page: import("@playwright/test").Page, title: string, slug: string) {
  await page.goto("/admin/stories/new");
  await expect(page.locator("h1", { hasText: "New Story" })).toBeVisible();

  const titleInput = page.locator("label", { hasText: "Title" }).locator("..").locator("input");
  await titleInput.fill(title);

  const slugInput = page.locator("label", { hasText: "Slug" }).locator("..").locator("input");
  await slugInput.fill(slug);

  // Set status to draft so it's easy to clean up
  const statusTrigger = page.locator("label", { hasText: "Status" }).locator("..").locator("[role='combobox']");
  await statusTrigger.click();
  await page.locator("[role='option']", { hasText: "Draft" }).click();

  await page.getByRole("button", { name: /Create Story/i }).click();
  await page.waitForURL(/\/admin\/stories\/edit\//, { timeout: 15000 });
}
