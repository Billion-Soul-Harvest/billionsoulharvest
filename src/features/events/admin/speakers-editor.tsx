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
import type { EventSpeaker, SpeakerRole } from "@/shared/types/database";

interface Props {
  eventId: string;
  initialSpeakers: EventSpeaker[];
}

const roles: { value: SpeakerRole; label: string }[] = [
  { value: "keynote", label: "Keynote Speaker" },
  { value: "speaker", label: "Speaker" },
  { value: "panelist", label: "Panelist" },
  { value: "worship", label: "Worship Leader" },
];

const emptySpeaker = {
  name: "",
  title: "",
  organization: "",
  bio: "",
  photo_url: "",
  role: "speaker" as SpeakerRole,
  sort_order: 0,
};

export function SpeakersEditor({ eventId, initialSpeakers }: Props) {
  const [speakers, setSpeakers] = useState<EventSpeaker[]>(initialSpeakers);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptySpeaker);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startAdd() {
    setEditing("new");
    setForm({ ...emptySpeaker, sort_order: speakers.length });
  }

  function startEdit(speaker: EventSpeaker) {
    setEditing(speaker.id);
    setForm({
      name: speaker.name,
      title: speaker.title,
      organization: speaker.organization ?? "",
      bio: speaker.bio ?? "",
      photo_url: speaker.photo_url ?? "",
      role: speaker.role,
      sort_order: speaker.sort_order,
    });
  }

  function cancel() {
    setEditing(null);
    setForm(emptySpeaker);
    setError(null);
  }

  async function save() {
    setSaving(true);
    setError(null);
    const supabase = createClient();

    const payload = {
      event_id: eventId,
      name: form.name,
      title: form.title,
      organization: form.organization || null,
      bio: form.bio || null,
      photo_url: form.photo_url || null,
      role: form.role,
      sort_order: form.sort_order,
    };

    if (editing === "new") {
      const { data, error: err } = await supabase
        .from("event_speakers")
        .insert(payload)
        .select()
        .single();
      if (err) { setError(err.message); setSaving(false); return; }
      setSpeakers((prev) => [...prev, data as unknown as EventSpeaker]);
    } else {
      const { data, error: err } = await supabase
        .from("event_speakers")
        .update(payload)
        .eq("id", editing!)
        .select()
        .single();
      if (err) { setError(err.message); setSaving(false); return; }
      setSpeakers((prev) => prev.map((s) => (s.id === editing ? (data as unknown as EventSpeaker) : s)));
    }

    setSaving(false);
    cancel();
  }

  async function remove(id: string) {
    const supabase = createClient();
    const { error: err } = await supabase.from("event_speakers").delete().eq("id", id);
    if (err) { setError(err.message); return; }
    setSpeakers((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Speakers ({speakers.length})</h3>
        {!editing && (
          <Button size="sm" onClick={startAdd}>Add Speaker</Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      {editing && (
        <div className="bg-white rounded-xl border p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-1">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="space-y-1">
              <Label>Organization</Label>
              <Input value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as SpeakerRole })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label>Photo URL</Label>
            <Input value={form.photo_url} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} placeholder="https://..." />
          </div>
          <div className="space-y-1">
            <Label>Bio</Label>
            <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="min-h-[60px]" />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={save} disabled={saving || !form.name || !form.title}>
              {saving ? "Saving..." : editing === "new" ? "Add" : "Update"}
            </Button>
            <Button size="sm" variant="outline" onClick={cancel}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {speakers.sort((a, b) => a.sort_order - b.sort_order).map((speaker) => (
          <div key={speaker.id} className="flex items-center gap-3 bg-white rounded-lg border px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              {speaker.photo_url ? (
                <img src={speaker.photo_url} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-gray-400 text-xs font-bold">
                  {speaker.name.split(" ").map((n) => n[0]).join("")}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{speaker.name}</p>
              <p className="text-xs text-gray-500">{speaker.title} &middot; {speaker.role}</p>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => startEdit(speaker)} disabled={!!editing}>
                Edit
              </Button>
              <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => remove(speaker.id)} disabled={!!editing}>
                Remove
              </Button>
            </div>
          </div>
        ))}
        {speakers.length === 0 && !editing && (
          <p className="text-sm text-gray-400 text-center py-4">No speakers added yet.</p>
        )}
      </div>
    </div>
  );
}
