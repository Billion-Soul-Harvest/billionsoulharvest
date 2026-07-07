"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WysiwygEditor } from "@/shared/components/wysiwyg-editor";
import { ArrowLeft } from "lucide-react";
import type { EmailTemplateWithStats } from "@/shared/types/database";

interface Props {
  template: EmailTemplateWithStats;
}

export function EmailTemplateEditor({ template: initial }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [subject, setSubject] = useState(initial.subject);
  const [previewText, setPreviewText] = useState(initial.preview_text ?? "");
  const [bodyHtml, setBodyHtml] = useState(initial.body_html);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Mark unsaved on any change
  useEffect(() => {
    setSaved(false);
  }, [name, subject, previewText, bodyHtml]);

  // Initial load should be "saved"
  useEffect(() => {
    setSaved(true);
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      await fetch(`/api/email-templates/${initial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, subject, body_html: bodyHtml, preview_text: previewText || null }),
      });
      setSaved(true);
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  }, [initial.id, name, subject, bodyHtml, previewText]);

  // Auto-save on blur
  const handleBlur = useCallback(() => {
    if (!saved) {
      clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(save, 300);
    }
  }, [saved, save]);

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/emails">
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Email</h1>
          {!saved && (
            <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
              Unsaved
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? "Edit" : "Preview"}
          </Button>
          <Button onClick={save} disabled={saving || saved}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {showPreview ? (
        <div className="bg-gray-100 rounded-xl p-6">
          <div className="bg-white rounded-lg border max-w-[600px] mx-auto overflow-hidden">
            {/* BSH Header */}
            <div className="bg-[#1a3a2a] px-10 py-8 text-center">
              <p className="text-[#d4a853] text-sm font-bold tracking-[3px] m-0">BILLION SOUL HARVEST</p>
            </div>
            {/* Content */}
            <div className="p-10 text-[#4a4a4a] text-base leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
            </div>
            <hr className="border-[#e8e0d4] m-0" />
            <div className="px-10 py-6 text-center">
              <p className="text-[#8b7355] text-sm m-0 mb-2">
                Billion Soul Harvest Ministry<br />Reaching the nations for Christ
              </p>
              <p className="text-[#b0a090] text-xs m-0">
                You are receiving this email because you are a contact of Billion Soul Harvest.<br />
                <span className="underline">Unsubscribe</span>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Name */}
          <div>
            <Label htmlFor="name">Template name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleBlur}
              placeholder="e.g., Monthly Newsletter"
              className="mt-1"
            />
          </div>

          {/* Subject */}
          <div>
            <Label htmlFor="subject">Subject line</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              onBlur={handleBlur}
              placeholder="e.g., Join us this Sunday!"
              className="mt-1"
            />
          </div>

          {/* Preview text */}
          <div>
            <Label htmlFor="preview_text">Preview text</Label>
            <Input
              id="preview_text"
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              onBlur={handleBlur}
              placeholder="Text shown in inbox before opening"
              className="mt-1"
            />
          </div>

          {/* Body */}
          <div>
            <Label>Body</Label>
            <p className="text-xs text-gray-500 mb-1.5">
              Merge fields: {"{{first_name}}"}, {"{{last_name}}"}
            </p>
            <WysiwygEditor value={bodyHtml} onChange={setBodyHtml} />
          </div>

          {/* Stats (if sent) */}
          {initial.send_count > 0 && (
            <div className="bg-gray-50 rounded-lg border p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Send history</p>
              <div className="grid grid-cols-5 gap-4 text-center text-sm">
                <div>
                  <p className="text-lg font-semibold text-gray-900">{initial.total_sends}</p>
                  <p className="text-gray-500">Sends</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">{initial.total_delivered}</p>
                  <p className="text-gray-500">Delivered</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">{initial.total_opened}</p>
                  <p className="text-gray-500">Opened</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">{initial.total_clicked}</p>
                  <p className="text-gray-500">Clicked</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">{initial.total_bounced}</p>
                  <p className="text-gray-500">Bounced</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
