"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WysiwygEditor } from "@/shared/components/wysiwyg-editor";
import { EmailBuilder, type EmailBuilderHandle } from "@/features/emails/builder/email-builder";
import { renderEmailJson } from "@/features/emails/builder/render-to-html";
import { ArrowLeft, Blocks, FileText, Loader2, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Send, Eye, MousePointerClick, MailX, AlertTriangle, Users, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { EmailTemplateWithStats, CampaignSend, CampaignSendStatus } from "@/shared/types/database";

interface TemplateCampaign {
  id: string;
  name: string;
  status: string;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  bounced_count: number;
  complained_count?: number;
  failed_count: number;
  started_at: string | null;
  completed_at: string | null;
}

function pct(num: number, total: number): string {
  if (total === 0) return "0%";
  return `${Math.round((num / total) * 100)}%`;
}

const sendStatusColors: Record<CampaignSendStatus, string> = {
  queued: "bg-gray-100 text-gray-600",
  sent: "bg-blue-100 text-blue-700",
  delivered: "bg-green-100 text-green-700",
  opened: "bg-cyan-100 text-cyan-700",
  clicked: "bg-purple-100 text-purple-700",
  bounced: "bg-red-100 text-red-700",
  complained: "bg-orange-100 text-orange-700",
  failed: "bg-red-100 text-red-700",
  unsubscribed: "bg-gray-100 text-gray-500",
};

const SENDS_PAGE_SIZE = 50;

function InlineCampaignReport({ campaign }: { campaign: TemplateCampaign }) {
  const [sends, setSends] = useState<CampaignSend[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendsPage, setSendsPage] = useState(1);

  useEffect(() => {
    fetch(`/api/campaigns/${campaign.id}/status`)
      .then((res) => res.json())
      .then((data) => { setSends(data.sends ?? []); setSendsPage(1); })
      .catch((err) => console.error("Failed to load sends:", err))
      .finally(() => setLoading(false));
  }, [campaign.id]);

  const totalSendsPages = Math.ceil(sends.length / SENDS_PAGE_SIZE);
  const paginatedSends = sends.slice((sendsPage - 1) * SENDS_PAGE_SIZE, sendsPage * SENDS_PAGE_SIZE);

  const c = campaign;
  const openRate = c.delivered_count > 0
    ? (c.opened_count / c.delivered_count * 100).toFixed(1)
    : "0.0";
  const clickRate = c.delivered_count > 0
    ? (c.clicked_count / c.delivered_count * 100).toFixed(1)
    : "0.0";

  // Delivery funnel bar
  const funnelSteps = [
    { label: "Sent", value: c.sent_count, color: "bg-blue-500" },
    { label: "Delivered", value: c.delivered_count, color: "bg-emerald-500" },
    { label: "Opened", value: c.opened_count, color: "bg-cyan-500" },
    { label: "Clicked", value: c.clicked_count, color: "bg-purple-500" },
  ];
  const maxFunnel = Math.max(c.sent_count, 1);

  return (
    <div className="border-t border-gray-200 bg-gradient-to-b from-gray-50 to-white px-5 py-5 space-y-5">
      {/* Headline metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Send className="w-3.5 h-3.5 text-blue-500" />
            <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Sent</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{c.sent_count.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-0.5">of {c.total_recipients.toLocaleString()} recipients</p>
        </div>
        <div className="bg-gradient-to-br from-cyan-50 to-white border border-cyan-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Eye className="w-3.5 h-3.5 text-cyan-500" />
            <p className="text-xs font-medium text-cyan-600 uppercase tracking-wide">Open Rate</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{openRate}%</p>
          <p className="text-xs text-gray-400 mt-0.5">{c.opened_count} of {c.delivered_count} delivered</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <MousePointerClick className="w-3.5 h-3.5 text-purple-500" />
            <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">Click Rate</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{clickRate}%</p>
          <p className="text-xs text-gray-400 mt-0.5">{c.clicked_count} of {c.delivered_count} delivered</p>
        </div>
      </div>

      {/* Delivery funnel */}
      <div className="bg-white border rounded-xl p-4">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Delivery Funnel</p>
        <div className="space-y-2.5">
          {funnelSteps.map((step) => (
            <div key={step.label} className="flex items-center gap-3">
              <span className="text-xs text-gray-600 w-16 shrink-0">{step.label}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                <div
                  className={`${step.color} h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                  style={{ width: `${Math.max((step.value / maxFunnel) * 100, step.value > 0 ? 8 : 0)}%` }}
                >
                  {step.value > 0 && (
                    <span className="text-[10px] font-semibold text-white">{step.value.toLocaleString()}</span>
                  )}
                </div>
              </div>
              <span className="text-[11px] text-gray-400 w-10 text-right">{pct(step.value, maxFunnel)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stat cards — issues row */}
      {(c.bounced_count > 0 || (c.complained_count ?? 0) > 0 || c.failed_count > 0) && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Bounced", value: c.bounced_count, total: c.sent_count, icon: MailX, bg: "from-red-50 to-white", border: "border-red-100", iconColor: "text-red-400", textColor: "text-red-600" },
            { label: "Complained", value: c.complained_count ?? 0, total: c.sent_count, icon: AlertTriangle, bg: "from-orange-50 to-white", border: "border-orange-100", iconColor: "text-orange-400", textColor: "text-orange-600" },
            { label: "Failed", value: c.failed_count, total: c.total_recipients, icon: AlertTriangle, bg: "from-rose-50 to-white", border: "border-rose-100", iconColor: "text-rose-400", textColor: "text-rose-600" },
          ].map((s) => (
            <div key={s.label} className={`bg-gradient-to-br ${s.bg} border ${s.border} rounded-xl p-3`}>
              <div className="flex items-center gap-1.5 mb-1">
                <s.icon className={`w-3 h-3 ${s.iconColor}`} />
                <p className={`text-[11px] font-medium ${s.textColor}`}>{s.label}</p>
              </div>
              <p className={`text-lg font-bold ${s.textColor}`}>{s.value.toLocaleString()}</p>
              {s.total > 0 && (
                <p className="text-[10px] text-gray-400">{pct(s.value, s.total)} of {s.total.toLocaleString()}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Individual sends */}
      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Individual Sends</h4>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            <span className="ml-2 text-xs text-gray-400">Loading sends...</span>
          </div>
        ) : (
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Email</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Status</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Opened</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Clicked</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedSends.length > 0 ? (
                  paginatedSends.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50/50">
                      <td className="px-3 py-2 text-gray-900">{s.email}</td>
                      <td className="px-3 py-2">
                        <Badge variant="secondary" className={`text-[10px] ${sendStatusColors[s.status]}`}>
                          {s.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-gray-600">
                        {s.opened_at ? new Date(s.opened_at).toLocaleString() : "\u2014"}
                      </td>
                      <td className="px-3 py-2 text-gray-600">
                        {s.clicked_at ? new Date(s.clicked_at).toLocaleString() : "\u2014"}
                      </td>
                      <td className="px-3 py-2 text-red-600 max-w-[200px] truncate">
                        {s.error_message || "\u2014"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-gray-400">
                      No sends recorded yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {totalSendsPages > 1 && (
              <div className="flex items-center justify-between px-3 py-2 border-t bg-gray-50">
                <span className="text-[11px] text-gray-500">
                  {((sendsPage - 1) * SENDS_PAGE_SIZE + 1).toLocaleString()}–{Math.min(sendsPage * SENDS_PAGE_SIZE, sends.length).toLocaleString()} of {sends.length.toLocaleString()}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                    onClick={() => setSendsPage((p) => p - 1)}
                    disabled={sendsPage <= 1}
                  >
                    <ChevronLeft className="w-3.5 h-3.5 text-gray-600" />
                  </button>
                  <span className="text-[11px] text-gray-600 px-1">
                    {sendsPage} / {totalSendsPages}
                  </span>
                  <button
                    type="button"
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                    onClick={() => setSendsPage((p) => p + 1)}
                    disabled={sendsPage >= totalSendsPages}
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface Props {
  template: EmailTemplateWithStats;
}

export function EmailTemplateEditor({ template: initial }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [subject, setSubject] = useState(initial.subject);
  const [previewText, setPreviewText] = useState(initial.preview_text ?? "");
  const [bodyHtml, setBodyHtml] = useState(initial.body_html);
  const [bodyJson, setBodyJson] = useState<string | null>(
    initial.body_json ? JSON.stringify(initial.body_json) : null
  );
  const hasBlockData = !!initial.body_json;
  const [useBlockEditor, setUseBlockEditor] = useState(hasBlockData);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);
  // Show preview by default for HTML-only templates (no block JSON)
  const [showPreview, setShowPreview] = useState(!hasBlockData && !!initial.body_html);
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const builderRef = useRef<EmailBuilderHandle>(null);
  const [campaigns, setCampaigns] = useState<TemplateCampaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);

  // Fetch campaigns for this template
  useEffect(() => {
    if (initial.send_count > 0) {
      setCampaignsLoading(true);
      fetch(`/api/email-templates/${initial.id}/campaigns`)
        .then((res) => res.json())
        .then((data) => setCampaigns(data))
        .catch((err) => console.error("Failed to load campaigns:", err))
        .finally(() => setCampaignsLoading(false));
    }
  }, [initial.id, initial.send_count]);

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

      const res = await fetch(`/api/email-templates/${initial.id}`, {
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
      if (!res.ok) throw new Error(`Save failed: ${res.status}`);
      setSaved(true);
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  }, [initial.id, name, subject, bodyHtml, bodyJson, previewText, useBlockEditor]);

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

  const [expandedCampaignId, setExpandedCampaignId] = useState<string | null>(null);

  const hasCampaigns = initial.send_count > 0;

  // Persist active tab via URL hash
  const [activeTab, setActiveTab] = useState<number>(() => {
    if (typeof window !== "undefined" && window.location.hash === "#campaigns") return 1;
    return 0;
  });

  function handleTabChange(value: number | string | null) {
    const v = Number(value);
    setActiveTab(v);
    window.history.replaceState(null, "", v === 1 ? "#campaigns" : window.location.pathname);
  }

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

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        {hasCampaigns && (
          <TabsList variant="line" className="mb-6 border-b pb-0">
            <TabsTrigger value={0}>Design</TabsTrigger>
            <TabsTrigger value={1}>Campaigns</TabsTrigger>
          </TabsList>
        )}

        <TabsContent value={0}>
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
            </div>
          )}
        </TabsContent>

        <TabsContent value={1}>
          <div className="max-w-3xl space-y-6">
            {/* Aggregate stats */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-5 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-slate-300" />
                <p className="text-sm font-medium text-slate-300 uppercase tracking-wide">Overall Performance</p>
              </div>
              <div className="grid grid-cols-5 gap-4 text-center">
                {[
                  { value: initial.total_sends, label: "Sends", color: "text-blue-300" },
                  { value: initial.total_delivered, label: "Delivered", color: "text-emerald-300" },
                  { value: initial.total_opened, label: "Opened", color: "text-cyan-300" },
                  { value: initial.total_clicked, label: "Clicked", color: "text-purple-300" },
                  { value: initial.total_bounced, label: "Bounced", color: "text-red-300" },
                ].map((s) => (
                  <div key={s.label}>
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value.toLocaleString()}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Campaign list heading */}
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Campaign History</h3>
              {campaigns.length > 0 && (
                <Badge variant="secondary" className="bg-gray-100 text-gray-500 text-[10px]">
                  {campaigns.length}
                </Badge>
              )}
            </div>

            {/* Campaign list with expandable reports */}
            {campaignsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
                <span className="ml-2 text-sm text-gray-400">Loading campaigns...</span>
              </div>
            ) : campaigns.length > 0 ? (
              <div className="space-y-3">
                {campaigns.map((c) => {
                  const cOpenRate = c.delivered_count > 0
                    ? Math.round((c.opened_count / c.delivered_count) * 100)
                    : 0;
                  const cClickRate = c.delivered_count > 0
                    ? Math.round((c.clicked_count / c.delivered_count) * 100)
                    : 0;

                  return (
                    <div key={c.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <button
                        type="button"
                        className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors"
                        onClick={() => setExpandedCampaignId(expandedCampaignId === c.id ? null : c.id)}
                      >
                        {/* Status indicator dot */}
                        <div className={`w-2 h-2 rounded-full shrink-0 ${
                          c.status === "sent" ? "bg-emerald-400" : c.status === "sending" ? "bg-blue-400 animate-pulse" : "bg-gray-300"
                        }`} />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-gray-900 truncate">{c.name}</span>
                            <Badge
                              variant="secondary"
                              className={`text-[10px] shrink-0 ${
                                c.status === "sent"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : c.status === "sending"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {c.status === "sent" ? "Sent" : c.status === "sending" ? "Sending" : c.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>
                              {c.started_at
                                ? new Date(c.started_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                                : "--"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {c.total_recipients}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {cOpenRate}%
                            </span>
                            <span className="flex items-center gap-1">
                              <MousePointerClick className="w-3 h-3" />
                              {cClickRate}%
                            </span>
                          </div>
                        </div>
                        <div className={`p-1.5 rounded-lg transition-colors ${expandedCampaignId === c.id ? "bg-gray-200" : "bg-gray-100"}`}>
                          {expandedCampaignId === c.id ? (
                            <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                          )}
                        </div>
                      </button>
                      {expandedCampaignId === c.id && (
                        <InlineCampaignReport campaign={c} />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 py-10 text-center">
                <Send className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No campaigns found</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
