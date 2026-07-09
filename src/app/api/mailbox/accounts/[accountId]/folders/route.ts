import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/shared/utils/supabase/server";
import { withImapClient } from "@/shared/utils/mailbox/imap-client";
import type { MailboxFolder } from "@/shared/utils/mailbox/types";

export const maxDuration = 30;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const authSupabase = await createServerClient();
    const { data: { user } } = await authSupabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { accountId } = await params;

    const folders = await withImapClient(accountId, async (client) => {
      const list = await client.list();
      const result: MailboxFolder[] = [];

      for (const folder of list) {
        let messageCount = 0;
        let unseenCount = 0;

        try {
          const status = await client.status(folder.path, {
            messages: true,
            unseen: true,
          });
          messageCount = status.messages || 0;
          unseenCount = status.unseen || 0;
        } catch {
          // Some folders may not support STATUS
        }

        result.push({
          path: folder.path,
          name: folder.name,
          specialUse: folder.specialUse || undefined,
          messageCount,
          unseenCount,
        });
      }

      return result;
    });

    return NextResponse.json(folders);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to list folders" }, { status: 500 });
  }
}
