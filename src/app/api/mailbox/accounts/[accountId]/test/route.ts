import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/shared/utils/supabase/server";
import { getServiceSupabase } from "@/features/email/send-campaign";
import { decryptPassword } from "@/shared/utils/mailbox/crypto";
import { testImapConnection } from "@/shared/utils/mailbox/imap-client";
import { testSmtpConnection } from "@/shared/utils/mailbox/smtp-client";
import type { EmailAccount } from "@/shared/utils/mailbox/types";

export const maxDuration = 30;

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const authSupabase = await createServerClient();
    const { data: { user } } = await authSupabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { accountId } = await params;
    const supabase = getServiceSupabase();
    const { data: account, error } = await supabase
      .from("email_accounts")
      .select("*")
      .eq("id", accountId)
      .single();

    if (error || !account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const acct = account as EmailAccount;
    const password = decryptPassword(acct.encrypted_password);

    const [imapResult, smtpResult] = await Promise.all([
      testImapConnection({
        imap_host: acct.imap_host,
        imap_port: acct.imap_port,
        username: acct.username,
        password,
      }),
      testSmtpConnection({
        smtp_host: acct.smtp_host,
        smtp_port: acct.smtp_port,
        username: acct.username,
        password,
      }),
    ]);

    return NextResponse.json({
      imap: imapResult,
      smtp: smtpResult,
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Test failed" }, { status: 500 });
  }
}
