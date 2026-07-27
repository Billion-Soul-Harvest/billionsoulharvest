/**
 * CSV Parser - handles quoted fields with commas/newlines
 * Extracted from scripts/migrate-from-csv.ts for reuse in browser CSV import.
 */
export function parseCSV(text: string): Record<string, string>[] {
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
