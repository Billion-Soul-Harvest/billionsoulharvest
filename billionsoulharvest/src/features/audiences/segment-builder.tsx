"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/shared/utils/supabase/client";
import type { Audience, SegmentCriterion, SegmentFilter } from "@/shared/types/database";
import { CriteriaPicker } from "./criteria-picker";
import { CriteriaRow } from "./criteria-row";
import type { CriteriaDefinition } from "./criteria-definitions";

interface Props {
  audience: Audience | null;
  listNames: string[];
}

export function SegmentBuilderPage({ audience, listNames }: Props) {
  const router = useRouter();
  const [name, setName] = useState(
    audience?.name ??
      `Segment created ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}`
  );
  const [criteria, setCriteria] = useState<SegmentCriterion[]>(
    audience?.segment_filter?.criteria ?? []
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [matchCount, setMatchCount] = useState<number | null>(null);
  const [counting, setCounting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchCount = useCallback(async (criteriaToCount: SegmentCriterion[]) => {
    if (criteriaToCount.length === 0) {
      setMatchCount(null);
      return;
    }
    setCounting(true);
    try {
      const filter: SegmentFilter = { criteria: criteriaToCount };
      const res = await fetch("/api/audiences/segments/count", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filter }),
      });
      const data = await res.json();
      setMatchCount(data.count ?? 0);
    } catch {
      setMatchCount(null);
    } finally {
      setCounting(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchCount(criteria), 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [criteria, fetchCount]);

  function handleAddCriteria(def: CriteriaDefinition) {
    const newCriterion: SegmentCriterion = {
      field: def.field,
      operator: def.operators[0].value,
      value: def.fieldType === "array" ? [] : "",
    };
    setCriteria([...criteria, newCriterion]);
  }

  function handleUpdateCriteria(index: number, updated: SegmentCriterion) {
    const next = [...criteria];
    next[index] = updated;
    setCriteria(next);
  }

  function handleRemoveCriteria(index: number) {
    setCriteria(criteria.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);

    const supabase = createClient();
    const payload = {
      name: name.trim(),
      type: "segment" as const,
      segment_filter: { criteria } as SegmentFilter,
    };

    if (audience) {
      await supabase.from("audiences").update(payload).eq("id", audience.id);
    } else {
      await supabase.from("audiences").insert(payload);
    }

    setSaving(false);
    router.push("/admin/audiences");
    router.refresh();
  }

  const usedFields = criteria.map((c) => c.field);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header bar */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Input
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            className="text-base font-medium border-none shadow-none px-0 focus-visible:ring-0 w-auto min-w-[300px]"
            placeholder="Segment name"
          />
          {matchCount !== null && (
            <Badge variant="secondary" className="text-sm">
              {counting ? "Counting..." : `${matchCount.toLocaleString()} contacts`}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/audiences")}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            {saving ? "Saving..." : "Save segment"}
          </Button>
        </div>
      </div>

      {/* Builder body */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {criteria.length === 0 ? (
          <div className="bg-white border rounded-xl p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Add criteria to build from scratch
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Create segments based on contact profiles, lists, tags, or other
              contact details.
            </p>
            <Button
              variant="outline"
              onClick={() => setPickerOpen(true)}
              className="text-cyan-600 border-cyan-300 hover:bg-cyan-50"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Criteria
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {criteria.map((c, i) => (
              <CriteriaRow
                key={`${c.field}-${i}`}
                criterion={c}
                onChange={(updated) => handleUpdateCriteria(i, updated)}
                onRemove={() => handleRemoveCriteria(i)}
                listNames={listNames}
              />
            ))}

            <Button
              variant="outline"
              onClick={() => setPickerOpen(true)}
              className="text-cyan-600 border-cyan-300 hover:bg-cyan-50"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Criteria
            </Button>
          </div>
        )}
      </div>

      <CriteriaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleAddCriteria}
        usedFields={usedFields}
      />
    </div>
  );
}
