import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/shared/utils/supabase/server";
import { sendMail } from "@/shared/utils/mailbox/smtp-client";
import { withImapClient } from "@/shared/utils/mailbox/imap-client";

export const maxDuration = 30;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const authSupabase = await createServerClient();
    const { data: { user } } = await authSupabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { accountId } = await params;
    const body = await request.json();
    const { to, cc, bcc, subject, html, inReplyTo, references } = body;

    if (!to || !subject || !html) {
      return NextResponse.json({ error: "to, subject, and html are required" }, { status: 400 });
    }

    // Send via SMTP
    const result = await sendMail(accountId, {
      to,
      cc,
      bcc,
      subject,
      html,
      inReplyTo,
      references,
    });

    // Append to Sent folder
    try {
      await withImapClient(accountId, async (client, account) => {
        // Build raw RFC 822 message for append
        const rawMessage = [
          `From: ${account.label} <${account.email_address}>`,
          `To: ${to}`,
          cc ? `Cc: ${cc}` : "",
          `Subject: ${subject}`,
          `Date: ${new Date().toUTCString()}`,
          inReplyTo ? `In-Reply-To: ${inReplyTo}` : "",
          references ? `References: ${references}` : "",
          `Message-ID: ${result.messageId || `<${Date.now()}@${account.smtp_host}>`}`,
          "MIME-Version: 1.0",
          'Content-Type: text/html; charset="UTF-8"',
          "",
          html,
        ]
          .filter(Boolean)
          .join("\r\n");

        // Try common Sent folder names
        const sentFolders = ["Sent", "INBOX.Sent", "[Gmail]/Sent Mail", "Sent Messages", "Sent Items"];
        for (const sentFolder of sentFolders) {
          try {
            await client.append(sentFolder, Buffer.from(rawMessage), ["\\Seen"]);
            return;
          } catch {
            continue;
          }
        }
      });
    } catch {
      // Non-critical: email was sent, just couldn't save to Sent folder
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to send email" }, { status: 500 });
  }
}
