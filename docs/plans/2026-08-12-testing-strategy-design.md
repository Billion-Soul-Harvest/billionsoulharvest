# Testing Strategy Design

Date: 2026-08-12

## Decisions

- Unit test runner: Vitest
- Test structure: Hybrid (unit colocated, E2E top-level)
- Coverage level: Full (happy path, error paths, edge cases, a11y, responsive, permissions)
- Test data: Seed + teardown via Supabase admin client
- A11y: axe-core integrated into E2E tests
- CI: GitHub Actions + branch protection on main

## Infrastructure

### Unit Tests (Vitest)

- `vitest.config.ts` at project root
- `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`
- `jsdom` environment
- Path aliases matching tsconfig (`@/` -> `src/`)
- Global setup for Supabase client mocking
- Custom `renderWithProviders` utility wrapping QueryClientProvider

### E2E Tests (Playwright)

- `playwright.config.ts` at project root
- `e2e/` directory organized per feature
- `e2e/fixtures/` for seed/teardown and auth state
- `@axe-core/playwright` for WCAG checks
- Auth state via `storageState` (login once, reuse)
- Dev server auto-started via `webServer` config on localhost:3005

### CI Pipeline

- `.github/workflows/test.yml`
- Two jobs: `unit-tests` (Vitest) and `e2e-tests` (Playwright + local Supabase)
- Both required to pass via branch protection on main
- Playwright report uploaded as artifact on failure

## File Structure

```
vitest.config.ts
playwright.config.ts
e2e/
  fixtures/
    seed.ts              # Create known test data via service role
    teardown.ts          # Delete seeded data by known IDs
    auth.setup.ts        # Login as admin, save storageState
  contacts.spec.ts
  audiences.spec.ts
  tags.spec.ts
  gatherings.spec.ts
  stories.spec.ts
  users.spec.ts
  system-usage.spec.ts
  navigation.spec.ts     # Sidebar nav, auth redirects
  permissions.spec.ts    # Role-based access checks
src/features/
  contacts/__tests__/
    contacts-list.test.tsx
    csv-column-mappings.test.ts
    create-contact-dialog.test.tsx
    import-csv-dialog.test.tsx
  audiences/__tests__/
    audiences-list.test.tsx
    criteria-definitions.test.ts
    segment-builder.test.tsx
    criteria-row.test.tsx
  tags/__tests__/
    tags-manager.test.tsx
  events/__tests__/
    event-form.test.tsx
    location-search-input.test.tsx
  stories/__tests__/
    story-form.test.tsx
    gallery-editor.test.tsx
  users/__tests__/
    users-manager.test.tsx
  usage/__tests__/
    usage-page-client.test.tsx
    actions.test.ts
src/shared/test-utils/
  render.tsx             # renderWithProviders helper
  mocks.ts              # Supabase client mock
.github/workflows/test.yml
```

## Coverage Per Feature

### Contacts
- Unit: CSV column mapping logic, create/edit form validation, import dialog parsing, filter logic
- E2E: List/search/filter, create, edit, delete, bulk CSV import, a11y, responsive, admin-only

### Audiences
- Unit: Criteria definitions logic, segment builder evaluation, criteria row rendering
- E2E: List, create with criteria builder, edit criteria, delete, preview matches, a11y, responsive

### Tags
- Unit: Tag name validation, duplicate detection
- E2E: List, create, rename, delete, assign/remove from contacts, a11y, responsive

### Gatherings (Events)
- Unit: Event form validation (dates, location), location search input
- E2E: List, create, edit, delete, location search, a11y, responsive

### Stories
- Unit: Story form validation, gallery image ordering logic
- E2E: List, create, edit content, gallery upload/reorder/delete, publish/unpublish, preview, a11y, responsive

### Users
- Unit: Role validation logic
- E2E: List, invite, change role, deactivate, permission checks, a11y, responsive

### System Usage
- Unit: Data transformation for charts, usage calculations
- E2E: View stats, verify data renders, a11y, responsive

### Cross-Cutting E2E
- Sidebar navigation between all features
- Unauthenticated user redirects to login
- Non-admin denied access to admin features
- Responsive at 375px, 768px, 1280px

## Test Data Strategy

### Seed (globalSetup)
Uses Supabase admin client (service role key) to create:
- 2 users: admin + non-admin
- 10 contacts with varied fields
- 3 tags assigned to contacts
- 2 audiences with criteria
- 2 events (upcoming + past)
- 2 stories (published + draft)
- Usage stats records

### Teardown (globalTeardown)
- Deletes seeded data by known IDs
- Never uses DELETE without WHERE or TRUNCATE

### Auth Fixtures
- `e2e/.auth/admin.json` — admin session (gitignored)
- `e2e/.auth/viewer.json` — non-admin session (gitignored)

## Gitignore Additions
- `e2e/.auth/`
- `test-results/`
- `playwright-report/`
