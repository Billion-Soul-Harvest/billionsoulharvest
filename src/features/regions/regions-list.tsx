"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createClient } from "@/shared/utils/supabase/client";

interface Region {
  id: string;
  name: string;
  color: string;
  description: string | null;
  created_at: string;
}

interface Props {
  initialRegions: Region[];
  contactCounts: Record<string, number>;
  eventCounts: Record<string, number>;
}

export function RegionsClient({ initialRegions, contactCounts, eventCounts }: Props) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    color: "#6366f1",
    description: "",
  });

  function openCreate() {
    setEditingId(null);
    setForm({ name: "", color: "#6366f1", description: "" });
    setDialogOpen(true);
  }

  function openEdit(region: Region) {
    setEditingId(region.id);
    setForm({ name: region.name, color: region.color, description: region.description ?? "" });
    setDialogOpen(true);
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name) return;
    setSaving(true);

    const supabase = createClient();
    const payload = {
      name: form.name,
      color: form.color,
      description: form.description || null,
    };

    if (editingId) {
      await supabase.from("ministry_regions").update(payload).eq("id", editingId);
    } else {
      await supabase.from("ministry_regions").insert(payload);
    }

    setSaving(false);
    setDialogOpen(false);
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ministry Regions</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button onClick={openCreate} />}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Region
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Region" : "New Region"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input value={form.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, name: e.target.value })}
                  required placeholder="e.g. East Africa" />
              </div>
              <div className="space-y-1.5">
                <Label>Color</Label>
                <div className="flex items-center gap-3">
                  <input type="color" value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="w-10 h-10 rounded border cursor-pointer" />
                  <Input value={form.color}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, color: e.target.value })}
                    className="font-mono text-sm w-28" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea value={form.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description of this region..." className="min-h-[60px]" />
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update Region" : "Create Region"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Regions grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {initialRegions.map((region) => (
          <div key={region.id} className="bg-white rounded-xl border p-5 relative overflow-hidden">
            {/* Color accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: region.color }} />

            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: region.color }} />
                <h3 className="font-semibold text-gray-900">{region.name}</h3>
              </div>
              <button
                onClick={() => openEdit(region)}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                Edit
              </button>
            </div>

            {region.description && (
              <p className="text-sm text-gray-500 mb-4">{region.description}</p>
            )}

            <div className="flex gap-6 text-sm">
              <div>
                <p className="text-xl font-bold text-gray-900">{contactCounts[region.id] ?? 0}</p>
                <p className="text-xs text-gray-400">contacts</p>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{eventCounts[region.id] ?? 0}</p>
                <p className="text-xs text-gray-400">events</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
