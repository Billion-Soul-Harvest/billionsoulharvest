"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SegmentCriterion } from "@/shared/types/database";
import { getCriterionByField, type CriteriaDefinition } from "./criteria-definitions";

interface Props {
  criterion: SegmentCriterion;
  onChange: (updated: SegmentCriterion) => void;
  onRemove: () => void;
  listNames?: string[];
}

export function CriteriaRow({ criterion, onChange, onRemove, listNames = [] }: Props) {
  const def = getCriterionByField(criterion.field);
  if (!def) return null;

  const needsValue = !["is_blank", "is_not_blank"].includes(criterion.operator);

  return (
    <div className="flex items-start gap-3 p-4 bg-white border rounded-lg group">
      <div className="shrink-0 w-36">
        <p className="text-sm font-medium text-gray-900">{def.label}</p>
        <p className="text-xs text-gray-400">{def.category}</p>
      </div>

      <div className="w-44 shrink-0">
        <Select
          value={criterion.operator}
          onValueChange={(v) => v && onChange({ ...criterion, operator: v })}
        >
          <SelectTrigger className="text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {def.operators.map((op) => (
              <SelectItem key={op.value} value={op.value}>
                {op.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1">
        {needsValue && (
          <ValueInput
            definition={def}
            criterion={criterion}
            onChange={onChange}
            listNames={listNames}
          />
        )}
      </div>

      <button
        onClick={onRemove}
        className="shrink-0 p-1.5 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
        title="Remove criterion"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

function ValueInput({
  definition,
  criterion,
  onChange,
  listNames,
}: {
  definition: CriteriaDefinition;
  criterion: SegmentCriterion;
  onChange: (updated: SegmentCriterion) => void;
  listNames: string[];
}) {
  const value = criterion.value;

  if (definition.fieldType === "select" && definition.options) {
    return (
      <Select
        value={typeof value === "string" ? value : ""}
        onValueChange={(v) => v && onChange({ ...criterion, value: v })}
      >
        <SelectTrigger className="text-sm">
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          {definition.options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (definition.fieldType === "array") {
    const arrValue = Array.isArray(value) ? value.join(", ") : (value ?? "");

    if (definition.field === "email_lists" && listNames.length > 0) {
      return (
        <div className="space-y-1">
          <Input
            value={arrValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const arr = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
              onChange({ ...criterion, value: arr });
            }}
            placeholder="Enter list names, comma separated"
            className="text-sm"
          />
          <div className="flex flex-wrap gap-1">
            {listNames.slice(0, 8).map((name) => {
              const current = Array.isArray(value) ? value : [];
              const selected = current.includes(name);
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    const next = selected
                      ? current.filter((v) => v !== name)
                      : [...current, name];
                    onChange({ ...criterion, value: next });
                  }}
                  className={`text-xs px-2 py-0.5 rounded-full border ${
                    selected
                      ? "bg-cyan-50 border-cyan-300 text-cyan-700"
                      : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <Input
        value={arrValue}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const arr = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
          onChange({ ...criterion, value: arr });
        }}
        placeholder="Comma separated values"
        className="text-sm"
      />
    );
  }

  if (definition.fieldType === "date") {
    if (criterion.operator === "in_last_days") {
      return (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={1}
            value={typeof value === "string" ? value : ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onChange({ ...criterion, value: e.target.value })
            }
            placeholder="30"
            className="text-sm w-24"
          />
          <span className="text-sm text-gray-500">days</span>
        </div>
      );
    }
    return (
      <Input
        type="date"
        value={typeof value === "string" ? value : ""}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange({ ...criterion, value: e.target.value })
        }
        className="text-sm"
      />
    );
  }

  return (
    <Input
      value={typeof value === "string" ? value : ""}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        onChange({ ...criterion, value: e.target.value })
      }
      placeholder="Enter value..."
      className="text-sm"
    />
  );
}
