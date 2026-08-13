import { test as setup, expect } from "@playwright/test";

const ADMIN_EMAIL = process.env.E2E_EMAIL || "admin@billionsoulharvest.org";
const ADMIN_PASSWORD = process.env.E2E_PASSWORD || "Password123$";

setup("authenticate as admin", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill(ADMIN_EMAIL);
  await page.getByLabel(/password/i).fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: /sign in|log in/i }).click();
  await page.waitForURL(/\/admin/);
  await expect(page.locator("text=Dashboard")).toBeVisible();
  await page.context().storageState({ path: "e2e/.auth/admin.json" });
});
