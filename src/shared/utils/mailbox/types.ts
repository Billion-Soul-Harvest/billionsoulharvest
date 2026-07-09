export interface EmailAccount {
  id: string;
  label: string;
  email_address: string;
  imap_host: string;
  imap_port: number;
  smtp_host: string;
  smtp_port: number;
  username: string;
  encrypted_password: string;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface MailboxFolder {
  path: string;
  name: string;
  specialUse?: string;
  messageCount: number;
  unseenCount: number;
}

export interface MailboxMessage {
  uid: number;
  messageId: string | null;
  subject: string;
  from: { name: string; address: string } | null;
  to: { name: string; address: string }[];
  date: string | null;
  flags: string[];
  preview: string;
  hasAttachments: boolean;
}

export interface AttachmentMeta {
  partId: string;
  filename: string;
  size: number;
  contentType: string;
}

export interface MailboxMessageFull extends MailboxMessage {
  htmlBody: string | null;
  textBody: string | null;
  cc: { name: string; address: string }[];
  attachments: AttachmentMeta[];
  inReplyTo: string | null;
  references: string | null;
}

export interface SendMailOptions {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  html: string;
  inReplyTo?: string;
  references?: string;
}
