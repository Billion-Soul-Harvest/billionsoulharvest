"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { createClient } from "@/shared/utils/supabase/client";

interface Position {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface Props {
  initialPositions: Position[];
  contactCounts: Record<string, number>;
}

export function PositionsClient({ initialPositions, contactCounts }: Props) {
  const router = useRouter();
  const [view, setView] = useState<"table" | "cards">("table");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  function openCreate() {
    setEditingId(null);
    setForm({ name: "", description: "" });
    setDialogOpen(true);
  }

  function openEdit(position: Position) {
    setEditingId(position.id);
    setForm({ name: position.name, description: position.description ?? "" });
    setDialogOpen(true);
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name) return;
    setSaving(true);

    const supabase = createClient();
    const payload = {
      name: form.name,
      description: form.description || null,
    };

    if (editingId) {
      await supabase.from("positions").update(payload).eq("id", editingId);
    } else {
      await supabase.from("positions").insert(payload);
    }

    setSaving(false);
    setDialogOpen(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    setDeleting(true);
    const supabase = createClient();
    await supabase.from("positions").delete().eq("id", id);
    setDeleting(false);
    setDeleteDialog(null);
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Positions</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-lg overflow-hidden">
            <button
              onClick={() => setView("table")}
              className={`p-2 ${view === "table" ? "bg-gray-100 text-gray-900" : "text-gray-400 hover:text-gray-600"}`}
              title="Table view"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setView("cards")}
              className={`p-2 ${view === "cards" ? "bg-gray-100 text-gray-900" : "text-gray-400 hover:text-gray-600"}`}
              title="Card view"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-5a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-5a1 1 0 01-1-1v-4z" />
              </svg>
            </button>
          </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button onClick={openCreate} />}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Position
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Position" : "New Position"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input value={form.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, name: e.target.value })}
                  required placeholder="e.g. Senior Pastor" />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea value={form.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description of this position..." className="min-h-[60px]" />
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update Position" : "Create Position"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {initialPositions.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          No positions yet. Create one to get started.
        </div>
      ) : view === "table" ? (
        /* Table view */
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Description</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Contacts</th>
                <th className="px-4 py-3 w-24"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {initialPositions.map((position) => {
                const count = contactCounts[position.id] ?? 0;
                return (
                  <tr key={position.id} className="hover:bg-gray-50/50 group/row">
                    <td className="px-4 py-3 font-medium text-gray-900">{position.name}</td>
                    <td className="px-4 py-3 text-gray-500">{position.description || "—"}</td>
                    <td className="px-4 py-3 text-gray-900">{count}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(position)}
                          className="text-gray-400 hover:text-gray-600 text-sm"
                        >
                          Edit
                        </button>
                        {count === 0 && (
                          <button
                            onClick={() => setDeleteDialog(position.id)}
                            className="text-gray-400 hover:text-red-600 text-sm"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Card view */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {initialPositions.map((position) => {
            const count = contactCounts[position.id] ?? 0;
            return (
              <div key={position.id} className="bg-white rounded-xl border p-5 relative overflow-hidden">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{position.name}</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(position)}
                      className="text-gray-400 hover:text-gray-600 text-sm"
                    >
                      Edit
                    </button>
                    {count === 0 && (
                      <button
                        onClick={() => setDeleteDialog(position.id)}
                        className="text-gray-400 hover:text-red-600 text-sm"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {position.description && (
                  <p className="text-sm text-gray-500 mb-4">{position.description}</p>
                )}

                <div className="text-sm">
                  <p className="text-xl font-bold text-gray-900">{count}</p>
                  <p className="text-xs text-gray-400">contacts</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog !== null} onOpenChange={(open) => { if (!open) setDeleteDialog(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Position</DialogTitle>
            <DialogDescription>Are you sure you want to delete this position? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button variant="destructive" onClick={() => deleteDialog && handleDelete(deleteDialog)} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
