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
import type { EventProgram, EventSpeaker, ProgramType } from "@/shared/types/database";

interface Props {
  eventId: string;
  initialPrograms: EventProgram[];
  speakers: EventSpeaker[];
}

const types: { value: ProgramType; label: string }[] = [
  { value: "main_session", label: "Main Session" },
  { value: "breakout", label: "Breakout" },
  { value: "workshop", label: "Workshop" },
  { value: "worship", label: "Worship" },
  { value: "meal", label: "Meal" },
  { value: "free_time", label: "Free Time" },
];

const emptyProgram = {
  title: "",
  description: "",
  day_date: "",
  start_time: "",
  end_time: "",
  location: "",
  type: "main_session" as ProgramType,
  speaker_id: "",
  sort_order: 0,
};

export function ProgramEditor({ eventId, initialPrograms, speakers }: Props) {
  const [programs, setPrograms] = useState<EventProgram[]>(initialPrograms);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyProgram);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startAdd() {
    setEditing("new");
    setForm({ ...emptyProgram, sort_order: programs.length });
  }

  function startEdit(program: EventProgram) {
    setEditing(program.id);
    setForm({
      title: program.title,
      description: program.description ?? "",
      day_date: program.day_date,
      start_time: program.start_time,
      end_time: program.end_time ?? "",
      location: program.location ?? "",
      type: program.type,
      speaker_id: program.speaker_id ?? "",
      sort_order: program.sort_order,
    });
  }

  function cancel() {
    setEditing(null);
    setForm(emptyProgram);
    setError(null);
  }

  async function save() {
    setSaving(true);
    setError(null);
    const supabase = createClient();

    const payload = {
      event_id: eventId,
      title: form.title,
      description: form.description || null,
      day_date: form.day_date,
      start_time: form.start_time,
      end_time: form.end_time || null,
      location: form.location || null,
      type: form.type,
      speaker_id: form.speaker_id || null,
      sort_order: form.sort_order,
    };

    if (editing === "new") {
      const { data, error: err } = await supabase
        .from("event_programs")
        .insert(payload)
        .select()
        .single();
      if (err) { setError(err.message); setSaving(false); return; }
      setPrograms((prev) => [...prev, data as unknown as EventProgram]);
    } else {
      const { data, error: err } = await supabase
        .from("event_programs")
        .update(payload)
        .eq("id", editing!)
        .select()
        .single();
      if (err) { setError(err.message); setSaving(false); return; }
      setPrograms((prev) => prev.map((p) => (p.id === editing ? (data as unknown as EventProgram) : p)));
    }

    setSaving(false);
    cancel();
  }

  async function remove(id: string) {
    const supabase = createClient();
    const { error: err } = await supabase.from("event_programs").delete().eq("id", id);
    if (err) { setError(err.message); return; }
    setPrograms((prev) => prev.filter((p) => p.id !== id));
  }

  // Group by day for display
  const grouped = new Map<string, EventProgram[]>();
  for (const p of [...programs].sort((a, b) => a.day_date.localeCompare(b.day_date) || a.start_time.localeCompare(b.start_time))) {
    if (!grouped.has(p.day_date)) grouped.set(p.day_date, []);
    grouped.get(p.day_date)!.push(p);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Program Schedule ({programs.length} items)</h3>
        {!editing && (
          <Button size="sm" onClick={startAdd}>Add Session</Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      {editing && (
        <div className="bg-white rounded-xl border p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
              <Label>Session Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="space-y-1">
              <Label>Date</Label>
              <Input type="date" value={form.day_date} onChange={(e) => setForm({ ...form, day_date: e.target.value })} required />
            </div>
            <div className="space-y-1">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as ProgramType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {types.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Start Time</Label>
              <Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} required />
            </div>
            <div className="space-y-1">
              <Label>End Time</Label>
              <Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Location / Room</Label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Speaker</Label>
              <Select value={form.speaker_id || "none"} onValueChange={(v: string | null) => setForm({ ...form, speaker_id: v === "none" || !v ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No speaker</SelectItem>
                  {speakers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="min-h-[50px]" />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={save} disabled={saving || !form.title || !form.day_date || !form.start_time}>
              {saving ? "Saving..." : editing === "new" ? "Add" : "Update"}
            </Button>
            <Button size="sm" variant="outline" onClick={cancel}>Cancel</Button>
          </div>
        </div>
      )}

      {programs.length === 0 && !editing ? (
        <p className="text-sm text-gray-400 text-center py-4">No schedule items yet.</p>
      ) : (
        <div className="space-y-4">
          {[...grouped.entries()].map(([date, items]) => (
            <div key={date}>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                {new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </h4>
              <div className="space-y-1.5">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 bg-white rounded-lg border px-4 py-2.5">
                    <div className="w-16 text-xs text-gray-400 shrink-0 font-mono">
                      {item.start_time.slice(0, 5)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                      <p className="text-xs text-gray-400">{item.type.replace("_", " ")}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => startEdit(item)} disabled={!!editing}>Edit</Button>
                      <Button size="sm" variant="ghost" className="text-red-600" onClick={() => remove(item.id)} disabled={!!editing}>Remove</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
