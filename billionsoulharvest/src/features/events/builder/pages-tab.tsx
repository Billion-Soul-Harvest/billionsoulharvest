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
  const [addingSubmenuFor, setAddingSubmenuFor] = useState<string | null>(null);
  const [submenuLabel, setSubmenuLabel] = useState("");
  const [submenuAnchor, setSubmenuAnchor] = useState("");

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

  const handleAddSubmenuItem = async (parentId: string) => {
    if (!submenuLabel.trim()) return;
    const supabase = createClient();
    const anchor = submenuAnchor.trim() || submenuLabel.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const newOrder = pages.length;
    const slug = `nav-${Date.now()}`;

    const { data } = await supabase
      .from("site_pages")
      .insert({
        title: submenuLabel.trim(),
        slug,
        sort_order: newOrder,
        published: true,
        show_in_nav: true,
        parent_id: parentId,
        nav_anchor: anchor,
      })
      .select()
      .single();

    if (data) {
      await refreshPages();
      setAddingSubmenuFor(null);
      setSubmenuLabel("");
      setSubmenuAnchor("");
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
    const slug = editTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
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

  const handleAnchorChange = async (id: string, anchor: string) => {
    const supabase = createClient();
    const value = anchor.trim() || null;
    await supabase.from("site_pages").update({ nav_anchor: value }).eq("id", id);
    setPages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, nav_anchor: value } : p))
    );
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
        {displayPages.map((page, idx) => {
          const isChild = 'isChild' in page && (page as { isChild?: boolean }).isChild;
          const hasChildren = isSiteBuilder && getChildren(page.id).length > 0;
          const isAnchorItem = !!page.nav_anchor;

          return (
            <div key={page.id}>
              <div
                className={`group flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors cursor-pointer ${
                  activePageId === page.id
                    ? "border-[#29BDD6] bg-[#29BDD6]/5"
                    : "border-gray-200 hover:border-gray-300"
                } ${isChild ? "ml-4" : ""}`}
                onClick={() => {
                  if (!isAnchorItem) switchPage(page.id);
                }}
              >
                {/* Icon: anchor icon for scroll items, page icon for pages */}
                {isAnchorItem ? (
                  <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}

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
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-gray-700 truncate block">
                      {isChild && <span className="text-gray-400 mr-1">&#8627;</span>}
                      {page.title}
                    </span>
                    {isAnchorItem && (
                      <span className="text-[10px] text-gray-400 block">#{page.nav_anchor}</span>
                    )}
                  </div>
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

              {/* "Add submenu item" button for top-level site pages */}
              {isSiteBuilder && !isChild && !isAnchorItem && (
                <>
                  {addingSubmenuFor === page.id ? (
                    <div className="ml-4 mt-1 mb-1 p-2 border border-dashed border-gray-300 rounded-lg space-y-1.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={submenuLabel}
                        onChange={(e) => {
                          setSubmenuLabel(e.target.value);
                          setSubmenuAnchor(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
                        }}
                        placeholder="Label (e.g. Our Story)"
                        className="w-full text-xs border rounded-lg px-2 py-1.5 text-gray-600 bg-white"
                        autoFocus
                      />
                      <input
                        type="text"
                        value={submenuAnchor}
                        onChange={(e) => setSubmenuAnchor(e.target.value)}
                        placeholder="Anchor ID (e.g. our-story)"
                        className="w-full text-xs border rounded-lg px-2 py-1.5 text-gray-600 bg-white"
                      />
                      <p className="text-[10px] text-gray-400">
                        Scrolls to <span className="font-mono">#{submenuAnchor || "anchor"}</span> on this page
                      </p>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleAddSubmenuItem(page.id)}
                          className="text-xs bg-[#29BDD6] text-white px-2.5 py-1 rounded-lg hover:bg-[#29BDD6]/90"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => { setAddingSubmenuFor(null); setSubmenuLabel(""); setSubmenuAnchor(""); }}
                          className="text-xs text-gray-500 px-2.5 py-1 rounded-lg hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); setAddingSubmenuFor(page.id); }}
                      className="ml-4 mt-0.5 text-[10px] text-gray-400 hover:text-[#29BDD6] transition-colors"
                    >
                      + Add submenu item
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-gray-300 text-center pt-2">
        Switch pages to edit them. Save persists all changes.
      </p>
    </div>
  );
}
