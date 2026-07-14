import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/shared/utils/supabase/server";
import { withImapClient } from "@/shared/utils/mailbox/imap-client";
import { parseFullMessage } from "@/shared/utils/mailbox/email-parser";

export const maxDuration = 30;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string; uid: string }> }
) {
  try {
    const authSupabase = await createServerClient();
    const { data: { user } } = await authSupabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { accountId, uid: uidStr } = await params;
    const messageUid = parseInt(uidStr, 10);
    const url = new URL(request.url);
    const folder = url.searchParams.get("folder") || "INBOX";

    const message = await withImapClient(accountId, async (client) => {
      const lock = await client.getMailboxLock(folder);
      try {
        // Fetch envelope, flags, structure
        let msgData = null;
        for await (const msg of client.fetch(messageUid, {
          uid: true,
          envelope: true,
          flags: true,
          bodyStructure: true,
          source: true,
        })) {
          msgData = msg;
        }

        if (!msgData) return null;

        // Parse body from the already-fetched source
        let htmlBody: string | null = null;
        let textBody: string | null = null;

        if (msgData.source) {
          const raw = Buffer.from(msgData.source).toString("utf8");

          // Try to extract HTML from the raw source
          const htmlMatch = raw.match(/<html[\s\S]*<\/html>/i);
          if (htmlMatch) {
            htmlBody = htmlMatch[0];
          } else {
            // Look for content after last boundary delimiter
            const bodyMatch = raw.match(/content-type:\s*text\/html[^\r\n]*\r?\n(?:.*\r?\n)*?\r?\n([\s\S]*?)(?:--[\w-]+|$)/i);
            if (bodyMatch) {
              htmlBody = bodyMatch[1].trim();
            }
          }

          if (!htmlBody) {
            const textMatch = raw.match(/content-type:\s*text\/plain[^\r\n]*\r?\n(?:.*\r?\n)*?\r?\n([\s\S]*?)(?:--[\w-]+|$)/i);
            if (textMatch) {
              textBody = textMatch[1].trim();
            } else if (!raw.includes("Content-Type:")) {
              textBody = raw;
            }
          }
        }

        // Mark as read
        try {
          await client.messageFlagsAdd(messageUid, ["\\Seen"], { uid: true });
        } catch {
          // Non-critical
        }

        return parseFullMessage(msgData, htmlBody, textBody);
      } finally {
        lock.release();
      }
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json(message);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to fetch message" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string; uid: string }> }
) {
  try {
    const authSupabase = await createServerClient();
    const { data: { user } } = await authSupabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { accountId, uid: uidStr } = await params;
    const messageUid = parseInt(uidStr, 10);
    const url = new URL(request.url);
    const folder = url.searchParams.get("folder") || "INBOX";

    await withImapClient(accountId, async (client) => {
      const lock = await client.getMailboxLock(folder);
      try {
        // Try to move to Trash
        try {
          await client.messageMove(messageUid, "Trash", { uid: true });
        } catch {
          // If Trash doesn't exist, try [Gmail]/Trash or just delete
          try {
            await client.messageMove(messageUid, "[Gmail]/Trash", { uid: true });
          } catch {
            await client.messageFlagsAdd(messageUid, ["\\Deleted"], { uid: true });
            await client.messageDelete(messageUid, { uid: true });
          }
        }
      } finally {
        lock.release();
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to delete message" }, { status: 500 });
  }
}
