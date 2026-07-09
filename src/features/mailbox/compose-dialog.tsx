"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WysiwygEditor } from "@/shared/components/wysiwyg-editor";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import type { MailboxMessageFull } from "@/shared/utils/mailbox/types";

type ComposeMode = "new" | "reply" | "replyAll" | "forward";

interface EmailAccountPublic {
  id: string;
  label: string;
  email_address: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: EmailAccountPublic[];
  activeAccountId: string;
  mode: ComposeMode;
  originalMessage?: MailboxMessageFull | null;
  folder?: string;
}

function buildQuotedBody(msg: MailboxMessageFull): string {
  const date = msg.date ? new Date(msg.date).toLocaleString() : "Unknown date";
  const from = msg.from ? `${msg.from.name} &lt;${msg.from.address}&gt;` : "Unknown";
  const header = `<br><br><div style="border-left: 2px solid #ccc; padding-left: 12px; margin-left: 4px; color: #666;">On ${date}, ${from} wrote:<br><br>`;
  const body = msg.htmlBody || msg.textBody?.replace(/\n/g, "<br>") || "";
  return `${header}${body}</div>`;
}

export function ComposeDialog({
  open,
  onOpenChange,
  accounts,
  activeAccountId,
  mode,
  originalMessage,
  folder,
}: Props) {
  const [fromAccountId, setFromAccountId] = useState(activeAccountId);
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setSending(false);
    setFromAccountId(activeAccountId);
    setShowCcBcc(false);

    if (mode === "new" || !originalMessage) {
      setTo("");
      setCc("");
      setBcc("");
      setSubject("");
      setBody("");
      return;
    }

    const msg = originalMessage;
    const fromAddr = msg.from?.address || "";

    switch (mode) {
      case "reply":
        setTo(fromAddr);
        setCc("");
        setSubject(msg.subject.startsWith("Re:") ? msg.subject : `Re: ${msg.subject}`);
        setBody(buildQuotedBody(msg));
        break;
      case "replyAll": {
        setTo(fromAddr);
        const ccAddrs = [
          ...msg.to.map((a) => a.address),
          ...msg.cc.map((a) => a.address),
        ].filter(
          (addr) =>
            addr !== fromAddr &&
            !accounts.some((a) => a.email_address === addr)
        );
        setCc(ccAddrs.join(", "));
        if (ccAddrs.length > 0) setShowCcBcc(true);
        setSubject(msg.subject.startsWith("Re:") ? msg.subject : `Re: ${msg.subject}`);
        setBody(buildQuotedBody(msg));
        break;
      }
      case "forward":
        setTo("");
        setCc("");
        setSubject(msg.subject.startsWith("Fwd:") ? msg.subject : `Fwd: ${msg.subject}`);
        setBody(buildQuotedBody(msg));
        break;
    }
  }, [open, mode, originalMessage, activeAccountId, accounts]);

  async function handleSend() {
    if (!to.trim() || !subject.trim()) return;

    setSending(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {
        to: to.trim(),
        subject: subject.trim(),
        html: body || "<p></p>",
      };
      if (cc.trim()) payload.cc = cc.trim();
      if (bcc.trim()) payload.bcc = bcc.trim();

      // Threading headers for replies
      if ((mode === "reply" || mode === "replyAll") && originalMessage) {
        if (originalMessage.messageId) payload.inReplyTo = originalMessage.messageId;
        if (originalMessage.references) {
          payload.references = originalMessage.messageId
            ? `${originalMessage.references} ${originalMessage.messageId}`
            : originalMessage.references;
        } else if (originalMessage.messageId) {
          payload.references = originalMessage.messageId;
        }
      }

      const res = await fetch(`/api/mailbox/accounts/${fromAccountId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Send failed");
      }

      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed");
    } finally {
      setSending(false);
    }
  }

  async function handleSaveDraft() {
    try {
      await fetch(`/api/mailbox/accounts/${fromAccountId}/drafts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, cc, subject, html: body }),
      });
      onOpenChange(false);
    } catch {
      setError("Failed to save draft");
    }
  }

  const titles: Record<ComposeMode, string> = {
    new: "New Email",
    reply: "Reply",
    replyAll: "Reply All",
    forward: "Forward",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{titles[mode]}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 flex-1 overflow-y-auto">
          {/* From selector */}
          {accounts.length > 1 && (
            <div>
              <Label>From</Label>
              <select
                value={fromAccountId}
                onChange={(e) => setFromAccountId(e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label} &lt;{a.email_address}&gt;
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <Label htmlFor="compose-to">To</Label>
            <Input
              id="compose-to"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
              className="mt-1"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowCcBcc(!showCcBcc)}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            {showCcBcc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            Cc / Bcc
          </button>

          {showCcBcc && (
            <>
              <div>
                <Label htmlFor="compose-cc">Cc</Label>
                <Input
                  id="compose-cc"
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="compose-bcc">Bcc</Label>
                <Input
                  id="compose-bcc"
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                  className="mt-1"
                />
              </div>
            </>
          )}

          <div>
            <Label htmlFor="compose-subject">Subject</Label>
            <Input
              id="compose-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Body</Label>
            <WysiwygEditor value={body} onChange={setBody} />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleSaveDraft} disabled={sending}>
            Save Draft
          </Button>
          <Button
            onClick={handleSend}
            disabled={sending || !to.trim() || !subject.trim()}
          >
            {sending && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
