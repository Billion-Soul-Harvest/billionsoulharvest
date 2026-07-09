/**
 * Constant Contact → Supabase Migration Script
 *
 * Usage:
 *   npx tsx scripts/migrate-constant-contact.ts
 *
 * Required env vars (in .env.local):
 *   CONSTANT_CONTACT_API_KEY
 *   CONSTANT_CONTACT_ACCESS_TOKEN
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const CC_BASE_URL = "https://api.cc.email/v3";
const CC_ACCESS_TOKEN = process.env.CONSTANT_CONTACT_ACCESS_TOKEN!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BATCH_SIZE = 100;

if (!CC_ACCESS_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error(
    "Missing required env vars. See .env.local.example for required variables."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface CCContact {
  contact_id: string;
  email_address?: { address: string; permission_to_send: string };
  first_name?: string;
  last_name?: string;
  phone_numbers?: Array<{ phone_number: string; kind: string }>;
  street_addresses?: Array<{
    city?: string;
    state?: string;
    country?: string;
  }>;
  custom_fields?: Array<{ custom_field_id: string; value: string }>;
  list_memberships?: string[];
  tags?: Array<{ tag_id: string; name: string }>;
  notes?: Array<{ content: string }>;
  company_name?: string;
  job_title?: string;
  create_source?: string;
  created_at?: string;
  updated_at?: string;
}

interface CCListsResponse {
  lists: Array<{ list_id: string; name: string; membership_count: number }>;
}

interface CCContactsResponse {
  contacts: CCContact[];
  _links?: { next?: { href: string } };
}

// ---------------------------------------------------------------------------
// Constant Contact API helpers
// ---------------------------------------------------------------------------
async function ccFetch<T>(url: string): Promise<T> {
  const fullUrl = url.startsWith("http") ? url : `${CC_BASE_URL}${url}`;
  const res = await fetch(fullUrl, {
    headers: {
      Authorization: `Bearer ${CC_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`CC API error ${res.status}: ${body}`);
  }
  return res.json();
}

async function fetchAllLists(): Promise<
  Map<string, string>
> {
  const data = await ccFetch<CCListsResponse>("/contact_lists?limit=1000");
  const map = new Map<string, string>();
  for (const list of data.lists) {
    map.set(list.list_id, list.name.toLowerCase());
  }
  console.log(`Fetched ${map.size} CC lists`);
  return map;
}

async function* paginateContacts(): AsyncGenerator<CCContact[]> {
  let url =
    "/contacts?limit=500&include=custom_fields,list_memberships,phone_numbers,street_addresses,notes,taggings";
  let page = 1;

  while (url) {
    console.log(`Fetching contacts page ${page}...`);
    const data = await ccFetch<CCContactsResponse>(url);
    yield data.contacts;
    url = data._links?.next?.href ?? "";
    page++;
  }
}

// ---------------------------------------------------------------------------
// Mapping logic
// ---------------------------------------------------------------------------
const REGION_KEYWORDS: Record<string, string[]> = {
  Brazil: ["brazil", "brasil"],
  Nepal: ["nepal"],
  "North India": ["india", "north india"],
  Mexico: ["mexico", "méxico"],
  Philippines: ["philippines", "pilipinas"],
};

function classifyContactType(
  listNames: string[]
): "pastor" | "leader" | "donor" | "attendee" | "subscriber" | "other" {
  const joined = listNames.join(" ").toLowerCase();
  if (joined.includes("pastor")) return "pastor";
  if (joined.includes("leader")) return "leader";
  if (joined.includes("donor") || joined.includes("giving")) return "donor";
  if (joined.includes("attendee") || joined.includes("event")) return "attendee";
  if (joined.includes("newsletter") || joined.includes("subscri")) return "subscriber";
  return "other";
}

function matchRegion(
  contact: CCContact,
  regionMap: Map<string, string>
): string | null {
  const country =
    contact.street_addresses?.[0]?.country?.toLowerCase() ?? "";
  const city = contact.street_addresses?.[0]?.city?.toLowerCase() ?? "";
  const searchText = `${country} ${city}`;

  for (const [regionName, keywords] of Object.entries(REGION_KEYWORDS)) {
    if (keywords.some((kw) => searchText.includes(kw))) {
      return regionMap.get(regionName) ?? null;
    }
  }
  return null;
}

function mapContact(
  cc: CCContact,
  listMap: Map<string, string>,
  regionMap: Map<string, string>
) {
  const listNames = (cc.list_memberships ?? [])
    .map((id) => listMap.get(id) ?? "")
    .filter(Boolean);
  const tags = [
    ...listNames,
    ...(cc.tags?.map((t) => t.name) ?? []),
  ];

  return {
    first_name: cc.first_name || "Unknown",
    last_name: cc.last_name || "",
    email: cc.email_address?.address?.toLowerCase() || null,
    phone: cc.phone_numbers?.[0]?.phone_number || null,
    contact_type: classifyContactType(listNames),
    tags,
    church_name: cc.company_name || null,
    church_role: cc.job_title || null,
    city: cc.street_addresses?.[0]?.city || null,
    state: cc.street_addresses?.[0]?.state || null,
    country: cc.street_addresses?.[0]?.country || null,
    region_id: matchRegion(cc, regionMap),
    notes: cc.notes?.map((n) => n.content).join("\n") || null,
    constant_contact_id: cc.contact_id,
  };
}

// ---------------------------------------------------------------------------
// Main migration
// ---------------------------------------------------------------------------
async function main() {
  console.log("=== Constant Contact → Supabase Migration ===\n");

  // Fetch regions from Supabase
  const { data: regions, error: regErr } = await supabase
    .from("ministry_regions")
    .select("id, name");
  if (regErr) throw new Error(`Failed to fetch regions: ${regErr.message}`);

  const regionMap = new Map<string, string>();
  for (const r of regions ?? []) {
    regionMap.set(r.name, r.id);
  }
  console.log(`Loaded ${regionMap.size} ministry regions\n`);

  // Fetch CC lists for classification
  const listMap = await fetchAllLists();

  // Paginate and upsert
  let totalProcessed = 0;
  let totalUpserted = 0;
  let totalErrors = 0;

  for await (const batch of paginateContacts()) {
    const mapped = batch.map((cc) => mapContact(cc, listMap, regionMap));
    totalProcessed += batch.length;

    // Batch upsert in chunks
    for (let i = 0; i < mapped.length; i += BATCH_SIZE) {
      const chunk = mapped.slice(i, i + BATCH_SIZE);
      const { data, error } = await supabase
        .from("contacts")
        .upsert(chunk, {
          onConflict: "constant_contact_id",
          ignoreDuplicates: false,
        })
        .select("id");

      if (error) {
        console.error(`Upsert error: ${error.message}`);
        totalErrors += chunk.length;
      } else {
        totalUpserted += data?.length ?? 0;
      }
    }

    console.log(
      `Progress: ${totalProcessed} processed, ${totalUpserted} upserted, ${totalErrors} errors`
    );
  }

  console.log("\n=== Migration Complete ===");
  console.log(`Total processed: ${totalProcessed}`);
  console.log(`Total upserted:  ${totalUpserted}`);
  console.log(`Total errors:    ${totalErrors}`);

  // Verification
  const { count } = await supabase
    .from("contacts")
    .select("*", { count: "exact", head: true });
  console.log(`\nVerification: ${count} contacts in Supabase`);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
