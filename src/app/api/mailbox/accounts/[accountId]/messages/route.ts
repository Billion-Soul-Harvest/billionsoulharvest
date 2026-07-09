import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/shared/utils/supabase/server";
import { withImapClient } from "@/shared/utils/mailbox/imap-client";
import { parseEnvelope } from "@/shared/utils/mailbox/email-parser";
import type { MailboxMessage } from "@/shared/utils/mailbox/types";

export const maxDuration = 30;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const authSupabase = await createServerClient();
    const { data: { user } } = await authSupabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { accountId } = await params;
    const url = new URL(request.url);
    const folder = url.searchParams.get("folder") || "INBOX";
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const pageSize = parseInt(url.searchParams.get("pageSize") || "50", 10);
    const search = url.searchParams.get("search") || "";

    const result = await withImapClient(accountId, async (client) => {
      const lock = await client.getMailboxLock(folder);
      try {
        const mailbox = client.mailbox;
        const total = mailbox && typeof mailbox === "object" && "exists" in mailbox ? (mailbox.exists as number) : 0;

        if (total === 0) {
          return { messages: [], total: 0, page, pageSize };
        }

        let uids: number[];

        if (search) {
          // IMAP SEARCH
          const searchResult = await client.search({
            or: [
              { subject: search },
              { from: search },
              { to: search },
              { body: search },
            ],
          });
          uids = searchResult as unknown as number[];
          uids.reverse(); // Newest first
        } else {
          // Fetch by sequence range (newest first)
          const end = total;
          const start = Math.max(1, end - (page * pageSize) + 1);
          const rangeEnd = Math.max(1, end - ((page - 1) * pageSize));

          const searchResult = await client.search({ seq: `${start}:${rangeEnd}` });
          uids = searchResult as unknown as number[];
          uids.reverse();
        }

        // Paginate search results
        const paginatedUids = search
          ? uids.slice((page - 1) * pageSize, page * pageSize)
          : uids;

        if (paginatedUids.length === 0) {
          return { messages: [], total: search ? uids.length : total, page, pageSize };
        }

        const messages: MailboxMessage[] = [];
        for await (const msg of client.fetch(paginatedUids, {
          uid: true,
          envelope: true,
          flags: true,
          bodyStructure: true,
        })) {
          messages.push(parseEnvelope(msg));
        }

        // Sort newest first
        messages.sort((a, b) => {
          if (!a.date || !b.date) return 0;
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        return {
          messages,
          total: search ? uids.length : total,
          page,
          pageSize,
        };
      } finally {
        lock.release();
      }
    });

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to fetch messages" }, { status: 500 });
  }
}
