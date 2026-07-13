"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/shared/utils/supabase/client";
import type { StoryStatus } from "@/shared/types/database";

const statusColors: Record<StoryStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  published: "bg-blue-100 text-blue-700",
};

const statusLabels: Record<StoryStatus, string> = {
  draft: "Draft",
  published: "Published",
};

interface StoryRow {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  status: string;
  author: string | null;
  published_at: string | null;
  banner_url: string | null;
}

interface Props {
  stories: StoryRow[];
}

export function StoriesList({ stories }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [confirmingBulk, setConfirmingBulk] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const allSelected = stories.length > 0 && selected.size === stories.length;
  const someSelected = selected.size > 0 && !allSelected;
  const selectAllRef = useCallback((el: HTMLInputElement | null) => {
    if (el) el.indeterminate = someSelected;
  }, [someSelected]);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(stories.map((s) => s.id)));
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    const supabase = createClient();
    const { error } = await supabase.from("stories").delete().eq("id", id);
    if (error) {
      alert(`Failed to delete: ${error.message}`);
      setDeleting(null);
      setConfirmingId(null);
      return;
    }
    setConfirmingId(null);
    setDeleting(null);
    router.refresh();
  }

  async function handleBulkDelete() {
    setBulkDeleting(true);
    const supabase = createClient();
    const ids = Array.from(selected);
    const { error } = await supabase.from("stories").delete().in("id", ids);
    if (error) {
      alert(`Failed to delete: ${error.message}`);
      setBulkDeleting(false);
      setConfirmingBulk(false);
      return;
    }
    setSelected(new Set());
    setConfirmingBulk(false);
    setBulkDeleting(false);
    router.refresh();
  }

  if (stories.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-12 text-center text-gray-400">
        No stories yet. Create your first story.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selected.size > 0 && (
        <div className="flex items-center gap-3 bg-gray-50 border rounded-lg px-4 py-2">
          <span className="text-sm text-gray-600">{selected.size} selected</span>
          {confirmingBulk ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-600">
                Delete {selected.size} stor{selected.size > 1 ? "ies" : "y"}?
              </span>
              <Button size="sm" variant="destructive" onClick={handleBulkDelete} disabled={bulkDeleting}>
                {bulkDeleting ? "Deleting..." : "Confirm"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setConfirmingBulk(false)} disabled={bulkDeleting}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="text-red-500 hover:text-red-700"
              onClick={() => setConfirmingBulk(true)}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Selected
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
            Clear
          </Button>
        </div>
      )}

      <div className="flex items-center gap-3 px-1">
        <input
          ref={selectAllRef}
          type="checkbox"
          checked={allSelected}
          onChange={toggleAll}
          className="h-4 w-4 rounded border-gray-300 accent-blue-600"
          aria-label="Select all stories"
        />
        <span className="text-xs text-gray-400">Select all</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stories.map((story) => (
          <div
            key={story.id}
            className={`bg-white rounded-xl border overflow-hidden transition-shadow hover:shadow-md ${
              selected.has(story.id) ? "ring-2 ring-blue-200 border-blue-300" : ""
            }`}
          >
            {/* Image Preview */}
            <Link href={`/admin/stories/edit/${story.id}`} className="block">
              <div className="relative w-full aspect-[16/9] bg-gray-100 overflow-hidden">
                {story.banner_url ? (
                  <img
                    src={story.banner_url}
                    alt={story.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                    <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className={`${statusColors[story.status as StoryStatus]} shadow-sm`}>
                    {statusLabels[story.status as StoryStatus]}
                  </Badge>
                </div>
              </div>
            </Link>

            {/* Card Body */}
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selected.has(story.id)}
                    onChange={() => toggleSelect(story.id)}
                    className="h-4 w-4 rounded border-gray-300 accent-blue-600"
                    aria-label={`Select ${story.title}`}
                  />
                </div>

                <Link
                  href={`/admin/stories/edit/${story.id}`}
                  className="flex-1 min-w-0 hover:opacity-80 transition-opacity"
                >
                  <h3 className="font-semibold text-gray-900 truncate text-sm">{story.title}</h3>
                  {story.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">{story.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    {story.author && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {story.author}
                      </span>
                    )}
                    {story.published_at && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(story.published_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </Link>

                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                  {confirmingId === story.id ? (
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(story.id)}
                        disabled={deleting === story.id}
                      >
                        {deleting === story.id ? "..." : "Yes"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setConfirmingId(null)}
                        disabled={deleting === story.id}
                      >
                        No
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-gray-400 hover:text-red-500 h-7 w-7"
                      onClick={() => setConfirmingId(story.id)}
                      title="Delete story"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
