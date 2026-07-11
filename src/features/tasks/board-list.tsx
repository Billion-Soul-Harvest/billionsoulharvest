"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

interface BoardWithCounts extends Board {
  columnCount: number;
  taskCount: number;
}

interface Props {
  boards: BoardWithCounts[];
}

export function BoardList({ boards }: Props) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<BoardWithCounts | null>(null);
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

  function openEdit(e: React.MouseEvent, board: BoardWithCounts) {
    e.preventDefault();
    e.stopPropagation();
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
        await supabase.from("board_columns").insert([
          { board_id: data.id, name: "To Do", position: 0, color: "#6b7280" },
          { board_id: data.id, name: "In Progress", position: 1, color: "#f59e0b" },
          { board_id: data.id, name: "Done", position: 2, color: "#10b981" },
        ]);
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
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Task Boards</h1>
        <Button onClick={openCreate} size="sm">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Board
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {boards.map((board) => (
          <Link
            key={board.id}
            href={`/admin/tasks/${board.id}`}
            className="group bg-white rounded-xl border p-5 hover:shadow-md hover:border-cyan-200 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-cyan-700 transition-colors">
                    {board.name}
                  </h3>
                  {board.description && (
                    <p className="text-sm text-gray-500 mt-0.5">{board.description}</p>
                  )}
                </div>
              </div>
              <button
                onClick={(e) => openEdit(e, board)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all"
                title="Edit board"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>{board.columnCount} columns</span>
              <span>{board.taskCount} tasks</span>
            </div>
          </Link>
        ))}

        {/* New board card */}
        <button
          onClick={openCreate}
          className="flex flex-col items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-5 min-h-[120px] hover:border-cyan-300 hover:bg-cyan-50/30 transition-all text-gray-400 hover:text-cyan-600"
        >
          <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-sm font-medium">Create new board</span>
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
              {editingBoard && !confirmDelete && (
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
    </div>
  );
}
