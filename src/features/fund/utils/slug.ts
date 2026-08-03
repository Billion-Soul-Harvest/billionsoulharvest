export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function generateUniqueSlug(title: string): string {
  const base = generateSlug(title);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}
