"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useNotifications } from "./use-notifications";
import type { Notification, NotificationType } from "./notification-types";

function typeIcon(type: NotificationType) {
  switch (type) {
    case "mentioned":
      return <span className="text-cyan-600 font-bold text-[10px]">@</span>;
    case "assigned":
      return (
        <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    case "comment_on_task":
      return (
        <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      );
    case "task_moved":
      return (
        <svg className="w-3.5 h-3.5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      );
    case "attachment_added":
      return (
        <svg className="w-3.5 h-3.5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
      );
    case "task_due_soon":
      return (
        <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(
    (n) => {
      toast(n.title, { description: n.body ?? undefined });
    }
  );
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function handleClickNotification(n: Notification) {
    markAsRead(n.id);
    setOpen(false);
    if (n.task_id) {
      router.push(`/admin/notifications/go/${n.task_id}`);
    }
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
        title="Notifications"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-cyan-600 hover:text-cyan-700 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400">
                No notifications yet
              </div>
            ) : (
              notifications.slice(0, 20).map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClickNotification(n)}
                  className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50 ${
                    !n.read ? "bg-cyan-50/30" : ""
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                    {typeIcon(n.type as NotificationType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-relaxed ${!n.read ? "font-medium text-gray-900" : "text-gray-600"}`}>
                      {n.title}
                    </p>
                    {n.body && (
                      <p className="text-[11px] text-gray-400 mt-0.5 truncate">{n.body}</p>
                    )}
                    <span className="text-[10px] text-gray-400 mt-0.5 block">
                      {formatTime(n.created_at)}
                    </span>
                  </div>
                  {!n.read && (
                    <div className="w-2 h-2 rounded-full bg-cyan-500 shrink-0 mt-2" />
                  )}
                </button>
              ))
            )}
          </div>

          <div className="border-t px-4 py-2">
            <a
              href="/admin/notifications"
              className="text-xs text-cyan-600 hover:text-cyan-700 font-medium"
              onClick={() => setOpen(false)}
            >
              View all notifications
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
