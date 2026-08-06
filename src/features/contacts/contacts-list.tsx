"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Pencil, Mail, Search, ChevronDown, X, ChevronUp, Trash2, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Settings2, Download, Maximize2, Minimize2 } from "lucide-react";
import { ActionMenu } from "@/components/ui/action-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { createClient } from "@/shared/utils/supabase/client";
import type { ContactType } from "@/shared/types/database";
import { CreateContactDialog } from "./create-contact-dialog";
import { SendEmailDialog } from "@/features/emails/send-email-dialog";
import type { SegmentFilter } from "@/shared/types/database";
import { AllCommunityModule, themeQuartz } from "ag-grid-community";
import type { ColDef, SelectionChangedEvent, RowClickedEvent, ICellRendererParams, SortChangedEvent } from "ag-grid-community";
import type { AgGridReact as AgGridReactType } from "ag-grid-react";
import { AgGridReact, AgGridProvider } from "ag-grid-react";

interface ContactRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  contact_type: ContactType;
  tags: string[];
  church_name: string | null;
  city: string | null;
  country: string | null;
  language: string | null;
  gender: string | null;
  region: { id: string; name: string; color: string } | null;
  position: { id: string; name: string } | null;
  created_at: string;
  job_title: string | null;
  church_role: string | null;
  birthday: string | null;
  age_group: string | null;
  alternative_email: string[] | null;
  referred_by: string | null;
  interests: string | null;
  expectations: string | null;
  source: string | null;
  email_status: string | null;
  email_permission: string | null;
  email_lists: string[] | null;
  street_address: string | null;
  state: string | null;
  phone_home: string | null;
  phone_mobile: string | null;
  phone_work: string | null;
  updated_at: string;
}

interface Region {
  id: string;
  name: string;
  color: string;
}

interface PositionOption {
  id: string;
  name: string;
}

interface Props {
  contacts: ContactRow[];
  regions: Region[];
  positions: PositionOption[];
  totalCount: number;
  page: number;
  pageSize: number;
  search: string;
  searchField: string;
  typeFilter: string;
  regionFilter: string;
  positionFilter: string;
  languageFilter: string;
  listFilter: string;
  excludeListFilter: string;
  eventFilter: string;
  events: { id: string; title: string }[];
  tagFilter: string;
  tagMode: string;
  languages: string[];
  listNames: string[];
  existingCustomFields: string[];
  sort: string;
  dir: string;
}

const contactTypeLabels: Record<ContactType, string> = {
  pastor: "Pastor",
  leader: "Leader",
  donor: "Donor",
  attendee: "Attendee",
  subscriber: "Subscriber",
  other: "Other",
};

const contactTypeColors: Record<ContactType, string> = {
  pastor: "bg-purple-100 text-purple-800",
  leader: "bg-blue-100 text-blue-800",
  donor: "bg-green-100 text-green-800",
  attendee: "bg-amber-100 text-amber-800",
  subscriber: "bg-gray-100 text-gray-700",
  other: "bg-gray-100 text-gray-600",
};

const PAGE_SIZE_OPTIONS = [25, 50, 100];

type ColumnKey =
  | "contact"
  | "email"
  | "first_name"
  | "last_name"
  | "phone"
  | "type"
  | "church"
  | "language"
  | "region"
  | "position"
  | "tags"
  | "city"
  | "country"
  | "gender"
  | "created_at"
  | "job_title"
  | "church_role"
  | "birthday"
  | "age_group"
  | "alternative_email"
  | "referred_by"
  | "interests"
  | "expectations"
  | "source"
  | "email_status"
  | "email_permission"
  | "email_lists"
  | "street_address"
  | "state"
  | "phone_home"
  | "phone_mobile"
  | "phone_work"
  | "updated_at";

interface ColumnDef {
  key: ColumnKey;
  label: string;
  group: string;
  sortable?: string;
}

const ALL_COLUMNS: ColumnDef[] = [
  { key: "contact", label: "Contact", group: "default" },
  { key: "email", label: "Email address", group: "default", sortable: "email" },
  { key: "first_name", label: "First name", group: "default", sortable: "first_name" },
  { key: "last_name", label: "Last name", group: "default" },
  { key: "type", label: "Type", group: "default", sortable: "contact_type" },
  { key: "created_at", label: "Date added", group: "default", sortable: "created_at" },
  { key: "tags", label: "Tags", group: "default" },
  { key: "phone", label: "Phone", group: "Basic details" },
  { key: "church", label: "Church", group: "Basic details", sortable: "church_name" },
  { key: "language", label: "Language", group: "Basic details" },
  { key: "region", label: "Region", group: "Basic details" },
  { key: "position", label: "Position", group: "Basic details" },
  { key: "gender", label: "Gender", group: "Basic details" },
  { key: "job_title", label: "Job title", group: "Basic details" },
  { key: "church_role", label: "Church role", group: "Basic details" },
  { key: "birthday", label: "Birthday", group: "Basic details" },
  { key: "age_group", label: "Age group", group: "Basic details" },
  { key: "alternative_email", label: "Alt. email", group: "Basic details" },
  { key: "referred_by", label: "Referred by", group: "Basic details" },
  { key: "interests", label: "Interests", group: "Basic details" },
  { key: "expectations", label: "Expectations", group: "Basic details" },
  { key: "source", label: "Source", group: "default" },
  { key: "email_status", label: "Email status", group: "default" },
  { key: "email_permission", label: "Email permission", group: "Campaign channels" },
  { key: "email_lists", label: "Lists", group: "default" },
  { key: "city", label: "City", group: "Physical addresses" },
  { key: "country", label: "Country", group: "Physical addresses" },
  { key: "street_address", label: "Street address", group: "Physical addresses" },
  { key: "state", label: "State", group: "Physical addresses" },
  { key: "phone_home", label: "Phone (home)", group: "Phone numbers" },
  { key: "phone_mobile", label: "Phone (mobile)", group: "Phone numbers" },
  { key: "phone_work", label: "Phone (work)", group: "Phone numbers" },
  { key: "updated_at", label: "Date edited", group: "System", sortable: "updated_at" },
];

const DEFAULT_VISIBLE: ColumnKey[] = [
  "contact", "email", "first_name", "last_name", "email_status", "source", "created_at", "email_lists",
];

const COLUMN_GROUPS = ["default", "Basic details", "Campaign channels", "Physical addresses", "Phone numbers", "System"] as const;

function TableSettingsDrawer({
  visible,
  onToggle,
  onClose,
}: {
  visible: Set<ColumnKey>;
  onToggle: (key: ColumnKey) => void;
  onClose: () => void;
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  function toggleGroup(group: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      {/* Drawer */}
      <div className="fixed top-0 right-0 bottom-0 w-[320px] bg-white border-l shadow-xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-semibold text-gray-900">Table settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {COLUMN_GROUPS.map((group) => {
            const cols = ALL_COLUMNS.filter((c) => c.group === group);
            if (cols.length === 0) return null;
            const isDefault = group === "default";
            const isCollapsed = collapsed.has(group);

            return (
              <div key={group}>
                {!isDefault && (
                  <button
                    type="button"
                    onClick={() => toggleGroup(group)}
                    className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    {group}
                    {isCollapsed ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                )}
                {(isDefault || !isCollapsed) && (
                  <div className="px-5 space-y-0.5">
                    {cols.map((col) => (
                      <label
                        key={col.key}
                        className="flex items-center gap-3 py-2 cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={visible.has(col.key)}
                          onChange={() => onToggle(col.key)}
                          className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                        />
                        <span className="text-sm text-gray-700">{col.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

const searchFieldOptions = [
  { value: "name_email", label: "Name or email" },
  { value: "email", label: "Email address" },
  { value: "first_name", label: "First name" },
  { value: "last_name", label: "Last name" },
  { value: "job_title", label: "Job title" },
  { value: "church_name", label: "Church name" },
  { value: "city", label: "City" },
  { value: "country", label: "Country" },
];

function FilterDropdown({
  value,
  label,
  options,
  onChange,
}: {
  value: string;
  label: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const activeLabel = options.find((o) => o.value === value)?.label ?? label;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium whitespace-nowrap transition-colors min-w-[160px] ${
          open
            ? "border-cyan-300 ring-2 ring-cyan-100 text-gray-900"
            : value !== "all"
              ? "border-cyan-200 bg-cyan-50 text-cyan-700"
              : "border-gray-200 text-gray-600 hover:border-gray-300"
        }`}
      >
        {activeLabel}
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg py-1 z-50 min-w-[200px] max-h-64 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                opt.value === value
                  ? "bg-cyan-50 text-cyan-700 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SearchableFilterDropdown({
  selectedValues,
  label,
  options,
  onChange,
  searchPlaceholder,
  countLabel,
  accentColor,
}: {
  selectedValues: string[];
  label: string;
  options: { value: string; label: string }[];
  onChange: (values: string[]) => void;
  searchPlaceholder?: string;
  countLabel?: string;
  accentColor?: "cyan" | "rose";
}) {
  const isRose = accentColor === "rose";
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const selectedSet = new Set(selectedValues);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const hasSelection = selectedValues.length > 0;
  const buttonLabel = !hasSelection
    ? label
    : selectedValues.length === 1
      ? (options.find((o) => o.value === selectedValues[0])?.label ?? label)
      : `${selectedValues.length} ${countLabel ?? "lists"}`;

  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  function toggleValue(val: string) {
    // "__none__" is exclusive — selecting it clears others, selecting others clears it
    if (val === "__none__") {
      onChange(selectedSet.has("__none__") ? [] : ["__none__"]);
      return;
    }
    const next = new Set(selectedSet);
    next.delete("__none__");
    if (next.has(val)) next.delete(val);
    else next.add(val);
    onChange(next.size > 0 ? [...next] : []);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium whitespace-nowrap transition-colors min-w-[120px] ${
          open
            ? isRose ? "border-rose-300 ring-2 ring-rose-100 text-gray-900" : "border-cyan-300 ring-2 ring-cyan-100 text-gray-900"
            : hasSelection
              ? isRose ? "border-rose-200 bg-rose-50 text-rose-700" : "border-cyan-200 bg-cyan-50 text-cyan-700"
              : "border-gray-200 text-gray-600 hover:border-gray-300"
        }`}
      >
        {buttonLabel}
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg z-50 min-w-[240px] w-max">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder ?? "Search lists"}
                className={`w-full pl-8 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 ${isRose ? "focus:ring-rose-500 focus:border-rose-500" : "focus:ring-cyan-500 focus:border-cyan-500"}`}
                autoFocus
              />
            </div>
          </div>
          {hasSelection && (
            <div className="px-3 py-1.5 border-b flex justify-end">
              <button
                type="button"
                onClick={() => { onChange([]); setQuery(""); }}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            </div>
          )}
          <div className="max-h-64 overflow-y-auto py-1">
            {filtered.map((opt) => {
              const isChecked = selectedSet.has(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleValue(opt.value)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 ${
                    isChecked
                      ? isRose ? "bg-rose-50 text-rose-700 font-medium" : "bg-cyan-50 text-cyan-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${
                    isChecked ? isRose ? "bg-rose-500 border-rose-500" : "bg-cyan-600 border-cyan-600" : "border-gray-300"
                  }`}>
                    {isChecked && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  <span className="truncate">{opt.label}</span>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="px-4 py-3 text-sm text-gray-400">No {countLabel ?? "lists"} found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AppliedFilterChips({
  listFilter,
  excludeListFilter,
  tagFilter,
  tagMode,
  eventFilter,
  events,
  onRemove,
}: {
  listFilter: string;
  excludeListFilter: string;
  tagFilter: string;
  tagMode: string;
  eventFilter: string;
  events: { id: string; title: string }[];
  onRemove: (updates: Record<string, string>) => void;
}) {
  const lists = listFilter && listFilter !== "all" ? listFilter.split(",").filter(Boolean) : [];
  const excludeLists = excludeListFilter ? excludeListFilter.split(",").filter(Boolean) : [];
  const tags = tagFilter ? tagFilter.split(",").filter(Boolean) : [];
  const eventIds = eventFilter ? eventFilter.split(",").filter(Boolean) : [];

  const hasAny = lists.length > 0 || excludeLists.length > 0 || tags.length > 0 || eventIds.length > 0;
  if (!hasAny) return null;

  const chipCount = (lists.length > 0 ? 1 : 0) + (excludeLists.length > 0 ? 1 : 0) + (tags.length > 0 ? 1 : 0) + (eventIds.length > 0 ? 1 : 0);

  function chipLabel(values: string[], labelFn?: (v: string) => string) {
    const labels = values.map(labelFn ?? ((v) => v));
    if (labels.length <= 2) return labels.join(", ");
    return `${labels[0]}, ${labels[1]} +${labels.length - 2}`;
  }

  return (
    <div className="flex items-center gap-2 flex-wrap mb-3">
      {lists.length > 0 && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-50 text-cyan-700 border border-cyan-200">
          Lists: {chipLabel(lists, (v) => v === "__none__" ? "Not in any list" : v)}
          <button type="button" onClick={() => onRemove({ list: "" })} className="hover:text-cyan-900">
            <X className="w-3 h-3" />
          </button>
        </span>
      )}
      {excludeLists.length > 0 && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
          Exclude: {chipLabel(excludeLists)}
          <button type="button" onClick={() => onRemove({ excludeList: "" })} className="hover:text-rose-900">
            <X className="w-3 h-3" />
          </button>
        </span>
      )}
      {tags.length > 0 && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-50 text-cyan-700 border border-cyan-200">
          Tags ({tagMode === "or" ? "any" : "all"}): {chipLabel(tags)}
          <button type="button" onClick={() => onRemove({ tag: "" })} className="hover:text-cyan-900">
            <X className="w-3 h-3" />
          </button>
        </span>
      )}
      {eventIds.length > 0 && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-50 text-cyan-700 border border-cyan-200">
          Events: {chipLabel(eventIds, (id) => events.find((e) => e.id === id)?.title ?? id)}
          <button type="button" onClick={() => onRemove({ event: "" })} className="hover:text-cyan-900">
            <X className="w-3 h-3" />
          </button>
        </span>
      )}
      {chipCount > 1 && (
        <button
          type="button"
          onClick={() => onRemove({ list: "", excludeList: "", tag: "", event: "" })}
          className="text-xs text-gray-400 hover:text-gray-600 font-medium"
        >
          Clear all
        </button>
      )}
    </div>
  );
}

function TagFilterDropdown({
  selectedTags,
  mode,
  onChangeSelection,
  onChangeMode,
}: {
  selectedTags: string[];
  mode: "and" | "or";
  onChangeSelection: (tags: string[]) => void;
  onChangeMode: (mode: "and" | "or") => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Fetch tags from server when dropdown opens or query changes
  useEffect(() => {
    if (!open) return;
    clearTimeout(debounceRef.current);
    const delay = query ? 300 : 0;
    if (delay > 0) setLoading(true);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const supabase = createClient();
      let q = supabase.from("tags").select("name").order("name").limit(50);
      if (query) q = q.ilike("name", `%${query}%`);
      const { data } = await q;
      setFiltered((data ?? []).map((r) => r.name));
      setLoading(false);
    }, delay);
    return () => clearTimeout(debounceRef.current);
  }, [open, query]);

  const hasSelection = selectedTags.length > 0;
  const label = hasSelection
    ? selectedTags.length === 1
      ? selectedTags[0]
      : `${selectedTags.length} tags`
    : "Tags";

  function toggle(tag: string) {
    if (selectedTags.includes(tag)) {
      onChangeSelection(selectedTags.filter((t) => t !== tag));
    } else {
      onChangeSelection([...selectedTags, tag]);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium whitespace-nowrap transition-colors min-w-[120px] ${
          open
            ? "border-cyan-300 ring-2 ring-cyan-100 text-gray-900"
            : hasSelection
              ? "border-cyan-200 bg-cyan-50 text-cyan-700"
              : "border-gray-200 text-gray-600 hover:border-gray-300"
        }`}
      >
        {label}
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg z-50 min-w-[280px] w-max">
          {/* AND/OR toggle */}
          <div className="flex items-center gap-2 px-3 py-2 border-b">
            <span className="text-xs text-gray-500">Match:</span>
            <button
              type="button"
              onClick={() => onChangeMode("and")}
              className={`px-2 py-0.5 text-xs rounded-full font-medium transition-colors ${
                mode === "and" ? "bg-cyan-100 text-cyan-700" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              All tags
            </button>
            <button
              type="button"
              onClick={() => onChangeMode("or")}
              className={`px-2 py-0.5 text-xs rounded-full font-medium transition-colors ${
                mode === "or" ? "bg-cyan-100 text-cyan-700" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              Any tag
            </button>
            {hasSelection && (
              <button
                type="button"
                onClick={() => onChangeSelection([])}
                className="ml-auto text-xs text-gray-400 hover:text-gray-600"
              >
                Clear
              </button>
            )}
          </div>
          {/* Search */}
          <div className="p-2 border-b">
            <div className="relative">
              {loading ? (
                <Loader2 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500 animate-spin" />
              ) : (
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              )}
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tags..."
                className="w-full pl-8 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                autoFocus
              />
            </div>
          </div>
          {/* Tag list */}
          <div className="max-h-64 overflow-y-auto py-1">
            {!loading && filtered.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggle(tag)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 ${
                    isSelected
                      ? "bg-cyan-50 text-cyan-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${
                    isSelected ? "bg-cyan-600 border-cyan-600" : "border-gray-300"
                  }`}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  <span className="truncate">{tag}</span>
                </button>
              );
            })}
            {loading && (
              <p className="px-4 py-3 text-sm text-gray-400">Searching...</p>
            )}
            {!loading && filtered.length === 0 && (
              <p className="px-4 py-3 text-sm text-gray-400">No tags found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SearchableMultiSelect({
  options,
  selected,
  onToggle,
  placeholder = "Search...",
  onCreate,
  onSearch,
}: {
  options?: string[];
  selected: Set<string>;
  onToggle: (item: string) => void;
  placeholder?: string;
  onCreate?: (name: string) => void;
  onSearch?: (query: string) => Promise<string[]>;
}) {
  const [search, setSearch] = useState("");
  const [asyncResults, setAsyncResults] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!onSearch) return;
    clearTimeout(debounceRef.current);
    const delay = search ? 300 : 0;
    debounceRef.current = setTimeout(async () => {
      const results = await onSearch(search);
      setAsyncResults(results);
    }, delay);
    return () => clearTimeout(debounceRef.current);
  }, [search, onSearch]);

  const filtered = onSearch
    ? asyncResults
    : search
      ? (options ?? []).filter((o) => o.toLowerCase().includes(search.toLowerCase()))
      : (options ?? []);

  const exactMatch = search
    ? filtered.some((o) => o.toLowerCase() === search.trim().toLowerCase())
    : true;

  return (
    <div>
      {/* Selected badges */}
      {selected.size > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {[...selected].map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 bg-cyan-50 text-cyan-800 border border-cyan-200 rounded-full px-2.5 py-0.5 text-xs font-medium"
            >
              {item}
              <button
                type="button"
                onClick={() => onToggle(item)}
                className="text-cyan-500 hover:text-cyan-700"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      {/* Search input */}
      <div className="relative mb-2">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder={placeholder}
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          className="pl-8 h-9 text-sm"
        />
      </div>
      {/* Options list */}
      <div className="max-h-48 overflow-y-auto border rounded-lg">
        {onCreate && search.trim() && !exactMatch && (
          <button
            type="button"
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-cyan-700 hover:bg-cyan-50 border-b font-medium"
            onClick={() => {
              onCreate(search.trim());
              setSearch("");
            }}
          >
            + Create &ldquo;{search.trim()}&rdquo;
          </button>
        )}
        {filtered.length === 0 && !(onCreate && search.trim() && !exactMatch) ? (
          <p className="text-sm text-gray-400 px-3 py-4 text-center">No matches found</p>
        ) : (
          filtered.map((item) => (
            <label
              key={item}
              className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
            >
              <input
                type="checkbox"
                checked={selected.has(item)}
                onChange={() => onToggle(item)}
                className="rounded"
              />
              <span className={selected.has(item) ? "font-medium text-gray-900" : "text-gray-700"}>{item}</span>
            </label>
          ))
        )}
      </div>
    </div>
  );
}

// --- AG Grid Theme ---
const contactsGridTheme = themeQuartz.withParams({
  backgroundColor: "#ffffff",
  headerBackgroundColor: "#f9fafb",
  headerFontSize: 13,
  fontSize: 14,
  borderRadius: 12,
  spacing: 6,
  headerFontWeight: 500,
  rowBorder: { color: "#f3f4f6" },
  selectedRowBackgroundColor: "rgba(6, 182, 212, 0.08)",
});

// --- Pagination Footer ---
function PaginationFooter({
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  const totalPages = Math.ceil(totalCount / pageSize);
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-gray-600">
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline">Rows per page:</span>
        <select
          className="border rounded px-2 py-1 text-sm bg-white"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <span className="text-xs sm:text-sm">
          {totalCount === 0
            ? "No rows"
            : `${(page - 1) * pageSize + 1}\u2013${Math.min(page * pageSize, totalCount)} of ${totalCount}`}
        </span>
        <div className="flex items-center gap-1">
          <button
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            onClick={() => onPageChange(1)}
            disabled={page <= 1}
            title="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
          <button
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            title="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            title="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            onClick={() => onPageChange(totalPages)}
            disabled={page >= totalPages}
            title="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// --- AG Grid Cell Renderers ---
function ContactNameCellRenderer(params: ICellRendererParams<ContactRow>) {
  if (!params.data) return null;
  const c = params.data;
  return (
    <a
      href={`/admin/contacts/${c.id}`}
      className="font-medium text-gray-900 hover:text-cyan-700"
    >
      {c.first_name} {c.last_name}
    </a>
  );
}

function TypeCellRenderer(params: ICellRendererParams<ContactRow>) {
  if (!params.data) return null;
  const type = params.data.contact_type;
  return (
    <Badge variant="secondary" className={contactTypeColors[type]}>
      {contactTypeLabels[type]}
    </Badge>
  );
}

function RegionCellRenderer(params: ICellRendererParams<ContactRow>) {
  if (!params.data?.region) return null;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="w-2.5 h-2.5 rounded-full"
        style={{ backgroundColor: params.data.region.color }}
      />
      <span className="text-gray-700">{params.data.region.name}</span>
    </span>
  );
}

function TagsCellRenderer(params: ICellRendererParams<ContactRow>) {
  if (!params.data || !params.data.tags || params.data.tags.length === 0) return null;
  const tags = params.data.tags;
  const visible = tags.slice(0, 2);
  const remaining = tags.length - 2;
  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((tag) => (
        <span key={tag} className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs">
          {tag}
        </span>
      ))}
      {remaining > 0 && (
        <span className="text-cyan-600 text-xs font-medium px-1" title={tags.slice(2).join(", ")}>
          +{remaining}
        </span>
      )}
    </div>
  );
}

function EmailListsCellRenderer(params: ICellRendererParams<ContactRow>) {
  if (!params.data?.email_lists || params.data.email_lists.length === 0) return <span className="text-gray-400">{"\u2014"}</span>;
  const lists = params.data.email_lists;
  const visible = lists.slice(0, 2);
  const remaining = lists.length - 2;
  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((list) => (
        <span key={list} className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs">{list}</span>
      ))}
      {remaining > 0 && (
        <span className="text-gray-500 text-xs font-medium px-1" title={lists.slice(2).join(", ")}>
          +{remaining}
        </span>
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ContactActionsCellRenderer(params: ICellRendererParams<ContactRow> & { context: any }) {
  const c = params.data;
  const [open, setOpen] = useState(false);
  if (!c) return null;
  const ctx = params.context;

  const close = () => setOpen(false);

  return (
    <div data-action-menu>
      <ActionMenu
        open={open}
        onToggle={() => setOpen((prev) => !prev)}
        onClose={close}
      >
        <a
          href={`/admin/contacts/${c.id}`}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          onClick={close}
        >
          <Eye className="w-4 h-4" /> View
        </a>
        <a
          href={`/admin/contacts/${c.id}?edit=true`}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          onClick={close}
        >
          <Pencil className="w-4 h-4" /> Edit
        </a>
        {c.email && (
          <a
            href={`mailto:${c.email}`}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            onClick={close}
          >
            <Mail className="w-4 h-4" /> Email
          </a>
        )}
        <button
          type="button"
          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
          onClick={(e) => {
            e.stopPropagation();
            close();
            ctx.setDeleteContact({ id: c.id, name: `${c.first_name} ${c.last_name}` });
          }}
        >
          <Trash2 className="w-4 h-4" /> Delete
        </button>
      </ActionMenu>
    </div>
  );
}

export function ContactsListClient({
  contacts,
  regions,
  positions,
  totalCount,
  page,
  pageSize,
  search,
  searchField,
  typeFilter,
  regionFilter,
  positionFilter,
  languageFilter,
  listFilter,
  excludeListFilter,
  eventFilter,
  events,
  tagFilter,
  tagMode,
  languages,
  listNames,
  existingCustomFields,
  sort,
  dir,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<ColumnKey>>(() => new Set(DEFAULT_VISIBLE));

  function toggleColumn(key: ColumnKey) {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectAllMode, setSelectAllMode] = useState(false);
  const [bulkDialog, setBulkDialog] = useState<"tags" | "region" | "type" | "delete" | "add_to_list" | "remove_from_list" | "remove_tags" | "create_list" | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkTagInput, setBulkTagInput] = useState("");
  const [bulkTagMode, setBulkTagMode] = useState<"add" | "replace">("add");
  const [bulkRegion, setBulkRegion] = useState("");
  const [bulkType, setBulkType] = useState<ContactType | "">("");
  const [bulkSelectedLists, setBulkSelectedLists] = useState<Set<string>>(new Set());
  const [localListNames, setLocalListNames] = useState(listNames);
  useEffect(() => { setLocalListNames(listNames); }, [listNames]);
  const [bulkSelectedTags, setBulkSelectedTags] = useState<Set<string>>(new Set());
  const [newListName, setNewListName] = useState("");
  const [sendEmailOpen, setSendEmailOpen] = useState(false);
  const [actionsDropdownOpen, setActionsDropdownOpen] = useState(false);
  const actionsDropdownRef = useRef<HTMLDivElement>(null);

  const [deleteContact, setDeleteContact] = useState<{ id: string; name: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const gridRef = useRef<AgGridReactType<ContactRow>>(null);
  const programmaticSelection = useRef(false);

  useEffect(() => {
    if (!actionsDropdownOpen) return;
    function handleClick(e: MouseEvent) {
      if (actionsDropdownRef.current && !actionsDropdownRef.current.contains(e.target as Node)) {
        setActionsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [actionsDropdownOpen]);

  // Exit fullscreen on Escape key
  useEffect(() => {
    if (!fullscreen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setFullscreen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [fullscreen]);

  // Sync AG Grid selection when contacts data changes (page navigation)
  useEffect(() => {
    if (!gridRef.current?.api) return;
    programmaticSelection.current = true;
    gridRef.current.api.forEachNode((node) => {
      if (!node.data) return;
      const shouldSelect = selectAllMode || selected.has(node.data.id);
      if (node.isSelected() !== shouldSelect) {
        node.setSelected(shouldSelect);
      }
    });
    requestAnimationFrame(() => { programmaticSelection.current = false; });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contacts]);

  // Select all rows when selectAllMode becomes true
  useEffect(() => {
    if (!selectAllMode || !gridRef.current?.api) return;
    programmaticSelection.current = true;
    gridRef.current.api.selectAll();
    requestAnimationFrame(() => { programmaticSelection.current = false; });
  }, [selectAllMode]);

  const allOnPageSelected = contacts.length > 0 && contacts.every((c) => selected.has(c.id));
  const someSelected = selected.size > 0 || selectAllMode;
  const effectiveCount = selectAllMode ? totalCount : selected.size;

  function toggleOne(id: string) {
    if (selectAllMode) {
      setSelectAllMode(false);
      // Keep all page contacts selected except the toggled one
      const next = new Set(contacts.map((c) => c.id));
      next.delete(id);
      setSelected(next);
      return;
    }
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allOnPageSelected || selectAllMode) {
      setSelectAllMode(false);
      setSelected((prev) => {
        const next = new Set(prev);
        contacts.forEach((c) => next.delete(c.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        contacts.forEach((c) => next.add(c.id));
        return next;
      });
    }
  }

  async function executeBulk(action: () => Promise<void>) {
    setBulkLoading(true);
    try {
      await action();
      setSelected(new Set());
      setSelectAllMode(false);
      setBulkDialog(null);
      router.refresh();
    } finally {
      setBulkLoading(false);
    }
  }

  async function bulkAssignTags() {
    const supabase = createClient();
    const newTags = bulkTagInput.split(",").map((t) => t.trim()).filter(Boolean);
    if (newTags.length === 0) return;

    if (bulkTagMode === "replace") {
      if (selectAllMode) {
        await supabase.from("contacts").update({ tags: newTags }).gte("created_at", "1970-01-01");
      } else {
        await supabase.from("contacts").update({ tags: newTags }).in("id", [...selected]);
      }
    } else {
      // For "add" mode, we need to fetch and merge per-contact
      let allIds: string[];
      if (selectAllMode) {
        const { data } = await supabase.from("contacts").select("id");
        allIds = (data ?? []).map((r) => r.id);
      } else {
        allIds = [...selected];
      }
      // Process in batches of 100
      for (let i = 0; i < allIds.length; i += 100) {
        const batch = allIds.slice(i, i + 100);
        const { data } = await supabase.from("contacts").select("id, tags").in("id", batch);
        for (const contact of data ?? []) {
          const merged = [...new Set([...(contact.tags ?? []), ...newTags])];
          await supabase.from("contacts").update({ tags: merged }).eq("id", contact.id);
        }
      }
    }
  }

  async function bulkAssignRegion() {
    const supabase = createClient();
    if (selectAllMode) {
      await supabase.from("contacts").update({ region_id: bulkRegion || null }).gte("created_at", "1970-01-01");
    } else {
      await supabase.from("contacts").update({ region_id: bulkRegion || null }).in("id", [...selected]);
    }
  }

  async function bulkChangeType() {
    const supabase = createClient();
    if (selectAllMode) {
      await supabase.from("contacts").update({ contact_type: bulkType as ContactType }).gte("created_at", "1970-01-01");
    } else {
      await supabase.from("contacts").update({ contact_type: bulkType as ContactType }).in("id", [...selected]);
    }
  }

  async function bulkDelete() {
    const supabase = createClient();
    if (selectAllMode) {
      await supabase.from("contacts").delete().gte("created_at", "1970-01-01");
    } else {
      await supabase.from("contacts").delete().in("id", [...selected]);
    }
  }

  async function handleDeleteContact() {
    if (!deleteContact) return;
    setDeleteLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("contacts").delete().eq("id", deleteContact.id);
      if (error) {
        alert(`Failed to delete: ${error.message}`);
        return;
      }
      setDeleteContact(null);
      router.refresh();
    } finally {
      setDeleteLoading(false);
    }
  }

  async function bulkAddToList() {
    const supabase = createClient();
    const listsToAdd = [...bulkSelectedLists];
    if (listsToAdd.length === 0) return;

    let allIds: string[];
    if (selectAllMode) {
      const { data } = await supabase.from("contacts").select("id");
      allIds = (data ?? []).map((r) => r.id);
    } else {
      allIds = [...selected];
    }

    for (let i = 0; i < allIds.length; i += 100) {
      const batch = allIds.slice(i, i + 100);
      const { data } = await supabase.from("contacts").select("id, email_lists").in("id", batch);
      for (const contact of data ?? []) {
        const merged = [...new Set([...(contact.email_lists ?? []), ...listsToAdd])];
        await supabase.from("contacts").update({ email_lists: merged }).eq("id", contact.id);
      }
    }
  }

  async function bulkCreateListAndAdd() {
    const name = newListName.trim();
    if (!name) return;
    const supabase = createClient();

    // Create audience record
    await supabase.from("audiences").insert({ name, type: "list" });

    // Add selected contacts to the new list
    let allIds: string[];
    if (selectAllMode) {
      const { data } = await supabase.from("contacts").select("id");
      allIds = (data ?? []).map((r) => r.id);
    } else {
      allIds = [...selected];
    }

    for (let i = 0; i < allIds.length; i += 100) {
      const batch = allIds.slice(i, i + 100);
      const { data } = await supabase.from("contacts").select("id, email_lists").in("id", batch);
      for (const contact of data ?? []) {
        const merged = [...new Set([...(contact.email_lists ?? []), name])];
        await supabase.from("contacts").update({ email_lists: merged }).eq("id", contact.id);
      }
    }

    setLocalListNames((prev) => [...prev, name].sort((a, b) => a.localeCompare(b)));
  }

  async function bulkRemoveFromList() {
    const supabase = createClient();
    const listsToRemove = [...bulkSelectedLists];
    if (listsToRemove.length === 0) return;

    let allIds: string[];
    if (selectAllMode) {
      const { data } = await supabase.from("contacts").select("id");
      allIds = (data ?? []).map((r) => r.id);
    } else {
      allIds = [...selected];
    }

    for (let i = 0; i < allIds.length; i += 100) {
      const batch = allIds.slice(i, i + 100);
      const { data } = await supabase.from("contacts").select("id, email_lists").in("id", batch);
      for (const contact of data ?? []) {
        const filtered = (contact.email_lists ?? []).filter((l: string) => !listsToRemove.includes(l));
        await supabase.from("contacts").update({ email_lists: filtered }).eq("id", contact.id);
      }
    }
  }

  async function bulkRemoveTags() {
    const supabase = createClient();
    const tagsToRemove = [...bulkSelectedTags];
    if (tagsToRemove.length === 0) return;

    let allIds: string[];
    if (selectAllMode) {
      const { data } = await supabase.from("contacts").select("id");
      allIds = (data ?? []).map((r) => r.id);
    } else {
      allIds = [...selected];
    }

    for (let i = 0; i < allIds.length; i += 100) {
      const batch = allIds.slice(i, i + 100);
      const { data } = await supabase.from("contacts").select("id, tags").in("id", batch);
      for (const contact of data ?? []) {
        const filtered = (contact.tags ?? []).filter((t: string) => !tagsToRemove.includes(t));
        await supabase.from("contacts").update({ tags: filtered }).eq("id", contact.id);
      }
    }
  }

  function exportSelectedCSV() {
    const selectedContacts = contacts.filter((c) => selected.has(c.id));
    const headers = ["First Name", "Last Name", "Email", "Phone", "Type", "Church", "City", "Country", "Region", "Tags"];
    const rows = selectedContacts.map((c) => [
      c.first_name, c.last_name, c.email ?? "", c.phone ?? "",
      c.contact_type, c.church_name ?? "", c.city ?? "", c.country ?? "",
      c.region?.name ?? "", c.tags.join("; "),
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `contacts-selected-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const navigate = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams();
      const merged = { page: String(page), pageSize: String(pageSize), search, searchField, type: typeFilter, region: regionFilter, position: positionFilter, language: languageFilter, list: listFilter, excludeList: excludeListFilter, event: eventFilter, tag: tagFilter, tagMode, sort, dir, ...updates };
      for (const [k, v] of Object.entries(merged)) {
        if (v && v !== "all" && v !== "1" && !(k === "pageSize" && v === "25") && !(k === "sort" && v === "created_at") && !(k === "dir" && v === "desc") && !(k === "searchField" && v === "name_email") && !(k === "tagMode" && v === "and")) {
          params.set(k, v);
        }
      }
      const qs = params.toString();
      startTransition(() => {
        router.push(qs ? `${pathname}?${qs}` : pathname);
      });
    },
    [router, pathname, page, pageSize, search, searchField, typeFilter, regionFilter, positionFilter, languageFilter, listFilter, excludeListFilter, eventFilter, tagFilter, tagMode, sort, dir, startTransition]
  );

  function exportCSV() {
    const headers = ["First Name", "Last Name", "Email", "Phone", "Type", "Church", "City", "Country", "Region", "Tags"];
    const rows = contacts.map((c) => [
      c.first_name, c.last_name, c.email ?? "", c.phone ?? "",
      c.contact_type, c.church_name ?? "", c.city ?? "", c.country ?? "",
      c.region?.name ?? "", c.tags.join("; "),
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `contacts-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // --- AG Grid Column Definitions ---
  const SORT_COL_MAP: Record<string, string> = {
    first_name: "first_name",
    email: "email",
    contact_type: "contact_type",
    church_name: "church_name",
    created_at: "created_at",
    updated_at: "updated_at",
  };

  const columnDefs = useMemo<ColDef<ContactRow>[]>(() => {
    const cols: ColDef<ContactRow>[] = [];

    if (visibleColumns.has("contact")) {
      cols.push({
        colId: "contact",
        headerName: "Contact",
        valueGetter: (p) => `${p.data?.first_name ?? ""} ${p.data?.last_name ?? ""}`.trim(),
        cellRenderer: ContactNameCellRenderer,
        minWidth: 160,
        flex: 1,
        sortable: false,
        filter: true,
      });
    }
    if (visibleColumns.has("email")) {
      cols.push({
        colId: "email",
        headerName: "Email address",
        field: "email",
        minWidth: 200,
        flex: 1.2,
        filter: true,
        sort: sort === "email" ? (dir as "asc" | "desc") : undefined,
      });
    }
    if (visibleColumns.has("first_name")) {
      cols.push({
        colId: "first_name",
        headerName: "First name",
        field: "first_name",
        minWidth: 120,
        flex: 0.8,
        filter: true,
        sort: sort === "first_name" ? (dir as "asc" | "desc") : undefined,
      });
    }
    if (visibleColumns.has("last_name")) {
      cols.push({
        colId: "last_name",
        headerName: "Last name",
        field: "last_name",
        minWidth: 120,
        flex: 0.8,
        sortable: false,
        filter: true,
      });
    }
    if (visibleColumns.has("type")) {
      cols.push({
        colId: "contact_type",
        headerName: "Type",
        field: "contact_type",
        cellRenderer: TypeCellRenderer,
        minWidth: 100,
        flex: 0.6,
        filter: true,
        sort: sort === "contact_type" ? (dir as "asc" | "desc") : undefined,
      });
    }
    if (visibleColumns.has("created_at")) {
      cols.push({
        colId: "created_at",
        headerName: "Date added",
        valueGetter: (p) => p.data ? new Date(p.data.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "",
        minWidth: 110,
        flex: 0.7,
        filter: true,
        sort: sort === "created_at" ? (dir as "asc" | "desc") : undefined,
      });
    }
    if (visibleColumns.has("tags")) {
      cols.push({
        colId: "tags",
        headerName: "Tags",
        valueGetter: (p) => p.data?.tags?.join(", ") ?? "",
        cellRenderer: TagsCellRenderer,
        minWidth: 140,
        flex: 1,
        sortable: false,
        filter: true,
      });
    }
    if (visibleColumns.has("phone")) {
      cols.push({ colId: "phone", headerName: "Phone", field: "phone", minWidth: 120, sortable: false, filter: true });
    }
    if (visibleColumns.has("church")) {
      cols.push({
        colId: "church_name",
        headerName: "Church",
        field: "church_name",
        minWidth: 130,
        flex: 0.8,
        filter: true,
        sort: sort === "church_name" ? (dir as "asc" | "desc") : undefined,
      });
    }
    if (visibleColumns.has("language")) {
      cols.push({ colId: "language", headerName: "Language", field: "language", minWidth: 100, sortable: false, filter: true });
    }
    if (visibleColumns.has("region")) {
      cols.push({
        colId: "region",
        headerName: "Region",
        valueGetter: (p) => p.data?.region?.name ?? "",
        cellRenderer: RegionCellRenderer,
        minWidth: 120,
        sortable: false,
        filter: true,
      });
    }
    if (visibleColumns.has("position")) {
      cols.push({ colId: "position", headerName: "Position", valueGetter: (p) => p.data?.position?.name ?? "", minWidth: 110, sortable: false, filter: true });
    }
    if (visibleColumns.has("gender")) {
      cols.push({ colId: "gender", headerName: "Gender", valueGetter: (p) => p.data?.gender ? p.data.gender.charAt(0).toUpperCase() + p.data.gender.slice(1) : "", minWidth: 90, sortable: false, filter: true });
    }
    if (visibleColumns.has("job_title")) {
      cols.push({ colId: "job_title", headerName: "Job title", field: "job_title", minWidth: 120, sortable: false, filter: true });
    }
    if (visibleColumns.has("church_role")) {
      cols.push({ colId: "church_role", headerName: "Church role", field: "church_role", minWidth: 110, sortable: false, filter: true });
    }
    if (visibleColumns.has("birthday")) {
      cols.push({ colId: "birthday", headerName: "Birthday", valueGetter: (p) => p.data?.birthday ? new Date(p.data.birthday).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "", minWidth: 110, sortable: false, filter: true });
    }
    if (visibleColumns.has("age_group")) {
      cols.push({ colId: "age_group", headerName: "Age group", field: "age_group", minWidth: 100, sortable: false, filter: true });
    }
    if (visibleColumns.has("alternative_email")) {
      cols.push({ colId: "alternative_email", headerName: "Alt. email", valueGetter: (p) => p.data?.alternative_email?.join(", ") ?? "", minWidth: 160, sortable: false, filter: true });
    }
    if (visibleColumns.has("referred_by")) {
      cols.push({ colId: "referred_by", headerName: "Referred by", field: "referred_by", minWidth: 120, sortable: false, filter: true });
    }
    if (visibleColumns.has("interests")) {
      cols.push({ colId: "interests", headerName: "Interests", field: "interests", minWidth: 120, sortable: false, filter: true });
    }
    if (visibleColumns.has("expectations")) {
      cols.push({ colId: "expectations", headerName: "Expectations", field: "expectations", minWidth: 120, sortable: false, filter: true });
    }
    if (visibleColumns.has("source")) {
      cols.push({ colId: "source", headerName: "Source", field: "source", minWidth: 100, sortable: false, filter: true });
    }
    if (visibleColumns.has("email_status")) {
      cols.push({ colId: "email_status", headerName: "Email status", field: "email_status", minWidth: 110, sortable: false, filter: true });
    }
    if (visibleColumns.has("email_permission")) {
      cols.push({ colId: "email_permission", headerName: "Email permission", field: "email_permission", minWidth: 130, sortable: false, filter: true });
    }
    if (visibleColumns.has("email_lists")) {
      cols.push({
        colId: "email_lists",
        headerName: "Lists",
        valueGetter: (p) => p.data?.email_lists?.join(", ") ?? "",
        cellRenderer: EmailListsCellRenderer,
        minWidth: 140,
        sortable: false,
        filter: true,
      });
    }
    if (visibleColumns.has("city")) {
      cols.push({ colId: "city", headerName: "City", field: "city", minWidth: 100, sortable: false, filter: true });
    }
    if (visibleColumns.has("country")) {
      cols.push({ colId: "country", headerName: "Country", field: "country", minWidth: 100, sortable: false, filter: true });
    }
    if (visibleColumns.has("street_address")) {
      cols.push({ colId: "street_address", headerName: "Street address", field: "street_address", minWidth: 140, sortable: false, filter: true });
    }
    if (visibleColumns.has("state")) {
      cols.push({ colId: "state", headerName: "State", field: "state", minWidth: 90, sortable: false, filter: true });
    }
    if (visibleColumns.has("phone_home")) {
      cols.push({ colId: "phone_home", headerName: "Phone (home)", field: "phone_home", minWidth: 120, sortable: false, filter: true });
    }
    if (visibleColumns.has("phone_mobile")) {
      cols.push({ colId: "phone_mobile", headerName: "Phone (mobile)", field: "phone_mobile", minWidth: 120, sortable: false, filter: true });
    }
    if (visibleColumns.has("phone_work")) {
      cols.push({ colId: "phone_work", headerName: "Phone (work)", field: "phone_work", minWidth: 120, sortable: false, filter: true });
    }
    if (visibleColumns.has("updated_at")) {
      cols.push({
        colId: "updated_at",
        headerName: "Date edited",
        valueGetter: (p) => p.data ? new Date(p.data.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "",
        minWidth: 110,
        flex: 0.7,
        filter: true,
        sort: sort === "updated_at" ? (dir as "asc" | "desc") : undefined,
      });
    }

    // Actions column (always visible, pinned right)
    cols.push({
      headerName: "",
      cellRenderer: ContactActionsCellRenderer,
      minWidth: 60,
      maxWidth: 60,
      sortable: false,
      filter: false,
      resizable: false,
      pinned: "right" as const,
    });

    return cols;
  }, [visibleColumns, sort, dir]);

  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: true,
    resizable: true,
  }), []);

  // --- AG Grid Event Handlers ---
  const onSelectionChanged = useCallback((event: SelectionChangedEvent<ContactRow>) => {
    if (programmaticSelection.current) return;
    const currentPageIds = new Set(contacts.map((c) => c.id));
    const gridSelectedIds = new Set(event.api.getSelectedRows().map((r) => r.id));
    setSelected((prev) => {
      const next = new Set(prev);
      for (const id of currentPageIds) {
        if (!gridSelectedIds.has(id)) next.delete(id);
      }
      for (const id of gridSelectedIds) {
        next.add(id);
      }
      return next;
    });
    setSelectAllMode(false);
  }, [contacts]);

  const onSortChanged = useCallback((event: SortChangedEvent<ContactRow>) => {
    const colState = event.api.getColumnState();
    const sorted = colState.find((c) => c.sort);
    if (sorted && sorted.colId && sorted.colId in SORT_COL_MAP) {
      navigate({ sort: SORT_COL_MAP[sorted.colId], dir: sorted.sort === "asc" ? "asc" : "desc", page: "1" });
    } else {
      navigate({ sort: "created_at", dir: "desc", page: "1" });
    }
  }, [navigate]);

  const onRowClicked = useCallback((event: RowClickedEvent<ContactRow>) => {
    const target = event.event?.target as HTMLElement | null;
    if (target?.closest("[data-action-menu]") || target?.closest("input[type=checkbox]") || target?.closest("a")) return;
    if (event.data) {
      window.location.href = `/admin/contacts/${event.data.id}`;
    }
  }, []);

  const gridContext = useMemo(() => ({
    setDeleteContact,
  }), []);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-baseline gap-3 mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
        <span className="text-sm text-gray-400">&middot;</span>
        <span className="text-sm text-gray-500"><span className="font-semibold text-gray-700">{totalCount.toLocaleString()}</span> total</span>
      </div>

      {/* Filters — Constant Contact style */}
      <div className={`flex flex-wrap items-center gap-3 mb-4 transition-opacity ${isPending ? "opacity-60 pointer-events-none" : ""}`}>
        {/* Search field picker + input */}
        <div className="flex">
          <FilterDropdown
            value={searchField}
            label="Name or email"
            options={searchFieldOptions}
            onChange={(v) => navigate({ searchField: v, page: "1" })}
          />
          <DebouncedSearchInput
            defaultValue={search}
            onSearch={(v) => navigate({ search: v, page: "1" })}
            placeholder={`Search by ${searchFieldOptions.find((o) => o.value === searchField)?.label.toLowerCase() ?? "name or email"}...`}
            className="rounded-l-none border-gray-200 pr-10 h-[42px] flex-1 min-w-[220px] -ml-px"
          />
        </div>

        <SearchableFilterDropdown
          selectedValues={listFilter ? listFilter.split(",").filter(Boolean) : []}
          label="Include lists"
          options={[
            { value: "__none__", label: "Not in any list" },
            ...listNames.map((name) => ({ value: name, label: name })),
          ]}
          onChange={(values) => navigate({ list: values.join(","), page: "1" })}
        />
        <SearchableFilterDropdown
          selectedValues={excludeListFilter ? excludeListFilter.split(",").filter(Boolean) : []}
          label="Exclude lists"
          options={listNames.map((name) => ({ value: name, label: name }))}
          onChange={(values) => navigate({ excludeList: values.join(","), page: "1" })}
          searchPlaceholder="Search lists"
          countLabel="lists"
          accentColor="rose"
        />

        <TagFilterDropdown
          selectedTags={tagFilter ? tagFilter.split(",").filter(Boolean) : []}
          mode={tagMode as "and" | "or"}
          onChangeSelection={(tags) => navigate({ tag: tags.join(","), page: "1" })}
          onChangeMode={(mode) => navigate({ tagMode: mode, page: "1" })}
        />

        <SearchableFilterDropdown
          selectedValues={eventFilter ? eventFilter.split(",").filter(Boolean) : []}
          label="Events"
          options={events.map((e) => ({ value: e.id, label: e.title }))}
          onChange={(values) => navigate({ event: values.join(","), page: "1" })}
          searchPlaceholder="Search events"
          countLabel="events"
        />

        <div className="flex items-center gap-1.5 sm:ml-auto">
          <CreateContactDialog
            listNames={listNames}
            existingCustomFields={existingCustomFields}
            onSuccess={() => router.refresh()}
          />
          <Button variant="outline" onClick={() => setSettingsOpen(true)} className="rounded-lg h-[42px] w-[42px] p-0" title="Table Settings">
            <Settings2 className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={exportCSV} className="rounded-lg h-[42px] w-[42px] p-0" title="Export CSV">
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setFullscreen(true)}
            className="rounded-lg h-[42px] w-[42px] p-0 hidden md:inline-flex"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Applied filter chips */}
      <AppliedFilterChips
        listFilter={listFilter}
        excludeListFilter={excludeListFilter}
        tagFilter={tagFilter}
        tagMode={tagMode}
        eventFilter={eventFilter}
        events={events}
        onRemove={(updates) => navigate({ ...updates, page: "1" })}
      />

      {/* All contacts header + gear icon / Selected contacts + Actions */}
      <div className="flex items-center justify-between mb-3">
        {someSelected ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <p className="text-base font-semibold text-gray-900">Selected contacts</p>
              <span className="text-xs font-medium text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-full px-2.5 py-0.5">
                {effectiveCount.toLocaleString()}
              </span>
            </div>
            <div className="relative" ref={actionsDropdownRef}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActionsDropdownOpen((prev) => !prev)}
                className="gap-1"
              >
                Actions
                <ChevronDown className="w-3.5 h-3.5" />
              </Button>
              {actionsDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => { setSendEmailOpen(true); setActionsDropdownOpen(false); }}
                  >
                    Send Campaign
                  </button>
                  <div className="h-px bg-gray-100 mx-2" />
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => { setBulkSelectedLists(new Set()); setBulkDialog("add_to_list"); setActionsDropdownOpen(false); }}
                  >
                    Add to list
                  </button>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => { setBulkSelectedLists(new Set()); setBulkDialog("remove_from_list"); setActionsDropdownOpen(false); }}
                  >
                    Remove from list
                  </button>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => { setNewListName(""); setBulkDialog("create_list"); setActionsDropdownOpen(false); }}
                  >
                    Create new list
                  </button>
                  <div className="h-px bg-gray-100 mx-2" />
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => { setBulkTagInput(""); setBulkTagMode("add"); setBulkDialog("tags"); setActionsDropdownOpen(false); }}
                  >
                    Add tags
                  </button>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => { setBulkSelectedTags(new Set()); setBulkDialog("remove_tags"); setActionsDropdownOpen(false); }}
                  >
                    Remove tags
                  </button>
                  <div className="h-px bg-gray-100 mx-2" />
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => { exportSelectedCSV(); setActionsDropdownOpen(false); }}
                  >
                    Export selection
                  </button>
                  <div className="h-px bg-gray-100 mx-2" />
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    onClick={() => { setBulkDialog("delete"); setActionsDropdownOpen(false); }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => { setSelected(new Set()); setSelectAllMode(false); gridRef.current?.api?.deselectAll(); }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear selection
            </button>
          </div>
        ) : null}
      </div>

      {/* Select all banner */}
      {allOnPageSelected && !selectAllMode && totalCount > contacts.length && (
        <div className="bg-cyan-50 border border-cyan-200 rounded-lg px-4 py-2.5 mb-3 flex items-center gap-2 text-sm">
          <span className="text-gray-700">{contacts.length} contacts on this page selected.</span>
          <span className="text-gray-300">|</span>
          <button
            type="button"
            onClick={() => setSelectAllMode(true)}
            className="font-semibold text-cyan-700 hover:text-cyan-800"
          >
            Select all {totalCount.toLocaleString()} contacts
          </button>
          <span className="text-gray-300">|</span>
          <button
            type="button"
            onClick={() => { setSelected(new Set()); setSelectAllMode(false); gridRef.current?.api?.deselectAll(); }}
            className="font-semibold text-gray-600 hover:text-gray-800"
          >
            Clear selection
          </button>
        </div>
      )}
      {selectAllMode && (
        <div className="bg-cyan-50 border border-cyan-200 rounded-lg px-4 py-2.5 mb-3 flex items-center gap-2 text-sm">
          <span className="text-gray-700">All {totalCount.toLocaleString()} contacts selected.</span>
          <span className="text-gray-300">|</span>
          <button
            type="button"
            onClick={() => {
              setSelectAllMode(false);
              const next = new Set(contacts.map((c) => c.id));
              setSelected(next);
            }}
            className="font-semibold text-cyan-700 hover:text-cyan-800"
          >
            Select only contacts from this page
          </button>
          <span className="text-gray-300">|</span>
          <button
            type="button"
            onClick={() => { setSelected(new Set()); setSelectAllMode(false); gridRef.current?.api?.deselectAll(); }}
            className="font-semibold text-gray-600 hover:text-gray-800"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* AG Grid Table — hidden on mobile, fullscreen-capable */}
      <div
        className={
          fullscreen
            ? "fixed inset-0 z-50 bg-white flex flex-col"
            : "hidden md:block bg-white rounded-xl border overflow-hidden"
        }
      >
        {/* Fullscreen header bar */}
        {fullscreen && (
          <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50 shrink-0">
            <h2 className="text-sm font-semibold text-gray-700">Contacts</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)}>
                <Settings2 className="w-4 h-4 mr-1" /> Settings
              </Button>
              <Button variant="outline" size="sm" onClick={exportCSV}>
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => setFullscreen(false)} title="Exit fullscreen (Esc)">
                <Minimize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        <div style={fullscreen ? { flex: 1 } : { height: 600, width: "100%" }}>
          <AgGridProvider modules={[AllCommunityModule]}>
            <AgGridReact<ContactRow>
              ref={gridRef}
              theme={contactsGridTheme}
              rowData={contacts}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              rowSelection={{ mode: "multiRow", checkboxes: true, headerCheckbox: true }}
              pagination={false}
              onSelectionChanged={onSelectionChanged}
              onRowClicked={onRowClicked}
              onSortChanged={onSortChanged}
              getRowId={(params) => params.data.id}
              context={gridContext}
              suppressCellFocus={true}
              loading={isPending}
              noRowsOverlayComponent={() => (
                <div className="text-center text-gray-400 py-12">No contacts found</div>
              )}
            />
          </AgGridProvider>
        </div>

        {/* Pagination Footer */}
        <div className="shrink-0">
          <PaginationFooter
            page={page}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={(p) => navigate({ page: String(p) })}
            onPageSizeChange={(size) => navigate({ pageSize: String(size), page: "1" })}
          />
        </div>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-2">
        {contacts.length === 0 && (
          <div className="text-center text-gray-400 py-12 bg-white rounded-xl border">No contacts found</div>
        )}
        {contacts.map((c) => (
          <a
            key={c.id}
            href={`/admin/contacts/${c.id}`}
            className="block bg-white rounded-xl border p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium text-gray-900">{c.first_name} {c.last_name}</p>
                <p className="text-sm text-gray-500">{c.email ?? "\u2014"}</p>
              </div>
              <Badge variant="secondary" className={contactTypeColors[c.contact_type]}>
                {contactTypeLabels[c.contact_type]}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
              {c.church_name && <span>{c.church_name}</span>}
              {(c.city || c.country) && <span>{[c.city, c.country].filter(Boolean).join(", ")}</span>}
              {c.region && (
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.region.color }} />
                  {c.region.name}
                </span>
              )}
              {c.phone && <span>{c.phone}</span>}
            </div>
            {c.tags && c.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {c.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs">{tag}</span>
                ))}
                {c.tags.length > 3 && <span className="text-gray-400 text-xs">+{c.tags.length - 3}</span>}
              </div>
            )}
          </a>
        ))}

        {/* Mobile Pagination */}
        <PaginationFooter
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={(p) => navigate({ page: String(p) })}
          onPageSizeChange={(size) => navigate({ pageSize: String(size), page: "1" })}
        />
      </div>

      {/* Assign Tags Dialog */}
      <Dialog open={bulkDialog === "tags"} onOpenChange={(open) => { if (!open) setBulkDialog(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Tags to {effectiveCount.toLocaleString()} contacts</DialogTitle>
            <DialogDescription>Enter tags separated by commas.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Tag 1, Tag 2, ..."
              value={bulkTagInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBulkTagInput(e.target.value)}
            />
            <div className="flex gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="tagMode" checked={bulkTagMode === "add"} onChange={() => setBulkTagMode("add")} />
                Add to existing
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="tagMode" checked={bulkTagMode === "replace"} onChange={() => setBulkTagMode("replace")} />
                Replace all
              </label>
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button onClick={() => executeBulk(bulkAssignTags)} disabled={bulkLoading}>
              {bulkLoading ? "Applying..." : "Apply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Region Dialog */}
      <Dialog open={bulkDialog === "region"} onOpenChange={(open) => { if (!open) setBulkDialog(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Region to {effectiveCount.toLocaleString()} contacts</DialogTitle>
          </DialogHeader>
          <Select value={bulkRegion} onValueChange={(v: string | null) => setBulkRegion(v ?? "")}>
            <SelectTrigger>
              <SelectValue placeholder="Select region..." />
            </SelectTrigger>
            <SelectContent>
              {regions.map((r) => (
                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button onClick={() => executeBulk(bulkAssignRegion)} disabled={bulkLoading || !bulkRegion}>
              {bulkLoading ? "Applying..." : "Apply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Type Dialog */}
      <Dialog open={bulkDialog === "type"} onOpenChange={(open) => { if (!open) setBulkDialog(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Type for {effectiveCount.toLocaleString()} contacts</DialogTitle>
          </DialogHeader>
          <Select value={bulkType} onValueChange={(v: string | null) => setBulkType((v ?? "") as ContactType | "")}>
            <SelectTrigger>
              <SelectValue placeholder="Select type..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(contactTypeLabels).map(([val, label]) => (
                <SelectItem key={val} value={val}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button onClick={() => executeBulk(bulkChangeType)} disabled={bulkLoading || !bulkType}>
              {bulkLoading ? "Applying..." : "Apply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={bulkDialog === "delete"} onOpenChange={(open) => { if (!open) setBulkDialog(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {effectiveCount.toLocaleString()} contacts?</DialogTitle>
            <DialogDescription>This action cannot be undone. These contacts and all their associated data will be permanently deleted.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button variant="destructive" onClick={() => executeBulk(bulkDelete)} disabled={bulkLoading}>
              {bulkLoading ? "Deleting..." : `Delete ${selected.size} contacts`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Single Contact Delete Dialog */}
      <Dialog open={deleteContact !== null} onOpenChange={(open) => { if (!open) setDeleteContact(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {deleteContact?.name}?</DialogTitle>
            <DialogDescription>This action cannot be undone. This contact and all their associated data (registrations, follow-ups, notes) will be permanently deleted.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button variant="destructive" onClick={handleDeleteContact} disabled={deleteLoading}>
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add to List Dialog */}
      <Dialog open={bulkDialog === "add_to_list"} onOpenChange={(open) => { if (!open) setBulkDialog(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add {effectiveCount.toLocaleString()} contacts to list</DialogTitle>
            <DialogDescription>Search and select lists to add contacts to.</DialogDescription>
          </DialogHeader>
          <SearchableMultiSelect
            options={localListNames}
            selected={bulkSelectedLists}
            onToggle={(name) => {
              setBulkSelectedLists((prev) => {
                const next = new Set(prev);
                if (next.has(name)) next.delete(name);
                else next.add(name);
                return next;
              });
            }}
            placeholder="Search lists..."
            onCreate={(name) => {
              setLocalListNames((prev) => [...prev, name].sort((a, b) => a.localeCompare(b)));
              setBulkSelectedLists((prev) => new Set([...prev, name]));
            }}
          />
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button onClick={() => executeBulk(bulkAddToList)} disabled={bulkLoading || bulkSelectedLists.size === 0}>
              {bulkLoading ? "Adding..." : `Add to ${bulkSelectedLists.size || ""} list${bulkSelectedLists.size !== 1 ? "s" : ""}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove from List Dialog */}
      <Dialog open={bulkDialog === "remove_from_list"} onOpenChange={(open) => { if (!open) setBulkDialog(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove {effectiveCount.toLocaleString()} contacts from list</DialogTitle>
            <DialogDescription>Search and select lists to remove contacts from.</DialogDescription>
          </DialogHeader>
          <SearchableMultiSelect
            options={listNames}
            selected={bulkSelectedLists}
            onToggle={(name) => {
              setBulkSelectedLists((prev) => {
                const next = new Set(prev);
                if (next.has(name)) next.delete(name);
                else next.add(name);
                return next;
              });
            }}
            placeholder="Search lists..."
          />
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button onClick={() => executeBulk(bulkRemoveFromList)} disabled={bulkLoading || bulkSelectedLists.size === 0}>
              {bulkLoading ? "Removing..." : `Remove from ${bulkSelectedLists.size || ""} list${bulkSelectedLists.size !== 1 ? "s" : ""}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create New List Dialog */}
      <Dialog open={bulkDialog === "create_list"} onOpenChange={(open) => { if (!open) setBulkDialog(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create new list</DialogTitle>
            <DialogDescription>Create a list and add {effectiveCount.toLocaleString()} selected contact{effectiveCount !== 1 ? "s" : ""} to it.</DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="new-list-name">List name</Label>
            <Input
              id="new-list-name"
              value={newListName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewListName(e.target.value)}
              placeholder="e.g., Conference 2026 Attendees"
              className="mt-1"
              autoFocus
            />
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button onClick={() => executeBulk(bulkCreateListAndAdd)} disabled={bulkLoading || !newListName.trim()}>
              {bulkLoading ? "Creating..." : "Create & add contacts"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Tags Dialog */}
      <Dialog open={bulkDialog === "remove_tags"} onOpenChange={(open) => { if (!open) setBulkDialog(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove tags from {effectiveCount.toLocaleString()} contacts</DialogTitle>
            <DialogDescription>Search and select tags to remove.</DialogDescription>
          </DialogHeader>
          <SearchableMultiSelect
            onSearch={async (q) => {
              const supabase = createClient();
              let query = supabase.from("tags").select("name").order("name").limit(50);
              if (q) query = query.ilike("name", `%${q}%`);
              const { data } = await query;
              return (data ?? []).map((r) => r.name);
            }}
            selected={bulkSelectedTags}
            onToggle={(tag) => {
              setBulkSelectedTags((prev) => {
                const next = new Set(prev);
                if (next.has(tag)) next.delete(tag);
                else next.add(tag);
                return next;
              });
            }}
            placeholder="Search tags..."
          />
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button onClick={() => executeBulk(bulkRemoveTags)} disabled={bulkLoading || bulkSelectedTags.size === 0}>
              {bulkLoading ? "Removing..." : `Remove ${bulkSelectedTags.size || ""} tag${bulkSelectedTags.size !== 1 ? "s" : ""}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Table Settings Drawer */}
      {settingsOpen && (
        <TableSettingsDrawer
          visible={visibleColumns}
          onToggle={toggleColumn}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {/* Send Campaign Dialog */}
      <SendEmailDialog
        open={sendEmailOpen}
        onOpenChange={setSendEmailOpen}
        contactIds={Array.from(selected)}
        selectAllMode={selectAllMode}
        selectAllFilter={selectAllMode ? buildSelectAllFilter() : undefined}
        recipientCount={effectiveCount}
        onSuccess={() => {
          setSelected(new Set());
          setSelectAllMode(false);
        }}
      />
    </div>
  );

  function buildSelectAllFilter(): SegmentFilter {
    const filter: SegmentFilter = {};
    if (typeFilter) filter.contact_type = [typeFilter];
    if (regionFilter) filter.region_id = regionFilter;
    if (languageFilter) filter.language = languageFilter;
    if (listFilter) filter.email_lists = listFilter.split(",").filter(Boolean);
    if (excludeListFilter) filter.email_lists_exclude = excludeListFilter.split(",").filter(Boolean);
    if (tagFilter) filter.tags_include = tagFilter.split(",").filter(Boolean);
    return filter;
  }
}

function DebouncedSearchInput({
  defaultValue,
  onSearch,
  placeholder,
  className,
}: {
  defaultValue: string;
  onSearch: (value: string) => void;
  placeholder: string;
  className?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSubmitted = useRef(defaultValue);

  useEffect(() => {
    if (defaultValue !== lastSubmitted.current) {
      setValue(defaultValue);
    }
    lastSubmitted.current = defaultValue;
  }, [defaultValue]);

  function handleChange(newValue: string) {
    setValue(newValue);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      lastSubmitted.current = newValue;
      onSearch(newValue);
    }, 350);
  }

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e.target.value)}
        placeholder={placeholder}
        className={className}
      />
      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
    </div>
  );
}
