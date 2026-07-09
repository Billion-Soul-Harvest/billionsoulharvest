import nodemailer from "nodemailer";
import { getServiceSupabase } from "@/features/email/send-campaign";
import { decryptPassword } from "./crypto";
import type { EmailAccount, SendMailOptions } from "./types";

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

export async function sendMail(accountId: string, options: SendMailOptions) {
  const account = await getAccount(accountId);
  const password = decryptPassword(account.encrypted_password);

  const transport = nodemailer.createTransport({
    host: account.smtp_host,
    port: account.smtp_port,
    secure: account.smtp_port === 465,
    auth: {
      user: account.username,
      pass: password,
    },
    tls: { servername: account.smtp_host },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  try {
    const info = await transport.sendMail({
      from: `${account.label} <${account.email_address}>`,
      to: options.to,
      cc: options.cc,
      bcc: options.bcc,
      subject: options.subject,
      html: options.html,
      inReplyTo: options.inReplyTo,
      references: options.references,
    });

    return { success: true, messageId: info.messageId };
  } finally {
    transport.close();
  }
}

export async function testSmtpConnection(account: {
  smtp_host: string;
  smtp_port: number;
  username: string;
  password: string;
}): Promise<{ success: boolean; error?: string }> {
  const transport = nodemailer.createTransport({
    host: account.smtp_host,
    port: account.smtp_port,
    secure: account.smtp_port === 465,
    auth: {
      user: account.username,
      pass: account.password,
    },
    tls: { servername: account.smtp_host },
    connectionTimeout: 10000,
  });

  try {
    await transport.verify();
    transport.close();
    return { success: true };
  } catch (err) {
    transport.close();
    return {
      success: false,
      error: err instanceof Error ? err.message : "SMTP connection failed",
    };
  }
}
