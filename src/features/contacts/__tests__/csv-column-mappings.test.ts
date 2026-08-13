import { describe, it, expect } from "vitest";
import { autoDetectMappings, coerceRow } from "../csv-column-mappings";
import { parseCSV } from "@/shared/utils/csv-parser";

// ---------------------------------------------------------------------------
// autoDetectMappings
// ---------------------------------------------------------------------------
describe("autoDetectMappings", () => {
  it("maps exact lowercase matches", () => {
    const result = autoDetectMappings(["email", "first_name", "last_name"]);
    // "first_name" and "last_name" are not aliases (aliases use spaces)
    expect(result["email"]).toBe("email");
  });

  it("maps common aliases (case-insensitive, trimmed)", () => {
    const result = autoDetectMappings([
      "Email Address",
      "First Name",
      "Last Name",
      "Phone Number",
    ]);
    expect(result["Email Address"]).toBe("email");
    expect(result["First Name"]).toBe("first_name");
    expect(result["Last Name"]).toBe("last_name");
    expect(result["Phone Number"]).toBe("phone");
  });

  it("maps Google Contacts style headers", () => {
    const result = autoDetectMappings([
      "Given Name",
      "Family Name",
      "E-mail Address",
      "Phone - Mobile",
      "Phone - Home",
      "City - Home",
      "State/Province - Home",
      "Country - Home",
    ]);
    expect(result["Given Name"]).toBe("first_name");
    expect(result["Family Name"]).toBe("last_name");
    expect(result["E-mail Address"]).toBe("email");
    expect(result["Phone - Mobile"]).toBe("phone_mobile");
    expect(result["Phone - Home"]).toBe("phone_home");
    expect(result["City - Home"]).toBe("city");
    expect(result["State/Province - Home"]).toBe("state");
    expect(result["Country - Home"]).toBe("country");
  });

  it("sets unknown headers to 'skip'", () => {
    const result = autoDetectMappings(["FavoriteColor", "Shoe Size"]);
    expect(result["FavoriteColor"]).toBe("skip");
    expect(result["Shoe Size"]).toBe("skip");
  });

  it("prevents duplicate field assignments — second occurrence is skipped", () => {
    const result = autoDetectMappings(["Email", "E-mail"]);
    expect(result["Email"]).toBe("email");
    expect(result["E-mail"]).toBe("skip"); // duplicate
  });

  it("handles empty headers array", () => {
    expect(autoDetectMappings([])).toEqual({});
  });

  it("trims whitespace in headers", () => {
    const result = autoDetectMappings(["  Email  ", " First Name "]);
    expect(result["  Email  "]).toBe("email");
    expect(result[" First Name "]).toBe("first_name");
  });

  it("maps birthday-related aliases", () => {
    const r1 = autoDetectMappings(["Date of Birth"]);
    expect(r1["Date of Birth"]).toBe("birthday");

    const r2 = autoDetectMappings(["DOB"]);
    expect(r2["DOB"]).toBe("birthday");
  });

  it("maps organization aliases", () => {
    const result = autoDetectMappings(["Company", "Ministry"]);
    expect(result["Company"]).toBe("church_name");
    expect(result["Ministry"]).toBe("skip"); // duplicate field
  });

  it("maps notes/comments aliases", () => {
    const result = autoDetectMappings(["Comments"]);
    expect(result["Comments"]).toBe("notes");
  });
});

// ---------------------------------------------------------------------------
// coerceRow
// ---------------------------------------------------------------------------
describe("coerceRow", () => {
  it("maps simple fields through", () => {
    const row = { Name: "John", Email: "JOHN@EXAMPLE.COM" };
    const mappings = { Name: "first_name", Email: "email" };
    const result = coerceRow(row, mappings);
    expect(result.first_name).toBe("John");
    expect(result.email).toBe("john@example.com");
  });

  it("skips fields mapped to 'skip'", () => {
    const row = { Junk: "data", Email: "a@b.com" };
    const mappings = { Junk: "skip", Email: "email" };
    const result = coerceRow(row, mappings);
    expect(result).not.toHaveProperty("Junk");
    expect(result).not.toHaveProperty("skip");
    expect(result.email).toBe("a@b.com");
  });

  it("skips empty/whitespace-only values", () => {
    const row = { Email: "  ", First: "" };
    const mappings = { Email: "email", First: "first_name" };
    const result = coerceRow(row, mappings);
    expect(result).toEqual({});
  });

  // --- Email handling ---
  it("normalizes email to lowercase", () => {
    const row = { Email: "  Alice@Example.COM  " };
    const mappings = { Email: "email" };
    const result = coerceRow(row, mappings);
    expect(result.email).toBe("alice@example.com");
  });

  it("splits multi-value emails — first becomes primary, rest go to alternative_email", () => {
    const row = { Email: "a@b.com, c@d.com; e@f.com" };
    const mappings = { Email: "email" };
    const result = coerceRow(row, mappings);
    expect(result.email).toBe("a@b.com");
    expect(result.alternative_email).toEqual(["c@d.com", "e@f.com"]);
  });

  it("deduplicates emails in multi-value field", () => {
    const row = { Email: "a@b.com, A@B.COM, c@d.com" };
    const mappings = { Email: "email" };
    const result = coerceRow(row, mappings);
    expect(result.email).toBe("a@b.com");
    expect(result.alternative_email).toEqual(["c@d.com"]);
  });

  it("handles single email with no splitting needed", () => {
    const row = { Email: "solo@test.com" };
    const mappings = { Email: "email" };
    const result = coerceRow(row, mappings);
    expect(result.email).toBe("solo@test.com");
    expect(result).not.toHaveProperty("alternative_email");
  });

  // --- Alternative email ---
  it("stores alternative_email as array", () => {
    const row = { Alt: "x@y.com, z@w.com" };
    const mappings = { Alt: "alternative_email" };
    const result = coerceRow(row, mappings);
    expect(result.alternative_email).toEqual(["x@y.com", "z@w.com"]);
  });

  it("merges alternative emails from email splitting and alternative_email column", () => {
    const row = { Email: "a@b.com, c@d.com", Alt: "e@f.com" };
    const mappings = { Email: "email", Alt: "alternative_email" };
    const result = coerceRow(row, mappings);
    expect(result.email).toBe("a@b.com");
    expect(result.alternative_email).toEqual(["c@d.com", "e@f.com"]);
  });

  // --- Contact type ---
  it("normalizes valid contact_type to lowercase", () => {
    const row = { Type: "Pastor" };
    const mappings = { Type: "contact_type" };
    const result = coerceRow(row, mappings);
    expect(result.contact_type).toBe("pastor");
  });

  it("skips invalid contact_type values", () => {
    const row = { Type: "VIP" };
    const mappings = { Type: "contact_type" };
    const result = coerceRow(row, mappings);
    expect(result).not.toHaveProperty("contact_type");
  });

  it("accepts all valid contact types", () => {
    const validTypes = ["pastor", "leader", "donor", "attendee", "subscriber", "other"];
    for (const t of validTypes) {
      const row = { Type: t };
      const mappings = { Type: "contact_type" };
      expect(coerceRow(row, mappings).contact_type).toBe(t);
    }
  });

  // --- Birthday ---
  it("normalizes MM/DD/YYYY birthday to YYYY-MM-DD", () => {
    const row = { Bday: "3/5/1990" };
    const mappings = { Bday: "birthday" };
    const result = coerceRow(row, mappings);
    expect(result.birthday).toBe("1990-03-05");
  });

  it("normalizes MM/DD/YYYY with zero-padded values", () => {
    const row = { Bday: "12/25/2000" };
    const mappings = { Bday: "birthday" };
    const result = coerceRow(row, mappings);
    expect(result.birthday).toBe("2000-12-25");
  });

  it("handles ISO date format for birthday", () => {
    const row = { Bday: "1990-03-05" };
    const mappings = { Bday: "birthday" };
    const result = coerceRow(row, mappings);
    expect(result.birthday).toBe("1990-03-05");
  });

  it("skips unparseable birthday", () => {
    const row = { Bday: "not-a-date" };
    const mappings = { Bday: "birthday" };
    const result = coerceRow(row, mappings);
    expect(result).not.toHaveProperty("birthday");
  });

  // --- Custom fields ---
  it("stores custom fields in custom_fields object", () => {
    const row = { Shirt: "Large" };
    const mappings = { Shirt: "custom:shirt_size" };
    const result = coerceRow(row, mappings);
    expect(result.custom_fields).toEqual({ shirt_size: "Large" });
  });

  it("accumulates multiple custom fields", () => {
    const row = { Shirt: "Large", Diet: "Vegan" };
    const mappings = { Shirt: "custom:shirt_size", Diet: "custom:dietary" };
    const result = coerceRow(row, mappings);
    expect(result.custom_fields).toEqual({ shirt_size: "Large", dietary: "Vegan" });
  });

  // --- Missing row values ---
  it("handles missing header key in row gracefully", () => {
    const row: Record<string, string> = {};
    const mappings = { Email: "email", Name: "first_name" };
    const result = coerceRow(row, mappings);
    expect(result).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// parseCSV
// ---------------------------------------------------------------------------
describe("parseCSV", () => {
  it("parses a simple CSV with header row", () => {
    const csv = "email,first_name\nalice@test.com,Alice\nbob@test.com,Bob";
    const rows = parseCSV(csv);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({ email: "alice@test.com", first_name: "Alice" });
    expect(rows[1]).toEqual({ email: "bob@test.com", first_name: "Bob" });
  });

  it("returns empty array for header-only input", () => {
    const csv = "email,name\n";
    expect(parseCSV(csv)).toEqual([]);
  });

  it("returns empty array for empty input", () => {
    expect(parseCSV("")).toEqual([]);
  });

  it("handles quoted fields containing commas", () => {
    const csv = 'name,address\nJohn,"123 Main St, Suite 4"';
    const rows = parseCSV(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0].address).toBe("123 Main St, Suite 4");
  });

  it("handles escaped quotes (doubled) inside quoted fields", () => {
    const csv = 'name,note\nJohn,"He said ""hello""."';
    const rows = parseCSV(csv);
    expect(rows[0].note).toBe('He said "hello".');
  });

  it("handles newlines inside quoted fields", () => {
    const csv = 'name,bio\nJohn,"Line 1\nLine 2"';
    const rows = parseCSV(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0].bio).toBe("Line 1\nLine 2");
  });

  it("handles CRLF line endings", () => {
    const csv = "email,name\r\na@b.com,Alice\r\nc@d.com,Bob";
    const rows = parseCSV(csv);
    expect(rows).toHaveLength(2);
    expect(rows[0].email).toBe("a@b.com");
  });

  it("lowercases and trims headers", () => {
    const csv = "  Email , First Name \na@b.com,Alice";
    const rows = parseCSV(csv);
    expect(Object.keys(rows[0])).toContain("email");
    expect(Object.keys(rows[0])).toContain("first name");
  });

  it("fills missing trailing columns with empty string", () => {
    const csv = "a,b,c\n1,2";
    const rows = parseCSV(csv);
    expect(rows[0]).toEqual({ a: "1", b: "2", c: "" });
  });

  it("skips blank lines", () => {
    const csv = "email,name\n\na@b.com,Alice\n\nb@c.com,Bob\n";
    const rows = parseCSV(csv);
    expect(rows).toHaveLength(2);
  });
});
