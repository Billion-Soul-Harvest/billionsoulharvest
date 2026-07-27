"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { createClient } from "@/shared/utils/supabase/client";
import { SharedContactOptions } from "./shared-contact-options";
import type { ContactType } from "@/shared/types/database";

interface Row {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  church_name: string;
  city: string;
  country: string;
}

const emptyRow = (): Row => ({
  email: "",
  first_name: "",
  last_name: "",
  phone: "",
  church_name: "",
  city: "",
  country: "",
});

interface AddMultipleDialogProps {
  listNames: string[];
  onSuccess: () => void;
  onClose: () => void;
}

export function AddMultipleDialog({ listNames, onSuccess, onClose }: AddMultipleDialogProps) {
  const [rows, setRows] = useState<Row[]>(() => Array.from({ length: 5 }, emptyRow));
  const [selectedLists, setSelectedLists] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateRow(index: number, field: keyof Row, value: string) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  }

  function deleteRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function addRow() {
    setRows((prev) => [...prev, emptyRow()]);
  }

  async function handleSave() {
    setError(null);

    const validRows = rows.filter(
      (r) => r.email.trim() || r.first_name.trim() || r.last_name.trim(),
    );

    if (validRows.length === 0) {
      setError("Please fill in at least one row with a name or email.");
      return;
    }

    setSaving(true);

    const payloads = validRows.map((r) => ({
      email: r.email.trim().toLowerCase() || null,
      first_name: r.first_name.trim(),
      last_name: r.last_name.trim(),
      phone: r.phone.trim() || null,
      church_name: r.church_name.trim() || null,
      city: r.city.trim() || null,
      country: r.country.trim() || null,
      contact_type: "subscriber" as ContactType,
      tags: selectedTags,
      email_lists: selectedLists.length > 0 ? selectedLists : null,
    }));

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

  const columns: { key: keyof Row; label: string; placeholder: string }[] = [
    { key: "email", label: "Email", placeholder: "email@example.com" },
    { key: "first_name", label: "First Name", placeholder: "First" },
    { key: "last_name", label: "Last Name", placeholder: "Last" },
    { key: "phone", label: "Phone", placeholder: "+1..." },
    { key: "church_name", label: "Church", placeholder: "Church name" },
    { key: "city", label: "City", placeholder: "City" },
    { key: "country", label: "Country", placeholder: "Country" },
  ];

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
                    {col.label}
                  </th>
                ))}
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key} className="pr-1.5 pb-1.5">
                      <Input
                        value={row[col.key]}
                        onChange={(e) => updateRow(i, col.key, e.target.value)}
                        placeholder={col.placeholder}
                        className="h-9 text-sm min-w-[100px]"
                      />
                    </td>
                  ))}
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
          {saving ? "Saving..." : `Save contacts`}
        </Button>
      </DialogFooter>
    </>
  );
}
