export function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatCentsWithDecimals(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function parseDollarsToCents(dollars: string): number {
  const cleaned = dollars.replace(/[^0-9.]/g, "");
  return Math.round(parseFloat(cleaned) * 100) || 0;
}
