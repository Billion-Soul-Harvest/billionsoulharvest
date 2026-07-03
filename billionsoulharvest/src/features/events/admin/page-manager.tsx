"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/shared/utils/supabase/client";
import type { EventPage } from "@/shared/types/database";
import { BlockEditor } from "./block-editor";
import type { EventPageBlock } from "@/shared/types/database";

interface Props {
  eventId: string;
  initialPages: EventPage[];
  initialBlocks: EventPageBlock[];
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function PageManager({ eventId, initialPages, initialBlocks }: Props) {
  const [pages, setPages] = useState<EventPage[]>(initialPages);
  const [blocks, setBlocks] = useState<EventPageBlock[]>(initialBlocks);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(
    initialPages[0]?.id ?? null
  );
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", slug: "", icon: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startAdd() {
    setEditing("new");
    setForm({ title: "", slug: "", icon: "" });
  }

  function startEdit(page: EventPage) {
    setEditing(page.id);
    setForm({ title: page.title, slug: page.slug, icon: page.icon ?? "" });
  }

  function cancel() {
    setEditing(null);
    setForm({ title: "", slug: "", icon: "" });
    setError(null);
  }

  async function save() {
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const slug = form.slug || slugify(form.title);

    const payload = {
      event_id: eventId,
      title: form.title,
      slug,
      icon: form.icon || null,
      sort_order: editing === "new" ? pages.length : undefined,
    };

    if (editing === "new") {
      const { data, error: err } = await supabase
        .from("event_pages")
        .insert(payload)
        .select()
        .single();
      if (err) { setError(err.message); setSaving(false); return; }
      const newPage = data as unknown as EventPage;
      setPages((prev) => [...prev, newPage]);
      setSelectedPageId(newPage.id);
    } else {
      const { title, slug: s, icon } = payload;
      const { data, error: err } = await supabase
        .from("event_pages")
        .update({ title, slug: s, icon })
        .eq("id", editing!)
        .select()
        .single();
      if (err) { setError(err.message); setSaving(false); return; }
      setPages((prev) => prev.map((p) => (p.id === editing ? (data as unknown as EventPage) : p)));
    }

    setSaving(false);
    cancel();
  }

  async function remove(id: string) {
    const supabase = createClient();
    const { error: err } = await supabase.from("event_pages").delete().eq("id", id);
    if (err) { setError(err.message); return; }
    setPages((prev) => prev.filter((p) => p.id !== id));
    setBlocks((prev) => prev.filter((b) => b.page_id !== id));
    if (selectedPageId === id) {
      setSelectedPageId(pages.find((p) => p.id !== id)?.id ?? null);
    }
  }

  async function movePageUp(id: string) {
    const idx = sortedPages.findIndex((p) => p.id === id);
    if (idx <= 0) return;
    await swapPageOrder(sortedPages[idx], sortedPages[idx - 1]);
  }

  async function movePageDown(id: string) {
    const idx = sortedPages.findIndex((p) => p.id === id);
    if (idx < 0 || idx >= sortedPages.length - 1) return;
    await swapPageOrder(sortedPages[idx], sortedPages[idx + 1]);
  }

  async function swapPageOrder(a: EventPage, b: EventPage) {
    const supabase = createClient();
    const [{ error: e1 }, { error: e2 }] = await Promise.all([
      supabase.from("event_pages").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("event_pages").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    if (e1 || e2) { setError((e1 || e2)!.message); return; }
    setPages((prev) =>
      prev.map((p) => {
        if (p.id === a.id) return { ...p, sort_order: b.sort_order };
        if (p.id === b.id) return { ...p, sort_order: a.sort_order };
        return p;
      })
    );
  }

  const sortedPages = [...pages].sort((a, b) => a.sort_order - b.sort_order);
  const selectedPage = pages.find((p) => p.id === selectedPageId);
  const pageBlocks = blocks.filter((b) => b.page_id === selectedPageId);

  return (
    <div className="space-y-6">
      {/* Page list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Pages ({pages.length})</h3>
          {!editing && (
            <Button size="sm" onClick={startAdd}>Add Page</Button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
        )}

        {editing && (
          <div className="bg-white rounded-xl border p-5 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Schedule"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder={slugify(form.title) || "auto-generated"}
                />
              </div>
              <div className="space-y-1">
                <Label>Icon (optional)</Label>
                <Input
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  placeholder="e.g. calendar"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={save} disabled={saving || !form.title}>
                {saving ? "Saving..." : editing === "new" ? "Add" : "Update"}
              </Button>
              <Button size="sm" variant="outline" onClick={cancel}>Cancel</Button>
            </div>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          {sortedPages.map((page) => (
            <button
              key={page.id}
              onClick={() => setSelectedPageId(page.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                selectedPageId === page.id
                  ? "bg-blue-50 border-blue-300 text-blue-700"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {page.title}
              {!page.published && (
                <span className="ml-1.5 text-[10px] bg-amber-100 text-amber-700 px-1 py-0.5 rounded">Draft</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Selected page actions & blocks */}
      {selectedPage && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-3">
            <h4 className="font-medium text-gray-900 flex-1">
              {selectedPage.title}
              <span className="text-gray-400 text-xs ml-2">/{selectedPage.slug}</span>
            </h4>
            <Button size="sm" variant="ghost" onClick={() => movePageUp(selectedPage.id)} disabled={sortedPages[0]?.id === selectedPage.id}>
              &uarr;
            </Button>
            <Button size="sm" variant="ghost" onClick={() => movePageDown(selectedPage.id)} disabled={sortedPages[sortedPages.length - 1]?.id === selectedPage.id}>
              &darr;
            </Button>
            <Button size="sm" variant="ghost" onClick={() => startEdit(selectedPage)} disabled={!!editing}>
              Edit
            </Button>
            <Button size="sm" variant="ghost" className="text-red-600" onClick={() => remove(selectedPage.id)} disabled={!!editing}>
              Delete
            </Button>
          </div>

          <BlockEditor
            eventId={eventId}
            pageId={selectedPage.id}
            initialBlocks={pageBlocks}
            onBlocksChange={(newBlocks) => {
              setBlocks((prev) => [
                ...prev.filter((b) => b.page_id !== selectedPage.id),
                ...newBlocks,
              ]);
            }}
          />
        </div>
      )}

      {pages.length === 0 && !editing && (
        <p className="text-sm text-gray-400 text-center py-8">
          No pages configured. Events without pages use the default fixed layout.
        </p>
      )}
    </div>
  );
}
