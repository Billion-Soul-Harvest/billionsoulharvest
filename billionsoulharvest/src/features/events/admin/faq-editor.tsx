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
import type { EventFaq, FaqCategory } from "@/shared/types/database";

interface Props {
  eventId: string;
  initialFaqs: EventFaq[];
}

const categories: { value: FaqCategory; label: string }[] = [
  { value: "general", label: "General" },
  { value: "travel", label: "Travel" },
  { value: "accommodation", label: "Accommodation" },
  { value: "registration", label: "Registration" },
];

const emptyFaq = {
  question: "",
  answer: "",
  category: "general" as FaqCategory,
  sort_order: 0,
};

export function FaqEditor({ eventId, initialFaqs }: Props) {
  const [faqs, setFaqs] = useState<EventFaq[]>(initialFaqs);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyFaq);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startAdd() {
    setEditing("new");
    setForm({ ...emptyFaq, sort_order: faqs.length });
  }

  function startEdit(faq: EventFaq) {
    setEditing(faq.id);
    setForm({
      question: faq.question,
      answer: faq.answer,
      category: (faq.category ?? "general") as FaqCategory,
      sort_order: faq.sort_order,
    });
  }

  function cancel() {
    setEditing(null);
    setForm(emptyFaq);
    setError(null);
  }

  async function save() {
    setSaving(true);
    setError(null);
    const supabase = createClient();

    const payload = {
      event_id: eventId,
      question: form.question,
      answer: form.answer,
      category: form.category,
      sort_order: form.sort_order,
    };

    if (editing === "new") {
      const { data, error: err } = await supabase
        .from("event_faqs")
        .insert(payload)
        .select()
        .single();
      if (err) { setError(err.message); setSaving(false); return; }
      setFaqs((prev) => [...prev, data as unknown as EventFaq]);
    } else {
      const { data, error: err } = await supabase
        .from("event_faqs")
        .update(payload)
        .eq("id", editing!)
        .select()
        .single();
      if (err) { setError(err.message); setSaving(false); return; }
      setFaqs((prev) => prev.map((f) => (f.id === editing ? (data as unknown as EventFaq) : f)));
    }

    setSaving(false);
    cancel();
  }

  async function remove(id: string) {
    const supabase = createClient();
    const { error: err } = await supabase.from("event_faqs").delete().eq("id", id);
    if (err) { setError(err.message); return; }
    setFaqs((prev) => prev.filter((f) => f.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">FAQs ({faqs.length})</h3>
        {!editing && (
          <Button size="sm" onClick={startAdd}>Add FAQ</Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      {editing && (
        <div className="bg-white rounded-xl border p-5 space-y-3">
          <div className="space-y-1">
            <Label>Question</Label>
            <Input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} required />
          </div>
          <div className="space-y-1">
            <Label>Answer</Label>
            <Textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} className="min-h-[80px]" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as FaqCategory })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Sort Order</Label>
              <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={save} disabled={saving || !form.question || !form.answer}>
              {saving ? "Saving..." : editing === "new" ? "Add" : "Update"}
            </Button>
            <Button size="sm" variant="outline" onClick={cancel}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        {faqs.sort((a, b) => a.sort_order - b.sort_order).map((faq) => (
          <div key={faq.id} className="flex items-start gap-3 bg-white rounded-lg border px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{faq.question}</p>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{faq.answer}</p>
              <p className="text-[10px] text-gray-400 mt-1">{faq.category}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button size="sm" variant="ghost" onClick={() => startEdit(faq)} disabled={!!editing}>Edit</Button>
              <Button size="sm" variant="ghost" className="text-red-600" onClick={() => remove(faq.id)} disabled={!!editing}>Remove</Button>
            </div>
          </div>
        ))}
        {faqs.length === 0 && !editing && (
          <p className="text-sm text-gray-400 text-center py-4">No FAQs added yet.</p>
        )}
      </div>
    </div>
  );
}
