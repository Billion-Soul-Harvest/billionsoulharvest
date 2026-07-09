import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/shared/utils/supabase/server";
import { withImapClient } from "@/shared/utils/mailbox/imap-client";

export const maxDuration = 30;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string; uid: string; partId: string }> }
) {
  try {
    const authSupabase = await createServerClient();
    const { data: { user } } = await authSupabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { accountId, uid: uidStr, partId } = await params;
    const messageUid = parseInt(uidStr, 10);
    const url = new URL(request.url);
    const folder = url.searchParams.get("folder") || "INBOX";

    const result = await withImapClient(accountId, async (client) => {
      const lock = await client.getMailboxLock(folder);
      try {
        const download = await client.download(messageUid, partId, { uid: true });
        if (!download?.content) return null;

        const chunks: Buffer[] = [];
        for await (const chunk of download.content) {
          chunks.push(Buffer.from(chunk));
        }

        return {
          data: Buffer.concat(chunks),
          contentType: download.meta?.contentType || "application/octet-stream",
          filename: download.meta?.filename || "attachment",
        };
      } finally {
        lock.release();
      }
    });

    if (!result) {
      return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
    }

    return new NextResponse(result.data, {
      headers: {
        "Content-Type": result.contentType,
        "Content-Disposition": `attachment; filename="${result.filename}"`,
        "Content-Length": String(result.data.length),
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to download attachment" }, { status: 500 });
  }
}
