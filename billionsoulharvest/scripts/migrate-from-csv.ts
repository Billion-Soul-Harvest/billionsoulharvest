/**
 * Constant Contact CSV → Supabase Migration
 *
 * Usage:
 *   npx tsx scripts/migrate-from-csv.ts /path/to/export.csv
 */

import { config } from "dotenv";
config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BATCH_SIZE = 100;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ---------------------------------------------------------------------------
// CSV Parser (handles quoted fields with commas/newlines)
// ---------------------------------------------------------------------------
function parseCSV(text: string): Record<string, string>[] {
  const lines: string[][] = [];
  let current: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        current.push(field.trim());
        field = "";
      } else if (ch === "\n" || (ch === "\r" && text[i + 1] === "\n")) {
        current.push(field.trim());
        if (current.some((f) => f)) lines.push(current);
        current = [];
        field = "";
        if (ch === "\r") i++;
      } else {
        field += ch;
      }
    }
  }
  current.push(field.trim());
  if (current.some((f) => f)) lines.push(current);

  if (lines.length < 2) return [];

  const headers = lines[0].map((h) => h.toLowerCase().trim());
  return lines.slice(1).map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = row[i] ?? "";
    });
    return obj;
  });
}

// ---------------------------------------------------------------------------
// Mapping logic for CC export format
// ---------------------------------------------------------------------------

// Map CC "Region" field to our ministry regions
const CC_REGION_MAP: Record<string, string> = {
  "latin america": "Brazil",
  "south america": "Brazil",
  "brazil": "Brazil",
  "south asia": "Nepal",
  "nepal": "Nepal",
  "north india": "North India",
  "india": "North India",
  "central america": "Mexico",
  "mexico": "Mexico",
  "southeast asia": "Philippines",
  "philippines": "Philippines",
};

function matchRegion(row: Record<string, string>, regionMap: Map<string, string>): string | null {
  // Check CC Region field first
  const ccRegion = (row["region"] ?? "").toLowerCase();
  if (ccRegion && CC_REGION_MAP[ccRegion]) {
    return regionMap.get(CC_REGION_MAP[ccRegion]) ?? null;
  }

  // Check country fields
  const countries = [
    row["country"] ?? "",
    row["country - home"] ?? "",
    row["country - work"] ?? "",
    row["country - other"] ?? "",
  ].join(" ").toLowerCase();

  for (const [keyword, regionName] of Object.entries(CC_REGION_MAP)) {
    if (countries.includes(keyword)) {
      return regionMap.get(regionName) ?? null;
    }
  }

  // Check tags for region hints
  const tags = (row["tags"] ?? "").toLowerCase();
  if (tags.includes("brazil") || tags.includes("south america")) return regionMap.get("Brazil") ?? null;
  if (tags.includes("nepal")) return regionMap.get("Nepal") ?? null;
  if (tags.includes("india")) return regionMap.get("North India") ?? null;
  if (tags.includes("mexico")) return regionMap.get("Mexico") ?? null;
  if (tags.includes("philippines")) return regionMap.get("Philippines") ?? null;

  return null;
}

function classifyType(row: Record<string, string>): "pastor" | "leader" | "donor" | "attendee" | "subscriber" | "other" {
  const role = (row["role"] ?? row["job title"] ?? "").toLowerCase();
  const lists = (row["email lists"] ?? "").toLowerCase();
  const tags = (row["tags"] ?? "").toLowerCase();
  const allText = `${role} ${lists} ${tags}`;

  if (role.includes("pastor") || role.includes("senior pastor") || role.includes("lead pastor")) return "pastor";
  if (role.includes("leader") || role.includes("director") || role.includes("president") ||
      role.includes("bishop") || role.includes("evangelist") || role.includes("founder") ||
      role.includes("overseer") || role.includes("apostle")) return "leader";
  if (allText.includes("donor") || allText.includes("giving") || allText.includes("partner")) return "donor";
  if (allText.includes("participant") || allText.includes("attendee") || allText.includes("ghs")) return "attendee";
  if (lists.includes("mailing") || lists.includes("newsletter")) return "subscriber";
  return "other";
}

function getPhone(row: Record<string, string>): string | null {
  return row["phone - mobile"] || row["phone - work"] || row["phone - home"] || row["phone - home 2"] || null;
}

function parseBirthday(raw: string): string | null {
  if (!raw) return null;
  // CC format is MM/DD/YYYY — parse explicitly to avoid locale issues
  const parts = raw.split("/");
  if (parts.length === 3) {
    const [month, day, year] = parts;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  // Fallback for other formats
  const d = new Date(raw);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function getEmailLists(row: Record<string, string>): string[] {
  const raw = row["email lists"] ?? "";
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

function getTags(row: Record<string, string>): string[] {
  const tagStr = row["tags"] ?? "";
  const listStr = row["email lists"] ?? "";
  const combined = `${tagStr},${listStr}`;
  return combined
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i); // deduplicate
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error("Usage: npx tsx scripts/migrate-from-csv.ts /path/to/export.csv");
    process.exit(1);
  }

  let csvText: string;
  try {
    csvText = readFileSync(csvPath, "utf-8");
  } catch {
    console.error(`File not found: ${csvPath}`);
    process.exit(1);
  }

  console.log("=== Constant Contact → Supabase Migration ===\n");
  console.log(`Reading: ${csvPath}`);

  const rows = parseCSV(csvText);
  console.log(`Parsed ${rows.length} contacts from CSV\n`);

  if (rows.length === 0) {
    console.error("No data rows found.");
    process.exit(1);
  }

  // Show sample
  console.log("Sample row fields:", Object.keys(rows[0]).join(", "));
  console.log("");

  // Fetch regions
  const { data: regions } = await supabase.from("ministry_regions").select("id, name");
  const regionMap = new Map<string, string>();
  for (const r of regions ?? []) regionMap.set(r.name, r.id);
  console.log(`Loaded ${regionMap.size} ministry regions\n`);

  // Map rows
  const contacts = rows
    .filter((row) => row["email address"])
    .map((row) => ({
      first_name: row["first name"] || "Unknown",
      last_name: row["last name"] || "",
      email: (row["email address"] ?? "").toLowerCase() || null,
      phone: getPhone(row),
      phone_home: row["phone - home"] || null,
      phone_mobile: row["phone - mobile"] || null,
      phone_work: row["phone - work"] || null,
      contact_type: classifyType(row),
      tags: getTags(row),
      church_name: row["ministry/organization"] || row["company"] || null,
      church_role: row["role"] || null,
      city: row["city - home"] || null,
      state: row["state/province - home"] || row["state/province - work"] || null,
      country: row["country"] || row["country - home"] || null,
      street_address: row["street address line 1 - home"] || null,
      email_status: row["email status"] || null,
      email_permission: row["email permission status"] || null,
      alternative_email: row["alternative email"] || null,
      birthday: parseBirthday(row["birthday"] ?? ""),
      gender: row["gender"] || null,
      age_group: row["age group"] || null,
      language: row["language"] || null,
      job_title: row["job title"] || null,
      referred_by: row["referred by"] || null,
      interests: row["which areas are you most passionate about"] || null,
      expectations: row["what is your primary expectation"] || null,
      source: row["source name"] || null,
      cc_region: row["region"] || null,
      email_lists: getEmailLists(row),
      region_id: matchRegion(row, regionMap),
      notes: row["notes"] || null,
    }));

  const skipped = rows.length - contacts.length;
  console.log(`Mapped ${contacts.length} contacts (skipped ${skipped} without email)\n`);

  // Type breakdown
  const typeCounts: Record<string, number> = {};
  contacts.forEach((c) => { typeCounts[c.contact_type] = (typeCounts[c.contact_type] ?? 0) + 1; });
  console.log("Contact type breakdown:");
  Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });

  // Region breakdown
  const regionCounts: Record<string, number> = {};
  contacts.forEach((c) => {
    const name = c.region_id ? [...regionMap.entries()].find(([, id]) => id === c.region_id)?.[0] ?? "Unknown" : "Unassigned";
    regionCounts[name] = (regionCounts[name] ?? 0) + 1;
  });
  console.log("\nRegion breakdown:");
  Object.entries(regionCounts).sort((a, b) => b[1] - a[1]).forEach(([region, count]) => {
    console.log(`  ${region}: ${count}`);
  });
  console.log("");

  // Batch upsert
  let totalUpserted = 0;
  let totalErrors = 0;

  for (let i = 0; i < contacts.length; i += BATCH_SIZE) {
    const batch = contacts.slice(i, i + BATCH_SIZE);
    const { data, error } = await supabase
      .from("contacts")
      .upsert(batch, { onConflict: "email", ignoreDuplicates: false })
      .select("id");

    if (error) {
      console.error(`  Batch ${Math.floor(i / BATCH_SIZE) + 1} error: ${error.message}`);
      totalErrors += batch.length;
    } else {
      totalUpserted += data?.length ?? 0;
    }

    process.stdout.write(`\r  Upserting: ${Math.min(i + BATCH_SIZE, contacts.length)}/${contacts.length}`);
  }

  console.log("\n\n=== Migration Complete ===");
  console.log(`Total in CSV:    ${rows.length}`);
  console.log(`Total mapped:    ${contacts.length}`);
  console.log(`Total upserted:  ${totalUpserted}`);
  console.log(`Total errors:    ${totalErrors}`);

  const { count } = await supabase.from("contacts").select("*", { count: "exact", head: true });
  console.log(`\nVerification: ${count} contacts now in database`);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
