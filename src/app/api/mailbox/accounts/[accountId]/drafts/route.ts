import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/shared/utils/supabase/server";
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
    const { to, cc, subject, html } = body;

    await withImapClient(accountId, async (client, account) => {
      const rawMessage = [
        `From: ${account.label} <${account.email_address}>`,
        to ? `To: ${to}` : "",
        cc ? `Cc: ${cc}` : "",
        subject ? `Subject: ${subject}` : "",
        `Date: ${new Date().toUTCString()}`,
        "MIME-Version: 1.0",
        'Content-Type: text/html; charset="UTF-8"',
        "",
        html || "",
      ]
        .filter(Boolean)
        .join("\r\n");

      // Try common Drafts folder names
      const draftFolders = ["Drafts", "INBOX.Drafts", "[Gmail]/Drafts", "Draft"];
      for (const draftFolder of draftFolders) {
        try {
          await client.append(draftFolder, Buffer.from(rawMessage), ["\\Draft"]);
          return;
        } catch {
          continue;
        }
      }
      throw new Error("Could not find Drafts folder");
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to save draft" }, { status: 500 });
  }
}
