# In-App Notification System — Design

## Overview

Real-time in-app notifications for admin users. Notifications are triggered by task-related events (mentions, assignments, comments, moves, attachments, due dates). Delivered via Supabase Realtime with a bell icon in the header and a dedicated notifications page.

## Database

### `notifications` table

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | `gen_random_uuid()` |
| `user_id` | uuid FK -> auth.users | Recipient, CASCADE |
| `type` | text NOT NULL | `mentioned`, `assigned`, `comment_on_task`, `task_moved`, `attachment_added`, `task_due_soon` |
| `title` | text NOT NULL | Short summary |
| `body` | text | Detail text |
| `task_id` | uuid FK -> tasks | Nullable, for navigation (SET NULL) |
| `actor_id` | uuid FK -> auth.users | Who triggered it, nullable for cron (SET NULL) |
| `read` | boolean | Default false |
| `created_at` | timestamptz | Default now() |

### Indexes

- `(user_id, read, created_at DESC)` — unread-first queries
- `(user_id, created_at DESC)` — chronological listing

### RLS

- Users can SELECT/UPDATE only their own notifications (`user_id = auth.uid()`)
- INSERT granted to authenticated (application creates on behalf of actor)
- Service role has full access (for cron)

### Realtime

- Enable Realtime on the `notifications` table for INSERT events
- Client subscribes filtered by `user_id = auth.uid()`

## Notification Triggers

All triggers are application-level (in existing client code), not DB triggers.

| Event | Type | Recipient(s) | Trigger Location |
|-------|------|-------------|-----------------|
| @mentioned in comment | `mentioned` | Each @mentioned user | `task-dialog.tsx` `handlePostComment` — parse comment for @names, resolve to user IDs |
| Assigned to task | `assigned` | New assignee | `task-dialog.tsx` `handleSubmit` — when `assigned_to` changes to a new user |
| Comment on your task | `comment_on_task` | Task assignee (if not commenter) | `task-dialog.tsx` `handlePostComment` |
| Task moved to column | `task_moved` | Task assignee (if not mover) | `kanban-board.tsx` `handleDragEnd` + `task-dialog.tsx` column change |
| Attachment added | `attachment_added` | Task assignee (if not uploader) | `task-dialog.tsx` `handleUploadFiles` / `handlePostComment` (with files) |
| Task due within 24h | `task_due_soon` | Task assignee | Supabase Edge Function (daily cron) |

### Deduplication

- `task_due_soon`: skip if notification already exists for same `task_id` + `type` + date
- `comment_on_task`: don't notify if assignee is the commenter
- `mentioned`: don't notify if mentioned user is the commenter
- General: never notify yourself for your own actions

## Cron: Due Soon

Supabase Edge Function running on a daily schedule (8am UTC):

1. Query tasks where `due_date` = tomorrow AND `assigned_to IS NOT NULL`
2. For each, check if a `task_due_soon` notification already exists for that task today
3. If not, insert a notification for the assignee

## UI Components

### 1. Bell Icon (header — `admin-layout.tsx`)

- Bell SVG icon in the top header bar (before the user email)
- Red badge with unread count (hidden when 0)
- Click toggles the notification dropdown panel
- Realtime subscription updates the count live

### 2. Notification Dropdown Panel

- Absolute positioned below bell icon, right-aligned
- Max height ~400px with overflow scroll
- Width ~320px
- Header: "Notifications" + "Mark all as read" button
- Each notification row:
  - Left: icon by type (mention=@, assigned=user, comment=chat, moved=arrow, file=paperclip, clock=due)
  - Center: title (bold if unread), body, relative time
  - Right: unread blue dot
  - Click: navigate to task and mark as read
- Footer: "View all notifications" link -> `/admin/notifications`
- Click outside closes dropdown

### 3. `/admin/notifications` Page

- Full-width notification list
- Filters: All | Unread | By type dropdown
- Each row same component as dropdown but wider, with more detail
- Pagination (or infinite scroll)
- Bulk "Mark all as read" button
- Individual mark read/unread toggle

### Navigation on Click

When a notification is clicked:
1. Mark as read (`UPDATE notifications SET read = true WHERE id = ?`)
2. Navigate to `/admin/tasks/{boardId}?task={taskId}`
3. Board page reads `?task` query param and auto-opens the TaskDialog for that task

## File Structure

```
supabase/migrations/042_notifications.sql          — table, RLS, indexes, realtime
supabase/functions/notify-due-soon/index.ts         — Edge Function for daily cron
src/features/notifications/notification-types.ts    — TypeScript interfaces
src/features/notifications/notification-bell.tsx    — Bell icon + dropdown (client component)
src/features/notifications/notification-list.tsx    — Full page list component
src/features/notifications/use-notifications.ts     — Hook: fetch, subscribe, mark read
src/app/admin/notifications/page.tsx                — Server page
```

## Key Reference Files

- `src/shared/components/admin-layout.tsx` — header bar where bell goes
- `src/features/tasks/task-dialog.tsx` — comment/assignment/attachment triggers
- `src/features/tasks/kanban-board.tsx` — drag-end move trigger
- `src/components/ui/sonner.tsx` — toast notifications (optional: show toast on realtime ping)
- `supabase/migrations/039_task_comments_activity.sql` — pattern for RLS/grants
