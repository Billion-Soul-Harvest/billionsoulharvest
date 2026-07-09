"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { SegmentFilter } from "@/shared/types/database";

const contactTypeLabels: Record<string, string> = {
  pastor: "Pastor",
  leader: "Leader",
  donor: "Donor",
  attendee: "Attendee",
  subscriber: "Subscriber",
  other: "Other",
};

interface Props {
  filter: SegmentFilter;
  onChange: (filter: SegmentFilter) => void;
  regions: { id: string; name: string }[];
  languages: string[];
  countries: string[];
}

export function SegmentBuilder({
  filter,
  onChange,
  regions,
  languages,
  countries,
}: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700">Segment Filters</h3>

      {/* Contact Type - multi-select via checkboxes */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">Contact Type</label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(contactTypeLabels).map(([val, label]) => {
            const isSelected = filter.contact_type?.includes(val) ?? false;
            return (
              <label
                key={val}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-cyan-50 border-cyan-300 text-cyan-700"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {
                    const current = filter.contact_type ?? [];
                    const next = isSelected
                      ? current.filter((t) => t !== val)
                      : [...current, val];
                    onChange({ ...filter, contact_type: next.length > 0 ? next : undefined });
                  }}
                  className="sr-only"
                />
                {label}
              </label>
            );
          })}
        </div>
      </div>

      {/* Region */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">Region</label>
        <Select
          value={filter.region_id || "all"}
          onValueChange={(v: string | null) => {
            onChange({ ...filter, region_id: v === "all" ? undefined : v || undefined });
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Regions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {regions.map((r) => (
              <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Language */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">Language</label>
        <Select
          value={filter.language || "all"}
          onValueChange={(v: string | null) => {
            onChange({ ...filter, language: v === "all" ? undefined : v || undefined });
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Languages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Languages</SelectItem>
            {languages.map((lang) => (
              <SelectItem key={lang} value={lang}>{lang}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Country */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">Country</label>
        <Select
          value={filter.country || "all"}
          onValueChange={(v: string | null) => {
            onChange({ ...filter, country: v === "all" ? undefined : v || undefined });
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Countries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            {countries.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">
          Tags (comma separated)
        </label>
        <Input
          placeholder="e.g. VIP, Speaker"
          value={filter.tags_include?.join(", ") ?? ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const tags = e.target.value
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean);
            onChange({ ...filter, tags_include: tags.length > 0 ? tags : undefined });
          }}
        />
      </div>

      {/* Show if filtering by specific contact IDs */}
      {filter.contact_ids && filter.contact_ids.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
          Targeting {filter.contact_ids.length} specific contact{filter.contact_ids.length !== 1 ? "s" : ""} selected from the contacts page.
        </div>
      )}
    </div>
  );
}
