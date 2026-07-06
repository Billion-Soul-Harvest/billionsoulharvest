"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { createClient } from "@/shared/utils/supabase/client";
import { toast } from "sonner";
import { Search, Plus, MoreVertical, Pencil, Trash2 } from "lucide-react";

interface Tag {
  id: string;
  name: string;
  created_at: string;
  contact_count: number;
}

type SortCol = "name" | "contact_count" | "created_at";
type SortDir = "asc" | "desc";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function TagsManager({ tags: initialTags }: { tags: Tag[] }) {
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSearchChange(value: string) {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(value), 300);
  }

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);
  const [sort, setSort] = useState<{ col: SortCol; dir: SortDir }>({
    col: "created_at",
    dir: "desc",
  });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [renameTag, setRenameTag] = useState<Tag | null>(null);
  const [deleteTag, setDeleteTag] = useState<Tag | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // Form states
  const [newTagName, setNewTagName] = useState("");
  const [renameValue, setRenameValue] = useState("");
  const [saving, setSaving] = useState(false);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = () => setMenuOpen(null);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [menuOpen]);

  // Filter and sort
  const filtered = tags.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    const col = sort.col;
    let cmp = 0;
    if (col === "name") {
      cmp = a.name.localeCompare(b.name);
    } else if (col === "contact_count") {
      cmp = a.contact_count - b.contact_count;
    } else {
      cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    return sort.dir === "asc" ? cmp : -cmp;
  });

  function toggleSort(col: SortCol) {
    setSort((prev) =>
      prev.col === col
        ? { col, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { col, dir: "asc" }
    );
  }

  function sortIndicator(col: SortCol) {
    if (sort.col !== col) return null;
    return sort.dir === "asc" ? " \u2191" : " \u2193";
  }

  const allFilteredSelected =
    sorted.length > 0 && sorted.every((t) => selected.has(t.id));

  function toggleSelectAll() {
    if (allFilteredSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(sorted.map((t) => t.id)));
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  // --- Actions ---

  async function handleCreate() {
    const name = newTagName.trim();
    if (!name) return;
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("tags")
      .insert({ name })
      .select("id, name, created_at")
      .single();

    if (error) {
      toast.error(error.message);
      setSaving(false);
      return;
    }

    const newTag: Tag = {
      id: data.id,
      name: data.name,
      created_at: data.created_at,
      contact_count: 0,
    };
    setTags((prev) => [newTag, ...prev]);
    setNewTagName("");
    setCreateOpen(false);
    setSaving(false);
    toast.success(`Tag "${name}" created`);
  }

  async function handleRename() {
    if (!renameTag) return;
    const newName = renameValue.trim();
    if (!newName || newName === renameTag.name) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("rename_tag", {
      p_old: renameTag.name,
      p_new: newName,
    });

    if (error) {
      toast.error(error.message);
      setSaving(false);
      return;
    }

    setTags((prev) =>
      prev.map((t) => (t.id === renameTag.id ? { ...t, name: newName } : t))
    );
    setRenameTag(null);
    setSaving(false);
    toast.success(`Tag renamed to "${newName}"`);
  }

  async function handleDelete() {
    if (!deleteTag) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("delete_tag", {
      p_name: deleteTag.name,
    });

    if (error) {
      toast.error(error.message);
      setSaving(false);
      return;
    }

    setTags((prev) => prev.filter((t) => t.id !== deleteTag.id));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(deleteTag.id);
      return next;
    });
    setDeleteTag(null);
    setSaving(false);
    toast.success(`Tag "${deleteTag.name}" deleted`);
  }

  async function handleBulkDelete() {
    const selectedNames = tags
      .filter((t) => selected.has(t.id))
      .map((t) => t.name);
    if (selectedNames.length === 0) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("delete_tags", {
      p_names: selectedNames,
    });

    if (error) {
      toast.error(error.message);
      setSaving(false);
      return;
    }

    setTags((prev) => prev.filter((t) => !selected.has(t.id)));
    setSelected(new Set());
    setBulkDeleteOpen(false);
    setSaving(false);
    toast.success(`${selectedNames.length} tag(s) deleted`);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage tags</h1>
          <p className="text-sm text-gray-500 mt-1">
            Tags are simple labels used to help organize and filter your
            contacts.
          </p>
        </div>
        <Button onClick={() => { setNewTagName(""); setCreateOpen(true); }}>
          <Plus data-icon="inline-start" />
          Create new tag
        </Button>
      </div>

      {/* Search + count bar */}
      <div className="bg-white rounded-xl border p-4 mb-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">
              All tags
            </span>
            <Badge variant="secondary">{tags.length}</Badge>
          </div>
          <div className="flex items-center gap-3">
            {selected.size > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setBulkDeleteOpen(true)}
              >
                <Trash2 data-icon="inline-start" />
                Delete selected ({selected.size})
              </Button>
            )}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                value={searchInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleSearchChange(e.target.value)
                }
                placeholder="Search by tag name"
                className="pl-9 w-[220px]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      {sorted.length === 0 && searchInput === search ? (
        <div className="text-center py-12 text-gray-400">
          {tags.length === 0
            ? "No tags yet. Create one to get started."
            : "No tags match your search."}
        </div>
      ) : (
        <div className="relative bg-white rounded-xl border border-t-0 rounded-t-none overflow-hidden">
          {searchInput !== search && (
            <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
              <svg className="w-6 h-6 text-cyan-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          )}
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-3 py-3 w-10">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-gray-300 accent-primary"
                    checked={allFilteredSelected}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th
                  className="text-left px-4 py-3 font-medium text-gray-500 cursor-pointer select-none"
                  onClick={() => toggleSort("name")}
                >
                  Name{sortIndicator("name")}
                </th>
                <th
                  className="text-left px-4 py-3 font-medium text-gray-500 cursor-pointer select-none"
                  onClick={() => toggleSort("contact_count")}
                >
                  Contacts{sortIndicator("contact_count")}
                </th>
                <th
                  className="text-left px-4 py-3 font-medium text-gray-500 cursor-pointer select-none"
                  onClick={() => toggleSort("created_at")}
                >
                  Date created{sortIndicator("created_at")}
                </th>
                <th className="px-3 py-3 w-10">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sorted.map((tag) => (
                <tr key={tag.id} className="hover:bg-gray-50/50">
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      className="size-4 rounded border-gray-300 accent-primary"
                      checked={selected.has(tag.id)}
                      onChange={() => toggleSelect(tag.id)}
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {tag.name}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {tag.contact_count.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDate(tag.created_at)}
                  </td>
                  <td className="px-3 py-3 relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(menuOpen === tag.id ? null : tag.id);
                      }}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded"
                    >
                      <MoreVertical className="size-5" />
                    </button>
                    {menuOpen === tag.id && (
                      <div className="absolute right-4 mt-1 bg-white border rounded-lg shadow-lg py-1 z-10 min-w-[150px]">
                        <button
                          onClick={() => {
                            setMenuOpen(null);
                            setRenameValue(tag.name);
                            setRenameTag(tag);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Pencil className="size-4" />
                          Rename
                        </button>
                        <button
                          onClick={() => {
                            setMenuOpen(null);
                            setDeleteTag(tag);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Tag Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create tag</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreate();
            }}
            className="space-y-4 mt-2"
          >
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Tag name
              </label>
              <Input
                value={newTagName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewTagName(e.target.value.slice(0, 255))
                }
                required
                placeholder="Enter tag name"
                autoFocus
                maxLength={255}
              />
              <p className="text-xs text-gray-400 text-right">
                {newTagName.length}/255
              </p>
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Cancel
              </DialogClose>
              <Button type="submit" disabled={saving || !newTagName.trim()}>
                {saving ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Rename Tag Dialog */}
      <Dialog
        open={renameTag !== null}
        onOpenChange={(open) => {
          if (!open) setRenameTag(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename tag</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRename();
            }}
            className="space-y-4 mt-2"
          >
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Tag name
              </label>
              <Input
                value={renameValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setRenameValue(e.target.value.slice(0, 255))
                }
                required
                autoFocus
                maxLength={255}
              />
              <p className="text-xs text-gray-400 text-right">
                {renameValue.length}/255
              </p>
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Cancel
              </DialogClose>
              <Button type="submit" disabled={saving || !renameValue.trim()}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Tag Dialog */}
      <Dialog
        open={deleteTag !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTag(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete &lsquo;{deleteTag?.name}&rsquo;?</DialogTitle>
            <DialogDescription>
              This will remove the tag from {deleteTag?.contact_count ?? 0}{" "}
              contact{deleteTag?.contact_count === 1 ? "" : "s"}. This cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={saving}
            >
              {saving ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Dialog */}
      <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {selected.size} tags?</DialogTitle>
            <DialogDescription>
              This will remove the selected tags from all associated contacts.
              This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={saving}
            >
              {saving ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
