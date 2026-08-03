"use client";

import { WysiwygEditor } from "@/shared/components/wysiwyg-editor";
import type { CampaignFormData } from "./campaign-wizard";

interface Props {
  form: CampaignFormData;
  updateForm: (updates: Partial<CampaignFormData>) => void;
}

export function StoryStep({ form, updateForm }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Your Story</h2>
        <p className="text-sm text-gray-500 mt-1">
          Share the heart behind your campaign. Why does this matter? What impact will donations have?
        </p>
      </div>

      <WysiwygEditor
        value={form.story_html}
        onChange={(html) => updateForm({ story_html: html })}
      />

      <p className="text-xs text-gray-400">
        Tip: Campaigns with compelling stories raise 3x more on average.
      </p>
    </div>
  );
}
