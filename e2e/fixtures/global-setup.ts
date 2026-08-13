/**
 * Playwright global setup — runs once before all test suites.
 * Seeds the database with test data.
 */
import { seed } from "./seed";

export default async function globalSetup() {
  await seed();
}
