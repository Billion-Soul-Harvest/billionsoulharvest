"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "./use-notifications";
import type { Notification, NotificationType } from "./notification-types";
import { Button } from "@/components/ui/button";

const typeLabels: Record<NotificationType, string> = {
  mentioned: "Mentions",
  assigned: "Assignments",
  comment_on_task: "Comments",
  task_moved: "Moves",
  attachment_added: "Attachments",
  task_due_soon: "Due Soon",
};

function typeIcon(type: NotificationType) {
  switch (type) {
    case "mentioned":
      return <span className="text-cyan-600 font-bold text-xs">@</span>;
    case "assigned":
      return (
        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    case "comment_on_task":
      return (
        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      );
    case "task_moved":
      return (
        <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      );
    case "attachment_added":
      return (
        <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
      );
    case "task_due_soon":
      return (
        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

type Filter = "all" | "unread" | NotificationType;

export function NotificationList() {
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();
  const [filter, setFilter] = useState<Filter>("all");
  const router = useRouter();

  const filtered = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    return n.type === filter;
  });

  function handleClick(n: Notification) {
    markAsRead(n.id);
    if (n.task_id) {
      router.push(`/admin/notifications/go/${n.task_id}`);
    }
  }

  const filters: { value: Filter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "unread", label: `Unread (${unreadCount})` },
    ...Object.entries(typeLabels).map(([value, label]) => ({
      value: value as Filter,
      label,
    })),
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-1 mb-4 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              filter === f.value
                ? "bg-cyan-500 text-white border-cyan-500"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-sm text-gray-400 text-center py-12">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-sm text-gray-400 text-center py-12">
          {filter === "all" ? "No notifications yet" : "No matching notifications"}
        </div>
      ) : (
        <div className="bg-white rounded-lg border divide-y">
          {filtered.map((n) => (
            <button
              key={n.id}
              onClick={() => handleClick(n)}
              className={`w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors ${
                !n.read ? "bg-cyan-50/30" : ""
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                {typeIcon(n.type as NotificationType)}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm leading-relaxed ${
                    !n.read ? "font-medium text-gray-900" : "text-gray-600"
                  }`}
                >
                  {n.title}
                </p>
                {n.body && (
                  <p className="text-xs text-gray-400 mt-0.5">{n.body}</p>
                )}
                <span className="text-xs text-gray-400 mt-1 block">
                  {formatTime(n.created_at)}
                </span>
              </div>
              {!n.read && (
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 shrink-0 mt-2" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
