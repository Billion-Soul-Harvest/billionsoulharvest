"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import { createClient } from "@/shared/utils/supabase/client";
import { KanbanColumn } from "./kanban-column";
import { TaskCard } from "./task-card";
import { TaskDialog } from "./task-dialog";
import { ColumnDialog } from "./column-dialog";
import { Button } from "@/components/ui/button";
import type {
  Board,
  BoardColumn,
  Task,
  TaskLabel,
  AdminUser,
} from "./task-types";
import { createNotification } from "@/features/notifications/create-notification";

type DueDateFilter = "overdue" | "due-week" | "no-date";

const priorityOptions = ["urgent", "high", "medium", "low"] as const;
const priorityColors: Record<string, string> = {
  urgent: "bg-red-100 text-red-700 border-red-200 hover:bg-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200",
  low: "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200",
};
const priorityColorsActive: Record<string, string> = {
  urgent: "bg-red-500 text-white border-red-500",
  high: "bg-orange-500 text-white border-orange-500",
  medium: "bg-yellow-500 text-white border-yellow-500",
  low: "bg-gray-500 text-white border-gray-500",
};

interface Props {
  board: Board;
  initialColumns: BoardColumn[];
  initialTasks: Task[];
  adminUsers: AdminUser[];
  allLabels: TaskLabel[];
}

export function KanbanBoard({
  board,
  initialColumns,
  initialTasks,
  adminUsers,
  allLabels,
}: Props) {
  const router = useRouter();
  const [columns, setColumns] = useState(initialColumns);
  const [tasks, setTasks] = useState(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [preselectedColumnId, setPreselectedColumnId] = useState<string | null>(null);
  const [columnDialogOpen, setColumnDialogOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<BoardColumn | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<Set<string>>(new Set());
  const [assigneeFilter, setAssigneeFilter] = useState<Set<string>>(new Set());
  const [labelFilter, setLabelFilter] = useState<Set<string>>(new Set());
  const [dueDateFilter, setDueDateFilter] = useState<Set<DueDateFilter>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

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
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownSearch, setDropdownSearch] = useState("");
  const filterBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterBarRef.current && !filterBarRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const hasActiveFilters = search || priorityFilter.size > 0 || assigneeFilter.size > 0 || labelFilter.size > 0 || dueDateFilter.size > 0;

  const filteredTasks = useMemo(() => {
    if (!hasActiveFilters) return tasks;

    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return tasks.filter((t) => {
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (priorityFilter.size > 0 && !priorityFilter.has(t.priority)) return false;
      if (assigneeFilter.size > 0) {
        if (!t.assigned_to || !assigneeFilter.has(t.assigned_to)) return false;
      }
      if (labelFilter.size > 0) {
        if (!t.labels.some((l) => labelFilter.has(l.id))) return false;
      }
      if (dueDateFilter.size > 0) {
        const matchesAny = Array.from(dueDateFilter).some((f) => {
          if (f === "no-date") return !t.due_date;
          if (f === "overdue") return t.due_date && new Date(t.due_date + "T00:00:00") < now;
          if (f === "due-week") return t.due_date && new Date(t.due_date + "T00:00:00") <= weekFromNow && new Date(t.due_date + "T00:00:00") >= now;
          return true;
        });
        if (!matchesAny) return false;
      }
      return true;
    });
  }, [tasks, search, priorityFilter, assigneeFilter, labelFilter, dueDateFilter, hasActiveFilters]);

  const tasksSnapshot = useRef<Task[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const tasksByColumn = useCallback(
    (columnId: string) =>
      filteredTasks
        .filter((t) => t.column_id === columnId)
        .sort((a, b) => a.position - b.position),
    [filteredTasks]
  );

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) {
      setActiveTask(task);
      tasksSnapshot.current = [...tasks];
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    const overTask = tasks.find((t) => t.id === overId);
    const overColumnId = overTask ? overTask.column_id : overId;

    if (activeTask.column_id === overColumnId) return;

    setTasks((prev) => {
      const withoutActive = prev.filter((t) => t.id !== activeId);
      const targetTasks = withoutActive
        .filter((t) => t.column_id === overColumnId)
        .sort((a, b) => a.position - b.position);

      let newIndex = targetTasks.length;
      if (overTask) {
        newIndex = targetTasks.findIndex((t) => t.id === overId);
        if (newIndex === -1) newIndex = targetTasks.length;
      }

      const updated: Task = {
        ...activeTask,
        column_id: overColumnId,
        position: newIndex,
      };

      const newTargetTasks = [...targetTasks];
      newTargetTasks.splice(newIndex, 0, updated);

      const result = withoutActive.filter(
        (t) => t.column_id !== overColumnId
      );
      newTargetTasks.forEach((t, i) => {
        result.push({ ...t, position: i });
      });

      return result;
    });
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) {
      setTasks(tasksSnapshot.current);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const task = tasks.find((t) => t.id === activeId);
    if (!task) return;

    const fromColumnId = task.column_id;

    if (activeId !== overId && task.column_id === (tasks.find((t) => t.id === overId)?.column_id ?? overId)) {
      const columnTasks = tasksByColumn(task.column_id);
      const oldIndex = columnTasks.findIndex((t) => t.id === activeId);
      const newIndex = columnTasks.findIndex((t) => t.id === overId);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const reordered = arrayMove(columnTasks, oldIndex, newIndex);
        setTasks((prev) => {
          const others = prev.filter((t) => t.column_id !== task.column_id);
          return [
            ...others,
            ...reordered.map((t, i) => ({ ...t, position: i })),
          ];
        });
      }
    }

    const finalTask = tasks.find((t) => t.id === activeId) ?? task;
    const finalColumnTasks = tasks
      .filter((t) => t.column_id === finalTask.column_id)
      .sort((a, b) => a.position - b.position);
    const finalPosition = finalColumnTasks.findIndex((t) => t.id === activeId);

    const supabase = createClient();
    const { error } = await supabase.rpc("reorder_task", {
      p_task_id: activeId,
      p_new_column_id: finalTask.column_id,
      p_new_position: finalPosition === -1 ? 0 : finalPosition,
    });

    if (error) {
      setTasks(tasksSnapshot.current);
    } else {
      // Notify assignee about the move (cross-column only)
      const movedTask = tasks.find((t) => t.id === activeId);
      if (movedTask?.assigned_to && fromColumnId !== finalTask.column_id) {
      const fromName = columns.find((c) => c.id === fromColumnId)?.name ?? "";
      const toName = columns.find((c) => c.id === finalTask.column_id)?.name ?? "";
      createNotification({
        recipientId: movedTask.assigned_to,
        type: "task_moved",
        title: `Task moved to ${toName}`,
        body: `"${movedTask.title}" from ${fromName}`,
        taskId: movedTask.id,
      });
      }
    }

    router.refresh();
  }

  function openCreateTask(columnId: string) {
    setEditingTask(null);
    setPreselectedColumnId(columnId);
    setTaskDialogOpen(true);
  }

  function openEditTask(task: Task) {
    setEditingTask(task);
    setPreselectedColumnId(null);
    setTaskDialogOpen(true);
  }

  function openCreateColumn() {
    setEditingColumn(null);
    setColumnDialogOpen(true);
  }

  function openEditColumn(column: BoardColumn) {
    setEditingColumn(column);
    setColumnDialogOpen(true);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/tasks"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{board.name}</h1>
            {board.description && (
              <p className="text-sm text-gray-500">{board.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant={hasActiveFilters ? "default" : "outline"}
            size="sm"
            className={hasActiveFilters ? "bg-cyan-600 hover:bg-cyan-700" : ""}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter
            {hasActiveFilters && (
              <span className="ml-1.5 bg-white/20 rounded-full px-1.5 text-[10px]">
                {priorityFilter.size + assigneeFilter.size + labelFilter.size + dueDateFilter.size + (search ? 1 : 0)}
              </span>
            )}
          </Button>
          <Button onClick={openCreateColumn} variant="outline" size="sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Column
          </Button>
        </div>
      </div>

      {/* Filter Bar — category dropdowns */}
      {showFilters && (
        <div ref={filterBarRef} className="mb-3 flex items-center gap-1.5 flex-wrap animate-in slide-in-from-top-2 duration-200">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-40 pl-7 pr-2 py-1.5 text-xs border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-300 transition-colors"
            />
          </div>

          {/* Priority dropdown */}
          <div className="relative">
            <button
              onClick={() => { setDropdownSearch(""); setOpenDropdown(openDropdown === "priority" ? null : "priority"); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                priorityFilter.size > 0
                  ? "bg-cyan-50 border-cyan-200 text-cyan-700"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Priority
              {priorityFilter.size > 0 && (
                <span className="bg-cyan-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px]">{priorityFilter.size}</span>
              )}
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {openDropdown === "priority" && (
              <div className="absolute top-full left-0 mt-1 bg-white rounded-lg border shadow-lg p-2 z-50 min-w-[140px]">
                {priorityOptions.map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      const next = new Set(priorityFilter);
                      next.has(p) ? next.delete(p) : next.add(p);
                      setPriorityFilter(next);
                    }}
                    className="flex items-center gap-2 w-full px-2 py-1.5 text-xs rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                      priorityFilter.has(p) ? "bg-cyan-500 border-cyan-500" : "border-gray-300"
                    }`}>
                      {priorityFilter.has(p) && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      )}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${priorityColors[p].split(" hover:")[0]}`}>{p}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Assignee dropdown */}
          {adminUsers.length > 0 && (
            <div className="relative">
              <button
                onClick={() => { setDropdownSearch(""); setOpenDropdown(openDropdown === "assignee" ? null : "assignee"); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  assigneeFilter.size > 0
                    ? "bg-cyan-50 border-cyan-200 text-cyan-700"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                Assignee
                {assigneeFilter.size > 0 && (
                  <span className="bg-cyan-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px]">{assigneeFilter.size}</span>
                )}
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {openDropdown === "assignee" && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg border shadow-lg z-50 min-w-[200px]">
                  <div className="p-2 border-b">
                    <input
                      type="text"
                      value={dropdownSearch}
                      onChange={(e) => setDropdownSearch(e.target.value)}
                      placeholder="Search assignees..."
                      className="w-full px-2 py-1 text-xs border rounded-md bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-500/30 focus:border-cyan-300"
                      autoFocus
                    />
                  </div>
                  <div className="p-1 max-h-[200px] overflow-y-auto">
                  {adminUsers.filter((u) => !dropdownSearch || (u.display_name ?? "").toLowerCase().includes(dropdownSearch.toLowerCase())).map((u) => {
                    const initials = u.display_name
                      ? u.display_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                      : "?";
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          const next = new Set(assigneeFilter);
                          next.has(u.id) ? next.delete(u.id) : next.add(u.id);
                          setAssigneeFilter(next);
                        }}
                        className="flex items-center gap-2 w-full px-2 py-1.5 text-xs rounded-md hover:bg-gray-50 transition-colors"
                      >
                        <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                          assigneeFilter.has(u.id) ? "bg-cyan-500 border-cyan-500" : "border-gray-300"
                        }`}>
                          {assigneeFilter.has(u.id) && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          )}
                        </span>
                        <span className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center text-[9px] font-bold">{initials}</span>
                        <span className="text-gray-700">{u.display_name ?? "Unknown"}</span>
                      </button>
                    );
                  })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Labels dropdown */}
          {allLabels.length > 0 && (
            <div className="relative">
              <button
                onClick={() => { setDropdownSearch(""); setOpenDropdown(openDropdown === "labels" ? null : "labels"); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  labelFilter.size > 0
                    ? "bg-cyan-50 border-cyan-200 text-cyan-700"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                Labels
                {labelFilter.size > 0 && (
                  <span className="bg-cyan-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px]">{labelFilter.size}</span>
                )}
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {openDropdown === "labels" && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg border shadow-lg z-50 min-w-[180px]">
                  <div className="p-2 border-b">
                    <input
                      type="text"
                      value={dropdownSearch}
                      onChange={(e) => setDropdownSearch(e.target.value)}
                      placeholder="Search labels..."
                      className="w-full px-2 py-1 text-xs border rounded-md bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-500/30 focus:border-cyan-300"
                      autoFocus
                    />
                  </div>
                  <div className="p-1 max-h-[200px] overflow-y-auto">
                  {allLabels.filter((l) => !dropdownSearch || l.name.toLowerCase().includes(dropdownSearch.toLowerCase())).map((l) => (
                    <button
                      key={l.id}
                      onClick={() => {
                        const next = new Set(labelFilter);
                        next.has(l.id) ? next.delete(l.id) : next.add(l.id);
                        setLabelFilter(next);
                      }}
                      className="flex items-center gap-2 w-full px-2 py-1.5 text-xs rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                        labelFilter.has(l.id) ? "bg-cyan-500 border-cyan-500" : "border-gray-300"
                      }`}>
                        {labelFilter.has(l.id) && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        )}
                      </span>
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: l.color }} />
                      <span className="text-gray-700">{l.name}</span>
                    </button>
                  ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Due Date dropdown */}
          <div className="relative">
            <button
              onClick={() => { setDropdownSearch(""); setOpenDropdown(openDropdown === "due" ? null : "due"); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                dueDateFilter.size > 0
                  ? "bg-cyan-50 border-cyan-200 text-cyan-700"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Due Date
              {dueDateFilter.size > 0 && (
                <span className="bg-cyan-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px]">{dueDateFilter.size}</span>
              )}
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {openDropdown === "due" && (
              <div className="absolute top-full left-0 mt-1 bg-white rounded-lg border shadow-lg p-2 z-50 min-w-[150px]">
                {([
                  { key: "overdue" as DueDateFilter, label: "Overdue", dot: "bg-red-500" },
                  { key: "due-week" as DueDateFilter, label: "Due this week", dot: "bg-blue-500" },
                  { key: "no-date" as DueDateFilter, label: "No due date", dot: "bg-gray-400" },
                ]).map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => {
                      const next = new Set(dueDateFilter);
                      next.has(opt.key) ? next.delete(opt.key) : next.add(opt.key);
                      setDueDateFilter(next);
                    }}
                    className="flex items-center gap-2 w-full px-2 py-1.5 text-xs rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                      dueDateFilter.has(opt.key) ? "bg-cyan-500 border-cyan-500" : "border-gray-300"
                    }`}>
                      {dueDateFilter.has(opt.key) && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      )}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${opt.dot}`} />
                    <span className="text-gray-700">{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clear all */}
          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearch("");
                setPriorityFilter(new Set());
                setAssigneeFilter(new Set());
                setLabelFilter(new Set());
                setDueDateFilter(new Set());
              }}
              className="px-2 py-1.5 text-[11px] text-gray-400 hover:text-red-500 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      <DndContext
        id="kanban-dnd"
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-12rem)]">
          {columns.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              tasks={tasksByColumn(col.id)}
              onAddTask={() => openCreateTask(col.id)}
              onEditTask={openEditTask}
              onEditColumn={() => openEditColumn(col)}
            />
          ))}
          {columns.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <p className="text-lg font-medium mb-2">No columns yet</p>
                <p className="text-sm mb-4">Add a column to start organizing tasks</p>
                <Button onClick={openCreateColumn} variant="outline" size="sm">
                  Add Column
                </Button>
              </div>
            </div>
          )}
        </div>

        <DragOverlay>
          {activeTask ? (
            <TaskCard task={activeTask} isOverlay adminUsers={adminUsers} />
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        task={editingTask}
        columns={columns}
        adminUsers={adminUsers}
        allLabels={allLabels}
        preselectedColumnId={preselectedColumnId}
      />

      <ColumnDialog
        open={columnDialogOpen}
        onOpenChange={setColumnDialogOpen}
        column={editingColumn}
        columns={columns}
        boardId={board.id}
      />
    </div>
  );
}
