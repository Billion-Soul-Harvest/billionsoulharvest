import { createClient } from "@supabase/supabase-js";

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

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function sendEmails(
  emails: EmailPayload[]
): Promise<EmailResult[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase.functions.invoke("send-email", {
    body: { emails },
  });

  if (error) {
    throw new Error(`Edge function error: ${error.message}`);
  }

  return data.results as EmailResult[];
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
