/**
 * Seed script for E2E tests.
 * Uses the Supabase service role key to bypass RLS.
 * Inserts test data with "test-" / "Test " prefixes and stores IDs in TEST_IDS.
 */
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";
import {
  TEST_IDS,
  TEST_CONTACTS,
  TEST_TAGS,
  TEST_AUDIENCES,
  TEST_EVENTS,
  TEST_STORIES,
} from "./test-data";

// Load env from .env.local
dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment"
    );
  }
  return createClient(url, key);
}

/**
 * Clean up all test data by prefix patterns.
 * Uses WHERE with ilike/like patterns -- never deletes without a WHERE clause.
 */
export async function cleanup() {
  const supabase = getSupabaseClient();
  console.log("[e2e] Cleaning up test data...");

  // Delete taggables linked to test tags (by tag name prefix)
  const { data: testTags } = await supabase
    .from("tags")
    .select("id")
    .ilike("name", "test-%");
  if (testTags && testTags.length > 0) {
    const tagIds = testTags.map((t) => t.id);
    await supabase.from("taggables").delete().in("tag_id", tagIds);
  }

  // Delete in dependency order
  await supabase.from("tags").delete().ilike("name", "test-%");
  await supabase.from("stories").delete().ilike("slug", "test-%");
  await supabase.from("events").delete().ilike("slug", "test-%");
  await supabase.from("audiences").delete().ilike("name", "Test %");
  await supabase.from("contacts").delete().ilike("email", "test-%@example.com");

  console.log("[e2e] Cleanup complete.");
}

/**
 * Seed all test data into the database.
 */
export async function seed() {
  const supabase = getSupabaseClient();

  // Clean up any leftover test data first
  await cleanup();

  console.log("[e2e] Seeding test data...");

  // 1. Insert contacts
  const { data: contacts, error: contactsErr } = await supabase
    .from("contacts")
    .insert(TEST_CONTACTS)
    .select("id");
  if (contactsErr) throw new Error(`Failed to seed contacts: ${contactsErr.message}`);
  TEST_IDS.contacts = contacts.map((c) => c.id);
  console.log(`[e2e]   Inserted ${contacts.length} contacts`);

  // 2. Insert tags
  const { data: tags, error: tagsErr } = await supabase
    .from("tags")
    .insert(TEST_TAGS)
    .select("id");
  if (tagsErr) throw new Error(`Failed to seed tags: ${tagsErr.message}`);
  TEST_IDS.tags = tags.map((t) => t.id);
  console.log(`[e2e]   Inserted ${tags.length} tags`);

  // 3. Assign first tag to first 3 contacts via taggables
  const taggableRows = TEST_IDS.contacts.slice(0, 3).map((contactId) => ({
    tag_id: TEST_IDS.tags[0],
    taggable_id: contactId,
    taggable_type: "contact",
  }));
  const { data: taggables, error: taggablesErr } = await supabase
    .from("taggables")
    .insert(taggableRows)
    .select("id");
  if (taggablesErr) throw new Error(`Failed to seed taggables: ${taggablesErr.message}`);
  TEST_IDS.taggables = taggables.map((t) => t.id);
  console.log(`[e2e]   Inserted ${taggables.length} taggable assignments`);

  // 4. Insert audiences
  const { data: audiences, error: audiencesErr } = await supabase
    .from("audiences")
    .insert(TEST_AUDIENCES)
    .select("id");
  if (audiencesErr) throw new Error(`Failed to seed audiences: ${audiencesErr.message}`);
  TEST_IDS.audiences = audiences.map((a) => a.id);
  console.log(`[e2e]   Inserted ${audiences.length} audiences`);

  // 5. Add first 2 contacts to first audience via email_lists
  const audienceName = TEST_AUDIENCES[0].name;
  const contactIdsForAudience = TEST_IDS.contacts.slice(0, 2);
  const { error: listErr } = await supabase
    .from("contacts")
    .update({ email_lists: [audienceName] })
    .in("id", contactIdsForAudience);
  if (listErr) throw new Error(`Failed to assign contacts to audience: ${listErr.message}`);
  console.log(`[e2e]   Added ${contactIdsForAudience.length} contacts to audience "${audienceName}"`);

  // 6. Insert events
  const { data: events, error: eventsErr } = await supabase
    .from("events")
    .insert(TEST_EVENTS)
    .select("id");
  if (eventsErr) throw new Error(`Failed to seed events: ${eventsErr.message}`);
  TEST_IDS.events = events.map((e) => e.id);
  console.log(`[e2e]   Inserted ${events.length} events`);

  // 7. Insert stories
  const { data: stories, error: storiesErr } = await supabase
    .from("stories")
    .insert(TEST_STORIES)
    .select("id");
  if (storiesErr) throw new Error(`Failed to seed stories: ${storiesErr.message}`);
  TEST_IDS.stories = stories.map((s) => s.id);
  console.log(`[e2e]   Inserted ${stories.length} stories`);

  console.log("[e2e] Seeding complete.");
}
