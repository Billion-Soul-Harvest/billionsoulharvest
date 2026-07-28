"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { X, Plus } from "lucide-react";
import { createClient } from "@/shared/utils/supabase/client";
import { SharedContactOptions } from "./shared-contact-options";
import { CONTACT_FIELDS } from "./csv-column-mappings";
import type { ContactType } from "@/shared/types/database";

interface Column {
  key: string;
  label: string;
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
  existingCustomFields: string[];
  onSuccess: () => void;
  onClose: () => void;
}

export function AddMultipleDialog({ listNames, existingCustomFields, onSuccess, onClose }: AddMultipleDialogProps) {
  const [columns, setColumns] = useState<Column[]>(DEFAULT_COLUMNS);
  const [rows, setRows] = useState<Record<string, string>[]>(() =>
    Array.from({ length: 5 }, () => ({})),
  );
  const [selectedLists, setSelectedLists] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active cell tracking for spreadsheet behavior
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  function updateRow(index: number, key: string, value: string) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [key]: value } : r)));
  }

  function deleteRow(index: number) {
    setRows((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length === 0 ? [{}] : next;
    });
    setActiveCell(null);
  }

  function addRow() {
    setRows((prev) => [...prev, {}]);
    // Focus first cell of new row
    setTimeout(() => {
      setActiveCell({ row: rows.length, col: 0 });
    }, 0);
  }

  function addColumn(key: string, label: string) {
    if (columns.some((c) => c.key === key)) return;
    setColumns((prev) => [...prev, buildColumn(key, label)]);
  }

  function removeColumn(key: string) {
    setColumns((prev) => prev.filter((c) => c.key !== key));
    setRows((prev) => prev.map((r) => {
      const { [key]: _, ...rest } = r;
      return rest;
    }));
  }

  // Keyboard navigation
  function handleCellKeyDown(e: React.KeyboardEvent, rowIdx: number, colIdx: number) {
    if (e.key === "Tab") {
      e.preventDefault();
      const nextCol = e.shiftKey ? colIdx - 1 : colIdx + 1;
      if (nextCol >= 0 && nextCol < columns.length) {
        setActiveCell({ row: rowIdx, col: nextCol });
      } else if (!e.shiftKey && nextCol >= columns.length) {
        // Tab past last column → next row first column, add row if last
        if (rowIdx < rows.length - 1) {
          setActiveCell({ row: rowIdx + 1, col: 0 });
        } else {
          addRow();
        }
      } else if (e.shiftKey && nextCol < 0 && rowIdx > 0) {
        setActiveCell({ row: rowIdx - 1, col: columns.length - 1 });
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (rowIdx < rows.length - 1) {
        setActiveCell({ row: rowIdx + 1, col: colIdx });
      } else {
        addRow();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (rowIdx < rows.length - 1) {
        setActiveCell({ row: rowIdx + 1, col: colIdx });
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (rowIdx > 0) {
        setActiveCell({ row: rowIdx - 1, col: colIdx });
      }
    } else if (e.key === "Escape") {
      e.stopPropagation();
      setActiveCell(null);
      (e.target as HTMLElement).blur();
    }
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
    if (err) { setError(err.message); return; }
    onSuccess();
    onClose();
  }

  const usedKeys = new Set(columns.map((c) => c.key));
  const filledCount = rows.filter(
    (r) => (r.email?.trim()) || (r.first_name?.trim()) || (r.last_name?.trim()),
  ).length;

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add multiple contacts</DialogTitle>
      </DialogHeader>

      <div className="space-y-3 py-2">
        {/* Spreadsheet grid */}
        <div className="overflow-x-auto -mx-6 px-6">
          <div className="border rounded-lg overflow-hidden">
            <table ref={tableRef} className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  {/* Row number header */}
                  <th className="w-10 px-2 py-2 text-center text-xs font-medium text-gray-400 border-b border-r bg-gray-50 sticky left-0">
                    #
                  </th>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="px-3 py-2 text-left text-xs font-semibold text-gray-600 border-b border-r whitespace-nowrap select-none group"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span>{col.label}</span>
                        {col.removable && (
                          <button
                            type="button"
                            onClick={() => removeColumn(col.key)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-300 hover:text-red-500 transition-all"
                            title={`Remove ${col.label}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                  {/* Add column header */}
                  <th className="w-20 px-2 py-2 border-b text-center">
                    <AddColumnButton usedKeys={usedKeys} onAdd={addColumn} existingCustomFields={existingCustomFields} />
                  </th>
                  {/* Delete row header */}
                  <th className="w-8 border-b" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className="group/row hover:bg-blue-50/30 transition-colors"
                  >
                    {/* Row number */}
                    <td className="px-2 py-0 text-center text-xs text-gray-400 border-r bg-gray-50 sticky left-0 select-none">
                      {rowIdx + 1}
                    </td>
                    {columns.map((col, colIdx) => {
                      const isActive = activeCell?.row === rowIdx && activeCell?.col === colIdx;
                      return (
                        <EditableCell
                          key={col.key}
                          value={row[col.key] ?? ""}
                          placeholder={col.placeholder}
                          isActive={isActive}
                          onActivate={() => setActiveCell({ row: rowIdx, col: colIdx })}
                          onChange={(val) => updateRow(rowIdx, col.key, val)}
                          onKeyDown={(e) => handleCellKeyDown(e, rowIdx, colIdx)}
                        />
                      );
                    })}
                    {/* Spacer for add-column */}
                    <td className="border-r" />
                    {/* Delete row */}
                    <td className="px-1 py-0">
                      <button
                        type="button"
                        onClick={() => deleteRow(rowIdx)}
                        className="p-1 text-gray-300 opacity-0 group-hover/row:opacity-100 hover:text-red-500 transition-all"
                        title="Remove row"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer row controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-1 text-sm text-cyan-600 hover:text-cyan-700 font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            Add row
          </button>
          <span className="text-xs text-gray-400">
            {filledCount} contact{filledCount !== 1 ? "s" : ""} filled
          </span>
        </div>

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
          {saving ? "Saving..." : `Save ${filledCount > 0 ? filledCount + " " : ""}contact${filledCount !== 1 ? "s" : ""}`}
        </Button>
      </DialogFooter>
    </>
  );
}

// ---------------------------------------------------------------------------
// Editable Cell — click to edit, shows text when idle
// ---------------------------------------------------------------------------

function EditableCell({
  value,
  placeholder,
  isActive,
  onActivate,
  onChange,
  onKeyDown,
}: {
  value: string;
  placeholder: string;
  isActive: boolean;
  onActivate: () => void;
  onChange: (val: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive]);

  if (isActive) {
    return (
      <td className="p-0 border-r">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => {/* keep value, just lose active state handled by parent */}}
          placeholder={placeholder}
          className="w-full h-8 px-3 text-sm bg-white outline-none ring-2 ring-inset ring-cyan-500 min-w-[100px]"
        />
      </td>
    );
  }

  return (
    <td
      className="px-3 py-0 border-r cursor-cell min-w-[100px] h-8"
      onClick={onActivate}
    >
      {value ? (
        <span className="text-sm text-gray-900 truncate block leading-8">{value}</span>
      ) : (
        <span className="text-sm text-gray-300 truncate block leading-8">{placeholder}</span>
      )}
    </td>
  );
}

// ---------------------------------------------------------------------------
// Add Column Button — dropdown with searchable field list + custom field
// ---------------------------------------------------------------------------

function AddColumnButton({
  usedKeys,
  onAdd,
  existingCustomFields,
}: {
  usedKeys: Set<string>;
  onAdd: (key: string, label: string) => void;
  existingCustomFields: string[];
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
      setPos({ top: rect.bottom + 4, left: rect.right - 220, width: 220 });
    }
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  const availableStandard = CONTACT_FIELDS.filter((f) => !usedKeys.has(f.key));
  const availableCustom = existingCustomFields
    .filter((k) => !usedKeys.has(`custom:${k}`))
    .map((k) => ({ key: `custom:${k}`, label: k }));

  const filteredStandard = query
    ? availableStandard.filter((f) => f.label.toLowerCase().includes(query.toLowerCase()))
    : availableStandard;
  const filteredCustom = query
    ? availableCustom.filter((f) => f.label.toLowerCase().includes(query.toLowerCase()))
    : availableCustom;

  const trimmedQuery = query.trim();
  const allLabels = [...CONTACT_FIELDS.map((f) => f.label), ...existingCustomFields];
  const showCreateCustom = trimmedQuery.length > 0 &&
    !allLabels.some((l) => l.toLowerCase() === trimmedQuery.toLowerCase());

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
        className="flex items-center gap-1 text-xs text-cyan-600 hover:text-cyan-700 font-medium whitespace-nowrap mx-auto"
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
            {filteredStandard.map((f) => (
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
            {filteredCustom.length > 0 && (
              <>
                <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider border-t mt-1 pt-2">
                  Custom Fields
                </div>
                {filteredCustom.map((f) => (
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
              </>
            )}
            {filteredStandard.length === 0 && filteredCustom.length === 0 && !showCreateCustom && (
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
