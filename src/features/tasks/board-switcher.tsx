"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/shared/utils/supabase/client";
import type { Board } from "./task-types";

interface Props {
  boards: Board[];
  activeBoardId: string | null;
  onBoardChange: (id: string | null) => void;
}

export function BoardSwitcher({ boards, activeBoardId, onBoardChange }: Props) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function openCreate() {
    setEditingBoard(null);
    setName("");
    setDescription("");
    setConfirmDelete(false);
    setDialogOpen(true);
  }

  function openEdit(board: Board) {
    setEditingBoard(board);
    setName(board.name);
    setDescription(board.description ?? "");
    setConfirmDelete(false);
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);

    const supabase = createClient();

    if (editingBoard) {
      await supabase
        .from("boards")
        .update({ name: name.trim(), description: description.trim() || null })
        .eq("id", editingBoard.id);
    } else {
      const { data } = await supabase
        .from("boards")
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          position: boards.length,
        })
        .select("id")
        .single();

      if (data) {
        // Create default columns for new board
        await supabase.from("board_columns").insert([
          { board_id: data.id, name: "To Do", position: 0, color: "#6b7280" },
          { board_id: data.id, name: "In Progress", position: 1, color: "#f59e0b" },
          { board_id: data.id, name: "Done", position: 2, color: "#10b981" },
        ]);

        // Switch to new board after refresh
        setTimeout(() => onBoardChange(data.id), 100);
      }
    }

    setSaving(false);
    setDialogOpen(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!editingBoard) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("boards").delete().eq("id", editingBoard.id);
    setSaving(false);
    setDialogOpen(false);

    // Switch to first remaining board
    const remaining = boards.filter((b) => b.id !== editingBoard.id);
    if (remaining.length > 0) {
      onBoardChange(remaining[0].id);
    }

    router.refresh();
  }

  return (
    <>
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => onBoardChange(null)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            activeBoardId === null
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          All
        </button>
        {boards.map((board) => (
          <div key={board.id} className="flex items-center">
            <button
              onClick={() => onBoardChange(board.id)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeBoardId === board.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {board.name}
            </button>
            {activeBoardId === board.id && (
              <button
                onClick={() => openEdit(board)}
                className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 ml-0.5"
                title="Edit board"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
          </div>
        ))}
        <button
          onClick={openCreate}
          className="px-2 py-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-white/50 transition-colors"
          title="New board"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBoard ? "Edit Board" : "New Board"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                required
                placeholder="e.g. Website Redesign"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <Input
                value={description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
                placeholder="Optional description"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving ? "Saving..." : editingBoard ? "Update" : "Create Board"}
              </Button>
              {editingBoard && boards.length > 1 && !confirmDelete && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setConfirmDelete(true)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Delete
                </Button>
              )}
              {editingBoard && confirmDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={saving}
                >
                  Delete Board
                </Button>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
