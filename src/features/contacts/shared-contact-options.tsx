"use client";

import { useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { createClient } from "@/shared/utils/supabase/client";

interface SharedContactOptionsProps {
  listNames: string[];
  selectedLists: string[];
  setSelectedLists: (lists: string[]) => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
}

export function SharedContactOptions({
  listNames,
  selectedLists,
  setSelectedLists,
  selectedTags,
  setSelectedTags,
}: SharedContactOptionsProps) {
  const [tagQuery, setTagQuery] = useState("");
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const tagRef = useRef<HTMLDivElement>(null);
  const tagDebounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!tagDropdownOpen) return;
    function handleClick(e: MouseEvent) {
      if (tagRef.current && !tagRef.current.contains(e.target as Node)) {
        setTagDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [tagDropdownOpen]);

  useEffect(() => {
    if (!tagDropdownOpen) return;
    clearTimeout(tagDebounceRef.current);
    const delay = tagQuery ? 300 : 0;
    tagDebounceRef.current = setTimeout(async () => {
      const supabase = createClient();
      let q = supabase.from("tags").select("name").order("name").limit(50);
      if (tagQuery) q = q.ilike("name", `%${tagQuery}%`);
      const { data } = await q;
      const results = (data ?? []).map((r) => r.name);
      setTagSuggestions(results.filter((t: string) => !selectedTags.includes(t)));
    }, delay);
    return () => clearTimeout(tagDebounceRef.current);
  }, [tagDropdownOpen, tagQuery, selectedTags]);

  function addTag(tag: string) {
    const trimmed = tag.trim();
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags([...selectedTags, trimmed]);
    }
    setTagQuery("");
  }

  return (
    <div className="space-y-4">
      {/* Add to list */}
      <div className="space-y-1.5">
        <Label>Add to list</Label>
        <div className="flex flex-wrap gap-1.5 min-h-[40px] p-2 border rounded-md bg-white">
          {selectedLists.map((list) => (
            <span
              key={list}
              className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-sm"
            >
              {list}
              <button
                type="button"
                onClick={() => setSelectedLists(selectedLists.filter((l) => l !== list))}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {listNames
            .filter((l) => !selectedLists.includes(l))
            .map((list) => (
              <button
                key={list}
                type="button"
                onClick={() => setSelectedLists([...selectedLists, list])}
                className="text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-600 hover:border-cyan-300 hover:text-cyan-700 transition-colors"
              >
                + {list}
              </button>
            ))}
        </div>
      </div>

      {/* Add tags */}
      <div className="space-y-1.5" ref={tagRef}>
        <Label>Add tags</Label>
        <div className="flex flex-wrap gap-1.5 min-h-[40px] p-2 border rounded-md bg-white">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => setSelectedTags(selectedTags.filter((t) => t !== tag))}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagQuery}
            onChange={(e) => {
              setTagQuery(e.target.value);
              setTagDropdownOpen(true);
            }}
            onFocus={() => setTagDropdownOpen(true)}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === ",") && tagQuery.trim()) {
                e.preventDefault();
                addTag(tagQuery);
              }
            }}
            placeholder={selectedTags.length === 0 ? "Start typing to find tags" : ""}
            className="flex-1 min-w-[120px] text-sm outline-none bg-transparent py-0.5"
          />
        </div>
        {tagDropdownOpen && tagQuery && tagSuggestions.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-lg max-h-48 overflow-y-auto py-1">
            {tagSuggestions.slice(0, 10).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  addTag(tag);
                  setTagDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
