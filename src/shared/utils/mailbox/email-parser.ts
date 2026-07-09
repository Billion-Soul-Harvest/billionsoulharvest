import type { FetchMessageObject } from "imapflow";
import type { MailboxMessage, MailboxMessageFull, AttachmentMeta } from "./types";

function parseAddress(addr: { name?: string; address?: string } | undefined) {
  if (!addr) return null;
  return { name: addr.name || "", address: addr.address || "" };
}

function parseAddressList(addrs: { name?: string; address?: string }[] | undefined) {
  if (!addrs || !Array.isArray(addrs)) return [];
  return addrs.map((a) => ({ name: a.name || "", address: a.address || "" }));
}

export function parseEnvelope(msg: FetchMessageObject): MailboxMessage {
  const envelope = msg.envelope;
  const flags = Array.from(msg.flags || []);

  // Check for attachments from bodyStructure
  const hasAttachments = checkHasAttachments(msg.bodyStructure);

  // Extract preview from the envelope or a snippet
  let preview = "";
  if (msg.bodyStructure?.type === "text/plain" && "content" in msg) {
    preview = String((msg as Record<string, unknown>).content || "").slice(0, 200);
  }

  return {
    uid: msg.uid,
    messageId: envelope?.messageId || null,
    subject: envelope?.subject || "(no subject)",
    from: envelope?.from?.[0] ? parseAddress(envelope.from[0]) : null,
    to: parseAddressList(envelope?.to),
    date: envelope?.date ? new Date(envelope.date).toISOString() : null,
    flags,
    preview,
    hasAttachments,
  };
}

function checkHasAttachments(structure: FetchMessageObject["bodyStructure"]): boolean {
  if (!structure) return false;
  if (structure.disposition === "attachment") return true;
  if (structure.childNodes) {
    return structure.childNodes.some((child) => checkHasAttachments(child));
  }
  return false;
}

export function extractAttachments(structure: FetchMessageObject["bodyStructure"]): AttachmentMeta[] {
  const attachments: AttachmentMeta[] = [];

  function walk(node: FetchMessageObject["bodyStructure"], partPath: string) {
    if (!node) return;
    if (node.disposition === "attachment" || (node.disposition === "inline" && node.dispositionParameters?.filename)) {
      attachments.push({
        partId: partPath || node.part || "1",
        filename: node.dispositionParameters?.filename || node.parameters?.name || "attachment",
        size: node.size || 0,
        contentType: node.type || "application/octet-stream",
      });
    }
    if (node.childNodes) {
      node.childNodes.forEach((child, i) => {
        walk(child, child.part || `${partPath ? partPath + "." : ""}${i + 1}`);
      });
    }
  }

  walk(structure, "");
  return attachments;
}

export function sanitizeHtml(html: string): string {
  // Strip dangerous tags. The HTML is also rendered in a sandbox="" iframe
  // on the client, which provides a second layer of protection.
  return html
    .replace(/<script[\s>][\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s>][\s\S]*?<\/iframe>/gi, "")
    .replace(/<object[\s>][\s\S]*?<\/object>/gi, "")
    .replace(/<embed[\s>][\s\S]*?(?:\/>|<\/embed>)/gi, "")
    .replace(/<form[\s>][\s\S]*?<\/form>/gi, "")
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, "")
    .replace(/javascript\s*:/gi, "");
}

export function parseFullMessage(
  msg: FetchMessageObject,
  htmlBody: string | null,
  textBody: string | null
): MailboxMessageFull {
  const base = parseEnvelope(msg);
  const envelope = msg.envelope;

  return {
    ...base,
    htmlBody: htmlBody ? sanitizeHtml(htmlBody) : null,
    textBody: textBody || null,
    cc: parseAddressList(envelope?.cc),
    attachments: extractAttachments(msg.bodyStructure),
    inReplyTo: envelope?.inReplyTo || null,
    references: (msg as unknown as Record<string, unknown>).references as string | null ?? null,
  };
}
