/**
 * Test data constants for E2E tests.
 * All test data uses "test-" or "Test " prefixes so cleanup can target them
 * safely with WHERE ilike patterns (never WHERE-less deletes).
 */

// Mutable arrays to store IDs of created records during seeding
export const TEST_IDS = {
  contacts: [] as string[],
  tags: [] as string[],
  audiences: [] as string[],
  events: [] as string[],
  stories: [] as string[],
  taggables: [] as string[],
};

export const TEST_CONTACTS = [
  {
    first_name: "Test",
    last_name: "Pastor",
    email: "test-pastor@example.com",
    phone: "+1-555-0101",
    church_name: "Test Community Church",
    city: "Dallas",
    country: "United States",
    contact_type: "pastor" as const,
  },
  {
    first_name: "Test",
    last_name: "Leader",
    email: "test-leader@example.com",
    phone: "+1-555-0102",
    church_name: "Test Grace Fellowship",
    city: "Houston",
    country: "United States",
    contact_type: "leader" as const,
  },
  {
    first_name: "Test",
    last_name: "Donor",
    email: "test-donor@example.com",
    phone: "+1-555-0103",
    church_name: "Test Faith Center",
    city: "Lagos",
    country: "Nigeria",
    contact_type: "donor" as const,
  },
  {
    first_name: "Test",
    last_name: "Attendee",
    email: "test-attendee@example.com",
    phone: "+1-555-0104",
    church_name: "Test Hope Church",
    city: "London",
    country: "United Kingdom",
    contact_type: "attendee" as const,
  },
  {
    first_name: "Test",
    last_name: "Subscriber",
    email: "test-subscriber@example.com",
    phone: "+1-555-0105",
    church_name: "Test Mercy Chapel",
    city: "Sao Paulo",
    country: "Brazil",
    contact_type: "subscriber" as const,
  },
  {
    first_name: "Test",
    last_name: "OtherOne",
    email: "test-other1@example.com",
    phone: "+1-555-0106",
    church_name: "Test Renewal Church",
    city: "Nairobi",
    country: "Kenya",
    contact_type: "other" as const,
  },
  {
    first_name: "Test",
    last_name: "OtherTwo",
    email: "test-other2@example.com",
    phone: "+1-555-0107",
    church_name: "Test Victory Church",
    city: "Seoul",
    country: "South Korea",
    contact_type: "other" as const,
  },
  {
    first_name: "Test",
    last_name: "OtherThree",
    email: "test-other3@example.com",
    phone: "+1-555-0108",
    church_name: "Test Unity Church",
    city: "Manila",
    country: "Philippines",
    contact_type: "pastor" as const,
  },
  {
    first_name: "Test",
    last_name: "OtherFour",
    email: "test-other4@example.com",
    phone: "+1-555-0109",
    church_name: "Test Lighthouse Church",
    city: "Accra",
    country: "Ghana",
    contact_type: "leader" as const,
  },
  {
    first_name: "Test",
    last_name: "OtherFive",
    email: "test-other5@example.com",
    phone: "+1-555-0110",
    church_name: "Test Cornerstone Church",
    city: "Mexico City",
    country: "Mexico",
    contact_type: "donor" as const,
  },
];

export const TEST_TAGS = [
  { name: "test-vip" },
  { name: "test-speaker" },
  { name: "test-volunteer" },
];

export const TEST_AUDIENCES = [
  {
    name: "Test Newsletter List",
    description: "Test audience for newsletter subscribers",
    type: "list" as const,
  },
  {
    name: "Test VIP Segment",
    description: "Test audience segment for VIP contacts",
    type: "segment" as const,
    segment_filter: { tags: ["test-vip"] },
  },
];

export const TEST_EVENTS = [
  {
    title: "Test Upcoming Gathering",
    slug: "test-upcoming-gathering",
    description: "A test event in the future",
    location: "Test Convention Center",
    city: "Dallas",
    country: "United States",
    start_date: getFutureDate(30),
    end_date: getFutureDate(32),
    status: "published" as const,
  },
  {
    title: "Test Past Gathering",
    slug: "test-past-gathering",
    description: "A test event in the past",
    location: "Test Arena",
    city: "Lagos",
    country: "Nigeria",
    start_date: getPastDate(60),
    end_date: getPastDate(58),
    status: "completed" as const,
  },
];

export const TEST_STORIES = [
  {
    title: "Test Published Story",
    slug: "test-published-story",
    description: "A test story that is published",
    status: "published" as const,
    author: "Test Author",
    published_at: new Date().toISOString(),
    content_html: "<p>Test published story content.</p>",
  },
  {
    title: "Test Draft Story",
    slug: "test-draft-story",
    description: "A test story that is a draft",
    status: "draft" as const,
    author: "Test Author",
    content_html: "<p>Test draft story content.</p>",
  },
];

// Helper functions for date generation
function getFutureDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split("T")[0];
}

function getPastDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}
