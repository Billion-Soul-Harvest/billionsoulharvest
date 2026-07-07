import nodemailer from "nodemailer";
import dns from "dns";

// Resolve SMTP host to IP to avoid getaddrinfo EBUSY in serverless
async function resolveHost(hostname: string): Promise<string> {
  try {
    const { address } = await dns.promises.lookup(hostname);
    return address;
  } catch {
    // Fallback: return hostname and let nodemailer resolve it
    return hostname;
  }
}

export async function getSmtpTransport() {
  const host = await resolveHost(process.env.SMTP_HOST || "smtp.hostinger.com");
  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 465),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      servername: process.env.SMTP_HOST || "smtp.hostinger.com",
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

export function getFromAddress() {
  return (
    process.env.SMTP_FROM ||
    "Billion Soul Harvest <info@billionsoulharvest.org>"
  );
}
