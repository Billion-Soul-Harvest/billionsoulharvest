"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createClient } from "@/shared/utils/supabase/client";
import type { TaskLabel } from "./task-types";

const LABEL_COLORS = [
  "#ef4444",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#6b7280",
];

interface Props {
  allLabels: TaskLabel[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

export function LabelManager({
  allLabels,
  selectedIds,
  onSelectionChange,
}: Props) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#3b82f6");
  const [creating, setCreating] = useState(false);

  function toggleLabel(id: string) {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  }

  async function handleCreateLabel(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!newName.trim()) return;
    setCreating(true);

    const supabase = createClient();
    const { data } = await supabase
      .from("task_labels")
      .insert({ name: newName.trim(), color: newColor })
      .select("id")
      .single();

    if (data) {
      onSelectionChange([...selectedIds, data.id]);
    }

    setNewName("");
    setShowCreate(false);
    setCreating(false);
    router.refresh();
  }

  return (
    <div className="space-y-1.5">
      <Label>Labels</Label>
      <div className="flex flex-wrap gap-1.5">
        {allLabels.map((label) => {
          const selected = selectedIds.includes(label.id);
          return (
            <button
              key={label.id}
              type="button"
              onClick={() => toggleLabel(label.id)}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all border ${
                selected
                  ? "ring-2 ring-offset-1"
                  : "opacity-60 hover:opacity-100"
              }`}
              style={{
                backgroundColor: label.color + "20",
                color: label.color,
                borderColor: label.color + "40",
                ...(selected ? { ringColor: label.color } : {}),
              }}
            >
              {selected && (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {label.name}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setShowCreate(!showCreate)}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border border-dashed border-gray-300 text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New
        </button>
      </div>

      {showCreate && (
        <div className="flex items-end gap-2 mt-2">
          <div className="flex-1">
            <Input
              value={newName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewName(e.target.value)
              }
              placeholder="Label name"
              className="h-8 text-sm"
            />
          </div>
          <div className="flex gap-1">
            {LABEL_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setNewColor(c)}
                className={`w-5 h-5 rounded-full border ${
                  newColor === c ? "border-gray-900 scale-110" : "border-transparent"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <Button
            type="button"
            size="sm"
            onClick={handleCreateLabel}
            disabled={creating || !newName.trim()}
            className="h-8"
          >
            Add
          </Button>
        </div>
      )}
    </div>
  );
}
