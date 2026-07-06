"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Pencil, Mail, Search, ChevronDown, Settings, X, ChevronUp, MoreVertical } from "lucide-react";
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
  alternative_email: string | null;
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
  tagFilter: string;
  tagMode: string;
  languages: string[];
  listNames: string[];
  allTags: string[];
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
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

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

  const activeLabel = value === "all" ? label : options.find((o) => o.value === value)?.label ?? label;
  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium whitespace-nowrap transition-colors min-w-[120px] ${
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
        <div className="absolute top-full left-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg z-50 min-w-[240px] w-max">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search lists"
                className="w-full pl-8 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {filtered.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value === value ? "all" : opt.value);
                  setOpen(false);
                  setQuery("");
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 ${
                  opt.value === value
                    ? "bg-cyan-50 text-cyan-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${
                  opt.value === value ? "bg-cyan-600 border-cyan-600" : "border-gray-300"
                }`}>
                  {opt.value === value && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                <span className="truncate">{opt.label}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-4 py-3 text-sm text-gray-400">No lists found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TagFilterDropdown({
  allTags,
  selectedTags,
  mode,
  onChangeSelection,
  onChangeMode,
}: {
  allTags: string[];
  selectedTags: string[];
  mode: "and" | "or";
  onChangeSelection: (tags: string[]) => void;
  onChangeMode: (mode: "and" | "or") => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

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

  const filtered = query
    ? allTags.filter((t) => t.toLowerCase().includes(query.toLowerCase()))
    : allTags;

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
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
            {filtered.map((tag) => {
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
            {filtered.length === 0 && (
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
}: {
  options: string[];
  selected: Set<string>;
  onToggle: (item: string) => void;
  placeholder?: string;
}) {
  const [search, setSearch] = useState("");
  const filtered = search
    ? options.filter((o) => o.toLowerCase().includes(search.toLowerCase()))
    : options;

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
        {filtered.length === 0 ? (
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
  tagFilter,
  tagMode,
  languages,
  listNames,
  allTags,
  sort,
  dir,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [expandedTags, setExpandedTags] = useState<Set<string>>(new Set());
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

  const isCol = (key: ColumnKey) => visibleColumns.has(key);
  const visibleCount = visibleColumns.size + 2; // +2 for checkbox and actions columns
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectAllMode, setSelectAllMode] = useState(false);
  const [bulkDialog, setBulkDialog] = useState<"tags" | "region" | "type" | "delete" | "add_to_list" | "remove_from_list" | "remove_tags" | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkTagInput, setBulkTagInput] = useState("");
  const [bulkTagMode, setBulkTagMode] = useState<"add" | "replace">("add");
  const [bulkRegion, setBulkRegion] = useState("");
  const [bulkType, setBulkType] = useState<ContactType | "">("");
  const [bulkSelectedLists, setBulkSelectedLists] = useState<Set<string>>(new Set());
  const [bulkSelectedTags, setBulkSelectedTags] = useState<Set<string>>(new Set());
  const [actionsDropdownOpen, setActionsDropdownOpen] = useState(false);
  const actionsDropdownRef = useRef<HTMLDivElement>(null);

  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!actionMenu) return;
    function handleClick(e: MouseEvent) {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target as Node)) {
        setActionMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [actionMenu]);

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
      const merged = { page: String(page), pageSize: String(pageSize), search, searchField, type: typeFilter, region: regionFilter, position: positionFilter, language: languageFilter, list: listFilter, tag: tagFilter, tagMode, sort, dir, ...updates };
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
    [router, pathname, page, pageSize, search, searchField, typeFilter, regionFilter, positionFilter, languageFilter, listFilter, tagFilter, tagMode, sort, dir, startTransition]
  );

  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, totalCount);

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

  function sortHeader(label: string, column: string) {
    const isActive = sort === column;
    return (
      <button
        type="button"
        className="inline-flex items-center gap-1 hover:text-gray-900"
        onClick={() => navigate({
          sort: column,
          dir: isActive && dir === "asc" ? "desc" : "asc",
          page: "1",
        })}
      >
        {label}
        {isActive ? (
          <span className="text-cyan-600">{dir === "asc" ? "▲" : "▼"}</span>
        ) : (
          <span className="text-gray-300">▲</span>
        )}
      </button>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
        <div className="flex items-center gap-2">
          <CreateContactDialog
            listNames={listNames}
            allTags={allTags}
            onSuccess={() => router.refresh()}
          />
          <Button variant="outline" onClick={exportCSV}>
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters — Constant Contact style */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Search field picker + input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            navigate({ search: formData.get("search") as string, page: "1" });
          }}
          className="flex"
        >
          <FilterDropdown
            value={searchField}
            label="Name or email"
            options={searchFieldOptions}
            onChange={(v) => navigate({ searchField: v, page: "1" })}
          />
          <div className="relative flex-1 min-w-[220px] -ml-px">
            <Input
              name="search"
              placeholder={`Search by ${searchFieldOptions.find((o) => o.value === searchField)?.label.toLowerCase() ?? "name or email"}...`}
              defaultValue={search}
              className="rounded-l-none border-gray-200 pr-10 h-[42px]"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </form>

        <SearchableFilterDropdown
          value={listFilter}
          label="Lists"
          options={[
            { value: "__none__", label: "Not in any list" },
            ...listNames.map((name) => ({ value: name, label: name })),
          ]}
          onChange={(v) => navigate({ list: v, page: "1" })}
        />

        <TagFilterDropdown
          allTags={allTags}
          selectedTags={tagFilter ? tagFilter.split(",").filter(Boolean) : []}
          mode={tagMode as "and" | "or"}
          onChangeSelection={(tags) => navigate({ tag: tags.join(","), page: "1" })}
          onChangeMode={(mode) => navigate({ tagMode: mode, page: "1" })}
        />
      </div>

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
                    className="w-full text-left px-4 py-2 text-sm text-gray-400 cursor-not-allowed"
                    disabled
                  >
                    Send email
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
              onClick={() => { setSelected(new Set()); setSelectAllMode(false); }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear selection
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <p className="text-base font-semibold text-gray-900">All contacts</p>
            <span className="text-xs font-medium text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-full px-2.5 py-0.5">
              {totalCount.toLocaleString()}
            </span>
          </div>
        )}
        <button
          onClick={() => setSettingsOpen(true)}
          className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors"
          title="Table settings"
        >
          <Settings className="w-4 h-4" />
        </button>
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
            onClick={() => { setSelected(new Set()); setSelectAllMode(false); }}
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
            onClick={() => { setSelected(new Set()); setSelectAllMode(false); }}
            className="font-semibold text-gray-600 hover:text-gray-800"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Table */}
      <div className={`bg-white rounded-xl border overflow-hidden relative ${isPending ? "opacity-50 pointer-events-none" : ""}`}>
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-cyan-600" />
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allOnPageSelected || selectAllMode}
                    onChange={toggleAll}
                    className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                  />
                </th>
                {isCol("contact") && <th className="text-left px-4 py-3 font-medium text-gray-600">Contact</th>}
                {isCol("email") && <th className="text-left px-4 py-3 font-medium text-gray-600">{sortHeader("Email address", "email")}</th>}
                {isCol("first_name") && <th className="text-left px-4 py-3 font-medium text-gray-600">{sortHeader("First name", "first_name")}</th>}
                {isCol("last_name") && <th className="text-left px-4 py-3 font-medium text-gray-600">Last name</th>}
                {isCol("type") && <th className="text-left px-4 py-3 font-medium text-gray-600">{sortHeader("Type", "contact_type")}</th>}
                {isCol("created_at") && <th className="text-left px-4 py-3 font-medium text-gray-600">{sortHeader("Date added", "created_at")}</th>}
                {isCol("tags") && <th className="text-left px-4 py-3 font-medium text-gray-600">Tags</th>}
                {isCol("phone") && <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>}
                {isCol("church") && <th className="text-left px-4 py-3 font-medium text-gray-600">{sortHeader("Church", "church_name")}</th>}
                {isCol("language") && <th className="text-left px-4 py-3 font-medium text-gray-600">Language</th>}
                {isCol("region") && <th className="text-left px-4 py-3 font-medium text-gray-600">Region</th>}
                {isCol("position") && <th className="text-left px-4 py-3 font-medium text-gray-600">Position</th>}
                {isCol("gender") && <th className="text-left px-4 py-3 font-medium text-gray-600">Gender</th>}
                {isCol("job_title") && <th className="text-left px-4 py-3 font-medium text-gray-600">Job title</th>}
                {isCol("church_role") && <th className="text-left px-4 py-3 font-medium text-gray-600">Church role</th>}
                {isCol("birthday") && <th className="text-left px-4 py-3 font-medium text-gray-600">Birthday</th>}
                {isCol("age_group") && <th className="text-left px-4 py-3 font-medium text-gray-600">Age group</th>}
                {isCol("alternative_email") && <th className="text-left px-4 py-3 font-medium text-gray-600">Alt. email</th>}
                {isCol("referred_by") && <th className="text-left px-4 py-3 font-medium text-gray-600">Referred by</th>}
                {isCol("interests") && <th className="text-left px-4 py-3 font-medium text-gray-600">Interests</th>}
                {isCol("expectations") && <th className="text-left px-4 py-3 font-medium text-gray-600">Expectations</th>}
                {isCol("source") && <th className="text-left px-4 py-3 font-medium text-gray-600">Source</th>}
                {isCol("email_status") && <th className="text-left px-4 py-3 font-medium text-gray-600">Email status</th>}
                {isCol("email_permission") && <th className="text-left px-4 py-3 font-medium text-gray-600">Email permission</th>}
                {isCol("email_lists") && <th className="text-left px-4 py-3 font-medium text-gray-600">Lists</th>}
                {isCol("city") && <th className="text-left px-4 py-3 font-medium text-gray-600">City</th>}
                {isCol("country") && <th className="text-left px-4 py-3 font-medium text-gray-600">Country</th>}
                {isCol("street_address") && <th className="text-left px-4 py-3 font-medium text-gray-600">Street address</th>}
                {isCol("state") && <th className="text-left px-4 py-3 font-medium text-gray-600">State</th>}
                {isCol("phone_home") && <th className="text-left px-4 py-3 font-medium text-gray-600">Phone (home)</th>}
                {isCol("phone_mobile") && <th className="text-left px-4 py-3 font-medium text-gray-600">Phone (mobile)</th>}
                {isCol("phone_work") && <th className="text-left px-4 py-3 font-medium text-gray-600">Phone (work)</th>}
                {isCol("updated_at") && <th className="text-left px-4 py-3 font-medium text-gray-600">{sortHeader("Date edited", "updated_at")}</th>}
                <th className="px-4 py-3 w-24 sticky right-0 bg-gray-50"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {contacts.length > 0 ? (
                contacts.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 group/row">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectAllMode || selected.has(c.id)}
                        onChange={() => toggleOne(c.id)}
                        className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                      />
                    </td>
                    {isCol("contact") && (
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/contacts/${c.id}`}
                          className="font-medium text-gray-900 hover:text-cyan-700"
                        >
                          {c.first_name} {c.last_name}
                        </Link>
                      </td>
                    )}
                    {isCol("email") && <td className="px-4 py-3 text-gray-600">{c.email}</td>}
                    {isCol("first_name") && <td className="px-4 py-3 text-gray-600">{c.first_name}</td>}
                    {isCol("last_name") && <td className="px-4 py-3 text-gray-600">{c.last_name}</td>}
                    {isCol("type") && (
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className={contactTypeColors[c.contact_type]}>
                          {contactTypeLabels[c.contact_type]}
                        </Badge>
                      </td>
                    )}
                    {isCol("created_at") && (
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                    )}
                    {isCol("tags") && (
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(expandedTags.has(c.id) ? c.tags : c.tags.slice(0, 2)).map((tag) => (
                            <span key={tag} className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                          {c.tags.length > 2 && (
                            <button
                              type="button"
                              onClick={() => {
                                setExpandedTags((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(c.id)) next.delete(c.id);
                                  else next.add(c.id);
                                  return next;
                                });
                              }}
                              className="text-cyan-600 hover:text-cyan-800 text-xs font-medium px-1"
                            >
                              {expandedTags.has(c.id) ? "show less" : `+${c.tags.length - 2}`}
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                    {isCol("phone") && <td className="px-4 py-3 text-gray-600">{c.phone}</td>}
                    {isCol("church") && <td className="px-4 py-3 text-gray-600">{c.church_name}</td>}
                    {isCol("language") && <td className="px-4 py-3 text-gray-600">{c.language}</td>}
                    {isCol("region") && (
                      <td className="px-4 py-3">
                        {c.region ? (
                          <span className="inline-flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: c.region.color }}
                            />
                            <span className="text-gray-700">{c.region.name}</span>
                          </span>
                        ) : null}
                      </td>
                    )}
                    {isCol("position") && <td className="px-4 py-3 text-gray-600">{c.position?.name}</td>}
                    {isCol("gender") && <td className="px-4 py-3 text-gray-600 capitalize">{c.gender}</td>}
                    {isCol("job_title") && <td className="px-4 py-3 text-gray-600">{c.job_title ?? "—"}</td>}
                    {isCol("church_role") && <td className="px-4 py-3 text-gray-600">{c.church_role ?? "—"}</td>}
                    {isCol("birthday") && (
                      <td className="px-4 py-3 text-gray-600">
                        {c.birthday ? new Date(c.birthday).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                      </td>
                    )}
                    {isCol("age_group") && <td className="px-4 py-3 text-gray-600">{c.age_group ?? "—"}</td>}
                    {isCol("alternative_email") && <td className="px-4 py-3 text-gray-600">{c.alternative_email ?? "—"}</td>}
                    {isCol("referred_by") && <td className="px-4 py-3 text-gray-600">{c.referred_by ?? "—"}</td>}
                    {isCol("interests") && <td className="px-4 py-3 text-gray-600">{c.interests ?? "—"}</td>}
                    {isCol("expectations") && <td className="px-4 py-3 text-gray-600">{c.expectations ?? "—"}</td>}
                    {isCol("source") && <td className="px-4 py-3 text-gray-600">{c.source ?? "—"}</td>}
                    {isCol("email_status") && <td className="px-4 py-3 text-gray-600">{c.email_status ?? "—"}</td>}
                    {isCol("email_permission") && <td className="px-4 py-3 text-gray-600">{c.email_permission ?? "—"}</td>}
                    {isCol("email_lists") && (
                      <td className="px-4 py-3">
                        {c.email_lists && c.email_lists.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {c.email_lists.map((list) => (
                              <span key={list} className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs">{list}</span>
                            ))}
                          </div>
                        ) : "—"}
                      </td>
                    )}
                    {isCol("city") && <td className="px-4 py-3 text-gray-600">{c.city}</td>}
                    {isCol("country") && <td className="px-4 py-3 text-gray-600">{c.country}</td>}
                    {isCol("street_address") && <td className="px-4 py-3 text-gray-600">{c.street_address ?? "—"}</td>}
                    {isCol("state") && <td className="px-4 py-3 text-gray-600">{c.state ?? "—"}</td>}
                    {isCol("phone_home") && <td className="px-4 py-3 text-gray-600">{c.phone_home ?? "—"}</td>}
                    {isCol("phone_mobile") && <td className="px-4 py-3 text-gray-600">{c.phone_mobile ?? "—"}</td>}
                    {isCol("phone_work") && <td className="px-4 py-3 text-gray-600">{c.phone_work ?? "—"}</td>}
                    {isCol("updated_at") && (
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(c.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                    )}
                    <td className="px-4 py-3 sticky right-0 bg-white group-hover/row:bg-gray-50">
                      <div className="relative" ref={actionMenu === c.id ? actionMenuRef : undefined}>
                        <button
                          type="button"
                          onClick={() => setActionMenu(actionMenu === c.id ? null : c.id)}
                          className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {actionMenu === c.id && (
                          <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border py-1 z-50">
                            <Link
                              href={`/admin/contacts/${c.id}`}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              onClick={() => setActionMenu(null)}
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </Link>
                            <Link
                              href={`/admin/contacts/${c.id}?edit=true`}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              onClick={() => setActionMenu(null)}
                            >
                              <Pencil className="w-4 h-4" />
                              Edit
                            </Link>
                            {c.email && (
                              <a
                                href={`mailto:${c.email}`}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                onClick={() => setActionMenu(null)}
                              >
                                <Mail className="w-4 h-4" />
                                Email
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={visibleCount} className="px-4 py-12 text-center text-gray-400">
                    No contacts found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalCount > 0 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {startIndex}–{endIndex} of {totalCount}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Rows:</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(v: string | null) => {
                    if (v) navigate({ pageSize: v, page: "1" });
                  }}
                >
                  <SelectTrigger className="w-[70px] h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate({ page: "1" })}
                disabled={page <= 1}
              >
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate({ page: String(page - 1) })}
                disabled={page <= 1}
              >
                Prev
              </Button>
              <span className="px-3 text-sm text-gray-600">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate({ page: String(page + 1) })}
                disabled={page >= totalPages}
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate({ page: String(totalPages) })}
                disabled={page >= totalPages}
              >
                Last
              </Button>
            </div>
          </div>
        )}
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

      {/* Add to List Dialog */}
      <Dialog open={bulkDialog === "add_to_list"} onOpenChange={(open) => { if (!open) setBulkDialog(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add {effectiveCount.toLocaleString()} contacts to list</DialogTitle>
            <DialogDescription>Search and select lists to add contacts to.</DialogDescription>
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

      {/* Remove Tags Dialog */}
      <Dialog open={bulkDialog === "remove_tags"} onOpenChange={(open) => { if (!open) setBulkDialog(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove tags from {effectiveCount.toLocaleString()} contacts</DialogTitle>
            <DialogDescription>Search and select tags to remove.</DialogDescription>
          </DialogHeader>
          <SearchableMultiSelect
            options={allTags}
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
    </div>
  );
}
