"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TemplateSelectionDialog } from "./template-selection-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/shared/components/image-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/shared/utils/supabase/client";
import type { StoryStatus } from "@/shared/types/database";

interface StoryData {
  id?: string;
  title: string;
  slug: string;
  description: string;
  author: string;
  status: StoryStatus;
  banner_url: string;
  published_at: string;
}

interface Props {
  story?: StoryData;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function StoryForm({ story }: Props) {
  const router = useRouter();
  const isEditing = !!story?.id;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newStoryId, setNewStoryId] = useState<string | null>(null);

  const [form, setForm] = useState<StoryData>({
    title: story?.title ?? "",
    slug: story?.slug ?? "",
    description: story?.description ?? "",
    author: story?.author ?? "",
    status: story?.status ?? "draft",
    banner_url: story?.banner_url ?? "",
    published_at: story?.published_at ?? "",
  });

  function updateField(field: keyof StoryData, value: string) {
    const updates: Partial<StoryData> = { [field]: value };
    if (field === "title" && !isEditing) {
      updates.slug = slugify(value);
    }
    setForm((prev) => ({ ...prev, ...updates }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const payload = {
      title: form.title,
      slug: form.slug,
      description: form.description || null,
      author: form.author || null,
      status: form.status,
      banner_url: form.banner_url || null,
      published_at: form.status === "published" ? (form.published_at || new Date().toISOString()) : null,
    };

    if (isEditing) {
      const { error: err } = await supabase.from("stories").update(payload).eq("id", story.id!);
      if (err) { setError(err.message); setSaving(false); return; }
      setSaving(false);
      router.push("/admin/stories");
      router.refresh();
    } else {
      const { data: newStory, error: err } = await supabase
        .from("stories")
        .insert(payload)
        .select("id")
        .single();
      if (err || !newStory) { setError(err?.message ?? "Failed to create story"); setSaving(false); return; }
      setSaving(false);
      setNewStoryId(newStory.id);
    }
  }

  const statuses: { value: StoryStatus; label: string }[] = [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
  ];

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Story Details</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <Label>Title</Label>
            <Input value={form.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("title", e.target.value)} required />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <Label>Slug</Label>
            <Input value={form.slug} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("slug", e.target.value)} required
              className="font-mono text-sm" />
            <p className="text-xs text-gray-400">URL: /stories/{form.slug || "..."}</p>
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <Label>Description</Label>
            <Textarea value={form.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField("description", e.target.value)}
              className="min-h-[60px]" />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <Label>Author</Label>
            <Input value={form.author} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("author", e.target.value)} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Banner Image</h3>
        <ImageUpload
          value={form.banner_url}
          onChange={(url) => setForm((prev) => ({ ...prev, banner_url: url }))}
          folder={story?.id ?? "new-story"}
        />
      </div>

      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Settings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v: string | null) => { if (v) updateField("status", v); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {statuses.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {form.status === "published" && (
            <div className="space-y-1.5">
              <Label>Published Date</Label>
              <Input type="date" value={form.published_at ? form.published_at.split("T")[0] : ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("published_at", e.target.value ? `${e.target.value}T00:00:00Z` : "")} />
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : isEditing ? "Update Story" : "Create Story"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
      {newStoryId && (
        <TemplateSelectionDialog open={!!newStoryId} storyId={newStoryId} />
      )}
    </form>
  );
}
