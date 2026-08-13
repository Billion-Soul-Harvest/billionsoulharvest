/**
 * Playwright global teardown — runs once after all test suites.
 * Removes all test data from the database.
 */
import { cleanup } from "./seed";

export default async function globalTeardown() {
  await cleanup();
}
