"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/shared/utils/supabase/client";
import type { EventSection, SectionType } from "@/shared/types/database";

interface Props {
  eventId: string;
  initialSections: EventSection[];
}

const sectionTypes: { value: SectionType; label: string }[] = [
  { value: "arrival_info", label: "Arrival Info" },
  { value: "accommodation", label: "Accommodation" },
  { value: "transportation", label: "Transportation" },
  { value: "about", label: "About" },
  { value: "custom", label: "Custom" },
];

const emptySection = {
  section_type: "custom" as SectionType,
  title: "",
  content: "",
  sort_order: 0,
  published: true,
};

export function SectionsEditor({ eventId, initialSections }: Props) {
  const [sections, setSections] = useState<EventSection[]>(initialSections);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptySection);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startAdd() {
    setEditing("new");
    setForm({ ...emptySection, sort_order: sections.length });
  }

  function startEdit(section: EventSection) {
    setEditing(section.id);
    setForm({
      section_type: section.section_type,
      title: section.title,
      content: section.content,
      sort_order: section.sort_order,
      published: section.published,
    });
  }

  function cancel() {
    setEditing(null);
    setForm(emptySection);
    setError(null);
  }

  async function save() {
    setSaving(true);
    setError(null);
    const supabase = createClient();

    const payload = {
      event_id: eventId,
      section_type: form.section_type,
      title: form.title,
      content: form.content,
      sort_order: form.sort_order,
      published: form.published,
    };

    if (editing === "new") {
      const { data, error: err } = await supabase
        .from("event_sections")
        .insert(payload)
        .select()
        .single();
      if (err) { setError(err.message); setSaving(false); return; }
      setSections((prev) => [...prev, data as unknown as EventSection]);
    } else {
      const { data, error: err } = await supabase
        .from("event_sections")
        .update(payload)
        .eq("id", editing!)
        .select()
        .single();
      if (err) { setError(err.message); setSaving(false); return; }
      setSections((prev) => prev.map((s) => (s.id === editing ? (data as unknown as EventSection) : s)));
    }

    setSaving(false);
    cancel();
  }

  async function remove(id: string) {
    const supabase = createClient();
    const { error: err } = await supabase.from("event_sections").delete().eq("id", id);
    if (err) { setError(err.message); return; }
    setSections((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Info Sections ({sections.length})</h3>
        {!editing && (
          <Button size="sm" onClick={startAdd}>Add Section</Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      {editing && (
        <div className="bg-white rounded-xl border p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Section Type</Label>
              <Select value={form.section_type} onValueChange={(v) => setForm({ ...form, section_type: v as SectionType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {sectionTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Content (HTML / Markdown)</Label>
            <Textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="min-h-[120px] font-mono text-xs"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Sort Order</Label>
              <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="flex items-end gap-2 pb-1">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                  className="rounded"
                />
                Published
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={save} disabled={saving || !form.title || !form.content}>
              {saving ? "Saving..." : editing === "new" ? "Add" : "Update"}
            </Button>
            <Button size="sm" variant="outline" onClick={cancel}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        {sections.sort((a, b) => a.sort_order - b.sort_order).map((section) => (
          <div key={section.id} className="flex items-start gap-3 bg-white rounded-lg border px-4 py-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900">{section.title}</p>
                <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                  {section.section_type.replace("_", " ")}
                </span>
                {!section.published && (
                  <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Draft</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{section.content}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button size="sm" variant="ghost" onClick={() => startEdit(section)} disabled={!!editing}>Edit</Button>
              <Button size="sm" variant="ghost" className="text-red-600" onClick={() => remove(section.id)} disabled={!!editing}>Remove</Button>
            </div>
          </div>
        ))}
        {sections.length === 0 && !editing && (
          <p className="text-sm text-gray-400 text-center py-4">No info sections added yet.</p>
        )}
      </div>
    </div>
  );
}
