export interface ContactField {
  key: string;
  label: string;
}

export const CONTACT_FIELDS: ContactField[] = [
  { key: "email", label: "Email" },
  { key: "first_name", label: "First Name" },
  { key: "last_name", label: "Last Name" },
  { key: "phone", label: "Phone" },
  { key: "church_name", label: "Church Name" },
  { key: "city", label: "City" },
  { key: "country", label: "Country" },
  { key: "state", label: "State" },
  { key: "job_title", label: "Job Title" },
  { key: "birthday", label: "Birthday" },
  { key: "gender", label: "Gender" },
  { key: "age_group", label: "Age Group" },
  { key: "language", label: "Language" },
  { key: "contact_type", label: "Contact Type" },
  { key: "source", label: "Source" },
  { key: "referred_by", label: "Referred By" },
  { key: "interests", label: "Interests" },
  { key: "expectations", label: "Expectations" },
  { key: "alternative_email", label: "Alternative Email" },
  { key: "church_role", label: "Church Role" },
  { key: "street_address", label: "Street Address" },
  { key: "phone_home", label: "Phone (Home)" },
  { key: "phone_mobile", label: "Phone (Mobile)" },
  { key: "phone_work", label: "Phone (Work)" },
  { key: "zip_code", label: "Zip Code" },
  { key: "notes", label: "Notes" },
];

/** Maps common CSV header variations to our field keys */
const HEADER_ALIASES: Record<string, string> = {
  // Email
  "email": "email",
  "email address": "email",
  "e-mail": "email",
  "e-mail address": "email",
  "primary email": "email",
  // Name
  "first name": "first_name",
  "first": "first_name",
  "given name": "first_name",
  "firstname": "first_name",
  "last name": "last_name",
  "last": "last_name",
  "surname": "last_name",
  "family name": "last_name",
  "lastname": "last_name",
  // Phone
  "phone": "phone",
  "phone number": "phone",
  "telephone": "phone",
  "mobile": "phone_mobile",
  "mobile phone": "phone_mobile",
  "cell phone": "phone_mobile",
  "phone - mobile": "phone_mobile",
  "home phone": "phone_home",
  "phone - home": "phone_home",
  "work phone": "phone_work",
  "phone - work": "phone_work",
  // Church/Org
  "church": "church_name",
  "church name": "church_name",
  "organization": "church_name",
  "company": "church_name",
  "company name": "church_name",
  "ministry/organization": "church_name",
  "org/ministry": "church_name",
  "ministry": "church_name",
  "role": "church_role",
  "church role": "church_role",
  // Location
  "city": "city",
  "city - home": "city",
  "town": "city",
  "state": "state",
  "state/province": "state",
  "state/province - home": "state",
  "province": "state",
  "country": "country",
  "country - home": "country",
  "street address": "street_address",
  "street address line 1 - home": "street_address",
  "address": "street_address",
  "zip": "zip_code",
  "zip code": "zip_code",
  "postal code": "zip_code",
  // Other
  "job title": "job_title",
  "title": "job_title",
  "birthday": "birthday",
  "date of birth": "birthday",
  "dob": "birthday",
  "gender": "gender",
  "sex": "gender",
  "age group": "age_group",
  "language": "language",
  "type": "contact_type",
  "contact type": "contact_type",
  "source": "source",
  "source name": "source",
  "referred by": "referred_by",
  "referral": "referred_by",
  "interests": "interests",
  "expectations": "expectations",
  "alternative email": "alternative_email",
  "secondary email": "alternative_email",
  "notes": "notes",
  "comments": "notes",
};

/**
 * Auto-detect column mappings from CSV headers.
 * Returns a map of CSV header → contact field key (or "skip").
 */
export function autoDetectMappings(headers: string[]): Record<string, string> {
  const mappings: Record<string, string> = {};
  const usedFields = new Set<string>();

  for (const header of headers) {
    const normalized = header.toLowerCase().trim();
    const fieldKey = HEADER_ALIASES[normalized];
    if (fieldKey && !usedFields.has(fieldKey)) {
      mappings[header] = fieldKey;
      usedFields.add(fieldKey);
    } else {
      mappings[header] = "skip";
    }
  }

  return mappings;
}

const VALID_CONTACT_TYPES = ["pastor", "leader", "donor", "attendee", "subscriber", "other"];

/** Normalize a single mapped row into a contact payload */
export function coerceRow(
  row: Record<string, string>,
  mappings: Record<string, string>,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  for (const [header, fieldKey] of Object.entries(mappings)) {
    if (fieldKey === "skip") continue;
    let value: string | null = row[header]?.trim() || null;
    if (!value) continue;

    // Custom field: store in custom_fields jsonb
    if (fieldKey.startsWith("custom:")) {
      const customKey = fieldKey.slice(7); // strip "custom:" prefix
      const existing = (payload.custom_fields as Record<string, string> | undefined) ?? {};
      existing[customKey] = value;
      payload.custom_fields = existing;
      continue;
    }

    if (fieldKey === "email") {
      // Handle multi-value email fields: first becomes primary, rest go to alternative_email
      const allEmails = value.split(/[,;\n\r]+/).map((s) => s.trim().toLowerCase()).filter(Boolean);
      const unique = [...new Set(allEmails)];
      value = unique[0] ?? null;
      if (!value) continue;
      if (unique.length > 1) {
        const existing = (payload.alternative_email as string[] | undefined) ?? [];
        payload.alternative_email = [...existing, ...unique.slice(1)];
      }
    } else if (fieldKey === "alternative_email") {
      // Split and store as array
      const emails = value.split(/[,;\n\r]+/).map((s) => s.trim().toLowerCase()).filter(Boolean);
      const existing = (payload.alternative_email as string[] | undefined) ?? [];
      payload.alternative_email = [...existing, ...emails];
      continue;
    } else if (fieldKey === "contact_type") {
      value = value.toLowerCase();
      if (!VALID_CONTACT_TYPES.includes(value)) continue;
    } else if (fieldKey === "birthday") {
      value = normalizeBirthday(value);
      if (!value) continue;
    }

    payload[fieldKey] = value;
  }

  return payload;
}

function normalizeBirthday(raw: string): string | null {
  // MM/DD/YYYY
  const parts = raw.split("/");
  if (parts.length === 3) {
    const [month, day, year] = parts;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  // Try ISO or other parseable format
  const d = new Date(raw);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}
