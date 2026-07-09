"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  CRITERIA_DEFINITIONS,
  CATEGORIES,
  type CriteriaDefinition,
} from "./criteria-definitions";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (criterion: CriteriaDefinition) => void;
  usedFields?: string[];
}

export function CriteriaPicker({ open, onClose, onSelect, usedFields = [] }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = CRITERIA_DEFINITIONS.filter((c) => {
    if (activeCategory && c.category !== activeCategory) return false;
    if (search) return c.label.toLowerCase().includes(search.toLowerCase());
    return true;
  });

  const categoryCounts = CATEGORIES.map((cat) => ({
    ...cat,
    count: CRITERIA_DEFINITIONS.filter((c) => c.category === cat.name).length,
  }));

  const totalCount = CRITERIA_DEFINITIONS.length;

  function handleSelect(criterion: CriteriaDefinition) {
    onSelect(criterion);
    setSearch("");
    setActiveCategory(null);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle>Criteria</DialogTitle>
        </DialogHeader>

        <div className="flex min-h-[400px]">
          {/* Left sidebar */}
          <div className="w-48 border-r p-4 space-y-1 shrink-0">
            <button
              onClick={() => setActiveCategory(null)}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg flex items-center justify-between ${
                !activeCategory ? "bg-cyan-50 text-cyan-700 font-medium" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span>All criteria</span>
              <span className="text-xs bg-gray-100 rounded-full px-2 py-0.5">{totalCount}</span>
            </button>
            {categoryCounts.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`w-full text-left text-sm px-3 py-2 rounded-lg flex items-center justify-between ${
                  activeCategory === cat.name ? "bg-cyan-50 text-cyan-700 font-medium" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span>{cat.name}</span>
                <span className="text-xs bg-gray-100 rounded-full px-2 py-0.5">{cat.count}</span>
              </button>
            ))}
          </div>

          {/* Right side */}
          <div className="flex-1 p-4">
            <div className="relative mb-4">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <Input
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                placeholder="Search criteria"
                className="pl-9"
              />
            </div>

            {(activeCategory ? [activeCategory] : CATEGORIES.map((c) => c.name)).map((catName) => {
              const items = filtered.filter((c) => c.category === catName);
              if (items.length === 0) return null;
              return (
                <div key={catName} className="mb-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{catName}</p>
                  <div className="space-y-0.5">
                    {items.map((item) => {
                      const isUsed = usedFields.includes(item.field);
                      return (
                        <button
                          key={item.field}
                          onClick={() => !isUsed && handleSelect(item)}
                          disabled={isUsed}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                            isUsed
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-gray-700 hover:bg-gray-50 cursor-pointer"
                          }`}
                        >
                          {item.label}
                          {isUsed && <span className="ml-2 text-xs text-gray-300">(added)</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">No criteria match your search.</p>
            )}
          </div>
        </div>

        <div className="border-t px-6 py-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 border rounded-lg hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
