"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/shared/utils/supabase/client";
import { useEventData } from "./event-context";

interface EventPage {
  id: string;
  title: string;
  slug: string;
  sort_order: number;
  published: boolean;
  page_content: Record<string, unknown> | null;
}

export function PagesTab() {
  const event = useEventData();
  const [pages, setPages] = useState<EventPage[]>([]);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const fetchPages = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("event_pages")
      .select("id, title, slug, sort_order, published, page_content")
      .eq("event_id", event.id)
      .order("sort_order");

    if (data) {
      setPages(data);
      if (!activePageId && data.length > 0) {
        setActivePageId(data[0].id);
      }
    }
    setLoading(false);
  }, [event.id, activePageId]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const handleAddPage = async () => {
    const supabase = createClient();
    const newOrder = pages.length;
    const title = `Page ${newOrder + 1}`;
    const slug = title.toLowerCase().replace(/\s+/g, "-");

    const { data } = await supabase
      .from("event_pages")
      .insert({ event_id: event.id, title, slug, sort_order: newOrder })
      .select()
      .single();

    if (data) {
      setPages([...pages, data]);
      setActivePageId(data.id);
    }
  };

  const handleDelete = async (id: string) => {
    if (pages.length <= 1) return;
    const supabase = createClient();
    await supabase.from("event_pages").delete().eq("id", id);
    const remaining = pages.filter((p) => p.id !== id);
    setPages(remaining);
    if (activePageId === id) {
      setActivePageId(remaining[0]?.id ?? null);
    }
  };

  const handleRename = async (id: string) => {
    if (!editTitle.trim()) return;
    const supabase = createClient();
    const slug = editTitle.trim().toLowerCase().replace(/\s+/g, "-");
    await supabase
      .from("event_pages")
      .update({ title: editTitle.trim(), slug })
      .eq("id", id);

    setPages(pages.map((p) => (p.id === id ? { ...p, title: editTitle.trim(), slug } : p)));
    setEditingId(null);
  };

  const handleMoveUp = async (idx: number) => {
    if (idx === 0) return;
    const newPages = [...pages];
    [newPages[idx - 1], newPages[idx]] = [newPages[idx], newPages[idx - 1]];
    newPages.forEach((p, i) => (p.sort_order = i));
    setPages(newPages);

    const supabase = createClient();
    await Promise.all(
      newPages.map((p, i) =>
        supabase.from("event_pages").update({ sort_order: i }).eq("id", p.id)
      )
    );
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p className="text-xs text-gray-400">Loading pages...</p>
      </div>
    );
  }

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

      {pages.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-xs text-gray-400">No pages yet.</p>
          <button
            onClick={handleAddPage}
            className="mt-2 text-xs text-[#29BDD6] hover:underline"
          >
            Create your first page
          </button>
        </div>
      ) : (
        <div className="space-y-1">
          {pages.map((page, idx) => (
            <div
              key={page.id}
              className={`group flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors cursor-pointer ${
                activePageId === page.id
                  ? "border-[#29BDD6] bg-[#29BDD6]/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setActivePageId(page.id)}
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
                  {page.title}
                </span>
              )}

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
                {pages.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(page.id); }}
                    className="p-0.5 text-gray-400 hover:text-red-500"
                    title="Delete"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-[10px] text-gray-300 text-center pt-2">
        Page content is saved with the main Save button.
      </p>
    </div>
  );
}
