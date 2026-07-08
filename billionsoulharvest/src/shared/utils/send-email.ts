import nodemailer from "nodemailer";

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

function getTransport() {
  const port = Number(process.env.SMTP_PORT || 587);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.hostinger.com",
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
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
