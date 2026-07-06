/**
 * Sanitize a user-provided search string for safe use in PostgREST
 * `.or()` filter expressions. Strips characters that have special
 * meaning in PostgREST filter syntax (commas, periods, parentheses)
 * to prevent filter injection.
 */
export function sanitizeSearch(input: string): string {
  return input.replace(/[,.()"\\]/g, "");
}
