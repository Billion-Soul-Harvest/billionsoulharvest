import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/shared/utils/supabase/server";
import { withImapClient } from "@/shared/utils/mailbox/imap-client";

export const maxDuration = 30;

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string; uid: string }> }
) {
  try {
    const authSupabase = await createServerClient();
    const { data: { user } } = await authSupabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { accountId, uid: uidStr } = await params;
    const messageUid = parseInt(uidStr, 10);
    const body = await request.json();
    const { action, folder, targetFolder } = body as { action: string; folder?: string; targetFolder?: string };

    await withImapClient(accountId, async (client) => {
      const lock = await client.getMailboxLock(folder || "INBOX");
      try {
        switch (action) {
          case "read":
            await client.messageFlagsAdd(messageUid, ["\\Seen"], { uid: true });
            break;
          case "unread":
            await client.messageFlagsRemove(messageUid, ["\\Seen"], { uid: true });
            break;
          case "star":
            await client.messageFlagsAdd(messageUid, ["\\Flagged"], { uid: true });
            break;
          case "unstar":
            await client.messageFlagsRemove(messageUid, ["\\Flagged"], { uid: true });
            break;
          case "move":
            if (!targetFolder) throw new Error("targetFolder is required for move action");
            await client.messageMove(messageUid, targetFolder, { uid: true });
            break;
          default:
            throw new Error(`Unknown action: ${action}`);
        }
      } finally {
        lock.release();
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to update flags" }, { status: 500 });
  }
}
