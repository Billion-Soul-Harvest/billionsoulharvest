"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/shared/utils/supabase/client";
import type { FooterConfig } from "@/shared/types/database";

interface Props {
  initialConfig: FooterConfig | null;
}

export function FooterSettings({ initialConfig }: Props) {
  const [config, setConfig] = useState<FooterConfig>(
    initialConfig ?? { description: "", email: "" }
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    const supabase = createClient();

    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "footer_config", value: config as unknown as Record<string, unknown> }, { onConflict: "key" });

    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Footer Settings</h2>
          <p className="text-sm text-gray-500">Configure the public website footer. Leave empty and save to hide the footer.</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-xs text-green-600 font-medium">Saved</span>}
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Footer"}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
          <textarea
            value={config.description}
            onChange={(e) => setConfig({ ...config, description: e.target.value })}
            rows={3}
            className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="A brief description of your organization shown in the footer..."
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Contact Email</label>
          <Input
            type="email"
            value={config.email}
            onChange={(e) => setConfig({ ...config, email: e.target.value })}
            placeholder="info@example.org"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Copyright Text (optional)</label>
          <Input
            value={config.copyrightText ?? ""}
            onChange={(e) => setConfig({ ...config, copyrightText: e.target.value || undefined })}
            placeholder={`© ${new Date().getFullYear()} Billion Soul Harvest. All rights reserved.`}
          />
          <p className="text-xs text-gray-400 mt-1">Leave empty to use default with current year.</p>
        </div>
      </div>
    </div>
  );
}
