"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SegmentBuilder } from "./segment-builder";
import { RecipientPreview } from "./recipient-preview";
import { SendConfirmationDialog } from "./send-confirmation-dialog";
import type { Campaign, SegmentFilter } from "@/shared/types/database";

interface TemplateOption {
  id: string;
  name: string;
  subject: string;
  body_html: string;
  preview_text: string | null;
}

interface Props {
  campaign: Campaign;
  regions: { id: string; name: string }[];
  languages: string[];
  countries: string[];
  templates: TemplateOption[];
}

type Step = "content" | "recipients" | "review";

export function CampaignEditor({
  campaign: initialCampaign,
  regions,
  languages,
  countries,
  templates,
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("content");
  const [saving, setSaving] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [recipientRefreshKey, setRecipientRefreshKey] = useState(0);

  // Form state
  const [name, setName] = useState(initialCampaign.name);
  const [subject, setSubject] = useState(initialCampaign.subject ?? "");
  const [bodyHtml, setBodyHtml] = useState(initialCampaign.body_html ?? "");
  const [previewText, setPreviewText] = useState(initialCampaign.preview_text ?? "");
  const [filter, setFilter] = useState<SegmentFilter>(initialCampaign.segment_filter ?? {});
  const [totalRecipients, setTotalRecipients] = useState(initialCampaign.total_recipients);

  const save = useCallback(async (updates: Record<string, unknown> = {}) => {
    setSaving(true);
    try {
      const payload = {
        name,
        subject,
        body_html: bodyHtml,
        preview_text: previewText,
        segment_filter: filter,
        ...updates,
      };
      const res = await fetch(`/api/campaigns/${initialCampaign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const updated = await res.json();
        setTotalRecipients(updated.total_recipients);
      }
    } finally {
      setSaving(false);
    }
  }, [name, subject, bodyHtml, previewText, filter, initialCampaign.id]);

  async function handleFilterChange(newFilter: SegmentFilter) {
    setFilter(newFilter);
    // Save filter and refresh recipients
    setSaving(true);
    try {
      const res = await fetch(`/api/campaigns/${initialCampaign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segment_filter: newFilter }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTotalRecipients(updated.total_recipients);
        setRecipientRefreshKey((k) => k + 1);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleTemplateSelect(templateId: string | null) {
    if (!templateId || templateId === "none") return;
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setSubject(template.subject);
      setBodyHtml(template.body_html);
      setPreviewText(template.preview_text || "");
    }
  }

  async function loadPreview() {
    await save();
    const res = await fetch(`/api/campaigns/${initialCampaign.id}/preview`, {
      method: "POST",
    });
    if (res.ok) {
      const { html } = await res.json();
      setPreviewHtml(html);
    }
  }

  async function handleSend() {
    const res = await fetch(`/api/campaigns/${initialCampaign.id}/send`, {
      method: "POST",
    });
    if (res.ok) {
      setShowSendDialog(false);
      router.push(`/admin/campaigns/${initialCampaign.id}/report`);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this draft campaign?")) return;
    const res = await fetch(`/api/campaigns/${initialCampaign.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.push("/admin/campaigns");
    }
  }

  const steps: { key: Step; label: string }[] = [
    { key: "content", label: "1. Content" },
    { key: "recipients", label: "2. Recipients" },
    { key: "review", label: "3. Review & Send" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/campaigns")}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Campaign</h1>
        </div>
        <div className="flex items-center gap-2">
          {saving && (
            <span className="text-sm text-gray-400">Saving...</span>
          )}
          <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600 hover:text-red-700">
            Delete
          </Button>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1">
        {steps.map((s) => (
          <button
            key={s.key}
            onClick={async () => {
              if (step === "content") await save();
              setStep(s.key);
              if (s.key === "review") await loadPreview();
            }}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              step === s.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Step Content */}
      {step === "content" && (
        <div className="space-y-6 max-w-2xl">
          {/* Template selection */}
          {templates.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Load from Template
              </label>
              <Select onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Campaign Name (internal)
            </label>
            <Input
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              onBlur={() => save()}
              placeholder="e.g. July Newsletter"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Subject
            </label>
            <Input
              value={subject}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubject(e.target.value)}
              onBlur={() => save()}
              placeholder="e.g. Updates from Billion Soul Harvest"
            />
            <p className="text-xs text-gray-400 mt-1">
              Supports merge fields: {"{{first_name}}"}, {"{{last_name}}"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preview Text
            </label>
            <Input
              value={previewText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPreviewText(e.target.value)}
              onBlur={() => save()}
              placeholder="Short preview text shown in inbox"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Body (HTML)
            </label>
            <textarea
              className="w-full min-h-[300px] px-3 py-2 text-sm border rounded-lg font-mono bg-white resize-y focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              value={bodyHtml}
              onChange={(e) => setBodyHtml(e.target.value)}
              onBlur={() => save()}
              placeholder="<p>Hello {{first_name}},</p><p>Your email content here...</p>"
            />
            <p className="text-xs text-gray-400 mt-1">
              Merge fields: {"{{first_name}}"}, {"{{last_name}}"}. The BSH branded header/footer is added automatically.
            </p>
          </div>

          <div className="flex justify-end">
            <Button onClick={async () => { await save(); setStep("recipients"); }}>
              Next: Recipients
            </Button>
          </div>
        </div>
      )}

      {step === "recipients" && (
        <div className="max-w-2xl">
          <SegmentBuilder
            filter={filter}
            onChange={handleFilterChange}
            regions={regions}
            languages={languages}
            countries={countries}
          />

          <RecipientPreview
            campaignId={initialCampaign.id}
            filter={filter}
            refreshKey={recipientRefreshKey}
          />

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep("content")}>
              Back
            </Button>
            <Button onClick={async () => { await save(); setStep("review"); await loadPreview(); }}>
              Next: Review
            </Button>
          </div>
        </div>
      )}

      {step === "review" && (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-white border rounded-xl p-6 max-w-2xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Campaign Summary</h2>
            <dl className="space-y-3">
              <div className="flex">
                <dt className="w-32 text-sm text-gray-500">Name</dt>
                <dd className="text-sm text-gray-900">{name}</dd>
              </div>
              <div className="flex">
                <dt className="w-32 text-sm text-gray-500">Subject</dt>
                <dd className="text-sm text-gray-900">{subject || "—"}</dd>
              </div>
              <div className="flex">
                <dt className="w-32 text-sm text-gray-500">Recipients</dt>
                <dd className="text-sm text-gray-900 font-medium">
                  {totalRecipients.toLocaleString()} contact{totalRecipients !== 1 ? "s" : ""}
                </dd>
              </div>
              <div className="flex">
                <dt className="w-32 text-sm text-gray-500">From</dt>
                <dd className="text-sm text-gray-900">
                  Billion Soul Harvest &lt;info@billionsoulharvest.org&gt;
                </dd>
              </div>
            </dl>
          </div>

          {/* Email Preview */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Email Preview</h2>
            {previewHtml ? (
              <div className="border rounded-xl overflow-hidden bg-gray-100">
                <iframe
                  srcDoc={previewHtml}
                  className="w-full h-[600px] bg-white"
                  title="Email Preview"
                  sandbox=""
                />
              </div>
            ) : (
              <div className="border rounded-xl p-12 flex items-center justify-center text-gray-400">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-cyan-600" />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("recipients")}>
              Back
            </Button>
            <Button
              onClick={() => setShowSendDialog(true)}
              disabled={!subject || !bodyHtml || totalRecipients === 0}
            >
              Send Now
            </Button>
          </div>

          <SendConfirmationDialog
            open={showSendDialog}
            onOpenChange={setShowSendDialog}
            campaignName={name}
            recipientCount={totalRecipients}
            onConfirm={handleSend}
          />
        </div>
      )}
    </div>
  );
}
