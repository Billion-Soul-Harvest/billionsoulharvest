"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  Paperclip,
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
  MailOpen,
  Mail,
  Star,
  RefreshCw,
  X,
  AlertTriangle,
  FolderInput,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MailboxMessage } from "@/shared/utils/mailbox/types";

interface Props {
  accountId: string | null;
  folder: string;
  onSelectMessage: (uid: number) => void;
  selectedUid: number | null;
}

export function MessageList({ accountId, folder, onSelectMessage, selectedUid }: Props) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<{ uids: number[] } | null>(null);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const queryClient = useQueryClient();
  const pageSize = 50;

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["mailbox-messages", accountId, folder, page, search],
    queryFn: async () => {
      const params = new URLSearchParams({ folder, page: String(page), pageSize: String(pageSize) });
      if (search) params.set("search", search);
      const res = await fetch(`/api/mailbox/accounts/${accountId}/messages?${params}`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json() as Promise<{
        messages: MailboxMessage[];
        total: number;
        page: number;
        pageSize: number;
      }>;
    },
    enabled: !!accountId,
    staleTime: 60_000,
  });

  const flagMutation = useMutation({
    mutationFn: async ({ uid, action }: { uid: number; action: string }) => {
      const res = await fetch(`/api/mailbox/accounts/${accountId}/messages/${uid}/flags`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, folder }),
      });
      if (!res.ok) throw new Error("Failed to update flag");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mailbox-messages", accountId, folder] });
      queryClient.invalidateQueries({ queryKey: ["mailbox-folders", accountId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (uid: number) => {
      const res = await fetch(`/api/mailbox/accounts/${accountId}/messages/${uid}?folder=${encodeURIComponent(folder)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete message");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mailbox-messages", accountId, folder] });
      queryClient.invalidateQueries({ queryKey: ["mailbox-folders", accountId] });
    },
  });

  const moveMutation = useMutation({
    mutationFn: async ({ uid, targetFolder }: { uid: number; targetFolder: string }) => {
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
      setSelected(new Set());
      setShowMoveMenu(false);
    },
  });

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setSearch(searchInput);
      setPage(1);
    },
    [searchInput]
  );

  const clearSearch = useCallback(() => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  }, []);

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["mailbox-messages", accountId, folder] });
    queryClient.invalidateQueries({ queryKey: ["mailbox-folders", accountId] });
    refetch();
  }, [queryClient, accountId, folder, refetch]);

  const toggleSelect = (uid: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selected.size === messages.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(messages.map((m) => m.uid)));
    }
  };

  const handleBulkDelete = () => {
    const uids = Array.from(selected);
    setConfirmDelete({ uids });
  };

  const confirmBulkDelete = () => {
    if (!confirmDelete) return;
    confirmDelete.uids.forEach((uid) => deleteMutation.mutate(uid));
    setSelected(new Set());
    setConfirmDelete(null);
  };

  const handleBulkMove = (targetFolder: string) => {
    selected.forEach((uid) => moveMutation.mutate({ uid, targetFolder }));
  };

  const messages = data?.messages || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / pageSize);
  const allSelected = messages.length > 0 && selected.size === messages.length;

  if (!accountId) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-400">
        Select an email account to get started
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="p-3 border-b space-y-2">
        <div className="flex items-center gap-2">
          {/* Select All */}
          <input
            type="checkbox"
            checked={allSelected}
            onChange={handleSelectAll}
            className="rounded border-gray-300"
            title={allSelected ? "Deselect all" : "Select all"}
          />

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            disabled={isFetching}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} />
          </button>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search emails..."
              className="pl-8 h-8 pr-8"
            />
            {(searchInput || search) && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        </div>

        {/* Active search indicator */}
        {search && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500">
              Results for &ldquo;{search}&rdquo; ({total} found)
            </span>
            <button onClick={clearSearch} className="text-cyan-600 hover:text-cyan-700 font-medium">
              Clear
            </button>
          </div>
        )}

        {/* Bulk Actions */}
        {selected.size > 0 && (
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <span className="text-gray-500">{selected.size} selected</span>
            <Button variant="outline" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Delete
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                selected.forEach((uid) => flagMutation.mutate({ uid, action: "read" }));
                setSelected(new Set());
              }}
            >
              <MailOpen className="w-3.5 h-3.5 mr-1" />
              Read
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                selected.forEach((uid) => flagMutation.mutate({ uid, action: "unread" }));
                setSelected(new Set());
              }}
            >
              <Mail className="w-3.5 h-3.5 mr-1" />
              Unread
            </Button>
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMoveMenu(!showMoveMenu)}
              >
                <FolderInput className="w-3.5 h-3.5 mr-1" />
                Move
              </Button>
              {showMoveMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMoveMenu(false)} />
                  <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-20 py-1 min-w-[140px]">
                    {["INBOX", "Sent", "Drafts", "Trash", "Junk"].filter((f) => f !== folder).map((f) => (
                      <button
                        key={f}
                        onClick={() => handleBulkMove(f)}
                        className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkMove("Junk")}
              className="text-amber-600"
              title="Mark as spam"
            >
              <AlertTriangle className="w-3.5 h-3.5 mr-1" />
              Spam
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="p-3 bg-red-50 border-b border-red-200 flex items-center gap-3">
          <Trash2 className="w-4 h-4 text-red-500 shrink-0" />
          <span className="text-sm text-red-700 flex-1">
            Delete {confirmDelete.uids.length} message{confirmDelete.uids.length !== 1 ? "s" : ""}? They will be moved to Trash.
          </span>
          <Button size="sm" variant="outline" onClick={() => setConfirmDelete(null)}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={confirmBulkDelete}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Delete
          </Button>
        </div>
      )}

      {/* Loading overlay for pagination/refetch */}
      {isFetching && !isLoading && (
        <div className="px-3 py-1.5 bg-cyan-50 border-b text-xs text-cyan-700 flex items-center gap-1.5">
          <Loader2 className="w-3 h-3 animate-spin" />
          Updating...
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-1 p-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-50 rounded animate-pulse" />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-sm text-gray-400 gap-2">
            {search ? (
              <>
                <span>No messages match &ldquo;{search}&rdquo;</span>
                <button onClick={clearSearch} className="text-cyan-600 hover:text-cyan-700 text-xs font-medium">
                  Clear search
                </button>
              </>
            ) : (
              "No messages in this folder"
            )}
          </div>
        ) : (
          <div className="divide-y">
            {messages.map((msg) => {
              const isUnread = !msg.flags.includes("\\Seen");
              const isStarred = msg.flags.includes("\\Flagged");
              const isSelected = selected.has(msg.uid);
              const isActive = selectedUid === msg.uid;

              return (
                <div
                  key={msg.uid}
                  className={cn(
                    "flex items-start gap-2 px-3 py-2.5 cursor-pointer transition-colors",
                    isActive ? "bg-cyan-50" : isUnread ? "bg-blue-50/40" : "hover:bg-gray-50",
                    isSelected && "bg-cyan-50/50"
                  )}
                  onClick={() => onSelectMessage(msg.uid)}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleSelect(msg.uid);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1.5 rounded border-gray-300"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      flagMutation.mutate({
                        uid: msg.uid,
                        action: isStarred ? "unstar" : "star",
                      });
                    }}
                    className={cn(
                      "mt-1 shrink-0",
                      isStarred ? "text-amber-400" : "text-gray-300 hover:text-amber-300"
                    )}
                  >
                    <Star className="w-4 h-4" fill={isStarred ? "currentColor" : "none"} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-sm truncate",
                          isUnread ? "font-semibold text-gray-900" : "text-gray-700"
                        )}
                      >
                        {msg.from?.name || msg.from?.address || "Unknown"}
                      </span>
                      <span className="text-xs text-gray-400 shrink-0 ml-auto">
                        {msg.date ? formatDate(msg.date) : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-cyan-500 shrink-0" />
                      )}
                      <p
                        className={cn(
                          "text-sm truncate",
                          isUnread ? "font-medium text-gray-900" : "text-gray-600"
                        )}
                      >
                        {msg.subject}
                      </p>
                      {msg.hasAttachments && (
                        <Paperclip className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      )}
                    </div>
                    {msg.preview && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">{msg.preview}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-2 border-t flex items-center justify-between text-sm">
          <span className="text-gray-500">
            Page {page} of {totalPages} ({total} total)
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  if (isYesterday) {
    return "Yesterday";
  }
  if (now.getFullYear() === date.getFullYear()) {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}
