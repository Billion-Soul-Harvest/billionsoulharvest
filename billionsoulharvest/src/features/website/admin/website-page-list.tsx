"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/shared/utils/supabase/client";
import { Button } from "@/components/ui/button";
import type { SitePage } from "@/shared/types/database";

interface Props {
  initialPages: SitePage[];
}

export function WebsitePageList({ initialPages }: Props) {
  const [pages, setPages] = useState(initialPages);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");

  // Build ordered list: parents followed by their children
  const topLevel = pages.filter((p) => !p.parent_id);
  const childrenOf = (parentId: string) =>
    pages.filter((p) => p.parent_id === parentId);

  const orderedPages: (SitePage & { isChild?: boolean })[] = [];
  for (const parent of topLevel) {
    orderedPages.push(parent);
    for (const child of childrenOf(parent.id)) {
      orderedPages.push({ ...child, isChild: true });
    }
  }

  async function handleReorder(id: string, direction: "up" | "down") {
    const idx = pages.findIndex((p) => p.id === id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= pages.length) return;

    const supabase = createClient();
    const a = pages[idx];
    const b = pages[swapIdx];

    await Promise.all([
      supabase.from("site_pages").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("site_pages").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);

    const updated = [...pages];
    const tempOrder = a.sort_order;
    updated[idx] = { ...a, sort_order: b.sort_order };
    updated[swapIdx] = { ...b, sort_order: tempOrder };
    updated.sort((x, y) => x.sort_order - y.sort_order);
    setPages(updated);
  }

  async function handleTogglePublished(id: string, published: boolean) {
    const supabase = createClient();
    await supabase.from("site_pages").update({ published: !published }).eq("id", id);
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, published: !published } : p)));
  }

  async function handleToggleNav(id: string, showInNav: boolean) {
    const supabase = createClient();
    await supabase.from("site_pages").update({ show_in_nav: !showInNav }).eq("id", id);
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, show_in_nav: !showInNav } : p)));
  }

  async function handleParentChange(id: string, parentId: string | null) {
    const supabase = createClient();
    await supabase.from("site_pages").update({ parent_id: parentId }).eq("id", id);
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, parent_id: parentId } : p)));
  }

  async function handleAnchorChange(id: string, anchor: string) {
    const supabase = createClient();
    const value = anchor.trim() || null;
    await supabase.from("site_pages").update({ nav_anchor: value }).eq("id", id);
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, nav_anchor: value } : p)));
  }

  async function handleAdd() {
    if (!newTitle.trim() || !newSlug.trim()) return;
    const supabase = createClient();
    const maxOrder = pages.length > 0 ? Math.max(...pages.map((p) => p.sort_order)) : -1;
    const { data, error } = await supabase
      .from("site_pages")
      .insert({
        title: newTitle.trim(),
        slug: newSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        sort_order: maxOrder + 1,
        published: false,
        show_in_nav: true,
      })
      .select()
      .single();

    if (!error && data) {
      setPages((prev) => [...prev, data as unknown as SitePage]);
      setNewTitle("");
      setNewSlug("");
      setAdding(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const supabase = createClient();
    await supabase.from("site_pages").delete().eq("id", id);
    setPages((prev) => prev.filter((p) => p.id !== id));
  }

  // Pages eligible to be a parent for a given page (not itself, not its own children)
  function getParentOptions(pageId: string) {
    const ownChildren = new Set(pages.filter((p) => p.parent_id === pageId).map((p) => p.id));
    return pages.filter((p) => p.id !== pageId && !ownChildren.has(p.id) && !p.parent_id);
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border divide-y">
        {orderedPages.map((page, idx) => (
          <div key={page.id} className={`flex items-center gap-4 px-5 py-4 ${page.isChild ? "pl-12" : ""}`}>
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => handleReorder(page.id, "up")}
                disabled={idx === 0}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                onClick={() => handleReorder(page.id, "down")}
                disabled={idx === orderedPages.length - 1}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {page.isChild && <span className="text-gray-400 text-sm">&#8627;</span>}
                <span className="font-medium text-gray-900">{page.title}</span>
                {page.is_home && (
                  <span className="text-xs bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-full font-medium">Home</span>
                )}
                <span className="text-xs text-gray-400">/{page.slug}</span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <button
                  onClick={() => handleTogglePublished(page.id, page.published)}
                  className={`text-xs font-medium ${page.published ? "text-green-600" : "text-gray-400"}`}
                >
                  {page.published ? "Published" : "Draft"}
                </button>
                <button
                  onClick={() => handleToggleNav(page.id, page.show_in_nav)}
                  className={`text-xs ${page.show_in_nav ? "text-blue-600" : "text-gray-400"}`}
                >
                  {page.show_in_nav ? "In Nav" : "Hidden from Nav"}
                </button>
              </div>
            </div>

            {/* Parent selector & anchor */}
            {!page.is_home && (
              <div className="flex items-center gap-2">
                <select
                  value={page.parent_id ?? ""}
                  onChange={(e) => handleParentChange(page.id, e.target.value || null)}
                  className="text-xs border rounded-lg px-2 py-1.5 text-gray-600 bg-white"
                >
                  <option value="">Top-level</option>
                  {getParentOptions(page.id).map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.title}</option>
                  ))}
                </select>
                {page.parent_id && (
                  <input
                    type="text"
                    defaultValue={page.nav_anchor ?? ""}
                    placeholder="#anchor"
                    onBlur={(e) => handleAnchorChange(page.id, e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                    className="text-xs border rounded-lg px-2 py-1.5 text-gray-600 bg-white w-24"
                    title="Scroll-to anchor ID (optional). If set, clicking this nav item scrolls to that section on the parent page."
                  />
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              <Link href={`/admin/website/${page.id}/builder`}>
                <Button size="sm" variant="outline">Edit Page</Button>
              </Link>
              {!page.is_home && (
                <button
                  onClick={() => handleDelete(page.id, page.title)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}

        {pages.length === 0 && (
          <div className="px-5 py-12 text-center text-gray-400">
            No pages yet. Add your first page below.
          </div>
        )}
      </div>

      {adding ? (
        <div className="bg-white rounded-xl border p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Page Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => {
                  setNewTitle(e.target.value);
                  setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
                }}
                placeholder="e.g. Our Team"
                className="w-full border rounded-lg px-3 py-2 text-sm"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">URL Slug</label>
              <input
                type="text"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                placeholder="e.g. our-team"
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd}>Add Page</Button>
            <Button size="sm" variant="outline" onClick={() => { setAdding(false); setNewTitle(""); setNewSlug(""); }}>Cancel</Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setAdding(true)}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Page
        </Button>
      )}
    </div>
  );
}
