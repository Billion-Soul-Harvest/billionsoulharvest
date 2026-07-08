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
import { LocationSearchInput, type PlaceResult } from "@/features/events/location-search-input";
import { createClient } from "@/shared/utils/supabase/client";
import type { EventStatus, EventType, RegistrationConfig, RegistrationCustomField, RegistrationCustomFieldType } from "@/shared/types/database";
import { eventTemplates } from "@/features/events/templates/event-templates";
import { applyTemplate } from "@/features/events/templates/apply-template";

interface EventData {
  id?: string;
  title: string;
  slug: string;
  description: string;
  location: string;
  address: string;
  city: string;
  region: string;
  country: string;
  postal_code: string;
  start_date: string;
  end_date: string;
  event_type: EventType;
  status: EventStatus;
  max_registrations: string;
  banner_url: string;
  registration_config?: RegistrationConfig | null;
}

interface Props {
  event?: EventData;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function EventForm({ event }: Props) {
  const router = useRouter();
  const isEditing = !!event?.id;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState("conference");

  const defaultRegConfig: RegistrationConfig = {
    enabled: false,
    fields: {
      region: { visible: true, required: true },
      country: { visible: true, required: true },
      visaRequired: { visible: true, required: true },
      passportNumber: { visible: true, required: true },
      phone: { visible: true, required: true },
      churchName: { visible: true, required: true },
      churchRole: { visible: true, required: true },
      referredBy: { visible: true, required: true },
      city: { visible: false, required: false },
      dietaryRequirements: { visible: false, required: false },
      howHeard: { visible: false, required: false },
      specialNeeds: { visible: false, required: false },
    },
    customFields: [],
  };

  const [form, setForm] = useState<EventData>({
    title: event?.title ?? "",
    slug: event?.slug ?? "",
    description: event?.description ?? "",
    location: event?.location ?? "",
    address: event?.address ?? "",
    city: event?.city ?? "",
    region: event?.region ?? "",
    country: event?.country ?? "",
    postal_code: event?.postal_code ?? "",
    start_date: event?.start_date ?? "",
    end_date: event?.end_date ?? "",
    event_type: event?.event_type ?? "conference",
    status: event?.status ?? "draft",
    max_registrations: event?.max_registrations ?? "",
    banner_url: event?.banner_url ?? "",
  });

  const [regConfig, setRegConfig] = useState<RegistrationConfig>(
    event?.registration_config ?? defaultRegConfig
  );

  function updateField(field: keyof EventData, value: string) {
    const updates: Partial<EventData> = { [field]: value };
    if (field === "title" && !isEditing) {
      updates.slug = slugify(value);
    }
    setForm((prev) => ({ ...prev, ...updates }));
  }

  function handlePlaceSelect(place: PlaceResult) {
    setForm((prev) => ({
      ...prev,
      location: place.venue,
      address: place.address,
      city: place.city,
      region: place.region,
      country: place.country,
      postal_code: place.postalCode,
    }));
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
      address: form.address || null,
      city: form.city || null,
      region: form.region || null,
      country: form.country || null,
      postal_code: form.postal_code || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      event_type: form.event_type,
      status: form.status,
      max_registrations: form.max_registrations ? parseInt(form.max_registrations) : null,
      banner_url: form.banner_url || null,
      registration_config: regConfig,
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

        <LocationSearchInput onPlaceSelect={handlePlaceSelect} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <Label>Venue / Location</Label>
            <Input value={form.location} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("location", e.target.value)} />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <Label>Address</Label>
            <Input value={form.address} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("address", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>City</Label>
            <Input value={form.city} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("city", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Region</Label>
            <Input value={form.region} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("region", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Country</Label>
            <Input value={form.country} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("country", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Postal Code</Label>
            <Input value={form.postal_code} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("postal_code", e.target.value)} />
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

      <div className="bg-white rounded-xl border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Registration</h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={regConfig.enabled}
              onChange={(e) => setRegConfig((prev) => ({ ...prev, enabled: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#29BDD6]" />
          </label>
        </div>

        {regConfig.enabled && (
          <div className="space-y-4">
            {/* Default fields */}
            <div>
              <p className="text-sm text-gray-500 mb-3">Configure which fields appear on the registration form.</p>
              <div className="space-y-1">
                {/* Always-on fields */}
                <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded text-sm text-gray-400">
                  <input type="checkbox" checked disabled className="w-4 h-4 rounded" />
                  <span className="flex-1">First Name, Last Name, Email</span>
                  <span className="text-xs">Always required</span>
                </div>

                {/* Configurable fields */}
                {(Object.entries(regConfig.fields) as Array<[keyof RegistrationConfig["fields"], { visible: boolean; required: boolean }]>).map(([key, field]) => {
                  const labels: Record<string, string> = {
                    region: "Region",
                    country: "Country",
                    visaRequired: "VISA Requirement",
                    passportNumber: "Passport Number",
                    phone: "Phone / WhatsApp Number",
                    churchName: "Organization / Movement / Church",
                    churchRole: "Ministry Title / Role",
                    referredBy: "Referred By",
                    city: "City",
                    dietaryRequirements: "Dietary Requirements",
                    howHeard: "How Did You Hear",
                    specialNeeds: "Special Needs",
                  };
                  return (
                    <div key={key} className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-50 text-sm">
                      <input
                        type="checkbox"
                        checked={field.visible}
                        onChange={(e) => setRegConfig((prev) => ({
                          ...prev,
                          fields: {
                            ...prev.fields,
                            [key]: { ...prev.fields[key], visible: e.target.checked },
                          },
                        }))}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="flex-1 text-gray-700">{labels[key] ?? key}</span>
                      {field.visible && (
                        <label className="flex items-center gap-1 text-xs text-gray-500">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => setRegConfig((prev) => ({
                              ...prev,
                              fields: {
                                ...prev.fields,
                                [key]: { ...prev.fields[key], required: e.target.checked },
                              },
                            }))}
                            className="w-3 h-3 rounded"
                          />
                          Required
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Fields */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">Custom Fields</p>
                <button
                  type="button"
                  onClick={() => {
                    const newField: RegistrationCustomField = {
                      id: `custom_${Date.now()}`,
                      label: "",
                      type: "text",
                      required: false,
                    };
                    setRegConfig((prev) => ({
                      ...prev,
                      customFields: [...prev.customFields, newField],
                    }));
                  }}
                  className="text-xs text-[#29BDD6] hover:text-[#1ea8c0] font-medium"
                >
                  + Add Field
                </button>
              </div>

              {regConfig.customFields.length === 0 && (
                <p className="text-xs text-gray-400">No custom fields added.</p>
              )}

              <div className="space-y-3">
                {regConfig.customFields.map((field, idx) => (
                  <div key={field.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        value={field.label}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const updated = [...regConfig.customFields];
                          updated[idx] = { ...updated[idx], label: e.target.value };
                          setRegConfig((prev) => ({ ...prev, customFields: updated }));
                        }}
                        placeholder="Field label"
                        className="text-sm flex-1"
                      />
                      <Input
                        value={field.placeholder ?? ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const updated = [...regConfig.customFields];
                          updated[idx] = { ...updated[idx], placeholder: e.target.value };
                          setRegConfig((prev) => ({ ...prev, customFields: updated }));
                        }}
                        placeholder="Placeholder (optional)"
                        className="text-sm flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setRegConfig((prev) => ({
                            ...prev,
                            customFields: prev.customFields.filter((_, i) => i !== idx),
                          }));
                        }}
                        className="text-gray-400 hover:text-red-500 p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <Select
                        value={field.type}
                        onValueChange={(v: string | null) => {
                          if (!v) return;
                          const updated = [...regConfig.customFields];
                          updated[idx] = { ...updated[idx], type: v as RegistrationCustomFieldType };
                          if (v === "select" && !updated[idx].options?.length) {
                            updated[idx].options = ["Option 1"];
                          }
                          setRegConfig((prev) => ({ ...prev, customFields: updated }));
                        }}
                      >
                        <SelectTrigger className="w-[130px] text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="tel">Phone</SelectItem>
                          <SelectItem value="url">URL</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="textarea">Text Area</SelectItem>
                          <SelectItem value="select">Dropdown</SelectItem>
                          <SelectItem value="checkbox">Checkbox</SelectItem>
                        </SelectContent>
                      </Select>
                      <label className="flex items-center gap-1 text-xs text-gray-500">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => {
                            const updated = [...regConfig.customFields];
                            updated[idx] = { ...updated[idx], required: e.target.checked };
                            setRegConfig((prev) => ({ ...prev, customFields: updated }));
                          }}
                          className="w-3 h-3 rounded"
                        />
                        Required
                      </label>
                    </div>
                    {field.type === "select" && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">Options (one per line)</p>
                        <Textarea
                          value={(field.options ?? []).join("\n")}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                            const updated = [...regConfig.customFields];
                            updated[idx] = { ...updated[idx], options: e.target.value.split("\n") };
                            setRegConfig((prev) => ({ ...prev, customFields: updated }));
                          }}
                          className="text-sm min-h-[60px]"
                          placeholder="Option 1&#10;Option 2&#10;Option 3"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
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
