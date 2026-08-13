import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * E2E tests for authentication and permission checks.
 *
 * These tests verify that unauthenticated users are redirected to /login
 * and that the login page renders correctly.
 */

// ---------------------------------------------------------------------------
// Unauthenticated access — use empty storageState to clear auth
// ---------------------------------------------------------------------------

test.describe("Unauthenticated access", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("visiting /admin/contacts without auth redirects to /login", async ({ page }) => {
    await page.goto("/admin/contacts");
    await page.waitForURL("**/login**", { timeout: 15_000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test("visiting /admin/dashboard without auth redirects to /login", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await page.waitForURL("**/login**", { timeout: 15_000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test("visiting /admin/audiences without auth redirects to /login", async ({ page }) => {
    await page.goto("/admin/audiences");
    await page.waitForURL("**/login**", { timeout: 15_000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test("visiting /admin/events without auth redirects to /login", async ({ page }) => {
    await page.goto("/admin/events");
    await page.waitForURL("**/login**", { timeout: 15_000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test("visiting /admin/users without auth redirects to /login", async ({ page }) => {
    await page.goto("/admin/users");
    await page.waitForURL("**/login**", { timeout: 15_000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test("visiting /admin/settings/usage without auth redirects to /login", async ({ page }) => {
    await page.goto("/admin/settings/usage");
    await page.waitForURL("**/login**", { timeout: 15_000 });
    await expect(page).toHaveURL(/\/login/);
  });
});

// ---------------------------------------------------------------------------
// Login page
// ---------------------------------------------------------------------------

test.describe("Login page", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("login page renders with email and password fields", async ({ page }) => {
    await page.goto("/login");

    // Email input
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible({ timeout: 10_000 });

    // Password input
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();

    // Submit / Sign In button
    const signInButton = page.getByRole("button", { name: /sign in|log in|login/i });
    await expect(signInButton).toBeVisible();
  });

  test("login page shows the Billion Soul Harvest branding", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('img[alt*="Billion Soul"]')).toBeVisible({ timeout: 10_000 });
  });

  test("login page passes axe-core accessibility checks", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10_000 });

    const results = await new AxeBuilder({ page }).analyze();

    expect(results.violations).toEqual([]);
  });
});
