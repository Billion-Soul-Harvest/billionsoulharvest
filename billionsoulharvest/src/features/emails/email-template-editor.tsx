"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WysiwygEditor } from "@/shared/components/wysiwyg-editor";
import { EmailBuilder, type EmailBuilderHandle } from "@/features/emails/builder/email-builder";
import { renderEmailJson } from "@/features/emails/builder/render-to-html";
import { ArrowLeft, Blocks, FileText } from "lucide-react";
import type { EmailTemplateWithStats } from "@/shared/types/database";

interface Props {
  template: EmailTemplateWithStats;
}

export function EmailTemplateEditor({ template: initial }: Props) {
  const [name, setName] = useState(initial.name);
  const [subject, setSubject] = useState(initial.subject);
  const [previewText, setPreviewText] = useState(initial.preview_text ?? "");
  const [bodyHtml, setBodyHtml] = useState(initial.body_html);
  const [bodyJson, setBodyJson] = useState<string | null>(
    initial.body_json ? JSON.stringify(initial.body_json) : null
  );
  const [useBlockEditor, setUseBlockEditor] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const builderRef = useRef<EmailBuilderHandle>(null);

  // Mark unsaved on any change
  useEffect(() => {
    setSaved(false);
  }, [name, subject, previewText, bodyHtml, bodyJson]);

  // Initial load should be "saved"
  useEffect(() => {
    setSaved(true);
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      let htmlToSave = bodyHtml;
      let jsonToSave: Record<string, unknown> | null = null;

      if (useBlockEditor && builderRef.current) {
        // Always serialize fresh from the canvas
        const currentJson = builderRef.current.getJson();
        htmlToSave = renderEmailJson(currentJson);
        jsonToSave = JSON.parse(currentJson);
        setBodyJson(currentJson);
      }

      await fetch(`/api/email-templates/${initial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          subject,
          body_html: htmlToSave,
          body_json: jsonToSave,
          preview_text: previewText || null,
        }),
      });
      setSaved(true);
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  }, [initial.id, name, subject, bodyHtml, previewText, useBlockEditor]);

  // Auto-save on blur
  const handleBlur = useCallback(() => {
    if (!saved) {
      clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(save, 300);
    }
  }, [saved, save]);

  // Generate preview HTML — serialize fresh from builder if available
  const getPreviewHtml = () => {
    if (useBlockEditor && builderRef.current) {
      const json = builderRef.current.getJson();
      return renderEmailJson(json);
    }
    if (useBlockEditor && bodyJson) {
      return renderEmailJson(bodyJson);
    }
    return bodyHtml;
  };

  return (
    <div className={useBlockEditor && !showPreview ? "" : "max-w-3xl"}>
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
          {!showPreview && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (useBlockEditor) {
                  setUseBlockEditor(false);
                } else {
                  setUseBlockEditor(true);
                  if (!bodyJson) setBodyJson(null);
                }
              }}
              title={useBlockEditor ? "Switch to classic editor" : "Switch to block editor"}
            >
              {useBlockEditor ? (
                <>
                  <FileText className="w-4 h-4 mr-1.5" />
                  Classic
                </>
              ) : (
                <>
                  <Blocks className="w-4 h-4 mr-1.5" />
                  Block Editor
                </>
              )}
            </Button>
          )}
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? "Edit" : "Preview"}
          </Button>
          <Button onClick={save} disabled={saving || saved}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {showPreview ? (
        <div className="bg-[#f3f3f4] rounded-xl p-6 max-w-3xl">
          {useBlockEditor ? (
            <div
              className="max-w-[600px] mx-auto overflow-hidden"
              dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
            />
          ) : (
            <div className="bg-white max-w-[600px] mx-auto overflow-hidden">
              {/* BSH Header */}
              <div className="bg-white px-5 py-4 text-center border-b border-[#c4c6cc]">
                <p className="text-black text-[22px] font-extrabold tracking-tight m-0 uppercase" style={{ fontFamily: "Manrope, sans-serif" }}>Billion Soul Harvest</p>
              </div>
              {/* Content */}
              <div className="px-5 py-10 text-[#44474c] text-base leading-relaxed" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
              </div>
              {/* Footer */}
              <div className="bg-[#f3f3f4] border-t border-[#c4c6cc] px-5 py-10 text-center">
                <p className="text-[#1a1c1c] text-sm font-bold tracking-widest uppercase m-0 mb-3" style={{ fontFamily: "Manrope, sans-serif" }}>
                  Billion Soul Harvest
                </p>
                <p className="text-[#44474c] text-sm m-0 mb-3">
                  <span className="hover:underline cursor-pointer">Privacy Policy</span>
                  {"  ·  "}
                  <span className="hover:underline cursor-pointer">Contact Us</span>
                  {"  ·  "}
                  <span className="hover:underline cursor-pointer">Unsubscribe</span>
                </p>
                <p className="text-[#44474c] text-xs m-0">
                  &copy; {new Date().getFullYear()} Billion Soul Harvest. All rights reserved.
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {/* Name */}
          <div className="max-w-3xl">
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
          <div className="max-w-3xl">
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
          <div className="max-w-3xl">
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
            {useBlockEditor ? (
              <EmailBuilder
                ref={builderRef}
                initialJson={bodyJson}
                onJsonChange={setBodyJson}
              />
            ) : (
              <div className="max-w-3xl">
                <WysiwygEditor value={bodyHtml} onChange={setBodyHtml} />
              </div>
            )}
          </div>

          {/* Stats (if sent) */}
          {initial.send_count > 0 && (
            <div className="bg-gray-50 rounded-lg border p-4 max-w-3xl">
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
