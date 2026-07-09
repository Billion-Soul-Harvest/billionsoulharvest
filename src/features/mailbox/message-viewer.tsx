"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  Reply,
  ReplyAll,
  Forward,
  Trash2,
  MailOpen,
  Paperclip,
  Download,
  ArrowLeft,
  X,
  AlertTriangle,
  FolderInput,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MailboxMessageFull } from "@/shared/utils/mailbox/types";

interface Props {
  accountId: string;
  uid: number;
  folder: string;
  onClose: () => void;
  onReply: (mode: "reply" | "replyAll" | "forward", message: MailboxMessageFull) => void;
}

export function MessageViewer({ accountId, uid, folder, onClose, onReply }: Props) {
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: message, isLoading, isError, refetch } = useQuery({
    queryKey: ["mailbox-message", accountId, uid, folder],
    queryFn: async () => {
      const res = await fetch(
        `/api/mailbox/accounts/${accountId}/messages/${uid}?folder=${encodeURIComponent(folder)}`
      );
      if (!res.ok) throw new Error("Failed to fetch message");
      return res.json() as Promise<MailboxMessageFull>;
    },
    staleTime: 5 * 60_000,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `/api/mailbox/accounts/${accountId}/messages/${uid}?folder=${encodeURIComponent(folder)}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete message");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mailbox-messages", accountId, folder] });
      queryClient.invalidateQueries({ queryKey: ["mailbox-folders", accountId] });
      onClose();
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Delete failed");
    },
  });

  const flagMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/mailbox/accounts/${accountId}/messages/${uid}/flags`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unread", folder }),
      });
      if (!res.ok) throw new Error("Failed to mark as unread");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mailbox-messages", accountId, folder] });
      onClose();
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Failed to update");
    },
  });

  const moveMutation = useMutation({
    mutationFn: async (targetFolder: string) => {
      const res = await fetch(`/api/mailbox/accounts/${accountId}/messages/${uid}/flags`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "move", folder, targetFolder }),
      });
      if (!res.ok) throw new Error("Failed to move message");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mailbox-messages", accountId, folder] });
      queryClient.invalidateQueries({ queryKey: ["mailbox-folders", accountId] });
      onClose();
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Move failed");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (isError || !message) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-sm text-gray-400">
        <span>Failed to load message</span>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-1" />
          Retry
        </Button>
      </div>
    );
  }

  const formatAddr = (addr: { name: string; address: string }) =>
    addr.name ? `${addr.name} <${addr.address}>` : addr.address;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onClose} className="lg:hidden">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onClose} className="hidden lg:flex">
            <X className="w-4 h-4" />
          </Button>
          <div className="flex-1" />
          <div className="flex items-center gap-1 flex-wrap justify-end">
            <Button variant="outline" size="sm" onClick={() => onReply("reply", message)}>
              <Reply className="w-4 h-4 mr-1" />
              Reply
            </Button>
            <Button variant="outline" size="sm" onClick={() => onReply("replyAll", message)}>
              <ReplyAll className="w-4 h-4 mr-1" />
              All
            </Button>
            <Button variant="outline" size="sm" onClick={() => onReply("forward", message)}>
              <Forward className="w-4 h-4 mr-1" />
              Fwd
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => flagMutation.mutate()}
              disabled={flagMutation.isPending}
              title="Mark unread"
            >
              <MailOpen className="w-4 h-4" />
            </Button>
            {/* Move */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMoveMenu(!showMoveMenu)}
                title="Move to folder"
              >
                <FolderInput className="w-4 h-4" />
              </Button>
              {showMoveMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMoveMenu(false)} />
                  <div className="absolute top-full right-0 mt-1 bg-white border rounded-lg shadow-lg z-20 py-1 min-w-[140px]">
                    {["INBOX", "Sent", "Drafts", "Trash", "Junk"].filter((f) => f !== folder).map((f) => (
                      <button
                        key={f}
                        onClick={() => { moveMutation.mutate(f); setShowMoveMenu(false); }}
                        className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            {/* Spam */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => moveMutation.mutate("Junk")}
              disabled={moveMutation.isPending}
              className="text-amber-600 hover:text-amber-700"
              title="Mark as spam"
            >
              <AlertTriangle className="w-4 h-4" />
            </Button>
            {/* Delete with confirmation */}
            {confirmDelete ? (
              <div className="flex items-center gap-1 ml-1">
                <span className="text-xs text-red-600">Delete?</span>
                <Button
                  size="sm"
                  onClick={() => { deleteMutation.mutate(); setConfirmDelete(false); }}
                  disabled={deleteMutation.isPending}
                  className="bg-red-600 hover:bg-red-700 text-white h-7 px-2 text-xs"
                >
                  Yes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmDelete(false)}
                  className="h-7 px-2 text-xs"
                >
                  No
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmDelete(true)}
                className="text-red-600 hover:text-red-700"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Error feedback */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center justify-between">
            <span className="text-sm text-red-700">{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <h2 className="text-lg font-semibold text-gray-900">{message.subject}</h2>

        <div className="space-y-1 text-sm">
          <div className="flex gap-2">
            <span className="text-gray-500 w-12 shrink-0">From</span>
            <span className="text-gray-900 font-medium">
              {message.from ? formatAddr(message.from) : "Unknown"}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-500 w-12 shrink-0">To</span>
            <span className="text-gray-700">
              {message.to.length > 0 ? message.to.map(formatAddr).join(", ") : "Undisclosed recipients"}
            </span>
          </div>
          {message.cc.length > 0 && (
            <div className="flex gap-2">
              <span className="text-gray-500 w-12 shrink-0">Cc</span>
              <span className="text-gray-700">{message.cc.map(formatAddr).join(", ")}</span>
            </div>
          )}
          <div className="flex gap-2">
            <span className="text-gray-500 w-12 shrink-0">Date</span>
            <span className="text-gray-700">
              {message.date ? new Date(message.date).toLocaleString() : "Unknown"}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto">
        {message.htmlBody ? (
          <iframe
            srcDoc={message.htmlBody}
            title="Email content"
            className="w-full h-full border-0"
            sandbox=""
            style={{ minHeight: "400px" }}
          />
        ) : message.textBody ? (
          <pre className="p-4 text-sm text-gray-700 whitespace-pre-wrap font-sans">
            {message.textBody}
          </pre>
        ) : (
          <div className="p-4 text-sm text-gray-400">No content available</div>
        )}
      </div>

      {/* Attachments */}
      {message.attachments.length > 0 && (
        <div className="border-t p-3">
          <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-2">
            <Paperclip className="w-4 h-4" />
            {message.attachments.length} attachment{message.attachments.length !== 1 ? "s" : ""}
          </div>
          <div className="flex flex-wrap gap-2">
            {message.attachments.map((att) => (
              <a
                key={att.partId}
                href={`/api/mailbox/accounts/${accountId}/messages/${uid}/attachments/${att.partId}?folder=${encodeURIComponent(folder)}`}
                download={att.filename}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-gray-400" />
                <span className="truncate max-w-[200px]">{att.filename}</span>
                <span className="text-xs text-gray-400">
                  {att.size > 1024 * 1024
                    ? `${(att.size / 1024 / 1024).toFixed(1)} MB`
                    : `${Math.round(att.size / 1024)} KB`}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
