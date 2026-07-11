"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import type { Task, AdminUser } from "./task-types";

const priorityColors: Record<string, string> = {
  urgent: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-gray-100 text-gray-600",
};

interface Props {
  task: Task;
  isOverlay?: boolean;
  onClick?: () => void;
  adminUsers?: AdminUser[];
}

export function TaskCard({ task, isOverlay, onClick }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const isOverdue =
    task.due_date && new Date(task.due_date + "T00:00:00") < new Date();

  const initials = task.assignee?.display_name
    ? task.assignee.display_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : null;

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={isOverlay ? undefined : style}
      {...(isOverlay ? {} : attributes)}
      {...(isOverlay ? {} : listeners)}
      onClick={onClick}
      className={`bg-white rounded-lg border p-3 cursor-grab active:cursor-grabbing shadow-sm hover:shadow transition-shadow ${
        isOverlay ? "shadow-lg rotate-2" : ""
      }`}
    >
      {/* Labels */}
      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.labels.map((label) => (
            <span
              key={label.id}
              className="inline-block h-1.5 w-8 rounded-full"
              style={{ backgroundColor: label.color }}
              title={label.name}
            />
          ))}
        </div>
      )}

      {/* Title */}
      <p className="text-sm font-medium text-gray-800 mb-2">{task.title}</p>

      {/* Bottom row */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge
          variant="secondary"
          className={`text-[10px] px-1.5 py-0 ${priorityColors[task.priority]}`}
        >
          {task.priority}
        </Badge>

        {task.due_date && (
          <span
            className={`text-[11px] ${
              isOverdue ? "text-red-500 font-semibold" : "text-gray-400"
            }`}
          >
            {new Date(task.due_date + "T00:00:00").toLocaleDateString(
              undefined,
              { month: "short", day: "numeric" }
            )}
          </span>
        )}

        <div className="flex-1" />

        {initials && (
          <div
            className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center text-[10px] font-semibold"
            title={task.assignee?.display_name ?? ""}
          >
            {initials}
          </div>
        )}
      </div>
    </div>
  );
}
