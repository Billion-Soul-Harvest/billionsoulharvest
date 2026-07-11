/**
 * Maps countryOptions display names to the abbreviated names used
 * in world-atlas/countries-110m.json TopoJSON properties.
 *
 * Only entries that differ between our list and the TopoJSON are included;
 * names that match exactly are resolved at runtime.
 */
const nameOverrides: Record<string, string> = {
  "Bosnia and Herzegovina": "Bosnia and Herz.",
  "Cabo Verde": "Cabo Verde", // not in 110m (too small)
  "Central African Republic": "Central African Rep.",
  "Congo (DRC)": "Dem. Rep. Congo",
  "Congo (Republic)": "Congo",
  "Czech Republic": "Czechia",
  "Dominican Republic": "Dominican Rep.",
  "Equatorial Guinea": "Eq. Guinea",
  "Eswatini": "eSwatini",
  "Ivory Coast": "Côte d'Ivoire",
  "North Macedonia": "Macedonia",
  "Solomon Islands": "Solomon Is.",
  "South Sudan": "S. Sudan",
  "United States": "United States of America",
};

/**
 * Canonical country names recognized by the system.
 * Used for fuzzy matching dirty data.
 */
const validCountries = new Set([
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola",
  "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados",
  "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei",
  "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
  "Cameroon", "Canada", "Central African Republic", "Chad", "Chile",
  "China", "Colombia", "Comoros", "Congo (DRC)", "Congo (Republic)",
  "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
  "Côte d'Ivoire", "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "East Timor", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea",
  "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji",
  "Finland", "France", "Gabon", "Gambia", "Georgia",
  "Germany", "Ghana", "Greece", "Grenada", "Guatemala",
  "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras",
  "Hong Kong", "Hungary", "Iceland", "India", "Indonesia",
  "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan",
  "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos",
  "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya",
  "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi",
  "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands",
  "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova",
  "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique",
  "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands",
  "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea",
  "North Macedonia", "Norway", "Oman", "Pakistan", "Palau",
  "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru",
  "Philippines", "Poland", "Portugal", "Qatar", "Romania",
  "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia",
  "Saint Vincent and the Grenadines", "Samoa", "San Marino",
  "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia",
  "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia",
  "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan",
  "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden",
  "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania",
  "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia",
  "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine",
  "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
  "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen",
  "Zambia", "Zimbabwe",
]);

/**
 * Normalize common aliases/abbreviations to the canonical country name
 * used in countryOptions (registration schema).
 */
const aliases: Record<string, string> = {
  "USA": "United States",
  "U.S.A.": "United States",
  "US": "United States",
  "U.S.": "United States",
  "UNITED STATES": "United States",
  "United States of America": "United States",
  "UK": "United Kingdom",
  "U.K.": "United Kingdom",
  "UAE": "United Arab Emirates",
  "Philippines (the)": "Philippines",
  "The Philippines": "Philippines",
  "Viet Nam": "Vietnam",
  "Sao Tome And Pricipe": "Sao Tome and Principe",
  "Sao Tome And Principe": "Sao Tome and Principe",
  "Korea": "South Korea",
  "Republic of Korea": "South Korea",
  "South korea": "South Korea",
  "KOREA": "South Korea",
  "DRC": "Congo (DRC)",
  "DR Congo": "Congo (DRC)",
  "CHINA": "China",
  "INDIA": "India",
  "NIGERIA": "Nigeria",
  "BANGLADESH": "Bangladesh",
  "INDONESIA": "Indonesia",
  "MALAYSIA": "Malaysia",
  "NEPAL": "Nepal",
  "KENYA": "Kenya",
  "PHILIPPINES": "Philippines",
  "TAIWAN": "Taiwan",
  "SINGAPORE": "Singapore",
  "JAPAN": "Japan",
  "GHANA": "Ghana",
  "PAKISTAN": "Pakistan",
  "MYANMAR": "Myanmar",
  "Burma": "Myanmar",
  "TURKEY": "Turkey",
  "Türkiye": "Turkey",
  "Turkiye": "Turkey",
};

/** Build a case-insensitive lookup from valid country names */
const countryLower = new Map<string, string>();
for (const c of validCountries) {
  countryLower.set(c.toLowerCase(), c);
}
for (const [alias, canonical] of Object.entries(aliases)) {
  countryLower.set(alias.toLowerCase(), canonical);
}

/**
 * Normalize a raw country string to its canonical name.
 * Returns null for values that are not recognizable as countries
 * (phone numbers, gibberish, etc.).
 *
 * Handles: case variations, parenthetical suffixes, non-Latin text,
 * slash-separated multi-countries, and common aliases.
 */
export function normalizeCountry(raw: string): string | null {
  if (!raw || typeof raw !== "string") return null;

  let trimmed = raw.trim();
  if (!trimmed) return null;

  // Filter out phone numbers (starts with + followed by digits)
  if (/^\+?\d[\d\s\-()]{5,}$/.test(trimmed) || /^'\+\d/.test(trimmed)) return null;

  // Direct alias match first (exact)
  if (aliases[trimmed]) return aliases[trimmed];

  // Strip parenthetical suffixes: "United Arab Emirates (Dubai)" → "United Arab Emirates"
  trimmed = trimmed.replace(/\s*\([^)]*\)\s*$/, "").trim();

  // Strip non-Latin text appended after the country name: "Lebanon 黎巴嫩" → "Lebanon"
  trimmed = trimmed.replace(/\s+[^\u0000-\u007F]+\s*$/, "").trim();

  // Direct match after cleaning
  if (validCountries.has(trimmed)) return trimmed;
  if (aliases[trimmed]) return aliases[trimmed];

  // Case-insensitive match
  const lower = trimmed.toLowerCase();
  if (countryLower.has(lower)) return countryLower.get(lower)!;

  // Try title-casing the input for matching
  const titleCased = trimmed.replace(/\b\w/g, (c) => c.toUpperCase());
  if (validCountries.has(titleCased)) return titleCased;

  return null;
}

/**
 * Normalize a raw country string, splitting slash-separated entries.
 * Returns an array of canonical country names (empty if none recognized).
 */
export function normalizeCountries(raw: string): string[] {
  if (!raw || typeof raw !== "string") return [];

  // Split on / or , separators for multi-country entries
  if (/[/,]/.test(raw)) {
    const parts = raw.split(/\s*[/,]\s*/);
    const results: string[] = [];
    for (const part of parts) {
      const normalized = normalizeCountry(part.trim());
      if (normalized) results.push(normalized);
    }
    if (results.length > 0) return results;
  }

  const normalized = normalizeCountry(raw);
  return normalized ? [normalized] : [];
}

/** Resolve a countryOptions name to the TopoJSON feature name. */
export function toTopoName(country: string): string {
  return nameOverrides[country] ?? country;
}

/**
 * Build a reverse lookup: TopoJSON name -> countryOptions display name.
 * Used for tooltip display so we show clean names.
 */
const reverseOverrides: Record<string, string> = Object.fromEntries(
  Object.entries(nameOverrides).map(([display, topo]) => [topo, display])
);

export function toDisplayName(topoName: string): string {
  return reverseOverrides[topoName] ?? topoName;
}

/**
 * Map from TopoJSON country names to ISO 3166-1 alpha-2 codes.
 * Only countries likely to appear in contacts data are included.
 */
const topoToIso: Record<string, string> = {
  "Afghanistan": "AF",
  "Albania": "AL",
  "Algeria": "DZ",
  "Angola": "AO",
  "Argentina": "AR",
  "Armenia": "AM",
  "Australia": "AU",
  "Austria": "AT",
  "Azerbaijan": "AZ",
  "Bangladesh": "BD",
  "Belarus": "BY",
  "Belgium": "BE",
  "Benin": "BJ",
  "Bolivia": "BO",
  "Bosnia and Herz.": "BA",
  "Botswana": "BW",
  "Brazil": "BR",
  "Bulgaria": "BG",
  "Burkina Faso": "BF",
  "Burundi": "BI",
  "Cambodia": "KH",
  "Cameroon": "CM",
  "Canada": "CA",
  "Central African Rep.": "CF",
  "Chad": "TD",
  "Chile": "CL",
  "China": "CN",
  "Colombia": "CO",
  "Congo": "CG",
  "Costa Rica": "CR",
  "Croatia": "HR",
  "Cuba": "CU",
  "Czechia": "CZ",
  "Côte d'Ivoire": "CI",
  "Dem. Rep. Congo": "CD",
  "Denmark": "DK",
  "Dominican Rep.": "DO",
  "Ecuador": "EC",
  "Egypt": "EG",
  "El Salvador": "SV",
  "Eq. Guinea": "GQ",
  "Eritrea": "ER",
  "eSwatini": "SZ",
  "Estonia": "EE",
  "Ethiopia": "ET",
  "Finland": "FI",
  "France": "FR",
  "Gabon": "GA",
  "Gambia": "GM",
  "Georgia": "GE",
  "Germany": "DE",
  "Ghana": "GH",
  "Greece": "GR",
  "Guatemala": "GT",
  "Guinea": "GN",
  "Haiti": "HT",
  "Honduras": "HN",
  "Hungary": "HU",
  "Iceland": "IS",
  "India": "IN",
  "Indonesia": "ID",
  "Iran": "IR",
  "Iraq": "IQ",
  "Ireland": "IE",
  "Israel": "IL",
  "Italy": "IT",
  "Jamaica": "JM",
  "Japan": "JP",
  "Jordan": "JO",
  "Kazakhstan": "KZ",
  "Kenya": "KE",
  "Kuwait": "KW",
  "Kyrgyzstan": "KG",
  "Laos": "LA",
  "Latvia": "LV",
  "Lebanon": "LB",
  "Liberia": "LR",
  "Libya": "LY",
  "Lithuania": "LT",
  "Macedonia": "MK",
  "Madagascar": "MG",
  "Malawi": "MW",
  "Malaysia": "MY",
  "Mali": "ML",
  "Mauritania": "MR",
  "Mexico": "MX",
  "Moldova": "MD",
  "Mongolia": "MN",
  "Morocco": "MA",
  "Mozambique": "MZ",
  "Myanmar": "MM",
  "Namibia": "NA",
  "Nepal": "NP",
  "Netherlands": "NL",
  "New Zealand": "NZ",
  "Nicaragua": "NI",
  "Niger": "NE",
  "Nigeria": "NG",
  "North Korea": "KP",
  "Norway": "NO",
  "Oman": "OM",
  "Pakistan": "PK",
  "Panama": "PA",
  "Papua New Guinea": "PG",
  "Paraguay": "PY",
  "Peru": "PE",
  "Philippines": "PH",
  "Poland": "PL",
  "Portugal": "PT",
  "Qatar": "QA",
  "Romania": "RO",
  "Russia": "RU",
  "Rwanda": "RW",
  "S. Sudan": "SS",
  "Saudi Arabia": "SA",
  "Senegal": "SN",
  "Serbia": "RS",
  "Sierra Leone": "SL",
  "Slovakia": "SK",
  "Slovenia": "SI",
  "Solomon Is.": "SB",
  "Somalia": "SO",
  "South Africa": "ZA",
  "South Korea": "KR",
  "Spain": "ES",
  "Sri Lanka": "LK",
  "Sudan": "SD",
  "Suriname": "SR",
  "Sweden": "SE",
  "Switzerland": "CH",
  "Syria": "SY",
  "Taiwan": "TW",
  "Tajikistan": "TJ",
  "Tanzania": "TZ",
  "Thailand": "TH",
  "Togo": "TG",
  "Trinidad and Tobago": "TT",
  "Tunisia": "TN",
  "Turkey": "TR",
  "Turkmenistan": "TM",
  "Uganda": "UG",
  "Ukraine": "UA",
  "United Arab Emirates": "AE",
  "United Kingdom": "GB",
  "United States of America": "US",
  "Uruguay": "UY",
  "Uzbekistan": "UZ",
  "Venezuela": "VE",
  "Vietnam": "VN",
  "Yemen": "YE",
  "Zambia": "ZM",
  "Zimbabwe": "ZW",
};

/** Get ISO 2-letter code from TopoJSON country name */
export function toIsoCode(topoName: string): string | undefined {
  return topoToIso[topoName];
}
