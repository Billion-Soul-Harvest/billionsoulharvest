export function getProgressPercentage(raisedCents: number, goalCents: number): number {
  if (goalCents <= 0) return 0;
  return Math.min(Math.round((raisedCents / goalCents) * 100), 100);
}

export function getDaysRemaining(endDate: string | null): number | null {
  if (!endDate) return null;
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
