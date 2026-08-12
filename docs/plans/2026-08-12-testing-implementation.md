# Testing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Set up Vitest + Playwright testing infrastructure and write full test coverage for all 7 sidebar features (Contacts, Audiences, Tags, Gatherings, Stories, Users, System Usage).

**Architecture:** Vitest for unit/component tests colocated in `__tests__/` directories alongside feature code. Playwright for E2E tests in a top-level `e2e/` directory. Seed/teardown scripts manage test data in local Supabase. GitHub Actions CI runs both suites with branch protection.

**Tech Stack:** Vitest, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, Playwright, @axe-core/playwright, Supabase service client for seeding.

---

## Phase 1: Infrastructure Setup

### Task 1: Install Vitest and Testing Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install packages**

Run:
```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event @axe-core/playwright
```

**Step 2: Verify installation**

Run: `npx vitest --version`
Expected: Version number prints without error

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install vitest and testing dependencies"
```

---

### Task 2: Configure Vitest

**Files:**
- Create: `vitest.config.ts`
- Create: `src/shared/test-utils/setup.ts`

**Step 1: Create vitest config**

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/shared/test-utils/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    css: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

**Step 2: Create setup file**

```ts
// src/shared/test-utils/setup.ts
import "@testing-library/jest-dom/vitest";
```

**Step 3: Add test script to package.json**

Add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest",
"test:ui": "vitest --ui"
```

**Step 4: Verify config works**

Run: `npx vitest run`
Expected: "No test files found" (no error)

**Step 5: Commit**

```bash
git add vitest.config.ts src/shared/test-utils/setup.ts package.json
git commit -m "chore: configure vitest with jsdom and path aliases"
```

---

### Task 3: Create Test Utilities

**Files:**
- Create: `src/shared/test-utils/render.tsx`
- Create: `src/shared/test-utils/mocks.ts`

**Step 1: Create renderWithProviders utility**

```tsx
// src/shared/test-utils/render.tsx
import { render, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactElement } from "react";

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  const queryClient = createTestQueryClient();
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }
  return { ...render(ui, { wrapper: Wrapper, ...options }), queryClient };
}

export { screen, waitFor, within, act } from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
```

**Step 2: Create Supabase mock**

```ts
// src/shared/test-utils/mocks.ts
import { vi } from "vitest";

export const mockSupabaseClient = {
  from: vi.fn(() => mockSupabaseClient),
  select: vi.fn(() => mockSupabaseClient),
  insert: vi.fn(() => mockSupabaseClient),
  update: vi.fn(() => mockSupabaseClient),
  delete: vi.fn(() => mockSupabaseClient),
  eq: vi.fn(() => mockSupabaseClient),
  neq: vi.fn(() => mockSupabaseClient),
  in: vi.fn(() => mockSupabaseClient),
  ilike: vi.fn(() => mockSupabaseClient),
  contains: vi.fn(() => mockSupabaseClient),
  order: vi.fn(() => mockSupabaseClient),
  range: vi.fn(() => mockSupabaseClient),
  limit: vi.fn(() => mockSupabaseClient),
  single: vi.fn(() => mockSupabaseClient),
  maybeSingle: vi.fn(() => mockSupabaseClient),
  rpc: vi.fn(() => mockSupabaseClient),
  then: vi.fn(),
  auth: {
    getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
  },
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn(() => Promise.resolve({ data: { path: "test" }, error: null })),
      getPublicUrl: vi.fn(() => ({ data: { publicUrl: "https://example.com/test.jpg" } })),
    })),
  },
};

export function mockSupabaseResponse(data: unknown, error: unknown = null) {
  return Promise.resolve({ data, error, count: Array.isArray(data) ? data.length : null });
}

vi.mock("@/shared/utils/supabase/client", () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));
```

**Step 3: Verify with a smoke test**

Create `src/shared/test-utils/__tests__/smoke.test.ts`:
```ts
import { describe, it, expect } from "vitest";

describe("test setup", () => {
  it("works", () => {
    expect(1 + 1).toBe(2);
  });
});
```

**Step 4: Run smoke test**

Run: `npx vitest run`
Expected: 1 test passes

**Step 5: Commit**

```bash
git add src/shared/test-utils/
git commit -m "chore: add test utilities (renderWithProviders, Supabase mock)"
```

---

### Task 4: Configure Playwright

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/fixtures/auth.setup.ts`

**Step 1: Create Playwright config**

```ts
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "html",
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:3005",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/admin.json",
      },
      dependencies: ["setup"],
    },
    {
      name: "mobile",
      use: {
        ...devices["iPhone 14"],
        storageState: "e2e/.auth/admin.json",
      },
      dependencies: ["setup"],
    },
    {
      name: "tablet",
      use: {
        ...devices["iPad Mini"],
        storageState: "e2e/.auth/admin.json",
      },
      dependencies: ["setup"],
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3005",
    reuseExistingServer: !process.env.CI,
  },
});
```

**Step 2: Create auth setup**

```ts
// e2e/fixtures/auth.setup.ts
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
```

**Step 3: Create e2e directory structure**

Run:
```bash
mkdir -p e2e/fixtures e2e/.auth
```

**Step 4: Add to .gitignore**

Append to `.gitignore`:
```
# Testing
e2e/.auth/
test-results/
playwright-report/
```

**Step 5: Add playwright scripts to package.json**

Add to `"scripts"`:
```json
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui"
```

**Step 6: Install Playwright browsers**

Run: `npx playwright install chromium`

**Step 7: Verify auth setup works**

Run: `npx playwright test --project=setup`
Expected: Auth setup passes (requires local dev server running)

**Step 8: Commit**

```bash
git add playwright.config.ts e2e/ .gitignore package.json
git commit -m "chore: configure Playwright with auth setup and responsive projects"
```

---

### Task 5: Create Seed and Teardown Scripts

**Files:**
- Create: `e2e/fixtures/seed.ts`
- Create: `e2e/fixtures/teardown.ts`
- Create: `e2e/fixtures/test-data.ts`

**Step 1: Create test data constants**

```ts
// e2e/fixtures/test-data.ts
export const TEST_IDS = {
  contacts: [] as string[],
  tags: [] as string[],
  audiences: [] as string[],
  events: [] as string[],
  stories: [] as string[],
};

export const TEST_CONTACTS = [
  { first_name: "Test", last_name: "Alpha", email: "test-alpha@example.com", phone: "+1234567890", church_name: "Alpha Church", city: "New York", country: "US", contact_type: "pastor" },
  { first_name: "Test", last_name: "Beta", email: "test-beta@example.com", phone: "+0987654321", church_name: "Beta Church", city: "London", country: "GB", contact_type: "leader" },
  { first_name: "Test", last_name: "Gamma", email: "test-gamma@example.com", city: "Lagos", country: "NG", contact_type: "attendee" },
  { first_name: "Test", last_name: "Delta", email: "test-delta@example.com", city: "Seoul", country: "KR", contact_type: "donor" },
  { first_name: "Test", last_name: "Epsilon", email: "test-epsilon@example.com", contact_type: "subscriber" },
  { first_name: "Test", last_name: "Zeta", email: "test-zeta@example.com", contact_type: "other" },
  { first_name: "Test", last_name: "Eta", email: "test-eta@example.com", church_name: "Eta Ministry", city: "Tokyo", country: "JP" },
  { first_name: "Test", last_name: "Theta", email: "test-theta@example.com", city: "Berlin", country: "DE" },
  { first_name: "Test", last_name: "Iota", email: "test-iota@example.com", church_name: "Iota Fellowship" },
  { first_name: "Test", last_name: "Kappa", email: "test-kappa@example.com", city: "Sydney", country: "AU" },
];

export const TEST_TAGS = [
  { name: "test-vip" },
  { name: "test-speaker" },
  { name: "test-volunteer" },
];

export const TEST_AUDIENCES = [
  { name: "Test Newsletter List", type: "list", description: "Test list for E2E" },
  { name: "Test US Segment", type: "segment", description: "Contacts in US", segment_filter: { criteria: [{ field: "country", operator: "is", value: "US" }] } },
];

export const TEST_EVENTS = [
  { title: "Test Upcoming Event", slug: "test-upcoming-event", description: "E2E test event", start_date: new Date(Date.now() + 30 * 86400000).toISOString(), end_date: new Date(Date.now() + 31 * 86400000).toISOString(), status: "published", event_type: "conference" },
  { title: "Test Past Event", slug: "test-past-event", description: "Past E2E event", start_date: new Date(Date.now() - 60 * 86400000).toISOString(), end_date: new Date(Date.now() - 59 * 86400000).toISOString(), status: "completed", event_type: "workshop" },
];

export const TEST_STORIES = [
  { title: "Test Published Story", slug: "test-published-story", description: "A published test story", status: "published", content_html: "<p>Test content for published story.</p>", published_at: new Date().toISOString() },
  { title: "Test Draft Story", slug: "test-draft-story", description: "A draft test story", status: "draft", content_html: "<p>Draft content.</p>" },
];
```

**Step 2: Create seed script**

```ts
// e2e/fixtures/seed.ts
import { createClient } from "@supabase/supabase-js";
import { TEST_CONTACTS, TEST_TAGS, TEST_AUDIENCES, TEST_EVENTS, TEST_STORIES, TEST_IDS } from "./test-data";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function seed() {
  // Clean up any leftover test data
  await cleanup();

  // Contacts
  const { data: contacts } = await supabase.from("contacts").insert(TEST_CONTACTS).select("id");
  TEST_IDS.contacts = (contacts ?? []).map((c) => c.id);

  // Tags
  const { data: tags } = await supabase.from("tags").insert(TEST_TAGS).select("id");
  TEST_IDS.tags = (tags ?? []).map((t) => t.id);

  // Assign first tag to first 3 contacts
  if (TEST_IDS.tags[0] && TEST_IDS.contacts.length >= 3) {
    const taggables = TEST_IDS.contacts.slice(0, 3).map((contactId) => ({
      tag_id: TEST_IDS.tags[0],
      taggable_id: contactId,
      taggable_type: "contact",
    }));
    await supabase.from("taggables").insert(taggables);
  }

  // Audiences
  const audienceRows = TEST_AUDIENCES.map(({ segment_filter, ...rest }) => rest);
  const { data: audiences } = await supabase.from("audiences").insert(audienceRows).select("id");
  TEST_IDS.audiences = (audiences ?? []).map((a) => a.id);

  // Add first 2 contacts to first audience (list)
  if (TEST_IDS.audiences[0] && TEST_IDS.contacts.length >= 2) {
    const members = TEST_IDS.contacts.slice(0, 2).map((contactId) => ({
      audience_id: TEST_IDS.audiences[0],
      contact_id: contactId,
    }));
    await supabase.from("audience_contacts").insert(members);
  }

  // Events
  const { data: events } = await supabase.from("events").insert(TEST_EVENTS).select("id");
  TEST_IDS.events = (events ?? []).map((e) => e.id);

  // Stories
  const { data: stories } = await supabase.from("stories").insert(TEST_STORIES).select("id");
  TEST_IDS.stories = (stories ?? []).map((s) => s.id);

  console.log("Seeded test data:", TEST_IDS);
}

export async function cleanup() {
  // Delete by known test prefixes to avoid WHERE-less deletes
  await supabase.from("taggables").delete().in("tag_id", TEST_IDS.tags.length ? TEST_IDS.tags : ["00000000-0000-0000-0000-000000000000"]);
  await supabase.from("audience_contacts").delete().in("audience_id", TEST_IDS.audiences.length ? TEST_IDS.audiences : ["00000000-0000-0000-0000-000000000000"]);
  await supabase.from("contacts").delete().ilike("email", "test-%@example.com");
  await supabase.from("tags").delete().ilike("name", "test-%");
  await supabase.from("audiences").delete().ilike("name", "Test %");
  await supabase.from("events").delete().ilike("slug", "test-%");
  await supabase.from("stories").delete().ilike("slug", "test-%");
}
```

**Step 3: Create teardown script**

```ts
// e2e/fixtures/teardown.ts
import { cleanup } from "./seed";

export default async function globalTeardown() {
  await cleanup();
  console.log("Cleaned up test data.");
}
```

**Step 4: Wire seed/teardown into Playwright config**

Update `playwright.config.ts` to add:
```ts
globalSetup: "./e2e/fixtures/global-setup.ts",
globalTeardown: "./e2e/fixtures/teardown.ts",
```

Create `e2e/fixtures/global-setup.ts`:
```ts
import { seed } from "./seed";

export default async function globalSetup() {
  await seed();
}
```

**Step 5: Commit**

```bash
git add e2e/fixtures/ playwright.config.ts
git commit -m "chore: add seed/teardown scripts and wire into Playwright config"
```

---

### Task 6: Set Up GitHub Actions CI

**Files:**
- Create: `.github/workflows/test.yml`

**Step 1: Create workflow file**

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx vitest run

  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - uses: supabase/setup-cli@v1
        with:
          version: latest
      - run: supabase start
      - run: npm ci
      - run: npx playwright install chromium --with-deps
      - run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: http://127.0.0.1:54321
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
      - run: npx playwright test --project=setup --project=chromium
        env:
          NEXT_PUBLIC_SUPABASE_URL: http://127.0.0.1:54321
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          E2E_BASE_URL: http://localhost:3005
          E2E_EMAIL: admin@billionsoulharvest.org
          E2E_PASSWORD: Password123$
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

**Step 2: Commit**

```bash
mkdir -p .github/workflows
git add .github/workflows/test.yml
git commit -m "ci: add GitHub Actions workflow for unit and E2E tests"
```

---

## Phase 2: Unit Tests

### Task 7: Contacts — CSV Column Mappings Tests

**Files:**
- Create: `src/features/contacts/__tests__/csv-column-mappings.test.ts`
- Reference: `src/features/contacts/csv-column-mappings.ts`

**Step 1: Write tests**

```ts
// src/features/contacts/__tests__/csv-column-mappings.test.ts
import { describe, it, expect } from "vitest";
import { autoDetectMappings, coerceRow, parseCSV } from "../csv-column-mappings";

describe("autoDetectMappings", () => {
  it("maps exact header names", () => {
    const headers = ["email", "first_name", "last_name", "phone"];
    const result = autoDetectMappings(headers);
    expect(result).toEqual({
      email: "email",
      first_name: "first_name",
      last_name: "last_name",
      phone: "phone",
    });
  });

  it("maps common aliases (Email Address → email)", () => {
    const headers = ["Email Address", "First Name", "Last Name"];
    const result = autoDetectMappings(headers);
    expect(result.email).toBe("Email Address");
    expect(result.first_name).toBe("First Name");
    expect(result.last_name).toBe("Last Name");
  });

  it("returns empty mappings for unknown headers", () => {
    const headers = ["foo", "bar", "baz"];
    const result = autoDetectMappings(headers);
    expect(Object.values(result).filter(Boolean)).toHaveLength(0);
  });
});

describe("coerceRow", () => {
  it("normalizes email to lowercase", () => {
    const row = { Email: "TEST@EXAMPLE.COM" };
    const mappings = { email: "Email" };
    const result = coerceRow(row, mappings);
    expect(result.email).toBe("test@example.com");
  });

  it("splits multi-value emails into alternative_email", () => {
    const row = { Email: "a@test.com; b@test.com, c@test.com" };
    const mappings = { email: "Email" };
    const result = coerceRow(row, mappings);
    expect(result.email).toBe("a@test.com");
    expect(result.alternative_email).toContain("b@test.com");
    expect(result.alternative_email).toContain("c@test.com");
  });

  it("normalizes birthday from MM/DD/YYYY to YYYY-MM-DD", () => {
    const row = { Birthday: "12/25/1990" };
    const mappings = { birthday: "Birthday" };
    const result = coerceRow(row, mappings);
    expect(result.birthday).toBe("1990-12-25");
  });
});

describe("parseCSV", () => {
  it("parses simple CSV", () => {
    const csv = "name,email\nJohn,john@test.com";
    const result = parseCSV(csv);
    expect(result.headers).toEqual(["name", "email"]);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].email).toBe("john@test.com");
  });

  it("handles quoted fields with commas", () => {
    const csv = 'name,address\nJohn,"123 Main St, Suite 4"';
    const result = parseCSV(csv);
    expect(result.rows[0].address).toBe("123 Main St, Suite 4");
  });

  it("handles empty input", () => {
    const result = parseCSV("");
    expect(result.headers).toHaveLength(0);
    expect(result.rows).toHaveLength(0);
  });
});
```

**Step 2: Run tests**

Run: `npx vitest run src/features/contacts/__tests__/csv-column-mappings.test.ts`
Expected: All tests pass (adjust assertions to match actual function signatures after reading the source)

**Step 3: Commit**

```bash
git add src/features/contacts/__tests__/
git commit -m "test: add unit tests for CSV column mappings and parsing"
```

---

### Task 8: Audiences — Criteria Definitions Tests

**Files:**
- Create: `src/features/audiences/__tests__/criteria-definitions.test.ts`
- Reference: `src/features/audiences/criteria-definitions.ts`

**Step 1: Write tests**

```ts
// src/features/audiences/__tests__/criteria-definitions.test.ts
import { describe, it, expect } from "vitest";
import { CRITERIA_DEFINITIONS } from "../criteria-definitions";

describe("CRITERIA_DEFINITIONS", () => {
  it("has definitions for all expected categories", () => {
    const categories = CRITERIA_DEFINITIONS.map((d) => d.category);
    expect(categories).toContain("Contact profiles");
    expect(categories).toContain("Contact type");
    expect(categories).toContain("Tags");
    expect(categories).toContain("Dates");
  });

  it("each definition has field, label, type, and operators", () => {
    for (const def of CRITERIA_DEFINITIONS) {
      expect(def.field).toBeTruthy();
      expect(def.label).toBeTruthy();
      expect(def.type).toBeTruthy();
      expect(def.operators.length).toBeGreaterThan(0);
    }
  });

  it("text fields support 'contains' operator", () => {
    const textFields = CRITERIA_DEFINITIONS.filter((d) => d.type === "text");
    for (const field of textFields) {
      expect(field.operators).toContain("contains");
    }
  });

  it("date fields support 'is_before' and 'is_after'", () => {
    const dateFields = CRITERIA_DEFINITIONS.filter((d) => d.type === "date");
    for (const field of dateFields) {
      expect(field.operators).toContain("is_before");
      expect(field.operators).toContain("is_after");
    }
  });

  it("select fields have options defined", () => {
    const selectFields = CRITERIA_DEFINITIONS.filter((d) => d.type === "select");
    for (const field of selectFields) {
      expect(field.options).toBeDefined();
      expect(field.options!.length).toBeGreaterThan(0);
    }
  });
});
```

**Step 2: Run tests**

Run: `npx vitest run src/features/audiences/__tests__/criteria-definitions.test.ts`

**Step 3: Commit**

```bash
git add src/features/audiences/__tests__/
git commit -m "test: add unit tests for audience criteria definitions"
```

---

### Task 9: Tags — Tag Name Validation Tests

**Files:**
- Create: `src/features/tags/__tests__/tags-manager.test.tsx`
- Reference: `src/features/tags/tags-manager.tsx`

**Step 1: Write tests** (test the component's validation behavior)

```tsx
// src/features/tags/__tests__/tags-manager.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders, screen, userEvent } from "@/shared/test-utils/render";
import "@/shared/test-utils/mocks";
import { mockSupabaseClient, mockSupabaseResponse } from "@/shared/test-utils/mocks";

// Mock the tags-manager with just the validation logic we want to test
describe("TagsManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not submit empty tag name", async () => {
    // Test that the create tag form rejects empty strings
    // Implementation depends on actual component structure
    // This is a placeholder - adjust after reading tags-manager.tsx
    expect(true).toBe(true);
  });
});
```

> **Note to implementer:** Read `src/features/tags/tags-manager.tsx` fully before writing these tests. The placeholder above should be replaced with tests matching the actual validation logic (inline validation, form state, Supabase insert calls).

**Step 2: Run tests**

Run: `npx vitest run src/features/tags/__tests__/`

**Step 3: Commit**

```bash
git add src/features/tags/__tests__/
git commit -m "test: add unit tests for tags manager"
```

---

### Task 10: Events — Event Form Validation Tests

**Files:**
- Create: `src/features/events/__tests__/event-form.test.tsx`
- Reference: `src/features/events/event-form.tsx`

**Step 1: Write tests for form validation logic**

Test date validation (end_date must be after start_date), required fields (title, slug), slug auto-generation from title, and event type options.

> **Note to implementer:** Read `event-form.tsx` fully to identify the Zod schema or validation logic used. Write tests against that schema directly if possible, or test via component rendering.

**Step 2: Run tests**

Run: `npx vitest run src/features/events/__tests__/`

**Step 3: Commit**

```bash
git add src/features/events/__tests__/
git commit -m "test: add unit tests for event form validation"
```

---

### Task 11: Stories — Story Form and Gallery Tests

**Files:**
- Create: `src/features/stories/__tests__/story-form.test.tsx`
- Create: `src/features/stories/__tests__/gallery-editor.test.tsx`
- Reference: `src/features/stories/story-form.tsx`, `src/features/stories/editor/gallery-editor.tsx`

**Step 1: Write story form tests**

Test slug auto-generation, required field validation, status transitions (draft → published sets published_at).

**Step 2: Write gallery editor tests**

Test image reordering logic (arrayMove), caption updates, image removal, accepted file type filtering, file size validation.

**Step 3: Run tests**

Run: `npx vitest run src/features/stories/__tests__/`

**Step 4: Commit**

```bash
git add src/features/stories/__tests__/
git commit -m "test: add unit tests for story form and gallery editor"
```

---

### Task 12: Users — Role Validation Tests

**Files:**
- Create: `src/features/users/__tests__/users-manager.test.tsx`
- Reference: `src/features/users/users-manager.tsx`

**Step 1: Write tests**

Test role options (super_admin, admin, editor), self-edit prevention, form validation for invite (email, password, display_name).

**Step 2: Run and commit**

```bash
git add src/features/users/__tests__/
git commit -m "test: add unit tests for users manager"
```

---

### Task 13: Usage — Data Transformation Tests

**Files:**
- Create: `src/features/usage/__tests__/actions.test.ts`
- Create: `src/features/usage/__tests__/usage-page-client.test.tsx`
- Reference: `src/features/usage/actions.ts`, `src/features/usage/usage-page-client.tsx`, `src/features/usage/types.ts`

**Step 1: Write tests for data transformation**

Test percentage calculations, color coding thresholds (green <50%, yellow 50-80%, red >=80%), table sorting, cache behavior.

**Step 2: Run and commit**

```bash
git add src/features/usage/__tests__/
git commit -m "test: add unit tests for system usage data transformations"
```

---

## Phase 3: E2E Tests

### Task 14: E2E — Contacts

**Files:**
- Create: `e2e/contacts.spec.ts`

**Step 1: Write E2E tests**

```ts
// e2e/contacts.spec.ts
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Contacts", () => {
  test("lists seeded contacts", async ({ page }) => {
    await page.goto("/admin/contacts");
    await expect(page.getByText("Test Alpha")).toBeVisible();
    await expect(page.getByText("Test Beta")).toBeVisible();
  });

  test("searches contacts by name", async ({ page }) => {
    await page.goto("/admin/contacts");
    await page.getByPlaceholder(/search/i).fill("Alpha");
    await expect(page.getByText("Test Alpha")).toBeVisible();
    await expect(page.getByText("Test Beta")).not.toBeVisible();
  });

  test("creates a new contact", async ({ page }) => {
    await page.goto("/admin/contacts");
    await page.getByRole("button", { name: /add|new|create/i }).click();
    // Select "Add Single Contact" option
    await page.getByText(/single/i).click();
    await page.getByLabel(/first name/i).fill("E2E");
    await page.getByLabel(/last name/i).fill("TestContact");
    await page.getByLabel(/email/i).fill("e2e-test-create@example.com");
    await page.getByRole("button", { name: /save|create|add/i }).click();
    await expect(page.getByText("E2E TestContact")).toBeVisible();
    // Cleanup
    await page.goto("/admin/contacts");
  });

  test("views contact detail", async ({ page }) => {
    await page.goto("/admin/contacts");
    await page.getByText("Test Alpha").click();
    await expect(page.getByText("test-alpha@example.com")).toBeVisible();
  });

  test("passes accessibility checks", async ({ page }) => {
    await page.goto("/admin/contacts");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
```

**Step 2: Run tests**

Run: `npx playwright test e2e/contacts.spec.ts --project=chromium`

**Step 3: Commit**

```bash
git add e2e/contacts.spec.ts
git commit -m "test: add E2E tests for contacts feature"
```

---

### Task 15: E2E — Audiences

**Files:**
- Create: `e2e/audiences.spec.ts`

**Step 1: Write E2E tests**

Test listing audiences, creating a list, creating a segment with criteria, editing, deleting, viewing list members. Include axe accessibility check.

**Step 2: Run and commit**

```bash
git add e2e/audiences.spec.ts
git commit -m "test: add E2E tests for audiences feature"
```

---

### Task 16: E2E — Tags

**Files:**
- Create: `e2e/tags.spec.ts`

**Step 1: Write E2E tests**

Test listing tags, creating, renaming, deleting, bulk operations, search, sorting. Include axe accessibility check.

**Step 2: Run and commit**

```bash
git add e2e/tags.spec.ts
git commit -m "test: add E2E tests for tags feature"
```

---

### Task 17: E2E — Gatherings (Events)

**Files:**
- Create: `e2e/gatherings.spec.ts`

**Step 1: Write E2E tests**

Test listing events, creating an event with all fields, editing, changing status, deleting. Include axe accessibility check.

**Step 2: Run and commit**

```bash
git add e2e/gatherings.spec.ts
git commit -m "test: add E2E tests for gatherings/events feature"
```

---

### Task 18: E2E — Stories

**Files:**
- Create: `e2e/stories.spec.ts`

**Step 1: Write E2E tests**

Test listing stories, creating 3-step story (details → content → gallery), editing, publish/unpublish, deleting. Include axe accessibility check.

**Step 2: Run and commit**

```bash
git add e2e/stories.spec.ts
git commit -m "test: add E2E tests for stories feature"
```

---

### Task 19: E2E — Users

**Files:**
- Create: `e2e/users.spec.ts`

**Step 1: Write E2E tests**

Test listing users, inviting a new user, changing role, deleting. Test permission checks (non-super-admin can't invite). Include axe accessibility check.

**Step 2: Run and commit**

```bash
git add e2e/users.spec.ts
git commit -m "test: add E2E tests for users feature"
```

---

### Task 20: E2E — System Usage

**Files:**
- Create: `e2e/system-usage.spec.ts`

**Step 1: Write E2E tests**

Test page loads with usage data, refresh button updates data, table sorting, color-coded gauges render. Include axe accessibility check.

**Step 2: Run and commit**

```bash
git add e2e/system-usage.spec.ts
git commit -m "test: add E2E tests for system usage feature"
```

---

### Task 21: E2E — Navigation and Permissions

**Files:**
- Create: `e2e/navigation.spec.ts`
- Create: `e2e/permissions.spec.ts`

**Step 1: Write navigation tests**

Test sidebar navigation between all 7 features, verify URLs, verify page headings load.

**Step 2: Write permission tests**

Test unauthenticated user redirects to login. Test non-admin access denial (requires a non-admin auth fixture).

**Step 3: Run and commit**

```bash
git add e2e/navigation.spec.ts e2e/permissions.spec.ts
git commit -m "test: add E2E tests for navigation and permissions"
```

---

## Phase 4: Finalize

### Task 22: Run Full Test Suite and Fix Failures

**Step 1: Run all unit tests**

Run: `npx vitest run`

**Step 2: Run all E2E tests**

Run: `npx playwright test`

**Step 3: Fix any failures**

Iterate until all tests pass.

**Step 4: Final commit**

```bash
git add -A
git commit -m "test: fix remaining test failures across all suites"
```

---

### Task 23: Push and Verify CI

**Step 1: Push to remote**

Run: `git push origin main`

**Step 2: Verify GitHub Actions runs**

Check that both `unit-tests` and `e2e-tests` jobs pass.

**Step 3: Configure branch protection**

Manually in GitHub: Settings → Branches → Add rule for `main`:
- Require status checks: `unit-tests`, `e2e-tests`
- Require branches to be up to date

---

## Task Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1 - Infrastructure | 1-6 | Install deps, configure Vitest, Playwright, seed/teardown, CI |
| 2 - Unit Tests | 7-13 | CSV parsing, criteria, tags, events, stories, users, usage |
| 3 - E2E Tests | 14-21 | All 7 features + navigation + permissions |
| 4 - Finalize | 22-23 | Run all, fix, push, verify CI |
