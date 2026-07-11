"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/shared/utils/supabase/client";
import type { BoardColumn } from "./task-types";

const PRESET_COLORS = [
  "#6b7280",
  "#ef4444",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  column: BoardColumn | null;
  columns: BoardColumn[];
  boardId: string;
}

export function ColumnDialog({ open, onOpenChange, column, columns, boardId }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#6b7280");

  useEffect(() => {
    if (column) {
      setName(column.name);
      setColor(column.color);
    } else {
      setName("");
      setColor("#6b7280");
    }
    setConfirmDelete(false);
  }, [column, open]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);

    const supabase = createClient();

    if (column) {
      await supabase
        .from("board_columns")
        .update({ name: name.trim(), color })
        .eq("id", column.id);
    } else {
      const nextPosition = columns.length;
      await supabase.from("board_columns").insert({
        name: name.trim(),
        color,
        position: nextPosition,
        board_id: boardId,
      });
    }

    setSaving(false);
    onOpenChange(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!column) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("board_columns").delete().eq("id", column.id);
    setSaving(false);
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {column ? "Edit Column" : "Add Column"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
              required
              placeholder="Column name"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${
                    color === c
                      ? "border-gray-900 scale-110"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? "Saving..." : column ? "Update" : "Add Column"}
            </Button>

            {column && !confirmDelete && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmDelete(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Delete
              </Button>
            )}

            {column && confirmDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={saving}
              >
                Delete (tasks too!)
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
