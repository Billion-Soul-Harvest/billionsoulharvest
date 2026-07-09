import { ImapFlow } from "imapflow";
import { getServiceSupabase } from "@/features/email/send-campaign";
import { decryptPassword } from "./crypto";
import type { EmailAccount } from "./types";

async function getAccount(accountId: string): Promise<EmailAccount> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("email_accounts")
    .select("*")
    .eq("id", accountId)
    .single();
  if (error || !data) throw new Error("Email account not found");
  return data as EmailAccount;
}

function createImapClient(account: EmailAccount, password: string): ImapFlow {
  return new ImapFlow({
    host: account.imap_host,
    port: account.imap_port,
    secure: account.imap_port === 993,
    auth: {
      user: account.username,
      pass: password,
    },
    logger: false,
  });
}

export async function withImapClient<T>(
  accountId: string,
  callback: (client: ImapFlow, account: EmailAccount) => Promise<T>
): Promise<T> {
  const account = await getAccount(accountId);
  const password = decryptPassword(account.encrypted_password);
  const client = createImapClient(account, password);

  await client.connect();
  try {
    return await callback(client, account);
  } finally {
    await client.logout();
  }
}

export async function testImapConnection(account: {
  imap_host: string;
  imap_port: number;
  username: string;
  password: string;
}): Promise<{ success: boolean; error?: string }> {
  const client = new ImapFlow({
    host: account.imap_host,
    port: account.imap_port,
    secure: account.imap_port === 993,
    auth: {
      user: account.username,
      pass: account.password,
    },
    logger: false,
  });

  try {
    await client.connect();
    await client.logout();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "IMAP connection failed",
    };
  }
}
