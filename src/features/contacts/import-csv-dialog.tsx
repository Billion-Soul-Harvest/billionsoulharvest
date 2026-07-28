"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Upload, CheckCircle2, AlertCircle, ChevronDown, Check } from "lucide-react";
import { read, utils } from "xlsx";
import { createClient } from "@/shared/utils/supabase/client";
import { parseCSV } from "@/shared/utils/csv-parser";
import { CONTACT_FIELDS, autoDetectMappings, coerceRow } from "./csv-column-mappings";
import { SharedContactOptions } from "./shared-contact-options";
import type { ContactType } from "@/shared/types/database";

type Step = "upload" | "mapping" | "preview" | "importing";

interface ImportCSVDialogProps {
  listNames: string[];
  existingCustomFields: string[];
  onSuccess: () => void;
  onClose: () => void;
}

const BATCH_SIZE = 100;

export function ImportCSVDialog({ listNames, existingCustomFields, onSuccess, onClose }: ImportCSVDialogProps) {
  const [step, setStep] = useState<Step>("upload");
  const [fileName, setFileName] = useState("");
  const [csvRows, setCsvRows] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [selectedLists, setSelectedLists] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Import progress
  const [progress, setProgress] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [importDone, setImportDone] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  function loadRows(rows: Record<string, string>[], name: string) {
    if (rows.length === 0) {
      setError("No data rows found in the file.");
      return;
    }
    const fileHeaders = Object.keys(rows[0]);
    setHeaders(fileHeaders);
    setCsvRows(rows);
    setMappings(autoDetectMappings(fileHeaders));
    setFileName(name);
    setStep("mapping");
  }

  const handleFile = useCallback((file: File) => {
    setError(null);
    const isXlsx = /\.xlsx?$/i.test(file.name);
    const isCsv = /\.csv$/i.test(file.name);

    if (!isCsv && !isXlsx) {
      setError("Please select a .csv or .xlsx file.");
      return;
    }

    if (isCsv) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        loadRows(parseCSV(text), file.name);
      };
      reader.readAsText(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result as ArrayBuffer;
        const workbook = read(data);
        const ws = workbook.Sheets[workbook.SheetNames[0]];
        const rows: Record<string, string>[] = utils.sheet_to_json(ws, { defval: "" });
        // Normalize header keys to lowercase strings
        const normalized = rows.map((row) => {
          const obj: Record<string, string> = {};
          for (const [key, value] of Object.entries(row)) {
            obj[key.toLowerCase().trim()] = String(value ?? "").trim();
          }
          return obj;
        });
        loadRows(normalized, file.name);
      };
      reader.readAsArrayBuffer(file);
    }
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function updateMapping(header: string, fieldKey: string) {
    setMappings((prev) => ({ ...prev, [header]: fieldKey }));
  }

  function getMappedPreviewRows() {
    return csvRows.slice(0, 5).map((row) => coerceRow(row, mappings));
  }

  async function startImport() {
    setStep("importing");
    setProgress(0);
    setSuccessCount(0);
    setErrorCount(0);
    setImportDone(false);

    const supabase = createClient();
    let totalSuccess = 0;
    let totalError = 0;

    const rawPayloads = csvRows.map((row) => {
      const mapped = coerceRow(row, mappings);
      if (!mapped.contact_type) mapped.contact_type = "subscriber" as ContactType;
      if (selectedTags.length > 0) mapped.tags = selectedTags;
      if (selectedLists.length > 0) mapped.email_lists = selectedLists;
      return mapped;
    }).filter((p) => p.email || p.first_name || p.last_name);

    // Deduplicate by email — last occurrence wins (prevents upsert conflict within a batch)
    const seen = new Map<string, number>();
    for (let i = 0; i < rawPayloads.length; i++) {
      const email = rawPayloads[i].email as string | null;
      if (email) seen.set(email, i);
    }
    const allPayloads = rawPayloads.filter((p, i) => {
      const email = p.email as string | null;
      return !email || seen.get(email) === i;
    });

    for (let i = 0; i < allPayloads.length; i += BATCH_SIZE) {
      const batch = allPayloads.slice(i, i + BATCH_SIZE);
      const { data, error: err } = await supabase
        .from("contacts")
        .upsert(batch, { onConflict: "email", ignoreDuplicates: false })
        .select("id");

      if (err) {
        totalError += batch.length;
      } else {
        totalSuccess += data?.length ?? 0;
      }

      setProgress(Math.min(i + BATCH_SIZE, allPayloads.length));
      setSuccessCount(totalSuccess);
      setErrorCount(totalError);
    }

    setImportDone(true);
    if (totalSuccess > 0) onSuccess();
  }

  const mappedFieldKeys = Object.values(mappings).filter((v) => v !== "skip");
  // Collect custom field keys from mappings too (newly created during this session)
  const sessionCustomKeys = Object.values(mappings)
    .filter((v) => v.startsWith("custom:"))
    .map((v) => v.slice(7));
  const allCustomKeys = [...new Set([...existingCustomFields, ...sessionCustomKeys])].sort();

  const fieldOptions = [
    { key: "skip", label: "-- Skip --" },
    ...CONTACT_FIELDS,
    ...allCustomKeys.map((k) => ({ key: `custom:${k}`, label: `Custom: ${k}` })),
  ];

  return (
    <>
      <DialogHeader>
        <DialogTitle>Import contacts</DialogTitle>
      </DialogHeader>

      <div className="py-2 min-h-[300px]">
        {/* Step 1: Upload */}
        {step === "upload" && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-cyan-400 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-1">
              Drag and drop a file here, or click to browse
            </p>
            <p className="text-xs text-gray-400">Supports .csv and .xlsx files (Constant Contact, Mailchimp, Google Contacts, Excel)</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        )}

        {/* Step 2: Column Mapping */}
        {step === "mapping" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Map columns to contact fields. {csvRows.length} rows found in <span className="font-medium">{fileName}</span>.
            </p>
            <div className="space-y-2">
              {headers.map((header) => (
                <div key={header} className="flex items-center gap-3">
                  <span className="text-sm text-gray-700 w-1/2 truncate font-medium" title={header}>
                    {header}
                  </span>
                  <SearchableFieldSelect
                    value={mappings[header] ?? "skip"}
                    onChange={(val) => updateMapping(header, val)}
                    options={fieldOptions}
                    disabledKeys={mappedFieldKeys}
                    csvHeader={header}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Preview */}
        {step === "preview" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium">{csvRows.length}</span> contacts will be imported. Showing first 5 rows.
            </p>
            <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-md">
              Contacts with matching emails will be updated (upsert).
            </p>

            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    {Object.entries(mappings)
                      .filter(([, v]) => v !== "skip")
                      .map(([, fieldKey]) => {
                        const isCustom = fieldKey.startsWith("custom:");
                        const label = isCustom
                          ? fieldKey.slice(7)
                          : (CONTACT_FIELDS.find((f) => f.key === fieldKey)?.label ?? fieldKey);
                        return (
                          <th key={fieldKey} className="text-left font-medium text-gray-500 pb-2 pr-3 whitespace-nowrap">
                            {label}
                          </th>
                        );
                      })}
                  </tr>
                </thead>
                <tbody>
                  {getMappedPreviewRows().map((row, i) => (
                    <tr key={i} className="border-t">
                      {Object.entries(mappings)
                        .filter(([, v]) => v !== "skip")
                        .map(([, fieldKey]) => {
                          const isCustom = fieldKey.startsWith("custom:");
                          const displayValue = isCustom
                            ? (row.custom_fields as Record<string, string> | undefined)?.[fieldKey.slice(7)] ?? ""
                            : String(row[fieldKey] ?? "");
                          return (
                            <td key={fieldKey} className="py-1.5 pr-3 text-gray-700 whitespace-nowrap max-w-[200px] truncate">
                              {displayValue}
                            </td>
                          );
                        })}
                    </tr>
                  ))}
                </tbody>
              </table>
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
          </div>
        )}

        {/* Step 4: Importing */}
        {step === "importing" && (
          <div className="space-y-6 py-8">
            {!importDone ? (
              <>
                <p className="text-sm text-gray-600 text-center">Importing contacts...</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-cyan-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${csvRows.length > 0 ? (progress / csvRows.length) * 100 : 0}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 text-center">
                  {progress} / {csvRows.length} processed
                </p>
              </>
            ) : (
              <div className="text-center space-y-3">
                {errorCount === 0 ? (
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
                ) : (
                  <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
                )}
                <p className="text-lg font-medium text-gray-900">Import complete</p>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="text-green-600">{successCount} contacts imported successfully</p>
                  {errorCount > 0 && (
                    <p className="text-red-600">{errorCount} contacts failed</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md mt-4">{error}</p>
        )}
      </div>

      <DialogFooter className="gap-2 sm:gap-2">
        {step === "upload" && (
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
        )}

        {step === "mapping" && (
          <>
            <Button variant="outline" onClick={() => setStep("upload")}>
              Back
            </Button>
            <Button
              onClick={() => setStep("preview")}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              Next: Preview
            </Button>
          </>
        )}

        {step === "preview" && (
          <>
            <Button variant="outline" onClick={() => setStep("mapping")}>
              Back
            </Button>
            <Button
              onClick={startImport}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              Import {csvRows.length} contacts
            </Button>
          </>
        )}

        {step === "importing" && importDone && (
          <Button
            onClick={onClose}
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            Done
          </Button>
        )}
      </DialogFooter>
    </>
  );
}

// --- Shared field option button ---

function FieldOption({ label, isSelected, isDisabled, onClick }: {
  label: string;
  isSelected: boolean;
  isDisabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={onClick}
      className={`w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 ${
        isDisabled
          ? "text-gray-300 cursor-not-allowed"
          : isSelected
            ? "bg-cyan-50 text-cyan-700"
            : "text-gray-700 hover:bg-gray-50"
      }`}
    >
      {isSelected && <Check className="w-3.5 h-3.5 text-cyan-600 shrink-0" />}
      {!isSelected && <span className="w-3.5 shrink-0" />}
      {label}
    </button>
  );
}

// --- Searchable dropdown for column mapping ---

function SearchableFieldSelect({
  value,
  onChange,
  options,
  disabledKeys,
  csvHeader,
}: {
  value: string;
  onChange: (val: string) => void;
  options: { key: string; label: string }[];
  disabledKeys: string[];
  csvHeader: string;
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
      setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  const isCustomValue = value.startsWith("custom:");
  const selectedLabel = isCustomValue
    ? `Custom: "${value.slice(7)}"`
    : (options.find((o) => o.key === value)?.label ?? value);

  const allFiltered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;
  const filteredStandard = allFiltered.filter((o) => !o.key.startsWith("custom:"));
  const filteredCustom = allFiltered.filter((o) => o.key.startsWith("custom:"));

  // Show "Create custom field" when query doesn't exactly match an existing option
  const trimmedQuery = query.trim();
  const showCreateCustom = trimmedQuery.length > 0 &&
    !options.some((o) => o.label.toLowerCase() === trimmedQuery.toLowerCase());

  function selectCustom(name: string) {
    onChange(`custom:${name}`);
    setOpen(false);
    setQuery("");
  }

  return (
    <div className="flex-1">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => { if (open) { setOpen(false); setQuery(""); } else openDropdown(); }}
        className="flex items-center justify-between w-full h-9 rounded-md border border-input bg-background px-3 text-sm text-left ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0 ml-1" />
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
              placeholder="Search or create custom field..."
              className="w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
          <div className="max-h-52 overflow-y-auto py-1">
            {filteredStandard.map((o, idx) => {
              const isDisabled = o.key !== "skip" && o.key !== value && disabledKeys.includes(o.key);
              const isSelected = o.key === value;
              const showCustomAfter = idx === 0 && o.key === "skip" && !query;
              return (
                <Fragment key={o.key}>
                  <FieldOption
                    label={o.label}
                    isSelected={isSelected}
                    isDisabled={isDisabled}
                    onClick={() => { onChange(o.key); setOpen(false); setQuery(""); }}
                  />
                  {showCustomAfter && !customEditing && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomEditing(true);
                        setCustomName(isCustomValue ? value.slice(7) : csvHeader);
                        setTimeout(() => customInputRef.current?.select(), 0);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 border-b mb-1 ${
                        isCustomValue
                          ? "bg-cyan-50 text-cyan-700"
                          : "text-cyan-700 hover:bg-cyan-50"
                      }`}
                    >
                      {isCustomValue && <Check className="w-3.5 h-3.5 text-cyan-600 shrink-0" />}
                      {!isCustomValue && <span className="w-3.5 shrink-0 text-cyan-600 font-bold">+</span>}
                      {isCustomValue ? `Custom: "${value.slice(7)}"` : "Custom field..."}
                    </button>
                  )}
                  {showCustomAfter && customEditing && (
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
                            setCustomEditing(false);
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
                          if (customName.trim()) {
                            selectCustom(customName.trim());
                            setCustomEditing(false);
                          }
                        }}
                        className="px-2 py-1 text-xs font-medium text-white bg-cyan-600 rounded hover:bg-cyan-700 disabled:opacity-50"
                      >
                        Save
                      </button>
                    </div>
                  )}
                </Fragment>
              );
            })}
            {filteredCustom.length > 0 && (
              <>
                <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider border-t mt-1 pt-2">
                  Custom Fields
                </div>
                {filteredCustom.map((o) => {
                  const isDisabled = o.key !== value && disabledKeys.includes(o.key);
                  const isSelected = o.key === value;
                  return (
                    <FieldOption
                      key={o.key}
                      label={o.label}
                      isSelected={isSelected}
                      isDisabled={isDisabled}
                      onClick={() => { onChange(o.key); setOpen(false); setQuery(""); }}
                    />
                  );
                })}
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
    </div>
  );
}
