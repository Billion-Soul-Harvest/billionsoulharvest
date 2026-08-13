import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * E2E tests for the Contacts feature.
 *
 * Seed data uses contacts with first_name "Test" and last names like
 * "Pastor", "Leader", "Donor", etc. (see e2e/fixtures/test-data.ts).
 *
 * Created contacts use a "test-e2e-" prefix so cleanup can target them.
 */

const CONTACTS_URL = "/admin/contacts";

// ---------------------------------------------------------------------------
// List view
// ---------------------------------------------------------------------------

test.describe("Contacts list", () => {
  test("page loads and displays heading with total count", async ({ page }) => {
    await page.goto(CONTACTS_URL);
    await expect(page.getByRole("heading", { name: "Contacts" })).toBeVisible();
    // Total count badge is next to the heading
    await expect(page.locator("text=total")).toBeVisible();
  });

  test("shows seeded test contacts in the grid", async ({ page }) => {
    await page.goto(CONTACTS_URL);
    // AG Grid renders rows — wait for at least one row to appear
    await expect(page.locator(".ag-row").first()).toBeVisible({ timeout: 15_000 });
    // Seeded contacts should be visible (they are sorted by created_at desc by default)
    // At minimum we should see some data rows
    const rowCount = await page.locator(".ag-row").count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test("shows column headers", async ({ page }) => {
    await page.goto(CONTACTS_URL);
    await expect(page.locator(".ag-header-cell").first()).toBeVisible({ timeout: 15_000 });
    // Default visible columns include Contact, Email address, First name, Last name
    const headers = page.locator(".ag-header-cell");
    const headerTexts = await headers.allTextContents();
    expect(headerTexts.some((h) => h.includes("Contact"))).toBe(true);
    expect(headerTexts.some((h) => h.includes("Email"))).toBe(true);
    expect(headerTexts.some((h) => h.includes("First name"))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Search / Filter
// ---------------------------------------------------------------------------

test.describe("Contacts search", () => {
  test("filters contacts by name and results update", async ({ page }) => {
    await page.goto(CONTACTS_URL);
    await expect(page.locator(".ag-row").first()).toBeVisible({ timeout: 15_000 });

    // The search input placeholder contains "Search by name or email..."
    const searchInput = page.locator(
      'input[placeholder*="Search by"]'
    );
    await searchInput.fill("Test Pastor");
    // Debounced search — wait for navigation / URL to update
    await page.waitForURL(/search=Test/);
    // Wait for grid to re-render
    await expect(page.locator(".ag-row").first()).toBeVisible({ timeout: 10_000 });

    // The grid should now show only matching contacts
    const cells = page.locator(".ag-cell");
    const allText = await cells.allTextContents();
    const joined = allText.join(" ");
    expect(joined).toContain("Pastor");
  });
});

// ---------------------------------------------------------------------------
// Create contact
// ---------------------------------------------------------------------------

test.describe("Create contact", () => {
  const testEmail = `test-e2e-create-${Date.now()}@example.com`;
  const firstName = "test-e2e-CreateFirst";
  const lastName = "test-e2e-CreateLast";

  test("opens create dialog, fills form, and saves new contact", async ({ page }) => {
    await page.goto(CONTACTS_URL);
    await expect(page.locator(".ag-row").first()).toBeVisible({ timeout: 15_000 });

    // Click "Add contacts" dropdown button
    await page.getByRole("button", { name: "Add contacts" }).click();
    // Select "Add a single contact"
    await page.getByText("Add a single contact").click();

    // Dialog should appear with "Add a contact" title
    await expect(page.getByRole("heading", { name: "Add a contact" })).toBeVisible();

    // Fill in the form fields
    await page.locator("#create-email").fill(testEmail);
    await page.locator("#create-first-name").fill(firstName);
    await page.locator("#create-last-name").fill(lastName);

    // Click Save
    await page.getByRole("button", { name: "Save", exact: true }).click();

    // Dialog should close
    await expect(page.getByRole("heading", { name: "Add a contact" })).not.toBeVisible({ timeout: 10_000 });

    // Page should refresh — search for the new contact to confirm it exists
    const searchInput = page.locator('input[placeholder*="Search by"]');
    await searchInput.fill(firstName);
    await page.waitForURL(/search=/);
    await expect(page.locator(".ag-row").first()).toBeVisible({ timeout: 10_000 });

    const cells = page.locator(".ag-cell");
    const allText = await cells.allTextContents();
    expect(allText.join(" ")).toContain(firstName);
  });

  // Cleanup: delete the contact we created
  test.afterAll(async ({ request }) => {
    // Use the API or leave for global teardown — test contacts with "test-e2e-"
    // prefix will be cleaned up by the global teardown script.
  });
});

// ---------------------------------------------------------------------------
// View detail
// ---------------------------------------------------------------------------

test.describe("Contact detail", () => {
  test("clicking a seeded contact navigates to detail page", async ({ page }) => {
    // Search for a known seeded contact
    await page.goto(`${CONTACTS_URL}?search=Test+Pastor`);
    await expect(page.locator(".ag-row").first()).toBeVisible({ timeout: 15_000 });

    // Click the contact name link in the grid
    const contactLink = page.locator(".ag-cell a", { hasText: "Test Pastor" }).first();
    await expect(contactLink).toBeVisible();
    await contactLink.click();

    // Should navigate to /admin/contacts/[id]
    await page.waitForURL(/\/admin\/contacts\/[a-f0-9-]+/);

    // Detail page shows the contact name in the heading
    await expect(page.getByRole("heading", { name: /Test Pastor/i })).toBeVisible({ timeout: 10_000 });

    // Detail page shows Basic details section
    await expect(page.getByText("Basic details")).toBeVisible();

    // Should display the contact's email
    await expect(page.locator('input[type="email"]')).toHaveValue("test-pastor@example.com");
  });
});

// ---------------------------------------------------------------------------
// Edit contact
// ---------------------------------------------------------------------------

test.describe("Edit contact", () => {
  test("edits a seeded contact field and saves changes", async ({ page }) => {
    // Navigate to a known seeded contact's detail page
    await page.goto(`${CONTACTS_URL}?search=Test+Leader`);
    await expect(page.locator(".ag-row").first()).toBeVisible({ timeout: 15_000 });

    const contactLink = page.locator(".ag-cell a", { hasText: "Test Leader" }).first();
    await contactLink.click();
    await page.waitForURL(/\/admin\/contacts\/[a-f0-9-]+/);
    await expect(page.getByRole("heading", { name: /Test Leader/i })).toBeVisible({ timeout: 10_000 });

    // The detail page is an inline edit form — find the Job title field and change it
    const jobTitleInput = page.locator('input').filter({ has: page.locator('~ label:has-text("Job title"), :scope') });
    // Use the label-based approach: find the label "Job title" and its sibling input
    const jobTitleLabel = page.getByText("Job title", { exact: true }).first();
    await expect(jobTitleLabel).toBeVisible();

    // The input is in the same parent container as the label
    const jobTitleField = jobTitleLabel.locator("..").locator("input");
    const originalValue = await jobTitleField.inputValue();
    const newValue = `test-e2e-jobtitle-${Date.now()}`;
    await jobTitleField.fill(newValue);

    // The "Save changes" button should now be enabled (form is dirty)
    const saveButton = page.getByRole("button", { name: "Save changes" });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    // Wait for success toast
    await expect(page.getByText("Changes saved")).toBeVisible({ timeout: 10_000 });

    // Reload the page and verify the value persisted
    await page.reload();
    await expect(page.getByRole("heading", { name: /Test Leader/i })).toBeVisible({ timeout: 10_000 });
    const updatedField = page.getByText("Job title", { exact: true }).first().locator("..").locator("input");
    await expect(updatedField).toHaveValue(newValue);

    // Restore original value
    await updatedField.fill(originalValue);
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Changes saved")).toBeVisible({ timeout: 10_000 });
  });
});

// ---------------------------------------------------------------------------
// Delete contact
// ---------------------------------------------------------------------------

test.describe("Delete contact", () => {
  const deleteFirstName = "test-e2e-DelFirst";
  const deleteLastName = "test-e2e-DelLast";
  const deleteEmail = `test-e2e-del-${Date.now()}@example.com`;

  test("creates and then deletes a contact from the detail page", async ({ page }) => {
    // First, create a contact to delete
    await page.goto(CONTACTS_URL);
    await expect(page.locator(".ag-row").first()).toBeVisible({ timeout: 15_000 });

    await page.getByRole("button", { name: "Add contacts" }).click();
    await page.getByText("Add a single contact").click();
    await expect(page.getByRole("heading", { name: "Add a contact" })).toBeVisible();

    await page.locator("#create-email").fill(deleteEmail);
    await page.locator("#create-first-name").fill(deleteFirstName);
    await page.locator("#create-last-name").fill(deleteLastName);
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Add a contact" })).not.toBeVisible({ timeout: 10_000 });

    // Search for the newly created contact
    const searchInput = page.locator('input[placeholder*="Search by"]');
    await searchInput.fill(deleteFirstName);
    await page.waitForURL(/search=/);
    await expect(page.locator(".ag-row").first()).toBeVisible({ timeout: 10_000 });

    // Navigate to the detail page
    const contactLink = page.locator(".ag-cell a", { hasText: `${deleteFirstName} ${deleteLastName}` }).first();
    await contactLink.click();
    await page.waitForURL(/\/admin\/contacts\/[a-f0-9-]+/);
    await expect(page.getByRole("heading", { name: new RegExp(deleteFirstName) })).toBeVisible({ timeout: 10_000 });

    // Click the Delete button in the header
    await page.getByRole("button", { name: /Delete/i }).click();

    // Confirm in the delete dialog
    await expect(page.getByText("This action cannot be undone")).toBeVisible();
    await page.getByRole("button", { name: "Delete", exact: true }).click();

    // Should redirect back to the contacts list
    await page.waitForURL(CONTACTS_URL, { timeout: 10_000 });

    // Verify the contact is gone by searching
    const searchAfter = page.locator('input[placeholder*="Search by"]');
    await searchAfter.fill(deleteFirstName);
    await page.waitForURL(/search=/);
    // Wait for the grid to settle — either no rows or the specific name is absent
    await page.waitForTimeout(2000);
    const cellTexts = await page.locator(".ag-cell").allTextContents();
    expect(cellTexts.join(" ")).not.toContain(deleteFirstName);
  });
});

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

test.describe("Contacts accessibility", () => {
  test("contacts list page passes axe-core checks", async ({ page }) => {
    await page.goto(CONTACTS_URL);
    await expect(page.locator(".ag-row").first()).toBeVisible({ timeout: 15_000 });

    const results = await new AxeBuilder({ page })
      // AG Grid injects its own DOM which may have known a11y issues;
      // exclude the grid internals to focus on our application markup
      .exclude(".ag-root-wrapper")
      .analyze();

    expect(results.violations).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Responsive / Mobile
// ---------------------------------------------------------------------------

test.describe("Contacts responsive (mobile)", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "Mobile tests run in chromium only");

  test("contacts list loads on mobile viewport", async ({ browser }) => {
    const context = await browser.newContext({
      ...({ viewport: { width: 390, height: 844 } }),
      storageState: "e2e/.auth/admin.json",
    });
    const page = await context.newPage();

    await page.goto(CONTACTS_URL);
    await expect(page.getByRole("heading", { name: "Contacts" })).toBeVisible({ timeout: 15_000 });

    // The grid should still render (AG Grid is responsive)
    await expect(page.locator(".ag-root-wrapper").first()).toBeVisible();

    // The "Add contacts" button should be visible
    await expect(page.getByRole("button", { name: "Add contacts" })).toBeVisible();

    // Search input should be visible
    await expect(page.locator('input[placeholder*="Search by"]')).toBeVisible();

    await context.close();
  });

  test("contact detail page loads on mobile viewport", async ({ browser }) => {
    const context = await browser.newContext({
      ...({ viewport: { width: 390, height: 844 } }),
      storageState: "e2e/.auth/admin.json",
    });
    const page = await context.newPage();

    // Navigate to a seeded contact via search
    await page.goto(`${CONTACTS_URL}?search=Test+Donor`);
    await expect(page.locator(".ag-row").first()).toBeVisible({ timeout: 15_000 });

    const contactLink = page.locator(".ag-cell a", { hasText: "Test Donor" }).first();
    await contactLink.click();
    await page.waitForURL(/\/admin\/contacts\/[a-f0-9-]+/);

    // Detail heading should be visible
    await expect(page.getByRole("heading", { name: /Test Donor/i })).toBeVisible({ timeout: 10_000 });

    // Basic details section should be visible
    await expect(page.getByText("Basic details")).toBeVisible();

    await context.close();
  });
});
