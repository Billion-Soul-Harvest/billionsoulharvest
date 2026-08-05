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
import type { EventStatus, EventType, RegistrationConfig, RegistrationCustomField, RegistrationCustomFieldType, RegistrationSection, ConditionOperator, SectionCondition } from "@/shared/types/database";
import { DEFAULT_FIELD_ORDER } from "@/shared/types/database";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
  is_external: boolean;
  external_url: string;
  registration_config?: RegistrationConfig | null;
}

interface Props {
  event?: EventData;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const FIELD_LABELS: Record<string, string> = {
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

function SortableFieldRow({
  fieldKey,
  field,
  sectionName,
  onToggleVisible,
  onToggleRequired,
}: {
  fieldKey: string;
  field: { visible: boolean; required: boolean };
  sectionName?: string;
  onToggleVisible: (checked: boolean) => void;
  onToggleRequired: (checked: boolean) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: fieldKey });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-50 text-sm"
    >
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 touch-none"
        {...attributes}
        {...listeners}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
          <circle cx="5" cy="3" r="1.5" />
          <circle cx="11" cy="3" r="1.5" />
          <circle cx="5" cy="8" r="1.5" />
          <circle cx="11" cy="8" r="1.5" />
          <circle cx="5" cy="13" r="1.5" />
          <circle cx="11" cy="13" r="1.5" />
        </svg>
      </button>
      <input
        type="checkbox"
        checked={field.visible}
        onChange={(e) => onToggleVisible(e.target.checked)}
        className="w-4 h-4 rounded border-gray-300"
      />
      <span className="flex-1 text-gray-700">
        {FIELD_LABELS[fieldKey] ?? fieldKey}
        {sectionName && (
          <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">{sectionName}</span>
        )}
      </span>
      {field.visible && (
        <label className="flex items-center gap-1 text-xs text-gray-500">
          <input
            type="checkbox"
            checked={field.required}
            onChange={(e) => onToggleRequired(e.target.checked)}
            className="w-3 h-3 rounded"
          />
          Required
        </label>
      )}
    </div>
  );
}

const CONDITION_OPERATORS: { value: ConditionOperator; label: string; needsValue: boolean }[] = [
  { value: "equals", label: "equals", needsValue: true },
  { value: "not_equals", label: "does not equal", needsValue: true },
  { value: "contains", label: "contains", needsValue: true },
  { value: "not_empty", label: "is not empty", needsValue: false },
  { value: "is_empty", label: "is empty", needsValue: false },
];

function getAllFieldOptions(config: RegistrationConfig, fieldOrder: Array<keyof RegistrationConfig["fields"]>) {
  const options: { key: string; label: string }[] = [];
  for (const key of fieldOrder) {
    if (config.fields[key]?.visible) {
      options.push({ key, label: FIELD_LABELS[key] ?? key });
    }
  }
  for (const cf of config.customFields) {
    if (cf.label) options.push({ key: cf.id, label: cf.label });
  }
  return options;
}

function getAssignedFieldKeys(sections: RegistrationSection[]): Set<string> {
  const set = new Set<string>();
  for (const s of sections) {
    for (const k of s.fieldKeys) set.add(k);
  }
  return set;
}

function SectionsEditor({
  regConfig,
  onUpdate,
  fieldOrder,
}: {
  regConfig: RegistrationConfig;
  onUpdate: (updated: RegistrationConfig) => void;
  fieldOrder: Array<keyof RegistrationConfig["fields"]>;
}) {
  const sections = regConfig.sections ?? [];
  const sectionOrder = regConfig.sectionOrder ?? sections.map((s) => s.id);
  const assignedKeys = getAssignedFieldKeys(sections);
  const allFields = getAllFieldOptions(regConfig, fieldOrder);
  const unassignedFields = allFields.filter((f) => !assignedKeys.has(f.key));

  const sectionSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  function updateSections(newSections: RegistrationSection[], newOrder?: string[]) {
    onUpdate({
      ...regConfig,
      sections: newSections,
      sectionOrder: newOrder ?? sectionOrder,
    });
  }

  function addSection() {
    const id = `section_${Date.now()}`;
    const newSection: RegistrationSection = { id, title: "", fieldKeys: [] };
    const newSections = [...sections, newSection];
    const newOrder = [...sectionOrder, id];
    updateSections(newSections, newOrder);
  }

  function deleteSection(id: string) {
    updateSections(
      sections.filter((s) => s.id !== id),
      sectionOrder.filter((sid) => sid !== id)
    );
  }

  function updateSection(id: string, patch: Partial<RegistrationSection>) {
    updateSections(sections.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function assignField(sectionId: string, fieldKey: string) {
    updateSections(
      sections.map((s) =>
        s.id === sectionId ? { ...s, fieldKeys: [...s.fieldKeys, fieldKey] } : s
      )
    );
  }

  function removeFieldFromSection(sectionId: string, fieldKey: string) {
    updateSections(
      sections.map((s) =>
        s.id === sectionId ? { ...s, fieldKeys: s.fieldKeys.filter((k) => k !== fieldKey) } : s
      )
    );
  }

  function handleSectionDragEnd(e: DragEndEvent) {
    setActiveSectionId(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = sectionOrder.indexOf(active.id as string);
    const newIdx = sectionOrder.indexOf(over.id as string);
    const newOrder = arrayMove(sectionOrder, oldIdx, newIdx);
    updateSections(sections, newOrder);
  }

  function getFieldLabel(key: string): string {
    return FIELD_LABELS[key] ?? regConfig.customFields.find((f) => f.id === key)?.label ?? key;
  }

  function conditionSummary(condition?: SectionCondition | null): string {
    if (!condition) return "Always visible";
    const fieldLabel = getFieldLabel(condition.fieldKey);
    const op = CONDITION_OPERATORS.find((o) => o.value === condition.operator);
    if (op && !op.needsValue) return `When ${fieldLabel} ${op.label}`;
    return `When ${fieldLabel} ${op?.label ?? condition.operator} "${condition.value ?? ""}"`;
  }

  const orderedSections = sectionOrder
    .map((id) => sections.find((s) => s.id === id))
    .filter((s): s is RegistrationSection => !!s);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-700">Sections</p>
        <button
          type="button"
          onClick={addSection}
          className="text-xs text-[#29BDD6] hover:text-[#1ea8c0] font-medium"
        >
          + Add Section
        </button>
      </div>

      {sections.length === 0 && (
        <p className="text-xs text-gray-400 mb-3">No sections. Fields display as a flat list.</p>
      )}

      <DndContext
        id="sections-dnd"
        sensors={sectionSensors}
        collisionDetection={closestCenter}
        onDragStart={(e) => setActiveSectionId(e.active.id as string)}
        onDragEnd={handleSectionDragEnd}
      >
        <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
          <div className="space-y-3 mb-4">
            {orderedSections.map((section) => (
              <SortableSectionCard
                key={section.id}
                section={section}
                allFields={allFields}
                unassignedFields={unassignedFields}
                conditionSummary={conditionSummary}
                getFieldLabel={getFieldLabel}
                onUpdate={(patch) => updateSection(section.id, patch)}
                onDelete={() => deleteSection(section.id)}
                onAssignField={(key) => assignField(section.id, key)}
                onRemoveField={(key) => removeFieldFromSection(section.id, key)}
              />
            ))}
          </div>
        </SortableContext>
        <DragOverlay>
          {activeSectionId ? (
            <div className="bg-white shadow-lg ring-2 ring-blue-400 rounded-lg p-3 text-sm font-medium text-gray-700">
              {sections.find((s) => s.id === activeSectionId)?.title || "Untitled Section"}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function SortableSectionCard({
  section,
  allFields,
  unassignedFields,
  conditionSummary,
  getFieldLabel,
  onUpdate,
  onDelete,
  onAssignField,
  onRemoveField,
}: {
  section: RegistrationSection;
  allFields: { key: string; label: string }[];
  unassignedFields: { key: string; label: string }[];
  conditionSummary: (c?: SectionCondition | null) => string;
  getFieldLabel: (key: string) => string;
  onUpdate: (patch: Partial<RegistrationSection>) => void;
  onDelete: () => void;
  onAssignField: (key: string) => void;
  onRemoveField: (key: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="border rounded-lg p-3 space-y-2 bg-white">
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 touch-none"
          {...attributes}
          {...listeners}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
            <circle cx="5" cy="3" r="1.5" /><circle cx="11" cy="3" r="1.5" />
            <circle cx="5" cy="8" r="1.5" /><circle cx="11" cy="8" r="1.5" />
            <circle cx="5" cy="13" r="1.5" /><circle cx="11" cy="13" r="1.5" />
          </svg>
        </button>
        <Input
          value={section.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate({ title: e.target.value })}
          placeholder="Section title"
          className="text-sm flex-1"
        />
        <button type="button" onClick={onDelete} className="text-gray-400 hover:text-red-500 p-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div>
        <Textarea
          value={section.description ?? ""}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onUpdate({ description: e.target.value || undefined })}
          placeholder="Description (optional) — supports **bold**, *italic*, [link text](https://...)"
          className="text-sm min-h-[60px]"
        />
        <p className="text-[10px] text-gray-400 mt-0.5">Supports **bold**, *italic*, [link text](url)</p>
      </div>

      {/* Condition editor */}
      <div className="bg-gray-50 rounded p-2 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500 shrink-0">Show when:</span>
          <select
            value={section.condition?.fieldKey ?? ""}
            onChange={(e) => {
              if (!e.target.value) {
                onUpdate({ condition: null });
              } else {
                onUpdate({
                  condition: {
                    fieldKey: e.target.value,
                    operator: section.condition?.operator ?? "equals",
                    value: section.condition?.value,
                  },
                });
              }
            }}
            className="text-xs border rounded px-2 py-1 bg-white"
          >
            <option value="">Always visible</option>
            {allFields.map((f) => (
              <option key={f.key} value={f.key}>{f.label}</option>
            ))}
          </select>

          {section.condition && (
            <>
              <select
                value={section.condition.operator}
                onChange={(e) =>
                  onUpdate({
                    condition: { ...section.condition!, operator: e.target.value as ConditionOperator },
                  })
                }
                className="text-xs border rounded px-2 py-1 bg-white"
              >
                {CONDITION_OPERATORS.map((op) => (
                  <option key={op.value} value={op.value}>{op.label}</option>
                ))}
              </select>

              {CONDITION_OPERATORS.find((o) => o.value === section.condition?.operator)?.needsValue && (
                <Input
                  value={section.condition.value ?? ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    onUpdate({ condition: { ...section.condition!, value: e.target.value } })
                  }
                  placeholder="Value"
                  className="text-xs w-28"
                />
              )}
            </>
          )}
        </div>
        <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${section.condition ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
          {conditionSummary(section.condition)}
        </span>
      </div>

      {/* Assigned fields */}
      <div className="space-y-1">
        <p className="text-xs text-gray-500">Fields in this section:</p>
        {section.fieldKeys.length === 0 && (
          <p className="text-xs text-gray-400 italic">No fields assigned</p>
        )}
        {section.fieldKeys.map((key) => (
          <div key={key} className="flex items-center justify-between text-xs px-2 py-1 bg-gray-50 rounded">
            <span className="text-gray-700">{getFieldLabel(key)}</span>
            <button type="button" onClick={() => onRemoveField(key)} className="text-gray-400 hover:text-red-500">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}

        {unassignedFields.length > 0 && (
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) onAssignField(e.target.value);
            }}
            className="text-xs border rounded px-2 py-1 bg-white w-full mt-1"
          >
            <option value="">Assign a field...</option>
            {unassignedFields.map((f) => (
              <option key={f.key} value={f.key}>{f.label}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}

export function EventForm({ event }: Props) {
  const router = useRouter();
  const isEditing = !!event?.id;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState("conference");

  const defaultRegConfig: RegistrationConfig = {
    enabled: false,
    showBanner: false,
    showHeroContent: true,
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
    is_external: event?.is_external ?? true,
    external_url: event?.external_url ?? "",
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

  async function autoSaveRegConfig(updated: RegistrationConfig) {
    if (!isEditing) return;
    const supabase = createClient();
    await supabase.from("events").update({ registration_config: updated }).eq("id", event.id!);
  }

  const fieldOrder = regConfig.fieldOrder ?? DEFAULT_FIELD_ORDER;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const [activeFieldKey, setActiveFieldKey] = useState<string | null>(null);

  function handleFieldDragStart(e: DragStartEvent) {
    setActiveFieldKey(e.active.id as string);
  }

  function handleFieldDragEnd(e: DragEndEvent) {
    setActiveFieldKey(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const oldIndex = fieldOrder.indexOf(active.id as keyof RegistrationConfig["fields"]);
    const newIndex = fieldOrder.indexOf(over.id as keyof RegistrationConfig["fields"]);
    const newOrder = arrayMove(fieldOrder, oldIndex, newIndex);

    const updated = { ...regConfig, fieldOrder: newOrder };
    setRegConfig(updated);
    autoSaveRegConfig(updated);
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
      ...(!isEditing && {
        is_external: form.is_external,
        external_url: form.external_url || null,
      }),
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

      // Apply page template (skip for external events)
      if (!form.is_external && selectedTemplate !== "blank") {
        await applyTemplate(supabase, newEvent.id, selectedTemplate);
      }

      setSaving(false);
      router.push(form.is_external
        ? `/admin/events/edit/${newEvent.id}`
        : `/admin/events/edit/${newEvent.id}/builder`
      );
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
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-gray-900">Registration</h3>
            {regConfig.enabled && form.slug && (
              <a
                href={`/register/${form.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-cyan-600 hover:text-cyan-700 font-medium"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview
              </a>
            )}
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={regConfig.enabled}
              onChange={(e) => {
                const updated = { ...regConfig, enabled: e.target.checked };
                setRegConfig(updated);
                autoSaveRegConfig(updated);
              }}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#29BDD6]" />
          </label>
        </div>

        {regConfig.enabled && (
          <div className="space-y-4">
            {/* Page Display toggles */}
            <div className="border-b pb-4 mb-4 space-y-3">
              <p className="text-sm font-medium text-gray-700">Page Display</p>
              {form.banner_url && (
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Use banner as hero background</span>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={regConfig.showBanner === true}
                      onChange={(e) => {
                        const updated = { ...regConfig, showBanner: e.target.checked };
                        setRegConfig(updated);
                        autoSaveRegConfig(updated);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#29BDD6]" />
                  </div>
                </label>
              )}
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Show event details in hero</span>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={regConfig.showHeroContent !== false}
                    onChange={(e) => {
                      const updated = { ...regConfig, showHeroContent: e.target.checked };
                      setRegConfig(updated);
                      autoSaveRegConfig(updated);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#29BDD6]" />
                </div>
              </label>
            </div>

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

                {/* Configurable fields (drag to reorder) */}
                <DndContext
                  id="reg-fields-dnd"
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleFieldDragStart}
                  onDragEnd={handleFieldDragEnd}
                >
                  <SortableContext items={fieldOrder as string[]} strategy={verticalListSortingStrategy}>
                    {fieldOrder.map((key) => {
                      const field = regConfig.fields[key];
                      if (!field) return null;
                      const assignedSection = (regConfig.sections ?? []).find((s) => s.fieldKeys.includes(key));
                      return (
                        <SortableFieldRow
                          key={key}
                          fieldKey={key}
                          field={field}
                          sectionName={assignedSection?.title || undefined}
                          onToggleVisible={(checked) => {
                            const updated = {
                              ...regConfig,
                              fields: {
                                ...regConfig.fields,
                                [key]: { ...regConfig.fields[key], visible: checked },
                              },
                            };
                            setRegConfig(updated);
                            autoSaveRegConfig(updated);
                          }}
                          onToggleRequired={(checked) => {
                            const updated = {
                              ...regConfig,
                              fields: {
                                ...regConfig.fields,
                                [key]: { ...regConfig.fields[key], required: checked },
                              },
                            };
                            setRegConfig(updated);
                            autoSaveRegConfig(updated);
                          }}
                        />
                      );
                    })}
                  </SortableContext>

                  <DragOverlay>
                    {activeFieldKey && regConfig.fields[activeFieldKey as keyof RegistrationConfig["fields"]] ? (
                      <div className="flex items-center gap-3 px-3 py-2 rounded bg-white shadow-lg ring-2 ring-blue-400 text-sm">
                        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 16 16">
                          <circle cx="5" cy="3" r="1.5" />
                          <circle cx="11" cy="3" r="1.5" />
                          <circle cx="5" cy="8" r="1.5" />
                          <circle cx="11" cy="8" r="1.5" />
                          <circle cx="5" cy="13" r="1.5" />
                          <circle cx="11" cy="13" r="1.5" />
                        </svg>
                        <span className="flex-1 text-gray-700">{FIELD_LABELS[activeFieldKey] ?? activeFieldKey}</span>
                      </div>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              </div>
            </div>

            {/* Sections */}
            <SectionsEditor
              regConfig={regConfig}
              onUpdate={(updated) => {
                setRegConfig(updated);
                autoSaveRegConfig(updated);
              }}
              fieldOrder={fieldOrder}
            />

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
