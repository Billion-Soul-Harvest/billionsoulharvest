"use client";

import { useState } from "react";
import { createClient } from "@/shared/utils/supabase/client";
import { useEventData } from "./event-context";
import { usePageContext } from "./page-context";

export function PagesTab() {
  const event = useEventData();
  const { activePageId, switchPage, pages, setPages, refreshPages } = usePageContext();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [parentSelectId, setParentSelectId] = useState<string | null>(null);

  const isEventBuilder = !!event.id;
  const isSiteBuilder = !event.id;

  const handleAddPage = async () => {
    const supabase = createClient();
    const newOrder = pages.length;
    const title = `Page ${newOrder + 1}`;
    const slug = `page-${Date.now()}`;

    if (isSiteBuilder) {
      const { data } = await supabase
        .from("site_pages")
        .insert({ title, slug, sort_order: newOrder, published: false, show_in_nav: true })
        .select()
        .single();

      if (data) {
        await refreshPages();
        switchPage(data.id);
      }
    } else {
      const { data } = await supabase
        .from("event_pages")
        .insert({ event_id: event.id, title, slug, sort_order: newOrder })
        .select()
        .single();

      if (data) {
        setPages((prev) => [...prev, data]);
        switchPage(data.id);
      }
    }
  };

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    const table = isSiteBuilder ? "site_pages" : "event_pages";
    await supabase.from(table).delete().eq("id", id);
    const remaining = pages.filter((p) => p.id !== id);
    setPages(remaining);
    if (activePageId === id) {
      switchPage(isSiteBuilder ? remaining[0]?.id ?? null : null);
    }
  };

  const handleRename = async (id: string) => {
    if (!editTitle.trim()) return;
    const supabase = createClient();
    const slug = editTitle.trim().toLowerCase().replace(/\s+/g, "-");
    const table = isSiteBuilder ? "site_pages" : "event_pages";
    await supabase.from(table).update({ title: editTitle.trim(), slug }).eq("id", id);

    setPages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, title: editTitle.trim(), slug } : p))
    );
    setEditingId(null);
  };

  const handleMoveUp = async (idx: number) => {
    if (idx === 0) return;
    const newPages = [...pages];
    [newPages[idx - 1], newPages[idx]] = [newPages[idx], newPages[idx - 1]];
    newPages.forEach((p, i) => (p.sort_order = i));
    setPages(newPages);

    const supabase = createClient();
    const table = isSiteBuilder ? "site_pages" : "event_pages";
    await Promise.all(
      newPages.map((p, i) =>
        supabase.from(table).update({ sort_order: i }).eq("id", p.id)
      )
    );
  };

  const handleParentChange = async (id: string, parentId: string | null) => {
    const supabase = createClient();
    await supabase.from("site_pages").update({ parent_id: parentId }).eq("id", id);
    setPages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, parent_id: parentId } : p))
    );
    setParentSelectId(null);
  };

  // Build ordered list for site builder: parents then children
  const topLevelPages = isSiteBuilder
    ? pages.filter((p) => !p.parent_id)
    : pages;

  const getChildren = (parentId: string) =>
    pages.filter((p) => p.parent_id === parentId);

  const orderedPages: (typeof pages[0] & { isChild?: boolean })[] = [];
  if (isSiteBuilder) {
    for (const parent of topLevelPages) {
      orderedPages.push(parent);
      for (const child of getChildren(parent.id)) {
        orderedPages.push({ ...child, isChild: true });
      }
    }
  }

  const displayPages = isSiteBuilder ? orderedPages : pages;

  // Parent options for a given page
  const getParentOptions = (pageId: string) => {
    const ownChildren = new Set(pages.filter((p) => p.parent_id === pageId).map((p) => p.id));
    return pages.filter((p) => p.id !== pageId && !ownChildren.has(p.id) && !p.parent_id);
  };

  return (
    <div className="p-3 space-y-3 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Pages</p>
        <button
          onClick={handleAddPage}
          className="text-xs text-[#29BDD6] hover:text-[#29BDD6]/80 font-medium"
        >
          + Add Page
        </button>
      </div>

      <div className="space-y-1">
        {/* Home Page (event builder only — site builder includes Home in pages array) */}
        {isEventBuilder && (
          <div
            className={`group flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors cursor-pointer ${
              activePageId === null
                ? "border-[#29BDD6] bg-[#29BDD6]/5"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => switchPage(null)}
          >
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="flex-1 text-xs font-medium text-gray-700 truncate">
              Home
            </span>
          </div>
        )}

        {/* Pages */}
        {displayPages.map((page, idx) => (
          <div key={page.id}>
            <div
              className={`group flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors cursor-pointer ${
                activePageId === page.id
                  ? "border-[#29BDD6] bg-[#29BDD6]/5"
                  : "border-gray-200 hover:border-gray-300"
              } ${'isChild' in page && (page as { isChild?: boolean }).isChild ? "ml-4" : ""}`}
              onClick={() => switchPage(page.id)}
            >
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>

              {editingId === page.id ? (
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={() => handleRename(page.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename(page.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="flex-1 text-xs bg-transparent border-b border-[#29BDD6] outline-none py-0.5"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="flex-1 text-xs font-medium text-gray-700 truncate">
                  {'isChild' in page && (page as { isChild?: boolean }).isChild && <span className="text-gray-400 mr-1">&#8627;</span>}
                  {page.title}
                </span>
              )}

              {/* Page actions */}
              <div className="hidden group-hover:flex items-center gap-0.5">
                {idx > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleMoveUp(idx); }}
                    className="p-0.5 text-gray-400 hover:text-gray-600"
                    title="Move up"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditTitle(page.title);
                    setEditingId(page.id);
                  }}
                  className="p-0.5 text-gray-400 hover:text-gray-600"
                  title="Rename"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                {isSiteBuilder && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setParentSelectId(parentSelectId === page.id ? null : page.id);
                    }}
                    className="p-0.5 text-gray-400 hover:text-gray-600"
                    title="Set parent page"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(page.id); }}
                  className="p-0.5 text-gray-400 hover:text-red-500"
                  title="Delete"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Parent selector dropdown */}
            {isSiteBuilder && parentSelectId === page.id && (
              <div className="ml-6 mt-1 mb-1" onClick={(e) => e.stopPropagation()}>
                <select
                  value={page.parent_id ?? ""}
                  onChange={(e) => handleParentChange(page.id, e.target.value || null)}
                  className="w-full text-xs border rounded-lg px-2 py-1.5 text-gray-600 bg-white"
                  autoFocus
                >
                  <option value="">Top-level (no parent)</option>
                  {getParentOptions(page.id).map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.title}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-[10px] text-gray-300 text-center pt-2">
        Switch pages to edit them. Save persists all changes.
      </p>
    </div>
  );
}
