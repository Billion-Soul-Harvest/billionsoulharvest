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
 * Normalize common aliases/abbreviations to the canonical country name
 * used in countryOptions (registration schema).
 */
const aliases: Record<string, string> = {
  "USA": "United States",
  "U.S.A.": "United States",
  "US": "United States",
  "U.S.": "United States",
  "UK": "United Kingdom",
  "U.K.": "United Kingdom",
  "UAE": "United Arab Emirates",
  "Philippines (the)": "Philippines",
  "The Philippines": "Philippines",
};

/** Normalize a raw country string to its canonical name. */
export function normalizeCountry(raw: string): string {
  return aliases[raw] ?? raw;
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
