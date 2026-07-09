import { createHmac } from "crypto";

const getSecret = () => {
  const secret = process.env.EMAIL_UNSUBSCRIBE_SECRET;
  if (!secret) throw new Error("EMAIL_UNSUBSCRIBE_SECRET is not set");
  return secret;
};

export function generateUnsubscribeToken(contactId: string): string {
  return createHmac("sha256", getSecret())
    .update(contactId)
    .digest("hex");
}

export function verifyUnsubscribeToken(
  contactId: string,
  token: string
): boolean {
  const expected = generateUnsubscribeToken(contactId);
  // Constant-time comparison
  if (expected.length !== token.length) return false;
  let result = 0;
  for (let i = 0; i < expected.length; i++) {
    result |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  }
  return result === 0;
}

export function buildUnsubscribeUrl(contactId: string): string {
  const token = generateUnsubscribeToken(contactId);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.billionsoulharvest.org";
  return `${baseUrl}/api/unsubscribe?id=${contactId}&token=${token}`;
}
