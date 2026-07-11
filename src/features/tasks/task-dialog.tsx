"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/shared/utils/supabase/client";
import { createNotification } from "@/features/notifications/create-notification";
import { LabelManager } from "./label-manager";
import type {
  Task,
  BoardColumn,
  TaskLabel,
  AdminUser,
  TaskComment,
  TaskActivity,
  TaskAttachment,
} from "./task-types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  columns: BoardColumn[];
  adminUsers: AdminUser[];
  allLabels: TaskLabel[];
  preselectedColumnId: string | null;
}

type ActiveTab = "comments" | "activity" | "files";

export function TaskDialog({
  open,
  onOpenChange,
  task,
  columns,
  adminUsers,
  allLabels,
  preselectedColumnId,
}: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    column_id: "",
    due_date: "",
    assigned_to: "",
  });
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);

  // Comments & Activity
  const [activeTab, setActiveTab] = useState<ActiveTab>("comments");
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [activity, setActivity] = useState<TaskActivity[]>([]);
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [confirmDeleteAttachment, setConfirmDeleteAttachment] = useState<TaskAttachment | null>(null);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [mentionStart, setMentionStart] = useState(0);
  const dragCounterRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const commentFileInputRef = useRef<HTMLInputElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const commentTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description ?? "",
        priority: task.priority,
        column_id: task.column_id,
        due_date: task.due_date ?? "",
        assigned_to: task.assigned_to ?? "",
      });
      setSelectedLabelIds(task.labels.map((l) => l.id));
      loadFeed(task.id);
    } else {
      setForm({
        title: "",
        description: "",
        priority: "medium",
        column_id: preselectedColumnId ?? columns[0]?.id ?? "",
        due_date: "",
        assigned_to: "",
      });
      setSelectedLabelIds([]);
      setComments([]);
      setActivity([]);
      setAttachments([]);
    }
    setConfirmDelete(false);
    setNewComment("");
    setPendingFiles([]);
    setEditingCommentId(null);
    setActiveTab("comments");
  }, [task, preselectedColumnId, columns, open]);

  async function loadFeed(taskId: string) {
    setLoadingFeed(true);
    const supabase = createClient();

    const [commentsRes, activityRes, attachmentsRes] = await Promise.all([
      supabase
        .from("task_comments")
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", { ascending: true }),
      supabase
        .from("task_activity")
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", { ascending: false }),
      supabase
        .from("task_attachments")
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", { ascending: false }),
    ]);

    const adminMap = new Map(
      adminUsers.map((u) => [u.id, { ...u, display_name: u.display_name || u.id.slice(0, 8) }])
    );

    setComments(
      (commentsRes.data ?? []).map((c) => ({
        ...c,
        author: adminMap.get(c.author_id) ?? { display_name: c.author_id.slice(0, 8) },
      }))
    );
    setActivity(
      (activityRes.data ?? []).map((a) => ({
        ...a,
        actor: a.actor_id
          ? adminMap.get(a.actor_id) ?? { display_name: a.actor_id.slice(0, 8) }
          : null,
      }))
    );
    setAttachments(attachmentsRes.data ?? []);
    setLoadingFeed(false);
  }

  async function logActivity(
    taskId: string,
    action: string,
    details?: Record<string, string>
  ) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("task_activity").insert({
      task_id: taskId,
      actor_id: user?.id ?? null,
      action,
      details: details ?? null,
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.title || !form.column_id) return;
    setSaving(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (task) {
      // Track changes for activity log
      const changes: { action: string; details: Record<string, string> }[] = [];
      if (form.title !== task.title) {
        changes.push({ action: "renamed", details: { from: task.title, to: form.title } });
      }
      if (form.column_id !== task.column_id) {
        const fromCol = columns.find((c) => c.id === task.column_id)?.name ?? "Unknown";
        const toCol = columns.find((c) => c.id === form.column_id)?.name ?? "Unknown";
        changes.push({ action: "moved", details: { from: fromCol, to: toCol } });
      }
      if (form.priority !== task.priority) {
        changes.push({ action: "priority_changed", details: { from: task.priority, to: form.priority } });
      }
      if ((form.assigned_to || null) !== (task.assigned_to || null)) {
        const fromName = task.assigned_to ? (adminUsers.find((u) => u.id === task.assigned_to)?.display_name ?? "Someone") : "Unassigned";
        const toName = form.assigned_to ? (adminUsers.find((u) => u.id === form.assigned_to)?.display_name ?? "Someone") : "Unassigned";
        changes.push({ action: "reassigned", details: { from: fromName, to: toName } });

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
      }
      if ((form.due_date || null) !== (task.due_date || null)) {
        changes.push({ action: "due_date_changed", details: { from: task.due_date ?? "None", to: form.due_date || "None" } });
      }

      await supabase
        .from("tasks")
        .update({
          title: form.title,
          description: form.description || null,
          priority: form.priority,
          column_id: form.column_id,
          due_date: form.due_date || null,
          assigned_to: form.assigned_to || null,
        })
        .eq("id", task.id);

      // Sync labels
      await supabase
        .from("task_label_assignments")
        .delete()
        .eq("task_id", task.id);

      if (selectedLabelIds.length > 0) {
        await supabase.from("task_label_assignments").insert(
          selectedLabelIds.map((label_id) => ({
            task_id: task.id,
            label_id,
          }))
        );
      }

      // Log all changes
      for (const change of changes) {
        await logActivity(task.id, change.action, change.details);
      }
    } else {
      // Get next position in column
      const { data: existing } = await supabase
        .from("tasks")
        .select("position")
        .eq("column_id", form.column_id)
        .order("position", { ascending: false })
        .limit(1);

      const nextPosition =
        existing && existing.length > 0 ? existing[0].position + 1 : 0;

      const { data: newTask } = await supabase
        .from("tasks")
        .insert({
          title: form.title,
          description: form.description || null,
          priority: form.priority,
          column_id: form.column_id,
          due_date: form.due_date || null,
          assigned_to: form.assigned_to || null,
          position: nextPosition,
          created_by: user?.id ?? null,
        })
        .select("id")
        .single();

      if (newTask) {
        if (selectedLabelIds.length > 0) {
          await supabase.from("task_label_assignments").insert(
            selectedLabelIds.map((label_id) => ({
              task_id: newTask.id,
              label_id,
            }))
          );
        }
        await logActivity(newTask.id, "created");
      }
    }

    setSaving(false);
    onOpenChange(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!task) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("tasks").delete().eq("id", task.id);
    setSaving(false);
    onOpenChange(false);
    router.refresh();
  }

  async function handlePostComment() {
    if (!task || (!newComment.trim() && pendingFiles.length === 0)) return;
    setPostingComment(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: newCommentRow } = await supabase
      .from("task_comments")
      .insert({
        task_id: task.id,
        author_id: user?.id ?? "",
        content: newComment.trim() || (pendingFiles.length > 0 ? `Attached ${pendingFiles.length} file${pendingFiles.length > 1 ? "s" : ""}` : ""),
      })
      .select("id")
      .single();

    await logActivity(task.id, "commented");

    const currentUserName =
      adminUsers.find((u) => u.id === user?.id)?.display_name ?? "Someone";

    // Notify mentioned users
    const mentionedIds = new Set<string>();
    const mentionMatches = newComment.trim().match(/@([\w\s]+?)(?=\s@|\s*$)/g);
    if (mentionMatches) {
      for (const match of mentionMatches) {
        const name = match.slice(1).trim();
        const mentionedUser = adminUsers.find(
          (u) => u.display_name?.toLowerCase() === name.toLowerCase()
        );
        if (mentionedUser) {
          mentionedIds.add(mentionedUser.id);
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

    // Notify task assignee about new comment (skip if already mentioned)
    if (task.assigned_to && !mentionedIds.has(task.assigned_to)) {
      await createNotification({
        recipientId: task.assigned_to,
        type: "comment_on_task",
        title: `${currentUserName} commented`,
        body: `on "${task.title}"`,
        taskId: task.id,
      });
    }

    // Upload pending files linked to comment
    if (newCommentRow && pendingFiles.length > 0) {
      for (const file of pendingFiles) {
        const ext = file.name.split(".").pop() ?? "";
        const storagePath = `${task.id}/${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("task-attachments")
          .upload(storagePath, file);

        if (uploadError) continue;

        await supabase.from("task_attachments").insert({
          task_id: task.id,
          comment_id: newCommentRow.id,
          file_name: file.name,
          file_path: storagePath,
          file_size: file.size,
          content_type: file.type,
          uploaded_by: user?.id ?? null,
        });

        await logActivity(task.id, "attached", { file: file.name });
      }
    }

    setNewComment("");
    setPendingFiles([]);
    setPostingComment(false);
    await loadFeed(task.id);
    setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  async function handleUpdateComment(commentId: string) {
    if (!editCommentText.trim()) return;
    const supabase = createClient();
    await supabase
      .from("task_comments")
      .update({ content: editCommentText.trim() })
      .eq("id", commentId);
    setEditingCommentId(null);
    setEditCommentText("");
    if (task) await loadFeed(task.id);
  }

  async function handleDeleteComment(commentId: string) {
    const supabase = createClient();
    await supabase.from("task_comments").delete().eq("id", commentId);
    if (task) await loadFeed(task.id);
  }

  async function handleUploadFiles(files: FileList | null) {
    if (!task || !files || files.length === 0) return;
    setUploading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop() ?? "";
      const storagePath = `${task.id}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("task-attachments")
        .upload(storagePath, file);

      if (uploadError) continue;

      await supabase.from("task_attachments").insert({
        task_id: task.id,
        file_name: file.name,
        file_path: storagePath,
        file_size: file.size,
        content_type: file.type,
        uploaded_by: user?.id ?? null,
      });

      await logActivity(task.id, "attached", { file: file.name });
    }

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

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    await loadFeed(task.id);
  }

  async function handleDeleteAttachment(att: TaskAttachment) {
    const supabase = createClient();
    await supabase.storage.from("task-attachments").remove([att.file_path]);
    await supabase.from("task_attachments").delete().eq("id", att.id);
    if (task) {
      await logActivity(task.id, "removed_attachment", { file: att.file_name });
      await loadFeed(task.id);
    }
  }

  async function handleDownloadAttachment(att: TaskAttachment) {
    const supabase = createClient();
    const { data } = await supabase.storage
      .from("task-attachments")
      .createSignedUrl(att.file_path, 60);
    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank");
    }
  }

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragging(true);
    }
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;
    if (e.dataTransfer.files.length > 0) {
      if (activeTab === "comments") {
        setPendingFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
      } else {
        handleUploadFiles(e.dataTransfer.files);
      }
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const items = e.clipboardData.items;
    const files: File[] = [];
    for (const item of Array.from(items)) {
      if (item.kind === "file") {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }
    if (files.length > 0) {
      e.preventDefault();
      setPendingFiles((prev) => [...prev, ...files]);
    }
  }

  async function handlePreviewAttachment(att: TaskAttachment) {
    const supabase = createClient();
    const { data } = await supabase.storage
      .from("task-attachments")
      .createSignedUrl(att.file_path, 300);
    if (data?.signedUrl) {
      setPreviewUrl(data.signedUrl);
    }
  }

  function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function fileIcon(contentType: string) {
    if (contentType.startsWith("image/")) return "img";
    if (contentType === "application/pdf") return "PDF";
    if (contentType.includes("word") || contentType.includes("document")) return "DOC";
    if (contentType.includes("excel") || contentType.includes("sheet")) return "XLS";
    if (contentType.includes("powerpoint") || contentType.includes("presentation")) return "PPT";
    if (contentType.startsWith("text/")) return "TXT";
    return "FILE";
  }

  function getInitials(name: string | null | undefined) {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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

  function activityMessage(a: TaskActivity) {
    const actor = a.actor?.display_name ?? "Someone";
    switch (a.action) {
      case "created":
        return <><strong>{actor}</strong> created this task</>;
      case "moved":
        return <><strong>{actor}</strong> moved from <span className="font-medium">{a.details?.from}</span> to <span className="font-medium">{a.details?.to}</span></>;
      case "priority_changed":
        return <><strong>{actor}</strong> changed priority from <span className="font-medium">{a.details?.from}</span> to <span className="font-medium">{a.details?.to}</span></>;
      case "reassigned":
        return <><strong>{actor}</strong> reassigned from <span className="font-medium">{a.details?.from}</span> to <span className="font-medium">{a.details?.to}</span></>;
      case "due_date_changed":
        return <><strong>{actor}</strong> changed due date from <span className="font-medium">{a.details?.from}</span> to <span className="font-medium">{a.details?.to}</span></>;
      case "renamed":
        return <><strong>{actor}</strong> renamed from &ldquo;{a.details?.from}&rdquo; to &ldquo;{a.details?.to}&rdquo;</>;
      case "commented":
        return <><strong>{actor}</strong> added a comment</>;
      case "attached":
        return <><strong>{actor}</strong> attached <span className="font-medium">{a.details?.file}</span></>;
      case "removed_attachment":
        return <><strong>{actor}</strong> removed <span className="font-medium">{a.details?.file}</span></>;
      default:
        return <><strong>{actor}</strong> {a.action}</>;
    }
  }

  const mentionUsers = mentionQuery !== null
    ? adminUsers.filter((u) => {
        const name = (u.display_name ?? "").toLowerCase();
        return name.includes(mentionQuery.toLowerCase());
      })
    : [];

  function handleCommentChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value;
    const cursor = e.target.selectionStart ?? value.length;
    setNewComment(value);

    // Check for @ mention trigger
    const textBeforeCursor = value.slice(0, cursor);
    const atMatch = textBeforeCursor.match(/@(\w*)$/);
    if (atMatch) {
      setMentionQuery(atMatch[1]);
      setMentionStart(cursor - atMatch[0].length);
      setMentionIndex(0);
    } else {
      setMentionQuery(null);
    }
  }

  function insertMention(user: AdminUser) {
    const name = user.display_name ?? user.id.slice(0, 8);
    const before = newComment.slice(0, mentionStart);
    const after = newComment.slice(mentionStart + 1 + (mentionQuery?.length ?? 0));
    const inserted = `${before}@${name} ${after}`;
    setNewComment(inserted);
    setMentionQuery(null);
    // Re-focus textarea
    setTimeout(() => {
      const ta = commentTextareaRef.current;
      if (ta) {
        ta.focus();
        const pos = before.length + name.length + 2; // @name + space
        ta.setSelectionRange(pos, pos);
      }
    }, 0);
  }

  const mentionRegex = useMemo(() => {
    const names = adminUsers
      .map((u) => u.display_name)
      .filter((n): n is string => !!n)
      .sort((a, b) => b.length - a.length);
    if (names.length === 0) return null;
    const escaped = names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    return new RegExp(`(@(?:${escaped.join("|")}))`, "gi");
  }, [adminUsers]);

  function renderCommentContent(content: string) {
    if (!mentionRegex) return content;

    const parts = content.split(mentionRegex);
    return parts.map((part, i) => {
      mentionRegex.lastIndex = 0;
      if (mentionRegex.test(part)) {
        mentionRegex.lastIndex = 0;
        return (
          <span key={i} className="text-cyan-600 font-medium bg-cyan-50 rounded px-0.5">
            {part}
          </span>
        );
      }
      mentionRegex.lastIndex = 0;
      return <span key={i} className="text-gray-600">{part}</span>;
    });
  }

  const isEditing = !!task;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={isEditing ? "sm:max-w-2xl" : "sm:max-w-md"}>
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Create Task"}</DialogTitle>
        </DialogHeader>

        <div className={isEditing ? "flex gap-6 mt-2" : "mt-2"}>
          {/* Left: Form */}
          <form
            onSubmit={handleSubmit}
            className={`space-y-4 ${isEditing ? "flex-1 min-w-0" : ""}`}
          >
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, title: e.target.value })
                }
                required
                placeholder="Task title"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Details..."
                className="min-h-[60px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Column</Label>
                <Select
                  value={form.column_id}
                  onValueChange={(v: string | null) => {
                    if (v) setForm({ ...form, column_id: v });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select column">
                      {columns.find((c) => c.id === form.column_id)?.name ??
                        "Select column"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map((col) => (
                      <SelectItem key={col.id} value={col.id}>
                        {col.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v: string | null) => {
                    if (v) setForm({ ...form, priority: v });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={form.due_date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setForm({ ...form, due_date: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label>Assigned To</Label>
                <Select
                  value={form.assigned_to}
                  onValueChange={(v: string | null) =>
                    setForm({ ...form, assigned_to: v ?? "" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Unassigned">
                      {form.assigned_to
                        ? (adminUsers.find((u) => u.id === form.assigned_to)
                            ?.display_name ?? "Assigned")
                        : "Unassigned"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {adminUsers.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.display_name ?? u.id.slice(0, 8)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <LabelManager
              allLabels={allLabels}
              selectedIds={selectedLabelIds}
              onSelectionChange={setSelectedLabelIds}
            />

            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving ? "Saving..." : task ? "Update Task" : "Create Task"}
              </Button>

              {task && !confirmDelete && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setConfirmDelete(true)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Delete
                </Button>
              )}

              {task && confirmDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={saving}
                >
                  Confirm Delete
                </Button>
              )}
            </div>
          </form>

          {/* Right: Comments, Activity & Files (only in edit mode) */}
          {isEditing && (
            <div
              className={`w-72 shrink-0 flex flex-col border-l pl-6 relative ${isDragging ? "ring-2 ring-cyan-400 ring-inset rounded-lg" : ""}`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {/* Drag overlay */}
              {isDragging && (
                <div className="absolute inset-0 bg-cyan-50/80 z-20 flex items-center justify-center rounded-lg pointer-events-none">
                  <div className="text-center">
                    <svg className="w-8 h-8 text-cyan-500 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-xs font-medium text-cyan-600">Drop files here</p>
                  </div>
                </div>
              )}
              {/* Tabs */}
              <div className="flex gap-1 mb-3 border-b">
                <button
                  onClick={() => setActiveTab("comments")}
                  className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors -mb-px ${
                    activeTab === "comments"
                      ? "border-cyan-500 text-cyan-700"
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
                >
                  Comments
                  {comments.length > 0 && (
                    <span className="ml-1.5 bg-gray-100 text-gray-500 rounded-full px-1.5 py-0.5 text-[9px]">
                      {comments.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("activity")}
                  className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors -mb-px ${
                    activeTab === "activity"
                      ? "border-cyan-500 text-cyan-700"
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
                >
                  Activity
                  {activity.length > 0 && (
                    <span className="ml-1.5 bg-gray-100 text-gray-500 rounded-full px-1.5 py-0.5 text-[9px]">
                      {activity.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("files")}
                  className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors -mb-px ${
                    activeTab === "files"
                      ? "border-cyan-500 text-cyan-700"
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
                >
                  Files
                  {attachments.length > 0 && (
                    <span className="ml-1.5 bg-gray-100 text-gray-500 rounded-full px-1.5 py-0.5 text-[9px]">
                      {attachments.length}
                    </span>
                  )}
                </button>
              </div>

              {loadingFeed ? (
                <div className="flex-1 flex items-center justify-center text-gray-400 text-xs">
                  Loading...
                </div>
              ) : activeTab === "comments" ? (
                /* Comments Tab */
                <div className="flex flex-col flex-1 min-h-0">
                  <div className="flex-1 overflow-y-auto space-y-3 max-h-[320px] pr-1">
                    {comments.length === 0 && (
                      <p className="text-xs text-gray-400 text-center py-6">
                        No comments yet
                      </p>
                    )}
                    {comments.map((c) => (
                      <div key={c.id} className="group">
                        <div className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                            {getInitials(c.author?.display_name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-gray-700 truncate">
                                {c.author?.display_name ?? "Unknown"}
                              </span>
                              <span className="text-[10px] text-gray-400 shrink-0">
                                {formatTime(c.created_at)}
                              </span>
                              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                                <button
                                  onClick={() => {
                                    setEditingCommentId(c.id);
                                    setEditCommentText(c.content);
                                  }}
                                  className="p-0.5 text-gray-300 hover:text-gray-500"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteComment(c.id)}
                                  className="p-0.5 text-gray-300 hover:text-red-500"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                            {editingCommentId === c.id ? (
                              <div className="mt-1 space-y-1">
                                <textarea
                                  value={editCommentText}
                                  onChange={(e) =>
                                    setEditCommentText(e.target.value)
                                  }
                                  className="w-full text-xs border rounded-md p-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 resize-none"
                                  rows={2}
                                />
                                <div className="flex gap-1">
                                  <button
                                    onClick={() =>
                                      handleUpdateComment(c.id)
                                    }
                                    className="text-[10px] text-cyan-600 hover:text-cyan-700 font-medium"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingCommentId(null);
                                      setEditCommentText("");
                                    }}
                                    className="text-[10px] text-gray-400 hover:text-gray-600"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-gray-600 mt-0.5 whitespace-pre-wrap break-words">
                                {renderCommentContent(c.content)}
                              </p>
                            )}
                            {/* Inline attachments for this comment */}
                            {attachments.filter((a) => a.comment_id === c.id).length > 0 && (
                              <div className="mt-1.5 flex flex-wrap gap-1.5">
                                {attachments
                                  .filter((a) => a.comment_id === c.id)
                                  .map((att) => (
                                    <button
                                      key={att.id}
                                      onClick={() =>
                                        att.content_type.startsWith("image/")
                                          ? handlePreviewAttachment(att)
                                          : handleDownloadAttachment(att)
                                      }
                                      className="flex items-center gap-1 px-1.5 py-0.5 rounded border bg-gray-50 hover:bg-white text-[10px] text-gray-600 hover:text-cyan-600 transition-colors max-w-full"
                                      title={att.file_name}
                                    >
                                      {att.content_type.startsWith("image/") ? (
                                        <svg className="w-3 h-3 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                      ) : (
                                        <svg className="w-3 h-3 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                        </svg>
                                      )}
                                      <span className="truncate">{att.file_name}</span>
                                    </button>
                                  ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={commentsEndRef} />
                  </div>

                  {/* Comment input */}
                  <div className="mt-3 pt-3 border-t">
                    <div className="relative">
                      {/* Highlight backdrop */}
                      <div
                        aria-hidden
                        className="absolute inset-0 p-2 text-xs leading-[1.5] whitespace-pre-wrap break-words pointer-events-none overflow-hidden border border-transparent rounded-md"
                      >
                        {newComment ? renderCommentContent(newComment) : ""}
                        {/* Extra space to prevent scrolling mismatch */}
                        {"\n "}
                      </div>
                      <textarea
                        ref={commentTextareaRef}
                        value={newComment}
                        onChange={handleCommentChange}
                        placeholder="Write a comment... Use @ to mention"
                        className="w-full text-xs border rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 resize-none bg-transparent relative z-10"
                        style={{ color: "transparent", caretColor: "#111827" }}
                        rows={2}
                        onPaste={handlePaste}
                        onKeyDown={(e) => {
                          if (mentionQuery !== null && mentionUsers.length > 0) {
                            if (e.key === "ArrowDown") {
                              e.preventDefault();
                              setMentionIndex((i) => Math.min(i + 1, mentionUsers.length - 1));
                              return;
                            }
                            if (e.key === "ArrowUp") {
                              e.preventDefault();
                              setMentionIndex((i) => Math.max(i - 1, 0));
                              return;
                            }
                            if (e.key === "Enter" || e.key === "Tab") {
                              e.preventDefault();
                              insertMention(mentionUsers[mentionIndex]);
                              return;
                            }
                            if (e.key === "Escape") {
                              e.preventDefault();
                              setMentionQuery(null);
                              return;
                            }
                          }
                          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                            e.preventDefault();
                            handlePostComment();
                          }
                        }}
                        onBlur={() => setTimeout(() => setMentionQuery(null), 150)}
                      />
                      {/* Mention dropdown */}
                      {mentionQuery !== null && mentionUsers.length > 0 && (
                        <div className="absolute bottom-full left-0 mb-1 w-full bg-white border rounded-md shadow-lg z-30 max-h-32 overflow-y-auto">
                          {mentionUsers.map((u, i) => (
                            <button
                              key={u.id}
                              type="button"
                              className={`w-full text-left px-2.5 py-1.5 text-xs flex items-center gap-2 transition-colors ${
                                i === mentionIndex
                                  ? "bg-cyan-50 text-cyan-700"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                insertMention(u);
                              }}
                              onMouseEnter={() => setMentionIndex(i)}
                            >
                              <div className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center text-[8px] font-bold shrink-0">
                                {getInitials(u.display_name)}
                              </div>
                              {u.display_name ?? u.id.slice(0, 8)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Pending files preview */}
                    {pendingFiles.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {pendingFiles.map((f, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-50 border border-cyan-200 text-[10px] text-cyan-700"
                          >
                            {f.type.startsWith("image/") ? (
                              <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            ) : (
                              <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                            )}
                            <span className="truncate max-w-[100px]">{f.name}</span>
                            <button
                              onClick={() => setPendingFiles((prev) => prev.filter((_, idx) => idx !== i))}
                              className="ml-0.5 text-cyan-400 hover:text-red-500"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-1.5">
                      <div className="flex items-center gap-2">
                        <input
                          ref={commentFileInputRef}
                          type="file"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files) {
                              setPendingFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
                              e.target.value = "";
                            }
                          }}
                          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                        />
                        <button
                          type="button"
                          onClick={() => commentFileInputRef.current?.click()}
                          className="text-gray-300 hover:text-cyan-500 transition-colors"
                          title="Attach file"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                        </button>
                        <span className="text-[10px] text-gray-400">
                          {"\u2318"}+Enter &middot; Paste or drop files
                        </span>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handlePostComment}
                        disabled={postingComment || (!newComment.trim() && pendingFiles.length === 0)}
                        className="h-6 text-[11px] px-2"
                      >
                        {postingComment ? "..." : "Post"}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : activeTab === "activity" ? (
                /* Activity Tab */
                <div className="flex-1 overflow-y-auto max-h-[400px] pr-1">
                  {activity.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-6">
                      No activity yet
                    </p>
                  )}
                  <div className="relative">
                    {activity.length > 0 && (
                      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200" />
                    )}
                    <div className="space-y-3">
                      {activity.map((a) => (
                        <div key={a.id} className="flex items-start gap-2.5 relative">
                          <div className="w-[15px] h-[15px] rounded-full bg-gray-200 border-2 border-white z-10 shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] text-gray-600 leading-relaxed">
                              {activityMessage(a)}
                            </p>
                            <span className="text-[10px] text-gray-400">
                              {formatTime(a.created_at)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Files Tab */
                <div className="flex flex-col flex-1 min-h-0">
                  <div className="flex-1 overflow-y-auto max-h-[320px] pr-1 space-y-2">
                    {attachments.length === 0 && !uploading && (
                      <div className="text-center py-6">
                        <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <p className="text-xs text-gray-400">No files attached</p>
                        <p className="text-[10px] text-gray-300 mt-1">Drop files here or paste from clipboard</p>
                      </div>
                    )}
                    {attachments.map((att) => (
                      <div
                        key={att.id}
                        className="group rounded-lg border bg-gray-50 hover:bg-white transition-colors overflow-hidden"
                      >
                        {/* Image preview */}
                        {att.content_type.startsWith("image/") && (
                          <button
                            onClick={() => handlePreviewAttachment(att)}
                            className="w-full block cursor-pointer"
                          >
                            <div className="w-full h-24 bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 relative overflow-hidden">
                              <img
                                src=""
                                alt={att.file_name}
                                className="hidden"
                                data-path={att.file_path}
                              />
                              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="absolute bottom-1 right-1 bg-black/50 text-white text-[8px] px-1 rounded">Click to preview</span>
                            </div>
                          </button>
                        )}
                        <div className="flex items-center gap-2 px-2.5 py-2">
                          {!att.content_type.startsWith("image/") && (
                            <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center text-[8px] font-bold text-gray-500 shrink-0">
                              {fileIcon(att.content_type)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <button
                              onClick={() => att.content_type.startsWith("image/") ? handlePreviewAttachment(att) : handleDownloadAttachment(att)}
                              className="text-xs font-medium text-gray-700 hover:text-cyan-600 truncate block w-full text-left transition-colors"
                              title={att.file_name}
                            >
                              {att.file_name}
                            </button>
                            <span className="text-[10px] text-gray-400">
                              {formatFileSize(att.file_size)} &middot; {formatTime(att.created_at)}
                            </span>
                          </div>
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                            <button
                              onClick={() => handleDownloadAttachment(att)}
                              className="p-1 text-gray-300 hover:text-cyan-500"
                              title="Download"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setConfirmDeleteAttachment(att)}
                              className="p-1 text-gray-300 hover:text-red-500"
                              title="Remove file"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {uploading && (
                      <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg border bg-cyan-50">
                        <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs text-cyan-600">Uploading...</span>
                      </div>
                    )}
                  </div>

                  {/* Upload button */}
                  <div className="mt-3 pt-3 border-t">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => handleUploadFiles(e.target.files)}
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full text-xs"
                    >
                      <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Attach files
                    </Button>
                    <p className="text-[10px] text-gray-400 text-center mt-1">
                      Max 10MB per file
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>

      {/* Image preview overlay */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center cursor-pointer"
          onClick={() => setPreviewUrl(null)}
        >
          <button
            onClick={() => setPreviewUrl(null)}
            className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={previewUrl}
            alt="Preview"
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Delete attachment confirmation */}
      {confirmDeleteAttachment && (
        <div
          className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center"
          onClick={() => setConfirmDeleteAttachment(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-5 max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold text-gray-900">Delete attachment?</h3>
            <p className="text-xs text-gray-500 mt-1.5">
              &ldquo;{confirmDeleteAttachment.file_name}&rdquo; will be permanently removed.
            </p>
            <div className="flex gap-2 mt-4 justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setConfirmDeleteAttachment(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={async () => {
                  await handleDeleteAttachment(confirmDeleteAttachment);
                  setConfirmDeleteAttachment(null);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
}
