# In-App Notifications Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Real-time in-app notification system for admin users triggered by task events (mentions, assignments, comments, moves, attachments, due dates).

**Architecture:** A `notifications` table with Supabase Realtime subscriptions. Notifications are created application-side in existing task handlers. A bell icon in the header shows unread count with a dropdown panel. A dedicated page shows the full list. A daily Edge Function handles due-soon alerts.

**Tech Stack:** Supabase (Postgres, Realtime, Edge Functions), Next.js App Router, React

---

### Task 1: Create notifications table migration

**Files:**
- Create: `supabase/migrations/042_notifications.sql`

**Step 1: Write the migration**

```sql
-- ============================================================
-- In-App Notifications
-- ============================================================

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  task_id uuid references tasks(id) on delete set null,
  actor_id uuid references auth.users(id) on delete set null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_notifications_user_unread on notifications(user_id, read, created_at desc);
create index idx_notifications_user_created on notifications(user_id, created_at desc);

alter table notifications enable row level security;

-- Users can read & update only their own notifications
create policy "Users can view own notifications"
  on notifications for select
  using (user_id = auth.uid());

create policy "Users can update own notifications"
  on notifications for update
  using (user_id = auth.uid());

-- Any authenticated user can insert (app creates on behalf of actor)
create policy "Authenticated users can create notifications"
  on notifications for insert
  to authenticated
  with check (true);

-- Service role for cron
grant select, insert, update, delete on notifications to authenticated;
grant all on notifications to service_role;

-- Enable Realtime for INSERT events
alter publication supabase_realtime add table notifications;
```

**Step 2: Apply the migration**

Run: `npx supabase migration up`
Expected: Migration applied successfully.

**Step 3: Commit**

```bash
git add supabase/migrations/042_notifications.sql
git commit -m "feat: add notifications table with RLS and Realtime"
```

---

### Task 2: Create notification types and helper

**Files:**
- Create: `src/features/notifications/notification-types.ts`
- Create: `src/features/notifications/create-notification.ts`

**Step 1: Create the types file**

```typescript
// src/features/notifications/notification-types.ts

export type NotificationType =
  | "mentioned"
  | "assigned"
  | "comment_on_task"
  | "task_moved"
  | "attachment_added"
  | "task_due_soon";

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  task_id: string | null;
  actor_id: string | null;
  read: boolean;
  created_at: string;
  // Joined fields
  actor?: { display_name: string | null } | null;
}

export const notificationIcons: Record<NotificationType, string> = {
  mentioned: "@",
  assigned: "user",
  comment_on_task: "chat",
  task_moved: "arrow",
  attachment_added: "clip",
  task_due_soon: "clock",
};
```

**Step 2: Create the notification helper**

This is a client-side helper used by task-dialog and kanban-board to create notifications. It deduplicates (never notify yourself).

```typescript
// src/features/notifications/create-notification.ts

import { createClient } from "@/shared/utils/supabase/client";
import type { NotificationType } from "./notification-types";

interface CreateNotificationParams {
  recipientId: string;
  type: NotificationType;
  title: string;
  body?: string;
  taskId?: string;
}

export async function createNotification({
  recipientId,
  type,
  title,
  body,
  taskId,
}: CreateNotificationParams) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Never notify yourself
  if (user?.id === recipientId) return;

  await supabase.from("notifications").insert({
    user_id: recipientId,
    type,
    title,
    body: body ?? null,
    task_id: taskId ?? null,
    actor_id: user?.id ?? null,
  });
}

export async function createNotificationsForMany(
  recipientIds: string[],
  params: Omit<CreateNotificationParams, "recipientId">
) {
  for (const id of recipientIds) {
    await createNotification({ ...params, recipientId: id });
  }
}
```

**Step 3: Commit**

```bash
git add src/features/notifications/notification-types.ts src/features/notifications/create-notification.ts
git commit -m "feat: add notification types and create-notification helper"
```

---

### Task 3: Create useNotifications hook (fetch + realtime)

**Files:**
- Create: `src/features/notifications/use-notifications.ts`

**Step 1: Write the hook**

This hook:
- Fetches notifications on mount
- Subscribes to Realtime INSERT on `notifications` table for the current user
- Provides `markAsRead`, `markAllAsRead`, `unreadCount`

```typescript
// src/features/notifications/use-notifications.ts

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/shared/utils/supabase/client";
import type { Notification } from "./notification-types";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const userIdRef = useRef<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    userIdRef.current = user.id;

    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    setNotifications(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotifications();

    const supabase = createClient();
    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          // Only add if it's for the current user
          if (newNotif.user_id === userIdRef.current) {
            setNotifications((prev) => [newNotif, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback(async (id: string) => {
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  return { notifications, loading, unreadCount, markAsRead, markAllAsRead, refetch: fetchNotifications };
}
```

**Step 2: Commit**

```bash
git add src/features/notifications/use-notifications.ts
git commit -m "feat: add useNotifications hook with Realtime subscription"
```

---

### Task 4: Build notification bell + dropdown in header

**Files:**
- Create: `src/features/notifications/notification-bell.tsx`
- Modify: `src/shared/components/admin-layout.tsx`

**Step 1: Create the NotificationBell component**

This renders a bell icon with unread badge, and a dropdown panel listing recent notifications. Clicking a notification navigates to the task and marks it read.

```typescript
// src/features/notifications/notification-bell.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close on click outside
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
      // Navigate to the task — we need the board_id, so go via a redirect page
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
          {/* Header */}
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

          {/* List */}
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

          {/* Footer */}
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
```

**Step 2: Add NotificationBell to admin-layout header**

In `src/shared/components/admin-layout.tsx`, add the bell between `<div className="flex-1" />` and the user email span.

Find (around line 400):
```tsx
          <div className="flex-1" />
          {userEmail && (
```

Replace with:
```tsx
          <div className="flex-1" />
          <NotificationBell />
          {userEmail && (
```

Add the import at the top of the file:
```tsx
import { NotificationBell } from "@/features/notifications/notification-bell";
```

**Step 3: Verify build**

Run: `npx next build 2>&1 | grep -E "(error|Error|✓)" | head -5`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add src/features/notifications/notification-bell.tsx src/shared/components/admin-layout.tsx
git commit -m "feat: add notification bell with dropdown to admin header"
```

---

### Task 5: Create task navigation route

**Files:**
- Create: `src/app/admin/notifications/go/[taskId]/route.ts`

When a notification is clicked, we need to navigate to the correct board page with `?task=taskId`. This API route looks up the task's board and redirects.

**Step 1: Create the redirect route**

```typescript
// src/app/admin/notifications/go/[taskId]/route.ts

import { createClient } from "@/shared/utils/supabase/server";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;
  const supabase = await createClient();

  const { data: task } = await supabase
    .from("tasks")
    .select("column_id")
    .eq("id", taskId)
    .single();

  if (!task) {
    redirect("/admin/tasks");
  }

  const { data: column } = await supabase
    .from("board_columns")
    .select("board_id")
    .eq("id", task.column_id)
    .single();

  if (!column) {
    redirect("/admin/tasks");
  }

  redirect(`/admin/tasks/${column.board_id}?task=${taskId}`);
}
```

**Step 2: Update KanbanBoard to auto-open task from query param**

In `src/features/tasks/kanban-board.tsx`, add a `useSearchParams` effect to open the task dialog when `?task=` is present.

Add import:
```tsx
import { useRouter, useSearchParams } from "next/navigation";
```

(Replace the existing `useRouter` import line.)

After the filter state declarations (around line 79), add:

```tsx
  const searchParams = useSearchParams();

  // Auto-open task from query param (e.g., from notification click)
  useEffect(() => {
    const taskId = searchParams.get("task");
    if (taskId) {
      const found = tasks.find((t) => t.id === taskId);
      if (found) {
        setEditingTask(found);
        setTaskDialogOpen(true);
      }
      // Clean up the URL
      const url = new URL(window.location.href);
      url.searchParams.delete("task");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams, tasks]);
```

**Step 3: Verify build**

Run: `npx next build 2>&1 | grep -E "(error|Error|✓)" | head -5`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add src/app/admin/notifications/go/ src/features/tasks/kanban-board.tsx
git commit -m "feat: add task navigation route and auto-open from query param"
```

---

### Task 6: Wire notification triggers into task-dialog

**Files:**
- Modify: `src/features/tasks/task-dialog.tsx`

**Step 1: Add import**

At the top of `task-dialog.tsx`, add:
```tsx
import { createNotification } from "@/features/notifications/create-notification";
```

**Step 2: Add mention notifications to handlePostComment**

After the comment is inserted and `logActivity(task.id, "commented")` is called, add mention parsing:

```tsx
    // Notify mentioned users
    const mentionMatches = (newComment.trim()).match(/@([\w\s]+?)(?=\s@|\s*$)/g);
    if (mentionMatches) {
      for (const match of mentionMatches) {
        const name = match.slice(1).trim();
        const mentionedUser = adminUsers.find(
          (u) => u.display_name?.toLowerCase() === name.toLowerCase()
        );
        if (mentionedUser) {
          await createNotification({
            recipientId: mentionedUser.id,
            type: "mentioned",
            title: `${currentUserName} mentioned you`,
            body: `in "${task.title}"`,
            taskId: task.id,
          });
        }
      }
    }
```

We need `currentUserName`. At the top of `handlePostComment`, after getting `user`, add:
```tsx
    const currentUserName =
      adminUsers.find((u) => u.id === user?.id)?.display_name ?? "Someone";
```

**Step 3: Add comment_on_task notification**

Still in `handlePostComment`, after the mention notifications, add:

```tsx
    // Notify task assignee about new comment (if not the commenter)
    if (task.assigned_to) {
      await createNotification({
        recipientId: task.assigned_to,
        type: "comment_on_task",
        title: `${currentUserName} commented`,
        body: `on "${task.title}"`,
        taskId: task.id,
      });
    }
```

**Step 4: Add assigned notification in handleSubmit**

In `handleSubmit`, where `reassigned` change is detected (the block checking `form.assigned_to !== task.assigned_to`), add after the `changes.push`:

```tsx
      // Notify new assignee
      if (form.assigned_to) {
        const currentUserName =
          adminUsers.find((u) => u.id === user?.id)?.display_name ?? "Someone";
        await createNotification({
          recipientId: form.assigned_to,
          type: "assigned",
          title: `${currentUserName} assigned you`,
          body: `to "${form.title}"`,
          taskId: task.id,
        });
      }
```

We need `user` available in `handleSubmit`. Add at the top of that function (after `const supabase`):
```tsx
    const {
      data: { user },
    } = await supabase.auth.getUser();
```

**Step 5: Add attachment_added notification in handleUploadFiles**

At the end of `handleUploadFiles`, after the upload loop, add:

```tsx
    // Notify task assignee about new attachment
    if (task.assigned_to) {
      const currentUserName =
        adminUsers.find((u) => u.id === user?.id)?.display_name ?? "Someone";
      await createNotification({
        recipientId: task.assigned_to,
        type: "attachment_added",
        title: `${currentUserName} attached a file`,
        body: `on "${task.title}"`,
        taskId: task.id,
      });
    }
```

**Step 6: Verify build**

Run: `npx next build 2>&1 | grep -E "(error|Error|✓)" | head -5`
Expected: Build succeeds.

**Step 7: Commit**

```bash
git add src/features/tasks/task-dialog.tsx
git commit -m "feat: wire mention, comment, assign, attachment notifications in task dialog"
```

---

### Task 7: Wire task_moved notification into kanban-board

**Files:**
- Modify: `src/features/tasks/kanban-board.tsx`

**Step 1: Add import**

```tsx
import { createNotification } from "@/features/notifications/create-notification";
```

**Step 2: Add notification in handleDragEnd**

In the `handleDragEnd` function, after the task is moved to a new column (after `reorder_task` RPC call succeeds), add:

```tsx
      // Notify assignee about the move
      const movedTask = tasks.find((t) => t.id === activeId);
      if (movedTask?.assigned_to && fromColumnId !== toColumnId) {
        const fromName = columns.find((c) => c.id === fromColumnId)?.name ?? "";
        const toName = columns.find((c) => c.id === toColumnId)?.name ?? "";
        createNotification({
          recipientId: movedTask.assigned_to,
          type: "task_moved",
          title: `Task moved to ${toName}`,
          body: `"${movedTask.title}" from ${fromName}`,
          taskId: movedTask.id,
        });
      }
```

**Step 3: Verify build**

Run: `npx next build 2>&1 | grep -E "(error|Error|✓)" | head -5`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add src/features/tasks/kanban-board.tsx
git commit -m "feat: wire task_moved notification on drag-and-drop"
```

---

### Task 8: Create notifications full page

**Files:**
- Create: `src/app/admin/notifications/page.tsx`
- Create: `src/features/notifications/notification-list.tsx`

**Step 1: Create the NotificationList client component**

This renders the full list with filters (All/Unread/by type), mark all read, and click-to-navigate.

```typescript
// src/features/notifications/notification-list.tsx

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
```

**Step 2: Create the server page**

```typescript
// src/app/admin/notifications/page.tsx

import { NotificationList } from "@/features/notifications/notification-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications — BSH Admin",
};

export default function NotificationsPage() {
  return <NotificationList />;
}
```

**Step 3: Verify build**

Run: `npx next build 2>&1 | grep -E "(error|Error|✓)" | head -5`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add src/app/admin/notifications/page.tsx src/features/notifications/notification-list.tsx
git commit -m "feat: add full notifications page with filters"
```

---

### Task 9: Add Sonner toast on realtime notification

**Files:**
- Modify: `src/features/notifications/notification-bell.tsx`

**Step 1: Add toast on new notification**

In `notification-bell.tsx`, import `toast` from `sonner`:

```tsx
import { toast } from "sonner";
```

In the Realtime subscription callback (inside `useNotifications` hook — or better, in the bell component), show a toast when a new notification arrives. Since the hook handles realtime, modify `use-notifications.ts`:

In `use-notifications.ts`, add a callback parameter:

Update the hook signature:
```tsx
export function useNotifications(onNewNotification?: (n: Notification) => void) {
```

In the Realtime `INSERT` handler, after pushing the new notification to state, call:
```tsx
            onNewNotification?.(newNotif);
```

Then in `notification-bell.tsx`, pass a toast callback:
```tsx
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(
    (n) => {
      toast(n.title, { description: n.body ?? undefined });
    }
  );
```

**Step 2: Verify build**

Run: `npx next build 2>&1 | grep -E "(error|Error|✓)" | head -5`
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/features/notifications/use-notifications.ts src/features/notifications/notification-bell.tsx
git commit -m "feat: show Sonner toast on incoming realtime notification"
```

---

### Task 10: Create due-soon Edge Function

**Files:**
- Create: `supabase/functions/notify-due-soon/index.ts`

**Step 1: Write the Edge Function**

```typescript
// supabase/functions/notify-due-soon/index.ts

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Find tasks due tomorrow with an assignee
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const { data: tasks, error: taskError } = await supabase
    .from("tasks")
    .select("id, title, assigned_to, due_date")
    .eq("due_date", tomorrowStr)
    .not("assigned_to", "is", null);

  if (taskError) {
    return new Response(JSON.stringify({ error: taskError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let created = 0;
  const today = new Date().toISOString().split("T")[0];

  for (const task of tasks ?? []) {
    // Check if we already sent a due_soon notification for this task today
    const { data: existing } = await supabase
      .from("notifications")
      .select("id")
      .eq("task_id", task.id)
      .eq("type", "task_due_soon")
      .gte("created_at", `${today}T00:00:00Z`)
      .limit(1);

    if (existing && existing.length > 0) continue;

    await supabase.from("notifications").insert({
      user_id: task.assigned_to,
      type: "task_due_soon",
      title: "Task due tomorrow",
      body: `"${task.title}" is due ${tomorrowStr}`,
      task_id: task.id,
      actor_id: null,
    });
    created++;
  }

  return new Response(
    JSON.stringify({ success: true, tasks_checked: tasks?.length ?? 0, notifications_created: created }),
    { headers: { "Content-Type": "application/json" } }
  );
});
```

**Step 2: Test locally (optional)**

Run: `npx supabase functions serve notify-due-soon --no-verify-jwt`
Then: `curl http://localhost:54321/functions/v1/notify-due-soon -H "Authorization: Bearer <service_role_key>"`

**Step 3: Commit**

```bash
git add supabase/functions/notify-due-soon/
git commit -m "feat: add notify-due-soon Edge Function for daily due date alerts"
```

---

### Task 11: Browser test the full flow

**Files:** None (testing only)

Use the `playwright-ui-testing` skill to verify:

1. Open a task, post a comment with `@mention` — verify notification bell shows count
2. Assign a task to another user — verify notification created
3. Click bell — dropdown shows notifications
4. Click a notification — navigates to the task and auto-opens dialog
5. Navigate to `/admin/notifications` — full page renders with filters
6. Mark all as read — badge clears

**Commit after any fixes.**

```bash
git add -A
git commit -m "fix: browser test fixes for notifications"
```

---

Plan complete and saved to `docs/plans/2026-07-11-in-app-notifications.md`. Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

Which approach?