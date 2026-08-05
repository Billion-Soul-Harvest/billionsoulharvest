import { Resend } from "resend";
import { createServiceClient } from "@/shared/utils/supabase/service";
import { recordEmailsSent } from "@/shared/utils/daily-email-quota";

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  from?: string;
  cc?: string;
  replyTo?: string;
  headers?: Record<string, string>;
}

interface EmailResult {
  to: string;
  success: boolean;
  messageId?: string;
  error?: string;
}

let resendClient: Resend | null = null;

function getResend(): Resend {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

export async function sendEmailsViaResend(
  emails: EmailPayload[]
): Promise<EmailResult[]> {
  const resend = getResend();
  const results: EmailResult[] = [];

  for (const email of emails) {
    try {
      const { data, error } = await resend.emails.send({
        from: email.from || "Billion Soul Harvest <info@billionsoulharvest.org>",
        to: [email.to],
        subject: email.subject,
        html: email.html,
        replyTo: email.replyTo,
        headers: email.headers,
      });

      if (error) {
        results.push({
          to: email.to,
          success: false,
          error: error.message,
        });
      } else {
        results.push({
          to: email.to,
          success: true,
          messageId: data?.id,
        });
      }
    } catch (err) {
      results.push({
        to: email.to,
        success: false,
        error: err instanceof Error ? err.message : "Send failed",
      });
    }
  }

  const successCount = results.filter((r) => r.success).length;
  if (successCount > 0) {
    const supabase = createServiceClient();
    await recordEmailsSent(supabase, successCount);
  }

  return results;
}
