"use client";

import { ProgressBar } from "../progress-bar";
import { formatCents } from "../../utils/format-currency";
import { CAMPAIGN_CATEGORY_LABELS } from "../../constants";
import type { CampaignFormData } from "./campaign-wizard";

interface Props {
  form: CampaignFormData;
}

export function PreviewStep({ form }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Preview</h2>
        <p className="text-sm text-gray-500 mt-1">Review your campaign before submitting</p>
      </div>

      {/* Banner preview */}
      {form.banner_url && (
        <img src={form.banner_url} alt="Banner" className="w-full h-48 object-cover rounded-lg" />
      )}

      <div>
        <span className="text-xs font-medium text-cyan-600 bg-cyan-50 px-2 py-1 rounded-full">
          {CAMPAIGN_CATEGORY_LABELS[form.category]}
        </span>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">{form.title || "Untitled Campaign"}</h3>
      </div>

      {form.goal_cents > 0 && (
        <div>
          <ProgressBar raisedCents={0} goalCents={form.goal_cents} showLabel />
          <p className="text-sm text-gray-500 mt-1">Goal: {formatCents(form.goal_cents)}</p>
        </div>
      )}

      {form.story_html && (
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: form.story_html }}
        />
      )}

      {form.gallery_images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {form.gallery_images.map((url, i) => (
            <img key={i} src={url} alt={`Gallery ${i + 1}`} className="w-full h-20 sm:h-24 object-cover rounded-lg" />
          ))}
        </div>
      )}

      {form.end_date && (
        <p className="text-sm text-gray-500">
          Campaign ends: {new Date(form.end_date).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
