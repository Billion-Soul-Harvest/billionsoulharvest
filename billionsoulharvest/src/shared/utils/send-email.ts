import nodemailer from "nodemailer";
import dns from "dns";
import { isIP } from "net";

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  headers?: Record<string, string>;
}

interface EmailResult {
  to: string;
  success: boolean;
  messageId?: string;
  error?: string;
}

// Vercel serverless: getaddrinfo EBUSY even for IP addresses.
// Patch dns.lookup at runtime to skip system resolver for IPs.
let dnsPatched = false;
function patchDns() {
  if (dnsPatched) return;
  dnsPatched = true;
  const original = dns.lookup;
  dns.lookup = function (hostname: string, ...args: unknown[]) {
    const family = isIP(hostname as string);
    if (family) {
      const cb = args[args.length - 1] as (err: null, address: string, family: number) => void;
      return cb(null, hostname, family);
    }
    return (original as Function).call(dns, hostname, ...args);
  } as typeof dns.lookup;
}

function getTransport() {
  patchDns();
  const port = Number(process.env.SMTP_PORT || 587);
  const host = process.env.SMTP_HOST || "smtp.hostinger.com";
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: { servername: "smtp.hostinger.com" },
  });
}

export async function sendEmails(
  emails: EmailPayload[]
): Promise<EmailResult[]> {
  const transport = getTransport();
  const defaultFrom = getFromAddress();
  const results: EmailResult[] = [];

  try {
    for (const email of emails) {
      try {
        const info = await transport.sendMail({
          from: email.from || defaultFrom,
          to: email.to,
          subject: email.subject,
          html: email.html,
          replyTo: email.replyTo,
          headers: email.headers,
        });
        results.push({
          to: email.to,
          success: true,
          messageId: info.messageId,
        });
      } catch (err) {
        results.push({
          to: email.to,
          success: false,
          error: err instanceof Error ? err.message : "Send failed",
        });
      }
    }
  } finally {
    transport.close();
  }

  return results;
}

export async function sendEmail(
  email: EmailPayload
): Promise<EmailResult> {
  const results = await sendEmails([email]);
  return results[0];
}

export function getFromAddress() {
  return (
    process.env.SMTP_FROM ||
    "Billion Soul Harvest <info@billionsoulharvest.org>"
  );
}
