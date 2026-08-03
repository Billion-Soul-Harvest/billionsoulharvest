"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CAMPAIGN_CATEGORIES, CAMPAIGN_CATEGORY_LABELS } from "../../constants";
import type { CampaignFormData } from "./campaign-wizard";

interface Props {
  form: CampaignFormData;
  updateForm: (updates: Partial<CampaignFormData>) => void;
}

export function BasicInfoStep({ form, updateForm }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
        <p className="text-sm text-gray-500 mt-1">Tell us about your campaign</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Campaign Title *</Label>
        <Input
          id="title"
          value={form.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateForm({ title: e.target.value })}
          placeholder="e.g., Building a Church in Rural Kenya"
          className="h-11"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          value={form.category}
          onChange={(e) => updateForm({ category: e.target.value as CampaignFormData["category"] })}
          className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm"
        >
          {CAMPAIGN_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {CAMPAIGN_CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="goal">Fundraising Goal ($)</Label>
          <Input
            id="goal"
            type="number"
            min="1"
            value={form.goal_cents ? form.goal_cents / 100 : ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateForm({ goal_cents: Math.round(parseFloat(e.target.value || "0") * 100) })
            }
            placeholder="5,000"
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_date">End Date (optional)</Label>
          <Input
            id="end_date"
            type="date"
            value={form.end_date}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateForm({ end_date: e.target.value })}
            className="h-11"
          />
        </div>
      </div>
    </div>
  );
}
