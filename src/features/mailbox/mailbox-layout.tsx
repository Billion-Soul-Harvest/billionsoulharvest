"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AccountSwitcher } from "./account-switcher";
import { FolderSidebar } from "./folder-sidebar";
import { MessageList } from "./message-list";
import { MessageViewer } from "./message-viewer";
import { ComposeDialog } from "./compose-dialog";
import { Button } from "@/components/ui/button";
import { Loader2, PenSquare, Settings, Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import type { MailboxFolder, MailboxMessageFull } from "@/shared/utils/mailbox/types";

interface EmailAccountPublic {
  id: string;
  label: string;
  email_address: string;
  is_active: boolean;
}

export function MailboxLayout() {
  const searchParams = useSearchParams();
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
  const [activeFolder, setActiveFolder] = useState("INBOX");
  const [selectedUid, setSelectedUid] = useState<number | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  // Compose
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeMode, setComposeMode] = useState<"new" | "reply" | "replyAll" | "forward">("new");
  const [composeOriginal, setComposeOriginal] = useState<MailboxMessageFull | null>(null);

  // Fetch accounts
  const { data: accounts = [], isLoading: loadingAccounts } = useQuery({
    queryKey: ["mailbox-accounts"],
    queryFn: async () => {
      const res = await fetch("/api/mailbox/accounts");
      if (!res.ok) throw new Error("Failed to fetch accounts");
      return res.json() as Promise<EmailAccountPublic[]>;
    },
    staleTime: 5 * 60_000,
  });

  // Auto-select account from URL param or first account
  useEffect(() => {
    if (accounts.length === 0) return;
    const paramAccountId = searchParams.get("account");
    if (paramAccountId && accounts.some((a) => a.id === paramAccountId)) {
      setActiveAccountId(paramAccountId);
    } else if (!activeAccountId) {
      setActiveAccountId(accounts[0].id);
    }
  }, [accounts, activeAccountId, searchParams]);

  // Fetch folders
  const { data: folders = [], isLoading: loadingFolders } = useQuery({
    queryKey: ["mailbox-folders", activeAccountId],
    queryFn: async () => {
      const res = await fetch(`/api/mailbox/accounts/${activeAccountId}/folders`);
      if (!res.ok) throw new Error("Failed to fetch folders");
      return res.json() as Promise<MailboxFolder[]>;
    },
    enabled: !!activeAccountId,
    staleTime: 60_000,
  });

  const handleSelectFolder = useCallback((path: string) => {
    setActiveFolder(path);
    setSelectedUid(null);
    setShowSidebar(false);
  }, []);

  const handleSelectMessage = useCallback((uid: number) => {
    setSelectedUid(uid);
  }, []);

  const handleCloseViewer = useCallback(() => {
    setSelectedUid(null);
  }, []);

  const handleCompose = useCallback(() => {
    setComposeMode("new");
    setComposeOriginal(null);
    setComposeOpen(true);
  }, []);

  const handleReply = useCallback(
    (mode: "reply" | "replyAll" | "forward", message: MailboxMessageFull) => {
      setComposeMode(mode);
      setComposeOriginal(message);
      setComposeOpen(true);
    },
    []
  );

  if (loadingAccounts) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Settings className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">No email accounts</h2>
        <p className="text-sm text-gray-500 mb-4">
          Connect an email account to start sending and receiving emails.
        </p>
        <Link href="/admin/mailbox/accounts">
          <Button>
            <Settings className="w-4 h-4 mr-1.5" />
            Add Account
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-2 pb-3">
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="lg:hidden text-gray-500 hover:text-gray-700"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">Mailbox</h1>
        <AccountSwitcher
          accounts={accounts}
          activeAccountId={activeAccountId}
          onSelect={(id) => {
            setActiveAccountId(id);
            setActiveFolder("INBOX");
            setSelectedUid(null);
          }}
        />
        <div className="flex-1" />
        <Button onClick={handleCompose} size="sm">
          <PenSquare className="w-4 h-4 mr-1.5" />
          Compose
        </Button>
        <Link href="/admin/mailbox/accounts">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Main 3-panel layout */}
      <div className="flex-1 flex border rounded-lg bg-white overflow-hidden min-h-0">
        {/* Folder sidebar */}
        <div
          className={`${
            showSidebar ? "fixed inset-0 z-40 bg-black/30 lg:relative lg:bg-transparent" : ""
          } lg:block`}
          onClick={() => setShowSidebar(false)}
        >
          <aside
            className={`${
              showSidebar
                ? "fixed left-0 top-0 h-full z-50 bg-white shadow-lg lg:shadow-none lg:relative"
                : "hidden lg:block"
            } ${sidebarCollapsed ? "w-14" : "w-56"} border-r flex flex-col shrink-0 transition-[width] duration-200`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-1 overflow-y-auto">
              <FolderSidebar
                folders={folders}
                activeFolder={activeFolder}
                onSelect={handleSelectFolder}
                loading={loadingFolders}
                collapsed={sidebarCollapsed}
              />
            </div>
            <div className="border-t p-1.5 hidden lg:block">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="w-full flex items-center justify-center p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen className="w-4 h-4" />
                ) : (
                  <PanelLeftClose className="w-4 h-4" />
                )}
              </button>
            </div>
          </aside>
        </div>

        {/* Message list */}
        <div
          className={`${
            selectedUid ? "hidden lg:flex" : "flex"
          } flex-col flex-1 min-w-0 border-r`}
        >
          <MessageList
            accountId={activeAccountId}
            folder={activeFolder}
            onSelectMessage={handleSelectMessage}
            selectedUid={selectedUid}
          />
        </div>

        {/* Message viewer */}
        {selectedUid && activeAccountId ? (
          <div className="flex-1 min-w-0 flex flex-col lg:max-w-[55%]">
            <MessageViewer
              accountId={activeAccountId}
              uid={selectedUid}
              folder={activeFolder}
              onClose={handleCloseViewer}
              onReply={handleReply}
            />
          </div>
        ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center text-sm text-gray-400">
            Select a message to read
          </div>
        )}
      </div>

      {/* Compose dialog */}
      {activeAccountId && (
        <ComposeDialog
          open={composeOpen}
          onOpenChange={setComposeOpen}
          accounts={accounts}
          activeAccountId={activeAccountId}
          mode={composeMode}
          originalMessage={composeOriginal}
          folder={activeFolder}
        />
      )}
    </div>
  );
}
