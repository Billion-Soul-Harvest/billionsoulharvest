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
