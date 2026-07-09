"use client";

import { cn } from "@/lib/utils";
import {
  Inbox,
  Send,
  FileEdit,
  Trash2,
  AlertTriangle,
  Folder,
  Star,
  Archive,
} from "lucide-react";
import type { MailboxFolder } from "@/shared/utils/mailbox/types";

interface Props {
  folders: MailboxFolder[];
  activeFolder: string;
  onSelect: (path: string) => void;
  loading?: boolean;
  collapsed?: boolean;
}

const SPECIAL_ICONS: Record<string, React.ReactNode> = {
  "\\Inbox": <Inbox className="w-4 h-4" />,
  "\\Sent": <Send className="w-4 h-4" />,
  "\\Drafts": <FileEdit className="w-4 h-4" />,
  "\\Trash": <Trash2 className="w-4 h-4" />,
  "\\Junk": <AlertTriangle className="w-4 h-4" />,
  "\\Flagged": <Star className="w-4 h-4" />,
  "\\Archive": <Archive className="w-4 h-4" />,
};

const FOLDER_NAME_TO_SPECIAL: Record<string, string> = {
  INBOX: "\\Inbox",
  Sent: "\\Sent",
  "Sent Mail": "\\Sent",
  "Sent Items": "\\Sent",
  Drafts: "\\Drafts",
  Draft: "\\Drafts",
  Trash: "\\Trash",
  "Deleted Items": "\\Trash",
  Junk: "\\Junk",
  Spam: "\\Junk",
  Starred: "\\Flagged",
  Archive: "\\Archive",
};

function getFolderIcon(folder: MailboxFolder) {
  const special = folder.specialUse || FOLDER_NAME_TO_SPECIAL[folder.name];
  return SPECIAL_ICONS[special || ""] || <Folder className="w-4 h-4" />;
}

function sortFolders(folders: MailboxFolder[]): MailboxFolder[] {
  const order = ["\\Inbox", "\\Sent", "\\Drafts", "\\Trash", "\\Junk", "\\Flagged", "\\Archive"];

  return [...folders].sort((a, b) => {
    const aSpecial = a.specialUse || FOLDER_NAME_TO_SPECIAL[a.name] || "";
    const bSpecial = b.specialUse || FOLDER_NAME_TO_SPECIAL[b.name] || "";
    const aIdx = order.indexOf(aSpecial);
    const bIdx = order.indexOf(bSpecial);

    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;
    return a.name.localeCompare(b.name);
  });
}

export function FolderSidebar({ folders, activeFolder, onSelect, loading, collapsed }: Props) {
  if (loading) {
    return (
      <div className="p-3 space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  const sorted = sortFolders(folders);
  const specialFolders = sorted.filter((f) => {
    const s = f.specialUse || FOLDER_NAME_TO_SPECIAL[f.name];
    return !!s;
  });
  const customFolders = sorted.filter((f) => {
    const s = f.specialUse || FOLDER_NAME_TO_SPECIAL[f.name];
    return !s;
  });

  return (
    <nav className={cn("space-y-0.5", collapsed ? "p-1.5" : "p-2")}>
      {specialFolders.map((folder) => (
        <FolderItem
          key={folder.path}
          folder={folder}
          active={activeFolder === folder.path}
          onClick={() => onSelect(folder.path)}
          collapsed={collapsed}
        />
      ))}
      {customFolders.length > 0 && (
        <>
          <div className="h-px bg-gray-200 my-2" />
          {customFolders.map((folder) => (
            <FolderItem
              key={folder.path}
              folder={folder}
              active={activeFolder === folder.path}
              onClick={() => onSelect(folder.path)}
              collapsed={collapsed}
            />
          ))}
        </>
      )}
    </nav>
  );
}

function FolderItem({
  folder,
  active,
  onClick,
  collapsed,
}: {
  folder: MailboxFolder;
  active: boolean;
  onClick: () => void;
  collapsed?: boolean;
}) {
  if (collapsed) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "w-full flex items-center justify-center p-2 rounded-lg transition-colors relative",
          active
            ? "bg-cyan-50 text-cyan-600"
            : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        )}
        title={folder.name}
      >
        {getFolderIcon(folder)}
        {folder.unseenCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] font-bold bg-cyan-500 text-white rounded-full flex items-center justify-center">
            {folder.unseenCount > 9 ? "9+" : folder.unseenCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm transition-colors text-left",
        active
          ? "bg-cyan-50 text-cyan-700 font-medium"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      )}
    >
      <span className={active ? "text-cyan-600" : "text-gray-400"}>{getFolderIcon(folder)}</span>
      <span className="flex-1 truncate">{folder.name}</span>
      {folder.unseenCount > 0 && (
        <span
          className={cn(
            "text-xs font-medium px-1.5 py-0.5 rounded-full min-w-[20px] text-center",
            active ? "bg-cyan-100 text-cyan-700" : "bg-gray-200 text-gray-600"
          )}
        >
          {folder.unseenCount}
        </span>
      )}
    </button>
  );
}
