"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import type { EventStatus, EventType } from "@/shared/types/database";
import { eventTemplates } from "@/features/events/templates/event-templates";
import { applyTemplate } from "@/features/events/templates/apply-template";

interface Region {
  id: string;
  name: string;
}

interface EventData {
  id?: string;
  title: string;
  slug: string;
  description: string;
  location: string;
  city: string;
  country: string;
  start_date: string;
  end_date: string;
  event_type: EventType;
  status: EventStatus;
  region_id: string;
  max_registrations: string;
  banner_url: string;
}

interface Props {
  event?: EventData;
  regions: Region[];
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function EventForm({ event, regions }: Props) {
  const router = useRouter();
  const isEditing = !!event?.id;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState("conference");

  const [form, setForm] = useState<EventData>({
    title: event?.title ?? "",
    slug: event?.slug ?? "",
    description: event?.description ?? "",
    location: event?.location ?? "",
    city: event?.city ?? "",
    country: event?.country ?? "",
    start_date: event?.start_date ?? "",
    end_date: event?.end_date ?? "",
    event_type: event?.event_type ?? "conference",
    status: event?.status ?? "draft",
    region_id: event?.region_id ?? "",
    max_registrations: event?.max_registrations ?? "",
    banner_url: event?.banner_url ?? "",
  });

  function updateField(field: keyof EventData, value: string) {
    const updates: Partial<EventData> = { [field]: value };
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
      location: form.location || null,
      city: form.city || null,
      country: form.country || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      event_type: form.event_type,
      status: form.status,
      region_id: form.region_id || null,
      max_registrations: form.max_registrations ? parseInt(form.max_registrations) : null,
      banner_url: form.banner_url || null,
    };

    if (isEditing) {
      const { error: err } = await supabase.from("events").update(payload).eq("id", event.id!);
      if (err) { setError(err.message); setSaving(false); return; }
      setSaving(false);
      router.push("/admin/events");
      router.refresh();
    } else {
      const { data: newEvent, error: err } = await supabase
        .from("events")
        .insert(payload)
        .select("id")
        .single();
      if (err || !newEvent) { setError(err?.message ?? "Failed to create event"); setSaving(false); return; }

      // Apply page template
      if (selectedTemplate !== "blank") {
        await applyTemplate(supabase, newEvent.id, selectedTemplate);
      }

      setSaving(false);
      router.push(`/admin/events/edit/${newEvent.id}/builder`);
      router.refresh();
    }
  }

  const eventTypes: { value: EventType; label: string; color: string }[] = [
    { value: "service", label: "Service", color: "#3b82f6" },
    { value: "conference", label: "Conference", color: "#8b5cf6" },
    { value: "workshop", label: "Workshop", color: "#22c55e" },
    { value: "social", label: "Social", color: "#f472b6" },
    { value: "prayer_meeting", label: "Prayer Meeting", color: "#f97316" },
    { value: "youth_event", label: "Youth Event", color: "#ef4444" },
    { value: "training", label: "Training", color: "#a855f7" },
    { value: "church_anniversary", label: "Church Anniversary", color: "#ec4899" },
    { value: "other", label: "Other", color: "#6b7280" },
  ];

  const statuses: { value: EventStatus; label: string }[] = [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "registration_open", label: "Registration Open" },
    { value: "registration_closed", label: "Registration Closed" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Event Details</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <Label>Title</Label>
            <Input value={form.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("title", e.target.value)} required />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <Label>Slug</Label>
            <Input value={form.slug} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("slug", e.target.value)} required
              className="font-mono text-sm" />
            <p className="text-xs text-gray-400">URL: /register/{form.slug || "..."}</p>
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <Label>Short Description</Label>
            <Textarea value={form.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField("description", e.target.value)}
              className="min-h-[60px]" />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <Label>Event Type</Label>
            <Select value={form.event_type} onValueChange={(v: string | null) => { if (v) updateField("event_type", v); }}>
              <SelectTrigger><SelectValue placeholder="Select event type" /></SelectTrigger>
              <SelectContent>
                {eventTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                      {t.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Banner Image</h3>
        <ImageUpload
          value={form.banner_url}
          onChange={(url) => setForm((prev) => ({ ...prev, banner_url: url }))}
          folder={event?.id ?? "new-event"}
        />
      </div>

      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Location & Dates</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Venue / Location</Label>
            <Input value={form.location} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("location", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>City</Label>
            <Input value={form.city} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("city", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Country</Label>
            <Input value={form.country} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("country", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Region</Label>
            <Select value={form.region_id} onValueChange={(v: string | null) => { if (v) updateField("region_id", v === "none" ? "" : v); }}>
              <SelectTrigger><SelectValue placeholder="Select region" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No region</SelectItem>
                {regions.map((r) => (
                  <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Start Date</Label>
            <Input type="date" value={form.start_date} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("start_date", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>End Date</Label>
            <Input type="date" value={form.end_date} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("end_date", e.target.value)} />
          </div>
        </div>
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
          <div className="space-y-1.5">
            <Label>Max Registrations</Label>
            <Input type="number" value={form.max_registrations}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("max_registrations", e.target.value)}
              placeholder="Unlimited" />
          </div>
        </div>
      </div>

      {!isEditing && (
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Page Template</h3>
          <p className="text-sm text-gray-500">Choose a starting layout for your event pages. You can customize everything later.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {eventTemplates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTemplate(t.id)}
                className={`text-left p-4 rounded-lg border-2 transition-colors ${
                  selectedTemplate === t.id
                    ? "border-[#29BDD6] bg-[#29BDD6]/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <p className="font-medium text-gray-900 text-sm">{t.name}</p>
                <p className="text-xs text-gray-500 mt-1">{t.description}</p>
                {t.pages.length > 0 && (
                  <p className="text-xs text-gray-400 mt-2">
                    {t.pages.length} page{t.pages.length > 1 ? "s" : ""}: {t.pages.map((p) => p.title).join(", ")}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : isEditing ? "Update Event" : "Create Event"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
