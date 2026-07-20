"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ChevronDown, X, Search, Check } from "lucide-react";
import { createClient } from "@/shared/utils/supabase/client";
import type { ContactType } from "@/shared/types/database";

interface CreateContactDialogProps {
  listNames: string[];
  onSuccess: () => void;
}

type OptionalField =
  | "phone"
  | "job_title"
  | "church_name"
  | "birthday"
  | "age_group"
  | "gender"
  | "source"
  | "city"
  | "country"
  | "language";

const OPTIONAL_FIELD_DEFS: { key: OptionalField; label: string; group: string }[] = [
  { key: "phone", label: "Phone", group: "Basic fields" },
  { key: "job_title", label: "Job title", group: "Basic fields" },
  { key: "church_name", label: "Church name", group: "Basic fields" },
  { key: "birthday", label: "Birthday", group: "Basic fields" },
  { key: "age_group", label: "Age group", group: "Basic fields" },
  { key: "gender", label: "Gender", group: "Basic fields" },
  { key: "source", label: "Source", group: "Basic fields" },
  { key: "city", label: "City", group: "Location" },
  { key: "country", label: "Country", group: "Location" },
  { key: "language", label: "Language", group: "Location" },
];

const FIELD_GROUPS = ["Basic fields", "Location"] as const;

const AGE_GROUP_OPTIONS = ["Under 18", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"];
const GENDER_OPTIONS = ["male", "female"];

export function CreateContactDialog({ listNames, onSuccess }: CreateContactDialogProps) {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="bg-cyan-600 hover:bg-cyan-700 text-white gap-1.5"
      >
        Add contacts
        <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
      </Button>
      {dropdownOpen && (
        <div className="absolute right-0 top-full mt-1 bg-white rounded-lg border border-gray-200 shadow-lg py-1 z-50 min-w-[200px]">
          <button
            type="button"
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => {
              setDropdownOpen(false);
              setOpen(true);
            }}
          >
            Add a single contact
          </button>
        </div>
      )}
      <Dialog open={open} onOpenChange={(o) => { if (!o) setOpen(false); }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <AddContactForm
            key={String(open)}
            listNames={listNames}
            onSuccess={onSuccess}
            onClose={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AddContactForm({
  listNames,
  onSuccess,
  onClose,
}: {
  listNames: string[];
  onSuccess: () => void;
  onClose: () => void;
}) {
  // Core fields
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Optional fields
  const [activeFields, setActiveFields] = useState<Set<OptionalField>>(new Set());
  const [fieldValues, setFieldValues] = useState<Partial<Record<OptionalField, string>>>({});

  // Manage fields dropdown
  const [manageOpen, setManageOpen] = useState(false);
  const [manageQuery, setManageQuery] = useState("");
  // Advanced settings
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [selectedLists, setSelectedLists] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagQuery, setTagQuery] = useState("");
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const tagRef = useRef<HTMLDivElement>(null);

  // Save state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  function resetForm() {
    setEmail("");
    setFirstName("");
    setLastName("");
    setActiveFields(new Set());
    setFieldValues({});
    setManageOpen(false);
    setManageQuery("");
    setAdvancedOpen(false);
    setSelectedLists([]);
    setSelectedTags([]);
    setTagQuery("");
    setError(null);
  }

  function toggleField(key: OptionalField) {
    setActiveFields((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
        setFieldValues((fv) => {
          const copy = { ...fv };
          delete copy[key];
          return copy;
        });
      } else {
        next.add(key);
      }
      return next;
    });
  }

  function setFieldValue(key: OptionalField, value: string) {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(andAnother: boolean) {
    if (!firstName.trim() && !lastName.trim() && !email.trim()) {
      setError("Please provide at least a name or email.");
      return;
    }

    setSaving(true);
    setError(null);
    const supabase = createClient();

    const payload: Record<string, unknown> = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim() || null,
      contact_type: "subscriber" as ContactType,
      tags: selectedTags,
      email_lists: selectedLists.length > 0 ? selectedLists : null,
    };

    for (const [key, value] of Object.entries(fieldValues)) {
      payload[key] = value?.trim() || null;
    }

    const { error: err } = await supabase.from("contacts").insert(payload);
    setSaving(false);

    if (err) {
      setError(err.message);
      return;
    }

    onSuccess();

    if (andAnother) {
      resetForm();
    } else {
      onClose();
      resetForm();
    }
  }

  const filteredManageFields = manageQuery
    ? OPTIONAL_FIELD_DEFS.filter((f) => f.label.toLowerCase().includes(manageQuery.toLowerCase()))
    : OPTIONAL_FIELD_DEFS;

  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const tagDebounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

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
      setSelectedTags((prev) => [...prev, trimmed]);
    }
    setTagQuery("");
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add a contact</DialogTitle>
      </DialogHeader>

      <div className="space-y-4 py-2">
        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="create-email">Email</Label>
          <Input
            id="create-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder=""
            autoFocus
          />
        </div>

        {/* First name */}
        <div className="space-y-1.5">
          <Label htmlFor="create-first-name">First name</Label>
          <Input
            id="create-first-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>

        {/* Last name */}
        <div className="space-y-1.5">
          <Label htmlFor="create-last-name">Last name</Label>
          <Input
            id="create-last-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        {/* Dynamic optional fields */}
        {OPTIONAL_FIELD_DEFS.filter((f) => activeFields.has(f.key)).map((f) => (
          <div key={f.key} className="space-y-1.5">
            <Label htmlFor={`create-${f.key}`}>{f.label}</Label>
            {f.key === "gender" ? (
              <select
                id={`create-${f.key}`}
                value={fieldValues[f.key] ?? ""}
                onChange={(e) => setFieldValue(f.key, e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Select...</option>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>
                ))}
              </select>
            ) : f.key === "age_group" ? (
              <select
                id={`create-${f.key}`}
                value={fieldValues[f.key] ?? ""}
                onChange={(e) => setFieldValue(f.key, e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Select...</option>
                {AGE_GROUP_OPTIONS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            ) : f.key === "birthday" ? (
              <Input
                id={`create-${f.key}`}
                type="date"
                value={fieldValues[f.key] ?? ""}
                onChange={(e) => setFieldValue(f.key, e.target.value)}
              />
            ) : (
              <Input
                id={`create-${f.key}`}
                value={fieldValues[f.key] ?? ""}
                onChange={(e) => setFieldValue(f.key, e.target.value)}
              />
            )}
          </div>
        ))}

        {/* Manage fields + Advanced settings row */}
        <div className="flex items-center justify-between">
          <div>
            <button
              type="button"
              onClick={() => setManageOpen(!manageOpen)}
              className="text-sm font-semibold text-cyan-700 hover:text-cyan-800"
            >
              Manage fields
            </button>
          </div>
          <button
            type="button"
            onClick={() => setAdvancedOpen(!advancedOpen)}
            className="text-sm font-semibold text-cyan-700 hover:text-cyan-800"
          >
            {advancedOpen ? "Hide advanced settings" : "Advanced settings"}
          </button>
        </div>

        {/* Manage fields panel (inline collapsible) */}
        {manageOpen && (
          <div className="rounded-lg border border-gray-200 shadow-sm">
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={manageQuery}
                  onChange={(e) => setManageQuery(e.target.value)}
                  placeholder="Type a command or search..."
                  className="w-full pl-8 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto py-1">
              {FIELD_GROUPS.map((group) => {
                const fields = filteredManageFields.filter((f) => f.group === group);
                if (fields.length === 0) return null;
                return (
                  <div key={group}>
                    <p className="px-4 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{group}</p>
                    {fields.map((f) => (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => toggleField(f.key)}
                        className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition-colors ${
                          activeFields.has(f.key) ? "bg-cyan-50 text-cyan-700" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {f.label}
                        {activeFields.has(f.key) && <Check className="w-4 h-4 text-cyan-600" />}
                      </button>
                    ))}
                  </div>
                );
              })}
              {filteredManageFields.length === 0 && (
                <p className="px-4 py-3 text-sm text-gray-400">No fields found</p>
              )}
            </div>
          </div>
        )}

        {/* Advanced settings section */}
        {advancedOpen && (
          <div className="space-y-4 border-t pt-4">
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
                      onClick={() => setSelectedLists((prev) => prev.filter((l) => l !== list))}
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
                      onClick={() => setSelectedLists((prev) => [...prev, list])}
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
                      onClick={() => setSelectedTags((prev) => prev.filter((t) => t !== tag))}
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
        )}

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</p>
        )}
      </div>

      <DialogFooter className="gap-2 sm:gap-2">
        <DialogClose render={<Button variant="outline" />}>
          Cancel
        </DialogClose>
        <Button
          variant="outline"
          onClick={() => handleSave(true)}
          disabled={saving}
        >
          Save and add another
        </Button>
        <Button
          onClick={() => handleSave(false)}
          disabled={saving}
          className="bg-cyan-600 hover:bg-cyan-700 text-white"
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </DialogFooter>
    </>
  );
}
