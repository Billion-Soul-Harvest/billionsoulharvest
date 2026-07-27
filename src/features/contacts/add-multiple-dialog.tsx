"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { X, Plus, ChevronDown, Check, Search } from "lucide-react";
import { createClient } from "@/shared/utils/supabase/client";
import { SharedContactOptions } from "./shared-contact-options";
import { CONTACT_FIELDS } from "./csv-column-mappings";
import type { ContactType } from "@/shared/types/database";

interface Column {
  key: string;      // e.g. "email", "first_name", or "custom:Ministry"
  label: string;    // display label
  placeholder: string;
  removable: boolean;
}

const DEFAULT_COLUMNS: Column[] = [
  { key: "email", label: "Email", placeholder: "email@example.com", removable: false },
  { key: "first_name", label: "First Name", placeholder: "First", removable: false },
  { key: "last_name", label: "Last Name", placeholder: "Last", removable: false },
  { key: "phone", label: "Phone", placeholder: "+1...", removable: true },
];

function buildColumn(key: string, label: string): Column {
  return { key, label, placeholder: label, removable: true };
}

interface AddMultipleDialogProps {
  listNames: string[];
  onSuccess: () => void;
  onClose: () => void;
}

export function AddMultipleDialog({ listNames, onSuccess, onClose }: AddMultipleDialogProps) {
  const [columns, setColumns] = useState<Column[]>(DEFAULT_COLUMNS);
  const [rows, setRows] = useState<Record<string, string>[]>(() =>
    Array.from({ length: 5 }, () => ({})),
  );
  const [selectedLists, setSelectedLists] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateRow(index: number, key: string, value: string) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [key]: value } : r)));
  }

  function deleteRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function addRow() {
    setRows((prev) => [...prev, {}]);
  }

  function addColumn(key: string, label: string) {
    if (columns.some((c) => c.key === key)) return;
    setColumns((prev) => [...prev, buildColumn(key, label)]);
  }

  function removeColumn(key: string) {
    setColumns((prev) => prev.filter((c) => c.key !== key));
    // Clean up row data for this column
    setRows((prev) => prev.map((r) => {
      const { [key]: _, ...rest } = r;
      return rest;
    }));
  }

  async function handleSave() {
    setError(null);

    const validRows = rows.filter(
      (r) => (r.email?.trim()) || (r.first_name?.trim()) || (r.last_name?.trim()),
    );

    if (validRows.length === 0) {
      setError("Please fill in at least one row with a name or email.");
      return;
    }

    setSaving(true);

    const standardKeys = new Set(CONTACT_FIELDS.map((f) => f.key));

    const payloads = validRows.map((r) => {
      const payload: Record<string, unknown> = {
        contact_type: "subscriber" as ContactType,
        tags: selectedTags,
        email_lists: selectedLists.length > 0 ? selectedLists : null,
      };
      const customFields: Record<string, string> = {};

      for (const col of columns) {
        const val = r[col.key]?.trim();
        if (!val) continue;

        if (col.key.startsWith("custom:")) {
          customFields[col.key.slice(7)] = val;
        } else if (col.key === "email") {
          payload.email = val.toLowerCase();
        } else if (col.key === "alternative_email") {
          payload.alternative_email = val.split(/[,;]+/).map((e) => e.trim().toLowerCase()).filter(Boolean);
        } else if (standardKeys.has(col.key)) {
          payload[col.key] = val;
        }
      }

      if (Object.keys(customFields).length > 0) {
        payload.custom_fields = customFields;
      }

      return payload;
    });

    const supabase = createClient();
    const { error: err } = await supabase.from("contacts").insert(payloads);
    setSaving(false);

    if (err) {
      setError(err.message);
      return;
    }

    onSuccess();
    onClose();
  }

  // Fields already used as columns
  const usedKeys = new Set(columns.map((c) => c.key));

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add multiple contacts</DialogTitle>
      </DialogHeader>

      <div className="space-y-4 py-2">
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className="text-left font-medium text-gray-600 pb-2 pr-2 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <span>{col.label}</span>
                      {col.removable && (
                        <button
                          type="button"
                          onClick={() => removeColumn(col.key)}
                          className="p-0.5 text-gray-300 hover:text-red-500 transition-colors"
                          title={`Remove ${col.label} column`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </th>
                ))}
                <th className="pb-2 pr-2">
                  <AddColumnButton
                    usedKeys={usedKeys}
                    onAdd={addColumn}
                  />
                </th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key} className="pr-1.5 pb-1.5">
                      <Input
                        value={row[col.key] ?? ""}
                        onChange={(e) => updateRow(i, col.key, e.target.value)}
                        placeholder={col.placeholder}
                        className="h-9 text-sm min-w-[100px]"
                      />
                    </td>
                  ))}
                  <td className="pr-1.5 pb-1.5" /> {/* spacer for add column */}
                  <td className="pb-1.5">
                    <button
                      type="button"
                      onClick={() => deleteRow(i)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove row"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          + Add row
        </Button>

        <div className="border-t pt-4">
          <SharedContactOptions
            listNames={listNames}
            selectedLists={selectedLists}
            setSelectedLists={setSelectedLists}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</p>
        )}
      </div>

      <DialogFooter className="gap-2 sm:gap-2">
        <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-cyan-600 hover:bg-cyan-700 text-white"
        >
          {saving ? "Saving..." : "Save contacts"}
        </Button>
      </DialogFooter>
    </>
  );
}

// ---------------------------------------------------------------------------
// Add Column Button — dropdown with searchable field list + custom field
// ---------------------------------------------------------------------------

function AddColumnButton({
  usedKeys,
  onAdd,
}: {
  usedKeys: Set<string>;
  onAdd: (key: string, label: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [customEditing, setCustomEditing] = useState(false);
  const [customName, setCustomName] = useState("");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const customInputRef = useRef<HTMLInputElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        buttonRef.current?.contains(e.target as Node) ||
        dropdownRef.current?.contains(e.target as Node)
      ) return;
      setOpen(false);
      setQuery("");
      setCustomEditing(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function openDropdown() {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.left, width: Math.max(rect.width, 220) });
    }
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  // Available fields (not already used)
  const available = CONTACT_FIELDS.filter((f) => !usedKeys.has(f.key));
  const filtered = query
    ? available.filter((f) => f.label.toLowerCase().includes(query.toLowerCase()))
    : available;

  const trimmedQuery = query.trim();
  const showCreateCustom = trimmedQuery.length > 0 &&
    !CONTACT_FIELDS.some((f) => f.label.toLowerCase() === trimmedQuery.toLowerCase());

  function selectField(key: string, label: string) {
    onAdd(key, label);
    setOpen(false);
    setQuery("");
    setCustomEditing(false);
  }

  function selectCustom(name: string) {
    onAdd(`custom:${name}`, name);
    setOpen(false);
    setQuery("");
    setCustomEditing(false);
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => { if (open) { setOpen(false); setQuery(""); setCustomEditing(false); } else openDropdown(); }}
        className="flex items-center gap-1 text-xs text-cyan-600 hover:text-cyan-700 font-medium whitespace-nowrap"
        title="Add column"
      >
        <Plus className="w-3.5 h-3.5" />
        Column
      </button>

      {open && createPortal(
        <div
          ref={dropdownRef}
          className="fixed bg-white rounded-md border border-gray-200 shadow-lg"
          style={{ top: pos.top, left: pos.left, width: pos.width, zIndex: 9999 }}
        >
          <div className="p-1.5 border-b">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && showCreateCustom) {
                  e.preventDefault();
                  selectCustom(trimmedQuery);
                }
              }}
              placeholder="Search or create custom..."
              className="w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
          <div className="max-h-52 overflow-y-auto py-1">
            {/* Custom field inline creator */}
            {!query && !customEditing && (
              <button
                type="button"
                onClick={() => {
                  setCustomEditing(true);
                  setCustomName("");
                  setTimeout(() => customInputRef.current?.focus(), 0);
                }}
                className="w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 text-cyan-700 hover:bg-cyan-50 border-b mb-1"
              >
                <span className="w-3.5 shrink-0 text-cyan-600 font-bold">+</span>
                Custom field...
              </button>
            )}
            {!query && customEditing && (
              <div className="flex items-center gap-1 px-2 py-1.5 border-b mb-1">
                <input
                  ref={customInputRef}
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && customName.trim()) {
                      e.preventDefault();
                      selectCustom(customName.trim());
                    } else if (e.key === "Escape") {
                      setCustomEditing(false);
                    }
                  }}
                  placeholder="Field name..."
                  className="flex-1 min-w-0 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <button
                  type="button"
                  disabled={!customName.trim()}
                  onClick={() => {
                    if (customName.trim()) selectCustom(customName.trim());
                  }}
                  className="px-2 py-1 text-xs font-medium text-white bg-cyan-600 rounded hover:bg-cyan-700 disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            )}

            {filtered.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => selectField(f.key, f.label)}
                className="w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 text-gray-700 hover:bg-gray-50"
              >
                <span className="w-3.5 shrink-0" />
                {f.label}
              </button>
            ))}
            {filtered.length === 0 && !showCreateCustom && (
              <p className="px-3 py-2 text-sm text-gray-400">No fields match</p>
            )}
            {showCreateCustom && (
              <button
                type="button"
                onClick={() => selectCustom(trimmedQuery)}
                className="w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 text-cyan-700 hover:bg-cyan-50 border-t"
              >
                <span className="w-3.5 shrink-0 text-cyan-600 font-bold">+</span>
                Create custom field: &quot;{trimmedQuery}&quot;
              </button>
            )}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
