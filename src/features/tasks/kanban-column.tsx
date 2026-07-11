"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { TaskCard } from "./task-card";
import type { BoardColumn, Task } from "./task-types";

interface Props {
  column: BoardColumn;
  tasks: Task[];
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onEditColumn: () => void;
  boardName?: string;
}

export function KanbanColumn({
  column,
  tasks,
  onAddTask,
  onEditTask,
  onEditColumn,
  boardName,
}: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex-shrink-0 w-80 flex flex-col bg-gray-100 rounded-xl">
      {/* Column header */}
      <div className="flex items-center gap-2 px-3 py-3">
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: column.color }}
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-gray-700 truncate">
            {column.name}
          </h3>
          {boardName && (
            <p className="text-[10px] text-gray-400 truncate">{boardName}</p>
          )}
        </div>
        <span className="text-xs text-gray-400 font-medium">
          {tasks.length}
        </span>
        <button
          onClick={onEditColumn}
          className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        </button>
      </div>

      {/* Task list */}
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={`flex-1 px-2 pb-2 space-y-2 min-h-[60px] transition-colors rounded-lg ${
            isOver ? "bg-gray-200/60" : ""
          }`}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onEditTask(task)}
            />
          ))}
        </div>
      </SortableContext>

      {/* Add task button */}
      <button
        onClick={onAddTask}
        className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 rounded-b-xl transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        Add task
      </button>
    </div>
  );
}
