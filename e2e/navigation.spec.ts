import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * E2E tests for sidebar navigation.
 *
 * The sidebar has collapsible groups:
 *   - "People Management" (Contacts, Audiences, Tags)
 *   - "Website" (Gatherings, Stories)
 *   - "Settings" (Users, System Usage)
 * Plus a top-level "Dashboard" link.
 */

const DASHBOARD_URL = "/admin/dashboard";

// ---------------------------------------------------------------------------
// Sidebar visibility
// ---------------------------------------------------------------------------

test.describe("Sidebar navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DASHBOARD_URL);
    // Wait for the sidebar to render
    await expect(page.locator("aside")).toBeVisible({ timeout: 15_000 });
  });

  test("sidebar is visible with all navigation groups and links", async ({ page }) => {
    const aside = page.locator("aside");

    // Top-level link
    await expect(aside.getByText("Dashboard", { exact: true })).toBeVisible();

    // Collapsible group headers
    await expect(aside.getByText("People Management", { exact: true })).toBeVisible();
    await expect(aside.getByText("Website", { exact: true })).toBeVisible();
    await expect(aside.getByText("Settings", { exact: true })).toBeVisible();

    // Expand all groups to verify children are present
    // People Management is auto-expanded by default; click to expand if collapsed
    const peopleBtn = aside.getByText("People Management", { exact: true });
    await peopleBtn.click();
    // Ensure it's expanded — click again if children aren't visible
    if (!(await aside.getByText("Contacts", { exact: true }).isVisible())) {
      await peopleBtn.click();
    }
    await expect(aside.getByText("Contacts", { exact: true })).toBeVisible();
    await expect(aside.getByText("Audiences", { exact: true })).toBeVisible();
    await expect(aside.getByText("Tags", { exact: true })).toBeVisible();

    // Website group
    const websiteBtn = aside.getByText("Website", { exact: true });
    await websiteBtn.click();
    if (!(await aside.getByText("Gatherings", { exact: true }).isVisible())) {
      await websiteBtn.click();
    }
    await expect(aside.getByText("Gatherings", { exact: true })).toBeVisible();
    await expect(aside.getByText("Stories", { exact: true })).toBeVisible();

    // Settings group
    const settingsBtn = aside.getByText("Settings", { exact: true });
    await settingsBtn.click();
    if (!(await aside.getByText("Users", { exact: true }).isVisible())) {
      await settingsBtn.click();
    }
    await expect(aside.getByText("Users", { exact: true })).toBeVisible();
    await expect(aside.getByText("System Usage", { exact: true })).toBeVisible();
  });

  // ── Dashboard ────────────────────────────────────────────────────────

  test("Dashboard link navigates to /admin/dashboard", async ({ page }) => {
    // Navigate away first
    await page.goto("/admin/contacts");
    await expect(page.locator("aside")).toBeVisible({ timeout: 15_000 });

    await page.locator("aside").getByText("Dashboard", { exact: true }).click();
    await page.waitForURL("**/admin/dashboard");
    await expect(page).toHaveURL(/\/admin\/dashboard/);
  });

  // ── People Management ────────────────────────────────────────────────

  test("Contacts link navigates to /admin/contacts", async ({ page }) => {
    const aside = page.locator("aside");
    // Expand People Management if needed
    const groupBtn = aside.getByText("People Management", { exact: true });
    await groupBtn.click();
    if (!(await aside.getByText("Contacts", { exact: true }).isVisible())) {
      await groupBtn.click();
    }

    await aside.getByText("Contacts", { exact: true }).click();
    await page.waitForURL("**/admin/contacts");
    await expect(page).toHaveURL(/\/admin\/contacts/);
  });

  test("Audiences link navigates to /admin/audiences", async ({ page }) => {
    const aside = page.locator("aside");
    const groupBtn = aside.getByText("People Management", { exact: true });
    await groupBtn.click();
    if (!(await aside.getByText("Audiences", { exact: true }).isVisible())) {
      await groupBtn.click();
    }

    await aside.getByText("Audiences", { exact: true }).click();
    await page.waitForURL("**/admin/audiences");
    await expect(page).toHaveURL(/\/admin\/audiences/);
  });

  test("Tags link navigates to /admin/tags", async ({ page }) => {
    const aside = page.locator("aside");
    const groupBtn = aside.getByText("People Management", { exact: true });
    await groupBtn.click();
    if (!(await aside.getByText("Tags", { exact: true }).isVisible())) {
      await groupBtn.click();
    }

    await aside.getByText("Tags", { exact: true }).click();
    await page.waitForURL("**/admin/tags");
    await expect(page).toHaveURL(/\/admin\/tags/);
  });

  // ── Website ──────────────────────────────────────────────────────────

  test("Gatherings link navigates to /admin/events", async ({ page }) => {
    const aside = page.locator("aside");
    const groupBtn = aside.getByText("Website", { exact: true });
    await groupBtn.click();
    if (!(await aside.getByText("Gatherings", { exact: true }).isVisible())) {
      await groupBtn.click();
    }

    await aside.getByText("Gatherings", { exact: true }).click();
    await page.waitForURL("**/admin/events");
    await expect(page).toHaveURL(/\/admin\/events/);
  });

  test("Stories link navigates to /admin/stories", async ({ page }) => {
    const aside = page.locator("aside");
    const groupBtn = aside.getByText("Website", { exact: true });
    await groupBtn.click();
    if (!(await aside.getByText("Stories", { exact: true }).isVisible())) {
      await groupBtn.click();
    }

    await aside.getByText("Stories", { exact: true }).click();
    await page.waitForURL("**/admin/stories");
    await expect(page).toHaveURL(/\/admin\/stories/);
  });

  // ── Settings ─────────────────────────────────────────────────────────

  test("Users link navigates to /admin/users", async ({ page }) => {
    const aside = page.locator("aside");
    const groupBtn = aside.getByText("Settings", { exact: true });
    await groupBtn.click();
    if (!(await aside.getByText("Users", { exact: true }).isVisible())) {
      await groupBtn.click();
    }

    await aside.getByText("Users", { exact: true }).click();
    await page.waitForURL("**/admin/users");
    await expect(page).toHaveURL(/\/admin\/users/);
  });

  test("System Usage link navigates to /admin/settings/usage", async ({ page }) => {
    const aside = page.locator("aside");
    const groupBtn = aside.getByText("Settings", { exact: true });
    await groupBtn.click();
    if (!(await aside.getByText("System Usage", { exact: true }).isVisible())) {
      await groupBtn.click();
    }

    await aside.getByText("System Usage", { exact: true }).click();
    await page.waitForURL("**/admin/settings/usage");
    await expect(page).toHaveURL(/\/admin\/settings\/usage/);
  });
});

// ---------------------------------------------------------------------------
// Collapsible groups
// ---------------------------------------------------------------------------

test.describe("Sidebar collapsible groups", () => {
  test("clicking a group header toggles its children visibility", async ({ page }) => {
    await page.goto(DASHBOARD_URL);
    const aside = page.locator("aside");
    await expect(aside).toBeVisible({ timeout: 15_000 });

    // Settings is collapsed by default (unless a child route is active)
    const settingsBtn = aside.getByText("Settings", { exact: true });

    // First click — expand
    await settingsBtn.click();
    await expect(aside.getByText("Users", { exact: true })).toBeVisible();

    // Second click — collapse
    await settingsBtn.click();
    await expect(aside.getByText("Users", { exact: true })).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

test.describe("Navigation accessibility", () => {
  test("sidebar passes axe-core checks", async ({ page }) => {
    await page.goto(DASHBOARD_URL);
    await expect(page.locator("aside")).toBeVisible({ timeout: 15_000 });

    const results = await new AxeBuilder({ page })
      .include("aside")
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
