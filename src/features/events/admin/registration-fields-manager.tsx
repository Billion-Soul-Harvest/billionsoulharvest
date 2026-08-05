"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { createClient } from "@/shared/utils/supabase/client";
import type {
  RegistrationConfig,
  RegistrationCustomField,
  RegistrationCustomFieldType,
  RegistrationSection,
  ConditionOperator,
  SectionCondition,
} from "@/shared/types/database";
import { DEFAULT_FIELD_ORDER } from "@/shared/types/database";
import { MarkdownInput } from "@/shared/components/markdown-input";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type CollisionDetection,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Custom collision detection: only collide with droppables of the same type as the active item
const sameTypeCollision: CollisionDetection = (args) => {
  const activeType = args.active.data.current?.type;
  const filtered = args.droppableContainers.filter(
    (container) => container.data.current?.type === activeType
  );
  return closestCenter({ ...args, droppableContainers: filtered });
};

// ── Constants ──

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

const DEFAULT_FIELD_TYPES: Record<string, string> = {
  region: "SELECT",
  country: "SELECT",
  visaRequired: "CHECKBOX",
  passportNumber: "TEXT",
  phone: "TEL",
  churchName: "TEXT",
  churchRole: "TEXT",
  referredBy: "TEXT",
  city: "TEXT",
  dietaryRequirements: "TEXTAREA",
  howHeard: "TEXT",
  specialNeeds: "TEXTAREA",
};

const CUSTOM_TYPE_LABELS: Record<string, string> = {
  text: "TEXT",
  textarea: "TEXTAREA",
  select: "SELECT",
  checkbox: "CHECKBOX",
  number: "NUMBER",
  date: "DATE",
  email: "EMAIL",
  tel: "TEL",
  url: "URL",
};

const TYPE_COLORS: Record<string, string> = {
  TEXT: "bg-blue-100 text-blue-700 border-blue-200",
  SELECT: "bg-purple-100 text-purple-700 border-purple-200",
  CHECKBOX: "bg-green-100 text-green-700 border-green-200",
  TEXTAREA: "bg-gray-100 text-gray-700 border-gray-200",
  NUMBER: "bg-orange-100 text-orange-700 border-orange-200",
  DATE: "bg-orange-100 text-orange-700 border-orange-200",
  EMAIL: "bg-blue-100 text-blue-700 border-blue-200",
  TEL: "bg-blue-100 text-blue-700 border-blue-200",
  URL: "bg-blue-100 text-blue-700 border-blue-200",
};

const CONDITION_OPERATORS: { value: ConditionOperator; label: string; needsValue: boolean }[] = [
  { value: "equals", label: "equals", needsValue: true },
  { value: "not_equals", label: "does not equal", needsValue: true },
  { value: "contains", label: "contains", needsValue: true },
  { value: "not_empty", label: "is not empty", needsValue: false },
  { value: "is_empty", label: "is empty", needsValue: false },
];

// ── Types ──

interface UnifiedField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  visible: boolean;
  description?: string;
  options?: string[];
  isCore?: boolean;
  isDefault?: boolean;
  isCustom?: boolean;
  sectionId?: string;
  customField?: RegistrationCustomField;
}

interface Props {
  eventId: string;
  initialConfig: RegistrationConfig | null;
  slug: string;
  bannerUrl: string | null;
}

// ── Sortable Table Row ──

function SortableFieldRow({
  field,
  onToggleVisible,
  onToggleRequired,
  onEdit,
  onDelete,
  disableDrag,
  group,
}: {
  field: UnifiedField;
  onToggleVisible: () => void;
  onToggleRequired: () => void;
  onEdit: () => void;
  onDelete: () => void;
  disableDrag?: boolean;
  group?: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id, disabled: disableDrag, data: { type: "field", group: group ?? "unsectioned" } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const typeLabel = field.type.toUpperCase();
  const colorClass = TYPE_COLORS[typeLabel] || "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b last:border-b-0 hover:bg-gray-50/50 transition-colors ${isDragging ? "bg-gray-100" : ""} ${field.isCore ? "bg-blue-50/30" : ""}`}
    >
      <td className="py-3 px-2 w-8">
        {!field.isCore && (
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing inline-flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
              <circle cx="5" cy="3" r="1.5" /><circle cx="11" cy="3" r="1.5" />
              <circle cx="5" cy="8" r="1.5" /><circle cx="11" cy="8" r="1.5" />
              <circle cx="5" cy="13" r="1.5" /><circle cx="11" cy="13" r="1.5" />
            </svg>
          </div>
        )}
      </td>
      <td className="py-3 px-3 max-w-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-medium text-sm truncate">{field.label}</span>
          {field.isCore && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200 shrink-0">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Core
            </span>
          )}
          {field.isCustom && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-cyan-50 text-cyan-700 border border-cyan-200 shrink-0">
              Custom
            </span>
          )}
        </div>
        {field.isDefault && (
          <div className="text-xs text-gray-400 mt-0.5 font-mono">{field.id}</div>
        )}
      </td>
      <td className="py-3 px-3">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${colorClass}`}>
          {typeLabel}
        </span>
      </td>
      <td className="py-3 px-3 text-center">
        {field.isCore ? (
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-600 text-xs font-medium">*</span>
        ) : (
          <button
            type="button"
            onClick={onToggleRequired}
            className="inline-flex items-center justify-center w-5 h-5 rounded-full transition-colors"
            title={field.required ? "Make optional" : "Make required"}
          >
            {field.required ? (
              <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 text-xs font-medium flex items-center justify-center">*</span>
            ) : (
              <span className="w-5 h-5 rounded-full text-gray-300 text-xs flex items-center justify-center">&mdash;</span>
            )}
          </button>
        )}
      </td>
      <td className="py-3 px-3 text-sm text-gray-500 max-w-[200px]">
        {field.options && field.options.length > 0 ? (
          <span className="truncate block" title={field.options.join(", ")}>
            {field.options.slice(0, 3).join(", ")}
            {field.options.length > 3 && <span className="text-gray-400 ml-1">+{field.options.length - 3}</span>}
          </span>
        ) : (
          <span className="text-gray-300">&mdash;</span>
        )}
      </td>
      <td className="py-3 px-3 text-center">
        {field.isCore ? (
          <span className="text-xs text-gray-400">Always</span>
        ) : (
          <button
            type="button"
            onClick={onToggleVisible}
            className={`p-1 transition-colors rounded ${field.visible ? "text-gray-500 hover:text-gray-700" : "text-amber-500 hover:text-amber-600"}`}
            title={field.visible ? "Visible — click to hide" : "Hidden — click to show"}
          >
            {field.visible ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.05 6.05m7.07 7.07l3.829 3.829M3 3l18 18" />
              </svg>
            )}
          </button>
        )}
      </td>
      <td className="py-3 px-3">
        <div className="flex items-center justify-end gap-1">
          {field.isCore ? (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Protected
            </span>
          ) : (
            <>
              {field.isCustom && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1"
                >
                  Delete
                </button>
              )}
              <button
                type="button"
                onClick={onEdit}
                className="p-1 text-gray-400 hover:text-[#29BDD6] transition-colors"
                title="Edit field"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── Section Header Row ──

function SectionHeaderRow({
  section,
  fieldCount,
  conditionSummary,
  onEdit,
  onDelete,
}: {
  section: RegistrationSection;
  fieldCount: number;
  conditionSummary: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id, data: { type: "section" } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} className="bg-[#29BDD6]/5 border-t-2 border-[#29BDD6]/20">
      <td colSpan={7} className="py-3 px-4">
        <div className="flex items-center gap-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-[#29BDD6]/50 hover:text-[#29BDD6] transition-colors touch-none"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
              <circle cx="5" cy="3" r="1.5" /><circle cx="11" cy="3" r="1.5" />
              <circle cx="5" cy="8" r="1.5" /><circle cx="11" cy="8" r="1.5" />
              <circle cx="5" cy="13" r="1.5" /><circle cx="11" cy="13" r="1.5" />
            </svg>
          </div>
          <span className="font-medium text-sm text-[#29BDD6]">{section.title || "Untitled Section"}</span>
          {section.condition && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
              Conditional
            </span>
          )}
          <span className="text-xs text-gray-400">
            ({fieldCount} field{fieldCount !== 1 ? "s" : ""})
          </span>
          <div className="ml-auto flex items-center gap-2">
            {section.condition && (
              <span className="text-xs text-amber-600">{conditionSummary}</span>
            )}
            <button
              type="button"
              onClick={onEdit}
              className="p-1 text-gray-400 hover:text-[#29BDD6] transition-colors"
              title="Edit section"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1"
            >
              Delete
            </button>
          </div>
        </div>
        {section.description && (
          <p className="text-xs text-gray-400 mt-1">{section.description}</p>
        )}
      </td>
    </tr>
  );
}

// ── Field Edit Dialog ──

function FieldEditDialog({
  open,
  onClose,
  field,
  onSave,
  sections,
}: {
  open: boolean;
  onClose: () => void;
  field: UnifiedField | null;
  onSave: (updates: { required?: boolean; description?: string; label?: string; placeholder?: string; options?: string[]; type?: RegistrationCustomFieldType; moveTo?: string | null }) => void;
  sections: RegistrationSection[];
}) {
  const fieldId = field?.id;
  const [required, setRequired] = useState(field?.required ?? false);
  const [description, setDescription] = useState(field?.description ?? "");
  const [label, setLabel] = useState(field?.label ?? "");
  const [placeholder, setPlaceholder] = useState(field?.customField?.placeholder ?? "");
  const [type, setType] = useState<RegistrationCustomFieldType>((field?.customField?.type ?? "text") as RegistrationCustomFieldType);
  const [options, setOptions] = useState((field?.options ?? []).join("\n"));
  const [selectedSection, setSelectedSection] = useState(field?.sectionId ?? "");
  const [lastFieldId, setLastFieldId] = useState(fieldId);

  // Reset when field changes
  if (fieldId !== lastFieldId) {
    setLastFieldId(fieldId);
    if (field) {
      setRequired(field.required);
      setDescription(field.description ?? "");
      setLabel(field.label);
      setPlaceholder(field.customField?.placeholder ?? "");
      setType((field.customField?.type ?? "text") as RegistrationCustomFieldType);
      setOptions((field.options ?? []).join("\n"));
      setSelectedSection(field.sectionId ?? "");
    }
  }

  if (!field) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Field: {field.label}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {field.isCustom && (
            <>
              <div>
                <Label>Label</Label>
                <Input value={label} onChange={(e) => setLabel(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as RegistrationCustomFieldType)}>
                  <SelectTrigger className="mt-1">
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
              </div>
              <div>
                <Label>Placeholder</Label>
                <Input value={placeholder} onChange={(e) => setPlaceholder(e.target.value)} className="mt-1" placeholder="Optional" />
              </div>
              {type === "select" && (
                <div>
                  <Label>Options (one per line)</Label>
                  <Textarea
                    value={options}
                    onChange={(e) => setOptions(e.target.value)}
                    className="mt-1 min-h-[80px]"
                    placeholder={"Option 1\nOption 2\nOption 3"}
                  />
                </div>
              )}
            </>
          )}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="field-required"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <Label htmlFor="field-required">Required</Label>
          </div>
          <div>
            <Label>Description</Label>
            <div className="mt-1">
              <MarkdownInput
                value={description}
                onChange={(val) => setDescription(val ?? "")}
                placeholder="Field description (optional) — supports links, bold, italic"
              />
            </div>
          </div>
          {sections.length > 0 && !field.isCore && (
            <div>
              <Label>Section</Label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm bg-white"
              >
                <option value="">No section</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>{s.title || "Untitled Section"}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => {
              const updates: Parameters<typeof onSave>[0] = { required, description: description || undefined };
              if (field.isCustom) {
                updates.label = label;
                updates.placeholder = placeholder || undefined;
                updates.type = type;
                if (type === "select") {
                  updates.options = options.split("\n").filter(Boolean);
                }
              }
              // Handle section change atomically with field updates
              const currentSection = field.sectionId ?? "";
              if (selectedSection !== currentSection) {
                updates.moveTo = selectedSection || null;
              }
              onSave(updates);
              onClose();
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Section Edit Dialog ──

function SectionEditDialog({
  open,
  onClose,
  section,
  allFields,
  onSave,
  onAddField,
  onRemoveField,
  unassignedFields,
  getFieldLabel: getLabel,
}: {
  open: boolean;
  onClose: () => void;
  section: RegistrationSection | null;
  allFields: { key: string; label: string }[];
  onSave: (updates: Partial<RegistrationSection>) => void;
  onAddField: (fieldKey: string) => void;
  onRemoveField: (fieldKey: string) => void;
  unassignedFields: { key: string; label: string }[];
  getFieldLabel: (key: string) => string;
}) {
  const sectionId = section?.id;
  const [title, setTitle] = useState(section?.title ?? "");
  const [description, setDescription] = useState(section?.description ?? "");
  const [condFieldKey, setCondFieldKey] = useState(section?.condition?.fieldKey ?? "");
  const [condOperator, setCondOperator] = useState<ConditionOperator>(section?.condition?.operator ?? "equals");
  const [condValue, setCondValue] = useState(section?.condition?.value ?? "");
  const [addFieldKey, setAddFieldKey] = useState("");
  const [lastSectionId, setLastSectionId] = useState(sectionId);

  if (sectionId !== lastSectionId) {
    setLastSectionId(sectionId);
    if (section) {
      setTitle(section.title ?? "");
      setDescription(section.description ?? "");
      setCondFieldKey(section.condition?.fieldKey ?? "");
      setCondOperator(section.condition?.operator ?? "equals");
      setCondValue(section.condition?.value ?? "");
      setAddFieldKey("");
    }
  }

  if (!section) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Section</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" placeholder="Section title" />
          </div>
          <div>
            <Label>Description</Label>
            <div className="mt-1">
              <MarkdownInput
                value={description}
                onChange={(val) => setDescription(val ?? "")}
                placeholder="Section description (optional)"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Condition</Label>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500">Show when:</span>
              <select
                value={condFieldKey}
                onChange={(e) => setCondFieldKey(e.target.value)}
                className="text-xs border rounded px-2 py-1 bg-white"
              >
                <option value="">Always visible</option>
                {allFields.map((f) => (
                  <option key={f.key} value={f.key}>{f.label}</option>
                ))}
              </select>
              {condFieldKey && (
                <>
                  <select
                    value={condOperator}
                    onChange={(e) => setCondOperator(e.target.value as ConditionOperator)}
                    className="text-xs border rounded px-2 py-1 bg-white"
                  >
                    {CONDITION_OPERATORS.map((op) => (
                      <option key={op.value} value={op.value}>{op.label}</option>
                    ))}
                  </select>
                  {CONDITION_OPERATORS.find((o) => o.value === condOperator)?.needsValue && (
                    <Input
                      value={condValue}
                      onChange={(e) => setCondValue(e.target.value)}
                      placeholder="Value"
                      className="text-xs w-28"
                    />
                  )}
                </>
              )}
            </div>
          </div>
          {/* Fields in this section */}
          <div className="space-y-2">
            <Label>Fields</Label>
            {section.fieldKeys.length === 0 ? (
              <p className="text-xs text-gray-400">No fields assigned to this section.</p>
            ) : (
              <div className="space-y-1">
                {section.fieldKeys.map((key) => (
                  <div key={key} className="flex items-center justify-between bg-gray-50 rounded px-3 py-1.5 text-sm">
                    <span>{getLabel(key)}</span>
                    <button
                      type="button"
                      onClick={() => onRemoveField(key)}
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
            {unassignedFields.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <select
                  value={addFieldKey}
                  onChange={(e) => setAddFieldKey(e.target.value)}
                  className="text-sm border rounded px-2 py-1.5 bg-white flex-1"
                >
                  <option value="">Add a field...</option>
                  {unassignedFields.map((f) => (
                    <option key={f.key} value={f.key}>{f.label}</option>
                  ))}
                </select>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!addFieldKey}
                  onClick={() => {
                    if (addFieldKey) {
                      onAddField(addFieldKey);
                      setAddFieldKey("");
                    }
                  }}
                  className="text-xs h-8"
                >
                  Add
                </Button>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => {
              onSave({
                title,
                description: description || undefined,
                condition: condFieldKey
                  ? { fieldKey: condFieldKey, operator: condOperator, value: condValue || undefined }
                  : null,
              });
              onClose();
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Component ──

export function RegistrationFieldsManager({ eventId, initialConfig, slug, bannerUrl }: Props) {
  const defaultConfig: RegistrationConfig = {
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

  const [config, setConfig] = useState<RegistrationConfig>(initialConfig ?? defaultConfig);
  const [editField, setEditField] = useState<UnifiedField | null>(null);
  const [editSection, setEditSection] = useState<RegistrationSection | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const autoSave = useCallback(async (updated: RegistrationConfig) => {
    const supabase = createClient();
    await supabase.from("events").update({ registration_config: updated }).eq("id", eventId);
  }, [eventId]);

  function updateConfig(updated: RegistrationConfig) {
    setConfig(updated);
    autoSave(updated);
  }

  // Build unified field list
  const fieldOrder = config.fieldOrder ?? DEFAULT_FIELD_ORDER;
  const sections = config.sections ?? [];
  const sectionOrder = config.sectionOrder ?? sections.map((s) => s.id);
  const assignedKeys = new Set(sections.flatMap((s) => s.fieldKeys));

  // All field options (for condition picker)
  const allFieldOptions: { key: string; label: string }[] = [
    ...(Object.keys(config.fields) as Array<keyof typeof config.fields>).filter((k) => config.fields[k]?.visible).map((k) => ({ key: k, label: FIELD_LABELS[k] ?? k })),
    ...config.customFields.map((f) => ({ key: f.id, label: f.label || "Untitled" })),
  ];

  function getFieldLabel(key: string): string {
    if (FIELD_LABELS[key]) return FIELD_LABELS[key];
    const cf = config.customFields.find((f) => f.id === key);
    return cf?.label || "Untitled field";
  }

  function getFieldType(key: string): string {
    if (DEFAULT_FIELD_TYPES[key]) return DEFAULT_FIELD_TYPES[key];
    const cf = config.customFields.find((f) => f.id === key);
    return cf ? (CUSTOM_TYPE_LABELS[cf.type] || cf.type.toUpperCase()) : "TEXT";
  }

  // Build unified field for a key
  function toUnifiedField(key: string, sectionId?: string): UnifiedField {
    const isDefault = key in config.fields;
    const cf = config.customFields.find((f) => f.id === key);
    const isCustom = !!cf;
    const fc = isDefault ? config.fields[key as keyof typeof config.fields] : null;
    return {
      id: key,
      label: getFieldLabel(key),
      type: getFieldType(key),
      required: isDefault ? (fc?.required ?? false) : (cf?.required ?? false),
      visible: isDefault ? (fc?.visible ?? true) : true,
      description: isDefault ? fc?.description : cf?.description,
      options: cf?.type === "select" ? cf.options : undefined,
      isDefault,
      isCustom,
      sectionId,
      customField: cf,
    };
  }

  // Core fields (always shown, not configurable)
  const coreFields: UnifiedField[] = [
    { id: "__firstName", label: "First Name", type: "TEXT", required: true, visible: true, isCore: true },
    { id: "__lastName", label: "Last Name", type: "TEXT", required: true, visible: true, isCore: true },
    { id: "__email", label: "Email", type: "EMAIL", required: true, visible: true, isCore: true },
  ];

  // Unsectioned fields (default fields not in any section + custom fields not in any section)
  // Include all default fields from fieldOrder, plus any default fields that exist in config.fields but aren't in fieldOrder
  const allDefaultKeys = [...fieldOrder, ...(Object.keys(config.fields) as Array<keyof typeof config.fields>).filter((k) => !fieldOrder.includes(k))];
  const unsectionedDefaultKeys = allDefaultKeys.filter((k) => !assignedKeys.has(k));
  const unsectionedCustomKeys = config.customFields
    .filter((f) => !assignedKeys.has(f.id))
    .map((f) => f.id);
  const allUnsectionedSet = new Set([...unsectionedDefaultKeys, ...unsectionedCustomKeys]);
  // Use saved order if available, filtering out stale keys and appending new ones
  const savedOrder = config.unsectionedOrder ?? [];
  const orderedFromSaved = savedOrder.filter((k) => allUnsectionedSet.has(k));
  const newKeys = [...unsectionedDefaultKeys, ...unsectionedCustomKeys].filter((k) => !savedOrder.includes(k));
  const unsectionedKeys = [...orderedFromSaved, ...newKeys];

  // Ordered sections with their fields
  const orderedSections = sectionOrder
    .map((id) => sections.find((s) => s.id === id))
    .filter((s): s is RegistrationSection => !!s);

  // DnD: handle reorder within unsectioned fields
  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const activeType = (active.data.current as { type?: string })?.type;
    const overType = (over.data.current as { type?: string })?.type;

    // Section reorder
    if (activeType === "section" && overType === "section") {
      const oldIdx = sectionOrder.indexOf(active.id as string);
      const newIdx = sectionOrder.indexOf(over.id as string);
      if (oldIdx === -1 || newIdx === -1) return;
      updateConfig({ ...config, sectionOrder: arrayMove(sectionOrder, oldIdx, newIdx) });
      return;
    }

    // Field reorder — only within same group
    if (activeType === "field" && overType === "field") {
      const activeGroup = (active.data.current as { group?: string })?.group;
      const overGroup = (over.data.current as { group?: string })?.group;
      if (activeGroup !== overGroup) return;

      if (activeGroup === "unsectioned") {
        const activeId = active.id as string;
        const overId = over.id as string;
        const oldIdx = unsectionedKeys.indexOf(activeId);
        const newIdx = unsectionedKeys.indexOf(overId);
        if (oldIdx === -1 || newIdx === -1) return;
        const reordered = arrayMove(unsectionedKeys, oldIdx, newIdx);
        updateConfig({ ...config, unsectionedOrder: reordered });
      } else {
        const sectionId = activeGroup!;
        const section = sections.find((s) => s.id === sectionId);
        if (!section) return;
        const oldIdx = section.fieldKeys.indexOf(active.id as string);
        const newIdx = section.fieldKeys.indexOf(over.id as string);
        if (oldIdx === -1 || newIdx === -1) return;
        const newKeys = arrayMove(section.fieldKeys, oldIdx, newIdx);
        updateConfig({
          ...config,
          sections: sections.map((s) => s.id === sectionId ? { ...s, fieldKeys: newKeys } : s),
        });
      }
    }
  }

  // Toggle field visibility
  function toggleVisible(key: string) {
    if (key in config.fields) {
      const fc = config.fields[key as keyof typeof config.fields];
      updateConfig({
        ...config,
        fields: { ...config.fields, [key]: { ...fc, visible: !fc.visible } },
      });
    }
  }

  // Toggle field required
  function toggleRequired(key: string) {
    if (key in config.fields) {
      const fc = config.fields[key as keyof typeof config.fields];
      updateConfig({
        ...config,
        fields: { ...config.fields, [key]: { ...fc, required: !fc.required } },
      });
    } else {
      const idx = config.customFields.findIndex((f) => f.id === key);
      if (idx >= 0) {
        const updated = [...config.customFields];
        updated[idx] = { ...updated[idx], required: !updated[idx].required };
        updateConfig({ ...config, customFields: updated });
      }
    }
  }

  // Save field edits
  function saveFieldEdit(fieldId: string, updates: { required?: boolean; description?: string; label?: string; placeholder?: string; options?: string[]; type?: RegistrationCustomFieldType; moveTo?: string | null }) {
    let newConfig = { ...config };
    const isDefault = fieldId in config.fields;
    if (isDefault) {
      const fc = config.fields[fieldId as keyof typeof config.fields];
      newConfig = {
        ...newConfig,
        fields: {
          ...newConfig.fields,
          [fieldId]: { ...fc, required: updates.required ?? fc.required, description: updates.description },
        },
      };
    } else {
      const idx = config.customFields.findIndex((f) => f.id === fieldId);
      if (idx >= 0) {
        const updated = [...config.customFields];
        updated[idx] = {
          ...updated[idx],
          required: updates.required ?? updated[idx].required,
          description: updates.description,
          label: updates.label ?? updated[idx].label,
          placeholder: updates.placeholder,
          type: updates.type ?? updated[idx].type,
          options: updates.options,
        };
        newConfig = { ...newConfig, customFields: updated };
      }
    }
    // Handle section move atomically
    if (updates.moveTo !== undefined) {
      newConfig = {
        ...newConfig,
        sections: (newConfig.sections ?? []).map((s) => {
          let keys = s.fieldKeys.filter((k) => k !== fieldId);
          if (s.id === updates.moveTo) keys = [...keys, fieldId];
          return { ...s, fieldKeys: keys };
        }),
      };
      // When moving a default field out of a section (to unsectioned), ensure it's in fieldOrder
      if (updates.moveTo === null && isDefault) {
        const currentOrder = newConfig.fieldOrder ?? DEFAULT_FIELD_ORDER;
        if (!currentOrder.includes(fieldId as keyof RegistrationConfig["fields"])) {
          newConfig = { ...newConfig, fieldOrder: [...currentOrder, fieldId as keyof RegistrationConfig["fields"]] };
        }
      }
    }
    updateConfig(newConfig);
  }

  // Delete custom field
  function deleteCustomField(fieldId: string) {
    updateConfig({
      ...config,
      customFields: config.customFields.filter((f) => f.id !== fieldId),
      sections: sections.map((s) => ({
        ...s,
        fieldKeys: s.fieldKeys.filter((k) => k !== fieldId),
      })),
    });
  }

  // Add custom field
  function addCustomField(sectionId?: string) {
    const id = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newField: RegistrationCustomField = { id, label: "", type: "text", required: false };
    const updatedCustomFields = [...config.customFields, newField];
    let updatedSections = sections;
    if (sectionId) {
      updatedSections = sections.map((s) =>
        s.id === sectionId ? { ...s, fieldKeys: [...s.fieldKeys, id] } : s
      );
    }
    const updated = { ...config, customFields: updatedCustomFields, sections: updatedSections };
    updateConfig(updated);
    // Open edit dialog for new field
    setEditField({
      id,
      label: "",
      type: "TEXT",
      required: false,
      visible: true,
      isCustom: true,
      customField: newField,
    });
  }

  // Add section
  function addSection() {
    const id = `section_${Date.now()}`;
    const newSection: RegistrationSection = { id, title: "", fieldKeys: [] };
    updateConfig({
      ...config,
      sections: [...sections, newSection],
      sectionOrder: [...sectionOrder, id],
    });
    setEditSection(newSection);
  }

  // Delete section (fields become unsectioned)
  function deleteSection(sectionId: string) {
    updateConfig({
      ...config,
      sections: sections.filter((s) => s.id !== sectionId),
      sectionOrder: sectionOrder.filter((id) => id !== sectionId),
    });
  }

  // Remove field from section (move back to unsectioned)
  function removeFieldFromSection(sectionId: string, fieldKey: string) {
    let newConfig = {
      ...config,
      sections: sections.map((s) =>
        s.id === sectionId ? { ...s, fieldKeys: s.fieldKeys.filter((k) => k !== fieldKey) } : s
      ),
    };
    // When removing a default field from a section, ensure it's in fieldOrder
    if (fieldKey in config.fields) {
      const currentOrder = newConfig.fieldOrder ?? DEFAULT_FIELD_ORDER;
      if (!currentOrder.includes(fieldKey as keyof RegistrationConfig["fields"])) {
        newConfig = { ...newConfig, fieldOrder: [...currentOrder, fieldKey as keyof RegistrationConfig["fields"]] };
      }
    }
    updateConfig(newConfig);
  }

  // Assign existing field to section
  function assignFieldToSection(sectionId: string, fieldKey: string) {
    const newConfig = {
      ...config,
      sections: sections.map((s) =>
        s.id === sectionId ? { ...s, fieldKeys: [...s.fieldKeys, fieldKey] } : s
      ),
    };
    updateConfig(newConfig);
  }

  // Save section edits
  function saveSectionEdit(sectionId: string, updates: Partial<RegistrationSection>) {
    updateConfig({
      ...config,
      sections: sections.map((s) => s.id === sectionId ? { ...s, ...updates } : s),
    });
  }

  function conditionSummary(condition?: SectionCondition | null): string {
    if (!condition) return "Always visible";
    const label = getFieldLabel(condition.fieldKey);
    const op = CONDITION_OPERATORS.find((o) => o.value === condition.operator);
    if (op && !op.needsValue) return `When ${label} ${op.label}`;
    return `When ${label} ${op?.label ?? condition.operator} "${condition.value ?? ""}"`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Registration Fields</h2>
          {config.enabled && slug && (
            <a
              href={`/register/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-cyan-600 hover:text-cyan-700 font-medium"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Preview Form
            </a>
          )}
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => updateConfig({ ...config, enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#29BDD6]" />
          <span className="ml-2 text-sm text-gray-600">{config.enabled ? "Enabled" : "Disabled"}</span>
        </label>
      </div>

      {config.enabled && (
        <>
          {/* Page Display toggles */}
          <div className="flex items-center gap-6 bg-white rounded-lg border p-4">
            {bannerUrl && (
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={config.showBanner === true}
                  onChange={(e) => updateConfig({ ...config, showBanner: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                Use banner as hero
              </label>
            )}
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={config.showHeroContent !== false}
                onChange={(e) => updateConfig({ ...config, showHeroContent: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              Show event details in hero
            </label>
            {sections.length > 0 && (
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={config.multiPage === true}
                  onChange={(e) => updateConfig({ ...config, multiPage: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                Multi-page form (sections as pages)
              </label>
            )}
          </div>

          {/* Fields Table */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50/50">
              <p className="text-sm font-medium text-gray-700">All Fields</p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addSection}
                  className="text-xs h-7"
                >
                  + Add Section
                </Button>
                <Button
                  size="sm"
                  onClick={() => addCustomField()}
                  className="text-xs h-7 bg-[#29BDD6] hover:bg-[#1ea8c0] text-white"
                >
                  + Add Field
                </Button>
              </div>
            </div>
            <DndContext
              id="registration-dnd"
              sensors={sensors}
              collisionDetection={sameTypeCollision}
              onDragEnd={handleDragEnd}
            >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50/30">
                    <th className="py-2.5 px-2 w-8"></th>
                    <th className="py-2.5 px-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Label</th>
                    <th className="py-2.5 px-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="py-2.5 px-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Required</th>
                    <th className="py-2.5 px-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Options</th>
                    <th className="py-2.5 px-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Visible</th>
                    <th className="py-2.5 px-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Core fields */}
                  {coreFields.map((f) => (
                    <SortableFieldRow
                      key={f.id}
                      field={f}
                      onToggleVisible={() => {}}
                      onToggleRequired={() => {}}
                      onEdit={() => {}}
                      onDelete={() => {}}
                      disableDrag
                    />
                  ))}

                  {/* Unsectioned fields */}
                  {sections.length > 0 && unsectionedKeys.length > 0 && (
                    <tr className="bg-gray-50/50">
                      <td colSpan={7} className="py-2 px-4">
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">No Section</span>
                      </td>
                    </tr>
                  )}
                  <SortableContext items={unsectionedKeys} strategy={verticalListSortingStrategy}>
                    {unsectionedKeys.map((key) => {
                      const field = toUnifiedField(key);
                      return (
                        <SortableFieldRow
                          key={key}
                          field={field}
                          onToggleVisible={() => toggleVisible(key)}
                          onToggleRequired={() => toggleRequired(key)}
                          onEdit={() => setEditField(field)}
                          onDelete={() => field.isCustom && deleteCustomField(key)}
                        />
                      );
                    })}
                  </SortableContext>
                </tbody>

                {/* Sectioned fields — each section is its own <tbody> for proper DnD */}
                <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
                  {orderedSections.map((section) => {
                    const sectionFields = section.fieldKeys
                      .map((k) => toUnifiedField(k, section.id))
                      .filter((f) => {
                        // Skip orphaned custom fields
                        if (f.isCustom && !f.customField) return false;
                        return true;
                      });
                    return (
                      <SectionFields
                        key={section.id}
                        section={section}
                        fields={sectionFields}
                        conditionSummary={conditionSummary(section.condition)}
                        onEditSection={() => setEditSection(section)}
                        onDeleteSection={() => deleteSection(section.id)}
                        onToggleVisible={toggleVisible}
                        onToggleRequired={toggleRequired}
                        onEditField={setEditField}
                        onDeleteField={deleteCustomField}
                        onAddField={() => addCustomField(section.id)}
                      />
                    );
                  })}
                </SortableContext>

                {/* Add section row */}
                <tbody>
                  <tr
                    className="border-t-2 border-dashed hover:bg-[#29BDD6]/5 cursor-pointer transition-colors group"
                    onClick={addSection}
                  >
                    <td colSpan={7} className="py-3 px-4">
                      <div className="flex items-center gap-2 text-[#29BDD6] group-hover:text-[#1ea8c0] transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <span className="text-sm font-medium">Create new section</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            </DndContext>
          </div>
        </>
      )}

      {/* Dialogs */}
      <FieldEditDialog
        open={!!editField}
        onClose={() => setEditField(null)}
        field={editField}
        onSave={(updates) => editField && saveFieldEdit(editField.id, updates)}
        sections={sections}
      />
      <SectionEditDialog
        open={!!editSection}
        onClose={() => setEditSection(null)}
        section={editSection}
        allFields={allFieldOptions}
        onSave={(updates) => editSection && saveSectionEdit(editSection.id, updates)}
        onAddField={(fieldKey) => {
          if (editSection) {
            assignFieldToSection(editSection.id, fieldKey);
            // Re-open with updated section
            setEditSection({ ...editSection, fieldKeys: [...editSection.fieldKeys, fieldKey] });
          }
        }}
        onRemoveField={(fieldKey) => {
          if (editSection) {
            removeFieldFromSection(editSection.id, fieldKey);
            setEditSection({ ...editSection, fieldKeys: editSection.fieldKeys.filter((k) => k !== fieldKey) });
          }
        }}
        unassignedFields={unsectionedKeys.map((k) => ({
          key: k,
          label: FIELD_LABELS[k] ?? config.customFields.find((f) => f.id === k)?.label ?? k,
        }))}
        getFieldLabel={getFieldLabel}
      />
    </div>
  );
}

// ── Section Fields Sub-component ──
// Needed to create a separate DndContext per section

function SectionFields({
  section,
  fields,
  conditionSummary,
  onEditSection,
  onDeleteSection,
  onToggleVisible,
  onToggleRequired,
  onEditField,
  onDeleteField,
  onAddField,
}: {
  section: RegistrationSection;
  fields: UnifiedField[];
  conditionSummary: string;
  onEditSection: () => void;
  onDeleteSection: () => void;
  onToggleVisible: (key: string) => void;
  onToggleRequired: (key: string) => void;
  onEditField: (field: UnifiedField) => void;
  onDeleteField: (key: string) => void;
  onAddField: () => void;
}) {
  return (
    <tbody>
      <SectionHeaderRow
        section={section}
        fieldCount={fields.length}
        conditionSummary={conditionSummary}
        onEdit={onEditSection}
        onDelete={onDeleteSection}
      />
      <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
        {fields.map((field) => (
          <SortableFieldRow
            key={field.id}
            field={field}
            onToggleVisible={() => onToggleVisible(field.id)}
            onToggleRequired={() => onToggleRequired(field.id)}
            onEdit={() => onEditField(field)}
            onDelete={() => field.isCustom && onDeleteField(field.id)}
            group={section.id}
          />
        ))}
      </SortableContext>
      {/* Add field to section row */}
      <tr className="bg-[#29BDD6]/5 hover:bg-[#29BDD6]/10 transition-colors group">
        <td colSpan={7} className="py-2.5 px-4">
          <button
            type="button"
            onClick={onAddField}
            className="flex items-center gap-1.5 text-gray-400 group-hover:text-[#29BDD6] transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs">New field</span>
          </button>
        </td>
      </tr>
    </tbody>
  );
}
