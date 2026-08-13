import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Helper: navigate to the users page and wait for it to load.
 */
async function goToUsers(page: Page) {
  await page.goto("/admin/users");
  await expect(page.locator("h1", { hasText: "Users" })).toBeVisible();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe("Users Manager", () => {
  test.beforeEach(async ({ page }) => {
    await goToUsers(page);
  });

  // ---------- List ----------

  test("page loads and shows users table", async ({ page }) => {
    // The heading and description should be visible
    await expect(page.locator("h1", { hasText: "Users" })).toBeVisible();
    await expect(
      page.getByText("Manage admin users and their roles.")
    ).toBeVisible();

    // Table headers should be present
    await expect(page.locator("th", { hasText: "Email" })).toBeVisible();
    await expect(
      page.locator("th", { hasText: "Display Name" })
    ).toBeVisible();
    await expect(page.locator("th", { hasText: "Role" })).toBeVisible();
    await expect(page.locator("th", { hasText: "Created" })).toBeVisible();
  });

  test("shows the current admin user in the list", async ({ page }) => {
    // The logged-in user (admin@billionsoulharvest.org) should appear
    await expect(
      page.getByRole("cell", { name: "admin@billionsoulharvest.org" })
    ).toBeVisible();
  });

  // ---------- User info ----------

  test("displays email and role badge for the current user", async ({
    page,
  }) => {
    const row = page.locator("tr", {
      hasText: "admin@billionsoulharvest.org",
    });
    await expect(row).toBeVisible();

    // Role badge should be visible (Super Admin for our test user)
    await expect(row.locator("text=Super Admin")).toBeVisible();
  });

  test("displays created date for users", async ({ page }) => {
    const row = page.locator("tr", {
      hasText: "admin@billionsoulharvest.org",
    });
    // The created column should contain a date-like string (e.g. "Aug 13, 2026")
    const createdCell = row.locator("td").nth(3);
    await expect(createdCell).toBeVisible();
    // Should contain a month abbreviation
    await expect(createdCell).toHaveText(
      /\w{3}\s+\d{1,2},\s+\d{4}/
    );
  });

  // ---------- Self-protection ----------

  test("current user action menu button is disabled", async ({ page }) => {
    const row = page.locator("tr", {
      hasText: "admin@billionsoulharvest.org",
    });

    // The MoreVertical (actions) button for the current user should be disabled
    const actionButton = row.locator("button").last();
    await expect(actionButton).toBeDisabled();
  });

  // ---------- Invite dialog (super_admin) ----------

  test("Invite User button is visible for super_admin", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /invite user/i })
    ).toBeVisible();
  });

  test("invite dialog opens with correct fields", async ({ page }) => {
    await page.getByRole("button", { name: /invite user/i }).click();

    // Dialog should be visible with title
    await expect(
      page.getByRole("heading", { name: "Invite User" })
    ).toBeVisible();
    await expect(
      page.getByText("Create a new admin user account.")
    ).toBeVisible();

    // All form fields should be present
    await expect(page.getByPlaceholder("user@example.com")).toBeVisible();
    await expect(page.getByPlaceholder("John Doe")).toBeVisible();
    await expect(page.getByText("Role", { exact: true })).toBeVisible();
    await expect(page.getByText("Password", { exact: true })).toBeVisible();

    // Cancel and Create User buttons should be present
    await expect(
      page.getByRole("button", { name: "Cancel" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Create User" })
    ).toBeVisible();
  });

  test("invite dialog has a pre-generated password", async ({ page }) => {
    await page.getByRole("button", { name: /invite user/i }).click();
    await expect(
      page.getByRole("heading", { name: "Invite User" })
    ).toBeVisible();

    // The password field should have a value (auto-generated)
    const passwordInput = page.locator(
      '[role="dialog"] input[type="password"]'
    );
    await expect(passwordInput).toBeVisible();
    const value = await passwordInput.inputValue();
    expect(value.length).toBeGreaterThanOrEqual(8);
  });

  test("Generate button refreshes the password", async ({ page }) => {
    await page.getByRole("button", { name: /invite user/i }).click();
    await expect(
      page.getByRole("heading", { name: "Invite User" })
    ).toBeVisible();

    const passwordInput = page.locator(
      '[role="dialog"] input[type="password"]'
    );
    const initialPassword = await passwordInput.inputValue();

    // Click the Generate button
    await page.getByRole("button", { name: "Generate" }).click();

    const newPassword = await passwordInput.inputValue();
    // The password should have changed (extremely unlikely to be the same)
    expect(newPassword).not.toEqual(initialPassword);
    expect(newPassword.length).toBeGreaterThanOrEqual(8);
  });

  test("password visibility toggle works", async ({ page }) => {
    await page.getByRole("button", { name: /invite user/i }).click();
    await expect(
      page.getByRole("heading", { name: "Invite User" })
    ).toBeVisible();

    // Initially the field should be type="password"
    const passwordInput = page.locator(
      '[role="dialog"] input[type="password"]'
    );
    await expect(passwordInput).toBeVisible();

    // Click the eye toggle button (the button inside the password field area)
    const toggleButton = page.locator(
      '[role="dialog"] .relative button[type="button"]'
    );
    await toggleButton.click();

    // Now it should be type="text"
    const textInput = page.locator('[role="dialog"] input[type="text"]');
    await expect(textInput).toBeVisible();

    // Toggle back
    await toggleButton.click();
    await expect(
      page.locator('[role="dialog"] input[type="password"]')
    ).toBeVisible();
  });

  test("invite dialog validates required email field", async ({ page }) => {
    await page.getByRole("button", { name: /invite user/i }).click();
    await expect(
      page.getByRole("heading", { name: "Invite User" })
    ).toBeVisible();

    // Clear password so it's not the blocker, then clear email
    // The Create User button should be disabled when email is empty
    const emailInput = page.getByPlaceholder("user@example.com");
    await emailInput.clear();

    const createButton = page.getByRole("button", { name: "Create User" });
    await expect(createButton).toBeDisabled();
  });

  test("invite dialog can be cancelled", async ({ page }) => {
    await page.getByRole("button", { name: /invite user/i }).click();
    await expect(
      page.getByRole("heading", { name: "Invite User" })
    ).toBeVisible();

    await page.getByRole("button", { name: "Cancel" }).click();

    // Dialog should be closed
    await expect(
      page.getByRole("heading", { name: "Invite User" })
    ).not.toBeVisible();
  });

  test("invite dialog role selector shows all role options", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /invite user/i }).click();
    await expect(
      page.getByRole("heading", { name: "Invite User" })
    ).toBeVisible();

    // Open the role select dropdown
    const roleTrigger = page
      .locator('[role="dialog"]')
      .locator("button[role='combobox']")
      .first();
    await roleTrigger.click();

    // All three roles should be available
    await expect(page.getByRole("option", { name: "Editor" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Admin" })).toBeVisible();
    await expect(
      page.getByRole("option", { name: "Super Admin" })
    ).toBeVisible();
  });

  // ---------- Edit role dialog ----------

  test("edit role dialog opens from action menu of another user", async ({
    page,
  }) => {
    // We need another user besides the current one. Look for any row that is
    // NOT the current admin user.
    const otherRows = page
      .locator("tbody tr")
      .filter({ hasNot: page.locator("text=admin@billionsoulharvest.org") });
    const count = await otherRows.count();

    // Skip if there's only the current user
    test.skip(count === 0, "No other users to test edit role on");

    const targetRow = otherRows.first();

    // Click the action menu button (MoreVertical)
    const actionButton = targetRow.locator("button").last();
    await actionButton.click();

    // Click "Edit Role"
    await page.getByText("Edit Role").click();

    // The edit role dialog should appear
    await expect(
      page.getByRole("heading", { name: "Edit Role" })
    ).toBeVisible();

    // It should have Save and Cancel buttons
    await expect(
      page.getByRole("button", { name: "Save" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Cancel" })
    ).toBeVisible();

    // The role selector should be present
    const roleTrigger = page
      .locator('[role="dialog"]')
      .locator("button[role='combobox']");
    await expect(roleTrigger).toBeVisible();

    // Cancel without making changes
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(
      page.getByRole("heading", { name: "Edit Role" })
    ).not.toBeVisible();
  });

  test("edit role dialog shows all role options", async ({ page }) => {
    const otherRows = page
      .locator("tbody tr")
      .filter({ hasNot: page.locator("text=admin@billionsoulharvest.org") });
    const count = await otherRows.count();
    test.skip(count === 0, "No other users to test edit role on");

    const targetRow = otherRows.first();
    const actionButton = targetRow.locator("button").last();
    await actionButton.click();
    await page.getByText("Edit Role").click();

    await expect(
      page.getByRole("heading", { name: "Edit Role" })
    ).toBeVisible();

    // Open the role select dropdown
    const roleTrigger = page
      .locator('[role="dialog"]')
      .locator("button[role='combobox']");
    await roleTrigger.click();

    // All three roles should be available
    await expect(page.getByRole("option", { name: "Editor" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Admin" })).toBeVisible();
    await expect(
      page.getByRole("option", { name: "Super Admin" })
    ).toBeVisible();

    // Press Escape to close the select and then cancel the dialog
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Cancel" }).click();
  });

  // ---------- Delete dialog ----------

  test("delete confirmation dialog appears from action menu", async ({
    page,
  }) => {
    const otherRows = page
      .locator("tbody tr")
      .filter({ hasNot: page.locator("text=admin@billionsoulharvest.org") });
    const count = await otherRows.count();
    test.skip(count === 0, "No other users to test delete on");

    const targetRow = otherRows.first();

    // Click the action menu button
    const actionButton = targetRow.locator("button").last();
    await actionButton.click();

    // Click "Delete"
    await page.getByText("Delete", { exact: true }).click();

    // The delete confirmation dialog should appear
    await expect(
      page.getByRole("heading", { name: "Delete User" })
    ).toBeVisible();
    await expect(
      page.getByText("Are you sure you want to delete")
    ).toBeVisible();

    // It should have Cancel and Delete User buttons
    await expect(
      page.getByRole("button", { name: "Cancel" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Delete User" })
    ).toBeVisible();

    // Cancel without deleting
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(
      page.getByRole("heading", { name: "Delete User" })
    ).not.toBeVisible();
  });

  // ---------- Accessibility ----------

  test("passes axe accessibility checks", async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .exclude(".sonner-toast") // exclude toast overlays from scan
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
